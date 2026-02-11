-- ============================================
-- DADOS DE EXEMPLO PARA TESTES
-- ============================================

-- Inserir auditores de exemplo
INSERT INTO auditores (nome, matricula, setor) VALUES
('João Silva', '12345', 'Fiscalização Central'),
('Maria Santos', '12346', 'Fiscalização Zona Sul'),
('Pedro Oliveira', '12347', 'Fiscalização Zona Norte'),
('Ana Costa', '12348', 'Fiscalização Zona Oeste');

-- Inserir eventos de exemplo
INSERT INTO eventos (nome, ra, tipo_evento, publico_estimado, data_evento) VALUES
('Bloco da Tati', 'Plano Piloto', 'Bloco de Rua', 5000, '2026-02-10'),
('Bloco Mamãe Taguá 2026', 'Taguatinga', 'Bloco de Rua', 3000, '2026-02-10'),
('Carnaval do Pisa', 'Ceilândia', 'Bloco de Rua', 8000, '2026-02-11'),
('Suvaco da Asa 20 Anos', 'Plano Piloto', 'Bloco de Rua', 10000, '2026-02-11'),
('Bloco da Terceirona - 2ª Edição', 'Águas Claras', 'Bloco de Rua', 4000, '2026-02-12');

-- Registros de fiscalização de exemplo
INSERT INTO registros_fiscalizacao (
  auditor_id, evento_id, turno, data_turno, inicio_turno, termino_turno,
  latitude, longitude, situacao_evento, recursos_apoio, recursos_motoristas, recursos_veiculos,
  ocorrencias_registradas, checklist_local, checklist_revisado, checklist_anexos
) VALUES
(1, 1, 'noite', '2026-02-10', '18:00', '23:00', -15.7942, -47.8822, 'Regular', 5, 2, 3, false, true, true, true),
(2, 2, 'tarde', '2026-02-10', '14:00', '19:00', -15.8451, -48.0431, 'Irregular', 3, 1, 2, true, true, true, false),
(3, 3, 'noite', '2026-02-11', '19:00', '00:00', -15.8178, -48.1078, 'Regular', 6, 3, 4, false, true, true, true),
(4, 4, 'noite', '2026-02-11', '18:00', '01:00', -15.7942, -47.8822, 'Regular', 8, 4, 5, true, true, true, true);

-- Ações fiscais
INSERT INTO acoes_fiscais (registro_id, tipo_acao) VALUES
(1, 'Vistoria'),
(1, 'Orientação'),
(2, 'Vistoria'),
(2, 'Notificação'),
(2, 'Apreensão'),
(3, 'Vistoria'),
(4, 'Vistoria'),
(4, 'Notificação');

-- Vistorias
INSERT INTO vistorias (registro_id, quantidade) VALUES
(1, 3),
(2, 5),
(3, 4),
(4, 6);

-- Notificações
INSERT INTO notificacoes (registro_id, responsavel, documento) VALUES
(2, 'Carlos Souza', '123.456.789-00'),
(4, 'Empresa XYZ Ltda', '12.345.678/0001-90');

-- Infrações
INSERT INTO infracoes (registro_id, responsavel, documento, valor_multa) VALUES
(2, 'Carlos Souza', '123.456.789-00', 500.00);

-- Apreensões
INSERT INTO apreensoes (registro_id, responsavel, documento, quantidade_bens, descricao) VALUES
(2, 'Carlos Souza', '123.456.789-00', 50, 'Bebidas alcoólicas sem autorização');

-- Bens apreendidos
INSERT INTO bens_apreendidos (apreensao_id, nome_bem, quantidade) VALUES
(1, 'Garrafa Cerveja (vidro)', 30),
(1, 'Lata Cerveja', 20);

-- Ambulantes
INSERT INTO ambulantes (
  registro_id, detectados, abordados, dispersados, vistoria_qtde,
  com_licenca, sem_licenca, em_desacordo,
  tem_autos_apreensao, autos_qtde, autos_bens_qtde
) VALUES
(2, 15, 12, 5, 12, 3, 7, 2, true, 2, 25),
(3, 20, 18, 8, 18, 5, 10, 3, true, 3, 40),
(4, 25, 20, 10, 20, 8, 9, 3, true, 2, 30);

-- Bens de ambulantes (autos)
INSERT INTO bens_ambulantes_autos (ambulante_id, nome_bem, quantidade) VALUES
(1, 'Lata Cerveja', 15),
(1, 'Lata Refrigerante', 10),
(2, 'Garrafa Cerveja (vidro)', 20),
(2, 'Lata Energético', 20),
(3, 'Lata Cerveja', 25),
(3, 'Cigarro eletrônico', 5);

-- Fotos de exemplo (base64 placeholder)
INSERT INTO fotos (registro_id, tipo_foto, filename) VALUES
(2, 'apreensoes', 'foto_apreensao_1.jpg'),
(2, 'apreensoes', 'foto_apreensao_2.jpg'),
(4, 'outros', 'foto_evento_1.jpg');

-- ============================================
-- CONSULTAS DE VERIFICAÇÃO
-- ============================================

-- Ver todos os registros completos
-- SELECT * FROM vw_registros_completos;

-- Ver estatísticas por evento
-- SELECT * FROM vw_estatisticas_eventos;

-- Ver performance dos auditores
-- SELECT * FROM vw_performance_auditores;

-- Ver bens mais apreendidos
-- SELECT * FROM vw_bens_mais_apreendidos;

-- Ver ambulantes por região
-- SELECT * FROM vw_ambulantes_por_regiao;
