const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORTA = 3000;

const PRIORIDADES = ["baixa", "media", "alta"];
const STATUS = ["a fazer", "fazendo", "pronto"];

// Permite receber dados em JSON
app.use(express.json());

// Mostra as páginas da pasta frontend (index.html é a primeira tela)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Verifica se o e-mail tem o formato nome@dominio.algo
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ================= USUÁRIOS =================

// Lista os usuários (usado no campo "Usuário" do cadastro de tarefas)
app.get("/api/usuarios", async (req, res) => {
    try {
        const [usuarios] = await db.query("SELECT id_usuario, nome, email FROM usuarios ORDER BY nome");
        res.json(usuarios);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao buscar usuários." });
    }
});

// Cadastra um novo usuário
app.post("/api/usuarios", async (req, res) => {
    const nome = (req.body.nome || "").trim();
    const email = (req.body.email || "").trim();

    if (nome == "" || email == "") {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }
    if (!emailValido(email)) {
        return res.status(400).json({ mensagem: "Digite um e-mail válido." });
    }

    try {
        await db.query("INSERT INTO usuarios (nome, email) VALUES (?, ?)", [nome, email]);
        res.status(201).json({ mensagem: "cadastro concluído com sucesso" });
    } catch (erro) {
        if (erro.code == "ER_DUP_ENTRY") {
            return res.status(400).json({ mensagem: "Este e-mail já está cadastrado." });
        }
        res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

// ================= TAREFAS =================

// Lista todas as tarefas com o nome do usuário (usa a view vw_tarefas)
app.get("/api/tarefas", async (req, res) => {
    try {
        const [tarefas] = await db.query(
            "SELECT * FROM vw_tarefas ORDER BY FIELD(prioridade, 'alta', 'media', 'baixa'), data_cadastro"
        );
        res.json(tarefas);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao buscar tarefas." });
    }
});

// Busca uma tarefa pelo id (usado na edição)
app.get("/api/tarefas/:id", async (req, res) => {
    try {
        const [tarefas] = await db.query("SELECT * FROM tarefas WHERE id_tarefa = ?", [req.params.id]);
        if (tarefas.length == 0) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada." });
        }
        res.json(tarefas[0]);
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao buscar tarefa." });
    }
});

// Confere os campos do formulário de tarefa
function validarTarefa(dados) {
    const descricao = (dados.descricao || "").trim();
    const setor = (dados.setor || "").trim();
    const id_usuario = parseInt(dados.id_usuario);
    const prioridade = dados.prioridade;

    if (descricao == "" || setor == "" || !id_usuario || !PRIORIDADES.includes(prioridade)) {
        return null;
    }
    return { descricao, setor, id_usuario, prioridade };
}

// Cadastra uma nova tarefa (o status entra como 'a fazer' pelo DEFAULT do banco)
app.post("/api/tarefas", async (req, res) => {
    const tarefa = validarTarefa(req.body);
    if (!tarefa) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    try {
        await db.query(
            "INSERT INTO tarefas (id_usuario, descricao, setor, prioridade) VALUES (?, ?, ?, ?)",
            [tarefa.id_usuario, tarefa.descricao, tarefa.setor, tarefa.prioridade]
        );
        res.status(201).json({ mensagem: "cadastro concluído com sucesso" });
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao cadastrar tarefa." });
    }
});

// Edita uma tarefa existente (não cria uma nova)
app.put("/api/tarefas/:id", async (req, res) => {
    const tarefa = validarTarefa(req.body);
    if (!tarefa) {
        return res.status(400).json({ mensagem: "Preencha todos os campos." });
    }

    try {
        const [resultado] = await db.query(
            "UPDATE tarefas SET id_usuario = ?, descricao = ?, setor = ?, prioridade = ? WHERE id_tarefa = ?",
            [tarefa.id_usuario, tarefa.descricao, tarefa.setor, tarefa.prioridade, req.params.id]
        );
        if (resultado.affectedRows == 0) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada." });
        }
        res.json({ mensagem: "cadastro concluído com sucesso" });
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao atualizar tarefa." });
    }
});

// Altera somente o status da tarefa
app.patch("/api/tarefas/:id/status", async (req, res) => {
    const status = req.body.status;
    if (!STATUS.includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido." });
    }

    try {
        await db.query("UPDATE tarefas SET status = ? WHERE id_tarefa = ?", [status, req.params.id]);
        res.json({ mensagem: "Status atualizado." });
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao atualizar status." });
    }
});

// Exclui a tarefa
app.delete("/api/tarefas/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM tarefas WHERE id_tarefa = ?", [req.params.id]);
        res.json({ mensagem: "Tarefa excluída com sucesso." });
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao excluir tarefa." });
    }
});

app.listen(PORTA, () => {
    console.log("Servidor rodando em http://localhost:" + PORTA);
});
