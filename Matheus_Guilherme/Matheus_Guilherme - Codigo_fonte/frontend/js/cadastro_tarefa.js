// Tela de cadastro de tarefas (também usada para editar)

const formTarefa = document.getElementById("form-tarefa");
const selectUsuario = document.getElementById("id_usuario");

// Se a URL tiver ?id=5, a tela funciona como edição da tarefa 5
const parametros = new URLSearchParams(window.location.search);
const idTarefa = parametros.get("id");

// Preenche o campo "Usuário" com os usuários cadastrados no banco
async function carregarUsuarios() {
    const resposta = await fetch("/api/usuarios");
    const usuarios = await resposta.json();

    for (const usuario of usuarios) {
        const opcao = document.createElement("option");
        opcao.value = usuario.id_usuario;
        opcao.textContent = usuario.nome;
        selectUsuario.appendChild(opcao);
    }
}

// Na edição, busca a tarefa e coloca os dados nos campos
async function carregarTarefa() {
    const resposta = await fetch("/api/tarefas/" + idTarefa);

    if (!resposta.ok) {
        alert("Tarefa não encontrada.");
        window.location.href = "index.html";
        return;
    }

    const tarefa = await resposta.json();
    document.getElementById("titulo").textContent = "Editar Tarefa";
    document.getElementById("descricao").value = tarefa.descricao;
    document.getElementById("setor").value = tarefa.setor;
    document.getElementById("id_usuario").value = tarefa.id_usuario;
    document.getElementById("prioridade").value = tarefa.prioridade;
}

async function iniciar() {
    try {
        await carregarUsuarios();
        if (idTarefa) {
            await carregarTarefa();
        }
    } catch (erro) {
        selectUsuario.options[0].textContent = "Nenhum usuário encontrado";
    }
}

formTarefa.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const tarefa = {
        descricao: document.getElementById("descricao").value.trim(),
        setor: document.getElementById("setor").value.trim(),
        id_usuario: document.getElementById("id_usuario").value,
        prioridade: document.getElementById("prioridade").value
    };

    // Todos os campos são obrigatórios
    if (tarefa.descricao == "" || tarefa.setor == "" || tarefa.id_usuario == "" || tarefa.prioridade == "") {
        alert("Preencha todos os campos.");
        return;
    }

    // Se for edição usa PUT (atualiza), senão usa POST (cadastra nova)
    let url = "/api/tarefas";
    let metodo = "POST";
    if (idTarefa) {
        url = "/api/tarefas/" + idTarefa;
        metodo = "PUT";
    }

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tarefa)
        });
        const dados = await resposta.json();

        alert(dados.mensagem);

        if (resposta.ok) {
            if (idTarefa) {
                window.location.href = "index.html";
            } else {
                formTarefa.reset();
            }
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
});

iniciar();
