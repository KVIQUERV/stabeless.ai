const inputs = document.querySelectorAll(".input");
const button = document.querySelector(".login__button");
const toggleLink = document.querySelector(".login__link");
const form = document.querySelector(".login__form");
const title = document.querySelector(".login__title");

let isRegistering = false;

const toggleFormWithAnimation = (event) => {
    event.preventDefault();
    isRegistering = !isRegistering;
    const nameField = document.getElementById("txt_name");
    form.classList.add("fade-out-form");
    setTimeout(() => {
        title.textContent = isRegistering
            ? "Realizar cadastro"
            : "Realizar login";
        toggleLink.textContent = isRegistering
            ? "Já tenho uma conta"
            : "Criar Conta";
        form.setAttribute(
            "action",
            isRegistering ? "/register" : "/authenticate"
        );
        nameField.style.display = isRegistering ? "block" : "none";
        validateInputs();
        form.classList.remove("fade-out-form");
        form.classList.add("fade-in-form");
        setTimeout(() => {
            form.classList.remove("fade-in-form");
        }, 500);
    }, 500);
};

const validateInputs = () => {
    const [name, username, password] = inputs;
    const isNameValid = isRegistering ? name.value.trim() : true;
    const isUsernameValid = username.value.trim();
    const isPasswordValid = password.value.trim().length >= 8;

    if (isNameValid && isUsernameValid && isPasswordValid) {
        button.removeAttribute("disabled");
        button.setAttribute("type", "submit");
    } else {
        button.setAttribute("disabled", "");
        button.setAttribute("type", "button");
    }
};

inputs.forEach((input) =>
    input.addEventListener("focus", ({ target }) => {
        const span = target.previousElementSibling;
        span.classList.add("span-active");
    })
);

inputs.forEach((input) =>
    input.addEventListener("focusout", ({ target }) => {
        if (target.value.trim() === "") {
            const span = target.previousElementSibling;
            span.classList.remove("span-active");
        }
    })
);

inputs.forEach((input) => input.addEventListener("input", validateInputs));
toggleLink.addEventListener("click", toggleFormWithAnimation);
