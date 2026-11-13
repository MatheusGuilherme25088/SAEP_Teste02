// Tela de gerenciamento de tarefas (primeira tela do sistema)

const STATUS = ["a fazer", "fazendo", "pronto"];
const NOMES_STATUS = { "a fazer": "A fazer", "fazendo": "Fazendo", "pronto": "Pronto" };
const NOMES_PRIORIDADE = { "baixa": "Baixa", "media": "Média", "alta": "Alta" };

// Cada status tem a sua coluna na tela
const colunas = {
    "a fazer": document.getElementById("coluna-a-fazer"),
    "fazendo": document.getElementById("coluna-fazendo"),
    "pronto": document.getElementById("coluna-pronto")
};

// Cria um parágrafo do tipo "Título: valor"
function criarLinha(titulo, valor) {
    const p = document.createElement("p");
    const negrito = document.createElement("strong");
    negrito.textContent = titulo + ": ";
    p.appendChild(negrito);
    p.appendChild(document.createTextNode(valor));
    return p;
}

// Cria um botão com texto e função de clique
function criarBotao(texto, funcao) {
    const botao = document.createElement("button");
    botao.className = "botao";
    botao.textContent = texto;
    botao.addEventListener("click", funcao);
    return botao;
}

// Monta o card (bloco) de uma tarefa
function criarCard(tarefa) {
    const card = document.createElement("div");
    card.className = "card";

    card.appendChild(criarLinha("Descrição", tarefa.descricao));
    card.appendChild(criarLinha("Setor", tarefa.setor));
    card.appendChild(criarLinha("Prioridade", NOMES_PRIORIDADE[tarefa.prioridade]));
    card.appendChild(criarLinha("Vinculado a", tarefa.nome_usuario));
    card.appendChild(criarLinha("Status", NOMES_STATUS[tarefa.status]));

    // Botões Editar e Excluir
    const acoes = document.createElement("div");
    acoes.className = "acoes";
    acoes.appendChild(criarBotao("Editar", function () {
        window.location.href = "cadastro_tarefa.html?id=" + tarefa.id_tarefa;
    }));
    acoes.appendChild(criarBotao("Excluir", function () {
        excluirTarefa(tarefa.id_tarefa);
    }));
    card.appendChild(acoes);

    // Botões para alterar o status (mostra só os outros status)
    const titulo = document.createElement("p");
    titulo.innerHTML = "<strong>Alterar status:</strong>";
    card.appendChild(titulo);

    const botoesStatus = document.createElement("div");
    botoesStatus.className = "acoes";
    for (const status of STATUS) {
        if (status != tarefa.status) {
            botoesStatus.appendChild(criarBotao(NOMES_STATUS[status], function () {
                alterarStatus(tarefa.id_tarefa, status);
            }));
        }
    }
    card.appendChild(botoesStatus);

    return card;
}

// Busca as tarefas no banco e coloca cada uma na coluna do seu status
async function carregarTarefas() {
    try {
        const resposta = await fetch("/api/tarefas");
        const tarefas = await resposta.json();

        for (const status of STATUS) {
            colunas[status].innerHTML = "";
        }

        for (const tarefa of tarefas) {
            colunas[tarefa.status].appendChild(criarCard(tarefa));
        }

        // Mostra um aviso nas colunas que ficaram vazias
        for (const status of STATUS) {
            if (colunas[status].children.length == 0) {
                colunas[status].innerHTML = '<p class="vazio">Nenhuma tarefa.</p>';
            }
        }
    } catch (erro) {
        for (const status of STATUS) {
            colunas[status].innerHTML = '<p class="vazio">Não foi possível carregar as tarefas.</p>';
        }
    }
}

// Exclui a tarefa depois da confirmação do usuário
async function excluirTarefa(id) {
    if (!confirm("Deseja realmente excluir esta tarefa?")) {
        return;
    }

    const resposta = await fetch("/api/tarefas/" + id, { method: "DELETE" });
    const dados = await resposta.json();
    alert(dados.mensagem);
    carregarTarefas();
}

// Atualiza o status no banco e recarrega as colunas
async function alterarStatus(id, novoStatus) {
    const resposta = await fetch("/api/tarefas/" + id + "/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
    });

    if (!resposta.ok) {
        const dados = await resposta.json();
        alert(dados.mensagem);
    }
    carregarTarefas();
}

carregarTarefas();
