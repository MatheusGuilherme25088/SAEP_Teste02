// Tela de cadastro de usuários

const formUsuario = document.getElementById("form-usuario");

// Verifica se o e-mail tem o formato nome@dominio.algo
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

formUsuario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();

    // Todos os campos são obrigatórios
    if (nome == "" || email == "") {
        alert("Preencha todos os campos.");
        return;
    }

    if (!emailValido(email)) {
        alert("Digite um e-mail válido.");
        return;
    }

    try {
        const resposta = await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome: nome, email: email })
        });
        const dados = await resposta.json();

        alert(dados.mensagem);

        if (resposta.ok) {
            formUsuario.reset();
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});
