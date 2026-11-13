// Conexão com o banco de dados MySQL (XAMPP)
const mysql = require("mysql2");

const conexao = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "gerenciamento_tarefas",
    charset: "utf8mb4"
});

// Exporta a versão com "promise" para poder usar async/await nas rotas
module.exports = conexao.promise();
