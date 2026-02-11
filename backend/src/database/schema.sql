-- ============================================
-- SCHEMA DO BANCO DE DADOS - CARNAVAL FISCALIZAÇÃO
-- ============================================

-- Tabela de Auditores/Fiscais
CREATE TABLE IF NOT EXISTS auditores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    setor VARCHAR(100),
    setor_outro VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nome_outro VARCHAR(255),
    ra VARCHAR(100),
    tipo_evento VARCHAR(100),
    publico_estimado INTEGER,
    data_evento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para acelerar buscas por nome e data
CREATE INDEX IF NOT EXISTS idx_eventos_nome ON eventos(nome);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_ra ON eventos(ra);

-- Tabela principal de Registros de Fiscalização
CREATE TABLE IF NOT EXISTS registros_fiscalizacao (
    id SERIAL PRIMARY KEY,
    auditor_id INTEGER REFERENCES auditores(id),
    evento_id INTEGER REFERENCES eventos(id),
    
    -- Informações do Turno
    turno VARCHAR(20),
    data_turno DATE NOT NULL,
    inicio_turno TIME,
    termino_turno TIME,
    
    -- Localização GPS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Situação e Tipo
    situacao_evento VARCHAR(100),
    tipo_estabelecimento VARCHAR(100),
    estabelecimento_outro VARCHAR(255),
    estabelecimento_licenciado VARCHAR(10),
    tipo_atividade_carnavalesca VARCHAR(100),
    
    -- Recursos
    recursos_apoio INTEGER DEFAULT 0,
    recursos_motoristas INTEGER DEFAULT 0,
    recursos_veiculos INTEGER DEFAULT 0,
    
    -- Ocorrências
    ocorrencias_registradas BOOLEAN DEFAULT false,
    ocorrencias_descricao TEXT,
    outros_fatos_observados BOOLEAN DEFAULT false,
    outros_fatos_descricao TEXT,
    
    -- Checklist de Finalização
    checklist_local BOOLEAN DEFAULT false,
    checklist_revisado BOOLEAN DEFAULT false,
    checklist_anexos BOOLEAN DEFAULT false,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para garantir integridade
    CONSTRAINT chk_turno CHECK (turno IN ('manhã', 'tarde', 'noite', 'madrugada'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros_fiscalizacao(data_turno);
CREATE INDEX IF NOT EXISTS idx_registros_auditor ON registros_fiscalizacao(auditor_id);
CREATE INDEX IF NOT EXISTS idx_registros_evento ON registros_fiscalizacao(evento_id);
CREATE INDEX IF NOT EXISTS idx_registros_created ON registros_fiscalizacao(created_at);

-- Tabela de Ações Fiscais
CREATE TABLE IF NOT EXISTS acoes_fiscais (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_acao VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_acoes_registro ON acoes_fiscais(registro_id);
CREATE INDEX IF NOT EXISTS idx_acoes_tipo ON acoes_fiscais(tipo_acao);

-- Tabela de Vistorias
CREATE TABLE IF NOT EXISTS vistorias (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    tipo VARCHAR(50) DEFAULT 'geral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vistorias_registro ON vistorias(registro_id);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    tipo VARCHAR(50) DEFAULT 'notificacao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_registro ON notificacoes(registro_id);

-- Tabela de Interdições
CREATE TABLE IF NOT EXISTS interdicoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    cpf_cnpj VARCHAR(18),
    data_interdicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interdicoes_registro ON interdicoes(registro_id);

-- Tabela de Infrações
CREATE TABLE IF NOT EXISTS infracoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    valor_multa DECIMAL(10, 2),
    data_infracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infracoes_registro ON infracoes(registro_id);

-- Tabela de Apreensões
CREATE TABLE IF NOT EXISTS apreensoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    quantidade_bens INTEGER DEFAULT 0,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'apreensao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apreensoes_registro ON apreensoes(registro_id);

-- Tabela de Bens Apreendidos (detalhes)
CREATE TABLE IF NOT EXISTS bens_apreendidos (
    id SERIAL PRIMARY KEY,
    apreensao_id INTEGER REFERENCES apreensoes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    tipo VARCHAR(50) DEFAULT 'bem',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_apreensao ON bens_apreendidos(apreensao_id);
CREATE INDEX IF NOT EXISTS idx_bens_nome ON bens_apreendidos(nome_bem);

-- Tabela de Ambulantes
CREATE TABLE IF NOT EXISTS ambulantes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    detectados INTEGER DEFAULT 0,
    abordados INTEGER DEFAULT 0,
    dispersados INTEGER DEFAULT 0,
    vistoria_qtde INTEGER DEFAULT 0,
    
    -- Situação dos Abordados
    com_licenca INTEGER DEFAULT 0,
    sem_licenca INTEGER DEFAULT 0,
    em_desacordo INTEGER DEFAULT 0,
    
    -- Autos de Apreensão
    tem_autos_apreensao BOOLEAN DEFAULT false,
    autos_qtde INTEGER DEFAULT 0,
    autos_bens_qtde INTEGER DEFAULT 0,
    autos_outros_descricao TEXT,
    
    -- TRV
    tem_trv BOOLEAN DEFAULT false,
    trv_qtde INTEGER DEFAULT 0,
    trv_bens_qtde INTEGER DEFAULT 0,
    trv_outros_descricao TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ambulantes_registro ON ambulantes(registro_id);

-- Tabela de Bens de Ambulantes (Autos)
CREATE TABLE IF NOT EXISTS bens_ambulantes_autos (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_autos ON bens_ambulantes_autos(ambulante_id);

-- Tabela de Bens de Ambulantes (TRV)
CREATE TABLE IF NOT EXISTS bens_ambulantes_trv (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_trv ON bens_ambulantes_trv(ambulante_id);

-- Tabela de Fotos
CREATE TABLE IF NOT EXISTS fotos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_foto VARCHAR(50), -- 'apreensoes', 'autos', 'outros'
    url_foto TEXT,
    base64_data TEXT, -- Para armazenar base64 se necessário
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fotos_registro ON fotos(registro_id);
CREATE INDEX IF NOT EXISTS idx_fotos_tipo ON fotos(tipo_foto);

-- Tabela de Documentos
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50),
    url_documento TEXT,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_registro ON documentos(registro_id);

-- ============================================
-- VIEWS PARA BI/ANALYTICS
-- ============================================

-- View consolidada de registros com informações principais
CREATE OR REPLACE VIEW vw_registros_completos AS
SELECT 
    r.id,
    r.data_turno,
    r.turno,
    r.inicio_turno,
    r.termino_turno,
    a.nome as auditor_nome,
    a.matricula as auditor_matricula,
    a.setor as auditor_setor,
    e.nome as evento_nome,
    e.ra as evento_ra,
    e.tipo_evento,
    e.publico_estimado,
    r.situacao_evento,
    r.latitude,
    r.longitude,
    r.recursos_apoio,
    r.recursos_motoristas,
    r.recursos_veiculos,
    r.ocorrencias_registradas,
    r.created_at
FROM registros_fiscalizacao r
LEFT JOIN auditores a ON r.auditor_id = a.id
LEFT JOIN eventos e ON r.evento_id = e.id;

-- View de estatísticas por evento
CREATE OR REPLACE VIEW vw_estatisticas_eventos AS
SELECT 
    e.nome as evento_nome,
    e.ra,
    COUNT(DISTINCT r.id) as total_registros,
    COUNT(DISTINCT r.auditor_id) as total_auditores,
    SUM(CASE WHEN r.ocorrencias_registradas THEN 1 ELSE 0 END) as total_ocorrencias,
    AVG(e.publico_estimado) as media_publico,
    MAX(r.created_at) as ultimo_registro
FROM eventos e
LEFT JOIN registros_fiscalizacao r ON e.id = r.evento_id
GROUP BY e.id, e.nome, e.ra;

-- View de bens mais apreendidos
CREATE OR REPLACE VIEW vw_bens_mais_apreendidos AS
SELECT 
    ba.nome_bem,
    SUM(ba.quantidade) as total_quantidade,
    COUNT(DISTINCT ba.apreensao_id) as total_apreensoes,
    COUNT(DISTINCT a.registro_id) as total_registros
FROM bens_apreendidos ba
JOIN apreensoes a ON ba.apreensao_id = a.id
GROUP BY ba.nome_bem
ORDER BY total_quantidade DESC;

-- View de performance de auditores
CREATE OR REPLACE VIEW vw_performance_auditores AS
SELECT 
    a.nome as auditor_nome,
    a.matricula,
    a.setor,
    COUNT(DISTINCT r.id) as total_registros,
    COUNT(DISTINCT r.evento_id) as total_eventos_fiscalizados,
    COUNT(DISTINCT af.id) as total_acoes_fiscais,
    COUNT(DISTINCT ap.id) as total_apreensoes,
    COUNT(DISTINCT i.id) as total_infracoes,
    SUM(COALESCE(i.valor_multa, 0)) as valor_total_multas
FROM auditores a
LEFT JOIN registros_fiscalizacao r ON a.id = r.auditor_id
LEFT JOIN acoes_fiscais af ON r.id = af.registro_id
LEFT JOIN apreensoes ap ON r.id = ap.registro_id
LEFT JOIN infracoes i ON r.id = i.registro_id
GROUP BY a.id, a.nome, a.matricula, a.setor;

-- View de ambulantes por região
CREATE OR REPLACE VIEW vw_ambulantes_por_regiao AS
SELECT 
    e.ra,
    COUNT(DISTINCT amb.id) as total_registros_ambulantes,
    SUM(amb.detectados) as total_detectados,
    SUM(amb.abordados) as total_abordados,
    SUM(amb.dispersados) as total_dispersados,
    SUM(amb.com_licenca) as total_com_licenca,
    SUM(amb.sem_licenca) as total_sem_licenca,
    SUM(amb.em_desacordo) as total_em_desacordo
FROM ambulantes amb
JOIN registros_fiscalizacao r ON amb.registro_id = r.id
JOIN eventos e ON r.evento_id = e.id
GROUP BY e.ra;

-- View de timeline de registros (para dashboards em tempo real)
CREATE OR REPLACE VIEW vw_timeline_registros AS
SELECT 
    DATE_TRUNC('hour', r.created_at) as hora,
    COUNT(r.id) as total_registros,
    COUNT(DISTINCT r.evento_id) as total_eventos,
    COUNT(DISTINCT r.auditor_id) as total_auditores_ativos
FROM registros_fiscalizacao r
WHERE r.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', r.created_at)
ORDER BY hora DESC;

-- ============================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auditores_updated_at BEFORE UPDATE ON auditores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON registros_fiscalizacao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTÁRIOS NAS TABELAS (Documentação)
-- ============================================

COMMENT ON TABLE registros_fiscalizacao IS 'Tabela principal com todos os registros de fiscalização';
COMMENT ON TABLE eventos IS 'Catálogo de eventos de carnaval';
COMMENT ON TABLE auditores IS 'Cadastro de auditores/fiscais';
COMMENT ON TABLE acoes_fiscais IS 'Ações fiscais realizadas durante a fiscalização';
COMMENT ON TABLE bens_apreendidos IS 'Detalhamento de bens apreendidos';
COMMENT ON TABLE ambulantes IS 'Informações sobre ambulantes detectados e ações tomadas';
COMMENT ON TABLE fotos IS 'Armazenamento de fotos dos registros';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
