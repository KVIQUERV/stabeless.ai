const userIdInput = document.querySelector("#user-id");
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const logoutButton = document.querySelector("#logout-btn");

const userId = userIdInput.value.trim();
let userText = null;

const loadCleanedChat = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode")
        ? "dark_mode"
        : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Stabeless.AI</h1>
                            <p>Inicie uma conversa e explore o poder da IA.<br>Seu histórico de conversas será exibido aqui.</p>
                        </div>`;

    chatContainer.innerHTML = defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

hljs.configure({ ignoreUnescapedHTML: true });

const getChatResponse = async (incomingChatDiv) => {
    try {
        const response = await (
            await fetch("/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user: userId,
                    ds_message: userText,
                }),
            })
        ).json();

        const fullText = response.chatReplied;

        const processMessage = (text) => {
            if (text.includes("```")) {
                const parts = text.split(/```/);
                let formattedContent = "";

                parts.forEach((part, index) => {
                    if (index % 2 === 1) {
                        const codeContent = part.trim();

                        try {
                            const highlightedCode =
                                hljs.highlightAuto(codeContent).value;
                            formattedContent += `<pre style="margin-bottom: -24px;"><code class="hljs" style="background: #23272e !important; padding: 16px !important; border-radius: 16px;">${highlightedCode}</code></pre>`;
                        } catch (err) {
                            formattedContent += `<pre style="margin-bottom: -24px;"><code style="background: #23272e !important; padding: 16px !important; border-radius: 16px;">${escapeHTML(
                                codeContent
                            )}</code></pre>`;
                        }
                    } else {
                        formattedContent += escapeHTML(part)
                            .replace(/\n/g, "<br>")
                            .replaceAll("`", "");
                    }
                });

                return formattedContent;
            } else {
                return escapeHTML(text)
                    .replace(/\n/g, "<br>")
                    .replaceAll("`", "");
            }
        };

        function escapeHTML(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        const typeText = async (element, htmlContent) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlContent;

            const nodes = Array.from(tempDiv.childNodes);

            for (const node of nodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    for (let i = 0; i < node.textContent.length; i++) {
                        element.innerHTML += escapeHTML(node.textContent[i]);
                        await new Promise((resolve) =>
                            setTimeout(resolve, 12.5)
                        );
                    }
                } else {
                    element.innerHTML += node.outerHTML;
                }
            }
        };

        const chatDetails = incomingChatDiv.querySelector(".chat-details");
        const typingAnimation =
            incomingChatDiv.querySelector(".typing-animation");
        typingAnimation.remove();

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message-content");
        chatDetails.appendChild(messageDiv);

        const formattedResponse = processMessage(fullText);
        await typeText(messageDiv, formattedResponse);

        messageDiv.innerHTML = formattedResponse;

        const codeBlocks = messageDiv.querySelectorAll("pre code");
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (error) {
        const errorMessage = `<p class="error">Oops! Something went wrong while retrieving the response. Please try again.</p>`;
        incomingChatDiv.querySelector(".typing-animation").remove();
        incomingChatDiv.querySelector(".chat-details").innerHTML +=
            errorMessage;
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

    if (!userText) {
        return;
    }

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
    Swal.fire({
        title: "Deseja deletar as mensagens?",
        text: "Não será possível recuperá-las!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, desejo deletar!",
        cancelButtonText: "Não",
        allowOutsideClick: false,
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch("/deleteChat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user: userId,
                }),
            })
                .then(async (res) => {
                    const jsonRes = await res.json();

                    Swal.fire({
                        title: "Sucesso!",
                        text: jsonRes.message,
                        icon: "success",
                    });
                    loadCleanedChat();
                })
                .catch(async (err) => {
                    const jsonRes = await err.json();

                    Swal.fire({
                        title: "Erro!",
                        text: jsonRes.message,
                        icon: "error",
                    });
                });
        }
    });
});

logoutButton.addEventListener("click", async () => {
    Swal.fire({
        title: "Deseja se deslogar?",
        text: "Ao clicar em sim, será necessário realizar o login novamente!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, desejo sair!",
        cancelButtonText: "Não",
        allowOutsideClick: false,
    }).then(async (result) => {
        if (result.isConfirmed) {
            await fetch("/logout", {
                method: "POST",
            }).then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                }
            });
        }
    });
});

themeButton.addEventListener("click", async () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode")
        ? "dark_mode"
        : "light_mode";
    const fl_isDarkMode = !document.body.classList.contains("light-mode");

    await fetch("/updateTheme", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id_user: userId,
            fl_isDarkMode: fl_isDarkMode ? 1 : 0,
        }),
    })
        .then(async (res) => {
            const jsonRes = await res.json();

            Swal.fire({
                title: "Sucesso!",
                text: jsonRes.message,
                icon: "success",
                allowOutsideClick: false,
            });
        })
        .catch(async (err) => {
            const jsonRes = await err.json();

            Swal.fire({
                title: "Erro!",
                text: jsonRes.message,
                icon: "error",
                allowOutsideClick: false,
            });
        });
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
    }
});

sendButton.addEventListener("click", handleOutgoingChat);

if (!chatContainer.innerHTML.trim()) {
    loadCleanedChat();
}

document.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll("pre code").forEach((block) => {
        const codeContent = block.textContent.trim();

        if (codeContent.includes("```")) {
            const parts = codeContent.split(/```/);
            let formattedContent = "";

            parts.forEach((part, index) => {
                if (index % 2 === 1) {
                    const codeBlock = document.createElement("code");
                    codeBlock.textContent = part.trim();
                    formattedContent += `<pre><code class="hljs javascript" style="margin-top: 24px !important; margin-bottom: 24px !important; background: #23272e !important; padding: 16px !important; border-radius: 16px;">${
                        hljs.highlight(part.trim(), { language: "javascript" })
                            .value
                    }</code></pre>`;
                } else {
                    formattedContent += part.trim();
                }
            });

            block.innerHTML = formattedContent;
        } else {
            block.textContent = codeContent;
        }
    });

    const flIsDarkMode = document.getElementById("fl-isDarkMode").value;

    if (flIsDarkMode === "1") {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    }
});
