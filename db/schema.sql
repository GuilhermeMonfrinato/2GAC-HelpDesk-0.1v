-- =====================================================================
-- EXÉRCITO BRASILEIRO - COMANDO MILITAR DO SUDESTE
-- 2º GRUPO DE ARTILHARIA DE CAMPANHA - REGIMENTO DEODORO
-- SEÇÃO DE INFORMÁTICA & TELEMÁTICA (CTI)
-- 
-- SCRIPT DE BANCO DE DADOS OFICIAL: MYSQL / POSTGRESQL / SQLITE
-- Compatível com Apache / Docker / MySQL 8.0 / MariaDB 10.x / PostgreSQL
-- =====================================================================

CREATE DATABASE IF NOT EXISTS regimento_deodoro_helpdesk 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE regimento_deodoro_helpdesk;

-- 1. TABELA DE SEÇÕES DA OM (DEPARTAMENTOS)
CREATE TABLE IF NOT EXISTS secoes (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    chefe_responsavel VARCHAR(100),
    cor_identificacao VARCHAR(20) DEFAULT '#27431e',
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE MILITARES DA SEÇÃO DE TI (USUÁRIOS E TÉCNICOS)
CREATE TABLE IF NOT EXISTS militares_ti (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(120) NOT NULL,
    posto_graduacao VARCHAR(30) NOT NULL,
    nome_de_guerra VARCHAR(50) NOT NULL,
    cargo_permissao ENUM('CH-SECINFO', 'CH-TVINFO', 'CH-TECNICOINFO', 'CH-XERIFEINFO') NOT NULL,
    email_institucional VARCHAR(100),
    especialidade VARCHAR(100) DEFAULT 'TI e Redes',
    ativo BOOLEAN DEFAULT TRUE,
    motivo_desligamento TEXT,
    data_desligamento DATE,
    desligado_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE CHAMADOS / TICKETS DE TI
CREATE TABLE IF NOT EXISTS chamados (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE, -- ex: TICKET-1001
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
    status ENUM('aberto', 'em_atendimento', 'aguardando', 'resolvido', 'cancelado') DEFAULT 'aberto',
    solicitante_nome VARCHAR(100) NOT NULL,
    secao_id VARCHAR(36) NOT NULL,
    tecnico_id VARCHAR(36),
    sla_limite_horas INT DEFAULT 4,
    notas_resolucao TEXT,
    avaliacao_nota INT DEFAULT NULL,
    avaliacao_comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolvido_em TIMESTAMP NULL,
    FOREIGN KEY (secao_id) REFERENCES secoes(id) ON DELETE CASCADE,
    FOREIGN KEY (tecnico_id) REFERENCES militares_ti(id) ON DELETE SET NULL
);

-- 4. TABELA DE MENSAGENS / CHAT DOS CHAMADOS (TEMPO REAL)
CREATE TABLE IF NOT EXISTS chamados_mensagens (
    id VARCHAR(36) PRIMARY KEY,
    chamado_id VARCHAR(36) NOT NULL,
    remetente_tipo ENUM('solicitante', 'ti') NOT NULL,
    remetente_nome VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    lida_pela_ti BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE
);

-- 5. TABELA DE HISTÓRICO DE AUDITORIA DO CHAMADO
CREATE TABLE IF NOT EXISTS chamados_historico (
    id VARCHAR(36) PRIMARY KEY,
    chamado_id VARCHAR(36) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    comentario TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE
);

-- 6. TABELA DE CAUTELAS DE NOTEBOOKS (CTI)
CREATE TABLE IF NOT EXISTS cautelas_notebooks (
    id VARCHAR(36) PRIMARY KEY,
    numero_patrimonio VARCHAR(50) NOT NULL, -- ex: DEODORO-NTB-014
    modelo VARCHAR(100) NOT NULL,
    militar_responsavel VARCHAR(100) NOT NULL,
    secao_id VARCHAR(36) NOT NULL,
    data_cautela DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    data_inicial_prevista DATE NOT NULL,
    qtd_prorrogacoes INT DEFAULT 0,
    motivo_ultima_prorrogacao TEXT,
    data_devolucao_efetiva DATE NULL,
    status ENUM('cautelado', 'devolvido') DEFAULT 'cautelado',
    possui_avarias BOOLEAN DEFAULT FALSE,
    laudo_avarias TEXT,
    autorizado_por VARCHAR(100) NOT NULL,
    recebido_por VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secao_id) REFERENCES secoes(id) ON DELETE CASCADE
);

-- 7. TABELA DE CHAT & MENSAGENS DAS CAUTELAS
CREATE TABLE IF NOT EXISTS cautelas_mensagens (
    id VARCHAR(36) PRIMARY KEY,
    cautela_id VARCHAR(36) NOT NULL,
    remetente_tipo ENUM('militar', 'ti') NOT NULL,
    remetente_nome VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cautela_id) REFERENCES cautelas_notebooks(id) ON DELETE CASCADE
);

-- 8. TABELA DE HISTÓRICO DE PRORROGAÇÃO E VISTORIA DE NOTEBOOKS
CREATE TABLE IF NOT EXISTS cautelas_historico (
    id VARCHAR(36) PRIMARY KEY,
    cautela_id VARCHAR(36) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    resumo VARCHAR(255) NOT NULL,
    data_anterior DATE,
    nova_data DATE,
    justificativa TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cautela_id) REFERENCES cautelas_notebooks(id) ON DELETE CASCADE
);

-- 9. TABELA DE MISSÕES & ORDENS DE SERVIÇO DA TI
CREATE TABLE IF NOT EXISTS missoes_ti (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE, -- ex: MISSAO-001
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
    status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
    local_om VARCHAR(120),
    militares_atribuidos_ids JSON,
    prazo_limite DATETIME NULL,
    emitida_por VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    concluida_em TIMESTAMP NULL
);

-- 10. TABELA DE DESPACHOS E RELATÓRIOS DE CAMPO DAS MISSÕES
CREATE TABLE IF NOT EXISTS missoes_relatorios (
    id VARCHAR(36) PRIMARY KEY,
    missao_id VARCHAR(36) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    texto_relatorio TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (missao_id) REFERENCES missoes_ti(id) ON DELETE CASCADE
);

-- 11. TABELA DE LOGS GERAIS DE AUDITORIA DO REGIMENTO
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id VARCHAR(36) PRIMARY KEY,
    militar_nome VARCHAR(100) NOT NULL,
    militar_login VARCHAR(50) NOT NULL,
    cargo_role VARCHAR(30) NOT NULL,
    tipo_acao VARCHAR(50) NOT NULL,
    resumo VARCHAR(255) NOT NULL,
    detalhes TEXT,
    codigo_referencia VARCHAR(50),
    registrado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE PERFORMANCE PARA BUSCA RÁPIDA
CREATE INDEX idx_chamados_status ON chamados(status);
CREATE INDEX idx_chamados_codigo ON chamados(codigo);
CREATE INDEX idx_cautelas_status ON cautelas_notebooks(status);
CREATE INDEX idx_cautelas_patrimonio ON cautelas_notebooks(numero_patrimonio);
CREATE INDEX idx_missoes_status ON missoes_ti(status);
CREATE INDEX idx_logs_timestamp ON logs_auditoria(registrado_em);
