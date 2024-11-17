const userIdInput = document.querySelector("#user-id");
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

const userId = userIdInput.value.trim();
let userText = null;

const loadCleanedChat = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Stabeless.AI</h1>
                            <p>Inicie uma conversa e explore o poder da IA.<br>Seu histórico de conversas será exibido aqui.</p>
                        </div>`

    chatContainer.innerHTML = defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
    try {
        const response = await (await fetch("/sendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_user: userId,
                ds_message: userText
            })
        })).json();

        const fullText = response.chatReplied;

        // Função para escapar HTML
        const escapeHTML = (string) => {
            const div = document.createElement("div");
            div.innerText = string;
            return div.innerHTML;
        };

        // Função para processar o texto e identificar códigos entre ```
        const processMessage = (text) => {
            if (text.includes("```")) {
                const parts = text.split(/```/);
                let formattedContent = '<pre><code class="hljs no-highlight">';

                parts.forEach((part, index) => {
                    if (index % 2 === 1) {
                        // Código entre backticks
                        const escapedCode = part.trim(); // Escapar antes do highlight não é necessário
                        const highlightedCode = hljs.highlight(escapedCode, { language: 'javascript' }).value;
                        formattedContent += `<pre style="margin-bottom: -24px"><code class="hljs javascript" style="background: #23272e !important; padding: 16px !important; border-radius: 16px;">${highlightedCode}</code></pre>`;
                    } else {
                        // Texto normal com quebras de linha preservadas
                        formattedContent += escapeHTML(part).replace(/\n/g, "<br>");
                    }
                });

                return formattedContent + "</pre></code>";
            } else {
                // Texto puro com quebras de linha
                return `<pre><code class="hljs no-highlight">${escapeHTML(text).replace(/\n/g, "<br>")}</code></pre>`;
            }
        };

        // Função para exibir o texto com animação de digitação, respeitando HTML
        const typeText = async (element, htmlContent) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlContent;

            const nodes = Array.from(tempDiv.childNodes);

            for (const node of nodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    // Digita texto normal
                    for (let i = 0; i < node.textContent.length; i++) {
                        element.innerHTML += escapeHTML(node.textContent[i]);
                        await new Promise(resolve => setTimeout(resolve, 12.5));
                    }
                } else {
                    // Adiciona elementos HTML completos
                    element.innerHTML += node.outerHTML;
                }
            }
        };

        // Adicionar a resposta ao DOM com animação
        const chatDetails = incomingChatDiv.querySelector(".chat-details");
        const typingAnimation = incomingChatDiv.querySelector(".typing-animation");
        typingAnimation.remove(); // Remove a animação de digitação

        // Div para o texto digitado
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message-content");
        chatDetails.appendChild(messageDiv);

        const formattedResponse = processMessage(fullText);
        await typeText(messageDiv, formattedResponse);

        // Após digitar o texto, renderizar o conteúdo final (completo, se necessário)
        messageDiv.innerHTML = formattedResponse;

        // Aplicar destaque nos blocos de código, caso não tenha sido aplicado
        const codeBlocks = messageDiv.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (error) {
        const errorMessage = `<p class="error">Oops! Something went wrong while retrieving the response. Please try again.</p>`;
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").innerHTML += errorMessage;
    }

    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="https://static.diario24horas.com.br/images/uploads/2022/6/6/373-baymax-estreia-em-29-de-junho-no-disney-plus.jpg" class="img-ai" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                </div>`;

    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();

    if (!userText) { return; };

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="https://i.pinimg.com/474x/47/bc/3b/47bc3b45afcc71aba0c8ec67e4e9bdf1.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 1000);
};

deleteButton.addEventListener("click", async () => {
    if (confirm("Você tem certeza que deseja excluir este chat?")) {
        const response = await (await fetch("/deleteChat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_user: userId,
            })
        })).json();
        loadCleanedChat();
    };
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    };
});

sendButton.addEventListener("click", handleOutgoingChat);

if (!chatContainer.innerHTML.trim()) {
    loadCleanedChat();
};

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((block) => {
        const codeContent = block.textContent.trim();
    
        // Verifica se o código contém backticks (```), indicando código
        if (codeContent.includes("```")) {
            // Divide o conteúdo em partes de texto e código entre backticks
            const parts = codeContent.split(/```/);
            let formattedContent = '';

            // Itera sobre as partes e aplica a formatação
            parts.forEach((part, index) => {
                if (index % 2 === 1) {
                    // Se for uma parte entre backticks (código), aplica o highlight
                    const codeBlock = document.createElement('code');
                    codeBlock.textContent = part.trim();

                    // Aplica o highlight, forçando a linguagem como 'javascript'
                    formattedContent += `<pre><code class="hljs javascript" style="margin-top: 24px !important; margin-bottom: 24px !important; background: #23272e !important; padding: 16px !important; border-radius: 16px;">${hljs.highlight(part.trim(), { language: 'javascript' }).value}</code></pre>`;
                } else {
                    // Se for texto normal, apenas adiciona o texto
                    formattedContent += part.trim();
                }
            });

            // Substitui o conteúdo original pelo conteúdo formatado
            block.innerHTML = formattedContent;
        } else {
            // Caso não tenha backticks, apenas mostra o texto normal
            block.textContent = codeContent;
        }
    });
});