CREATE DATABASE IF NOT EXISTS gerenciamento_tarefas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gerenciamento_tarefas;

DROP VIEW IF EXISTS vw_tarefas;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE tarefas (
    id_tarefa     INT NOT NULL AUTO_INCREMENT,
    id_usuario    INT NOT NULL,
    descricao     VARCHAR(255) NOT NULL,
    setor         VARCHAR(100) NOT NULL,
    prioridade    ENUM('baixa', 'media', 'alta') NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        ENUM('a fazer', 'fazendo', 'pronto') NOT NULL DEFAULT 'a fazer',
    PRIMARY KEY (id_tarefa),
    CONSTRAINT fk_tarefas_usuarios FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE VIEW vw_tarefas AS
SELECT t.id_tarefa,
       t.descricao,
       t.setor,
       t.prioridade,
       t.data_cadastro,
       t.status,
       u.id_usuario,
       u.nome AS nome_usuario,
       u.email AS email_usuario
FROM tarefas t
INNER JOIN usuarios u ON u.id_usuario = t.id_usuario;

INSERT INTO usuarios (nome, email) VALUES
('João Silva',    'joao.silva@empresa.com'),
('Maria Souza',   'maria.souza@empresa.com'),
('Carlos Pereira','carlos.pereira@empresa.com'),
('Ana Oliveira',  'ana.oliveira@empresa.com');

INSERT INTO tarefas (id_usuario, descricao, setor, prioridade, status) VALUES
(1, 'Verificar validade dos insumos do estoque', 'Almoxarifado', 'alta',  'a fazer'),
(2, 'Higienizar a linha de envase 2',            'Produção',     'media', 'a fazer'),
(3, 'Calibrar a balança da expedição',           'Qualidade',    'baixa', 'fazendo'),
(4, 'Emitir relatório mensal de perdas',         'Administrativo','media','pronto');
