-- ============================================
-- QUERIES PRONTAS PARA FERRAMENTAS DE BI
-- Power BI, Tableau, Metabase, etc.
-- ============================================

-- ================================================
-- 1. VISÃO GERAL - DASHBOARD PRINCIPAL
-- ================================================

-- KPIs Principais
SELECT 
    COUNT(DISTINCT r.id) as total_registros,
    COUNT(DISTINCT r.evento_id) as total_eventos,
    COUNT(DISTINCT r.auditor_id) as total_auditores,
    COUNT(DISTINCT ap.id) as total_apreensoes,
    SUM(COALESCE(i.valor_multa, 0)) as valor_total_multas,
    SUM(amb.detectados) as total_ambulantes_detectados,
    SUM(amb.abordados) as total_ambulantes_abordados
FROM registros_fiscalizacao r
LEFT JOIN apreensoes ap ON r.id = ap.registro_id
LEFT JOIN infracoes i ON r.id = i.registro_id
LEFT JOIN ambulantes amb ON r.id = amb.registro_id;

-- ================================================
-- 2. SÉRIE TEMPORAL - REGISTROS POR DIA/HORA
-- ================================================

-- Registros por dia
SELECT 
    DATE(data_turno) as data,
    COUNT(*) as total_registros,
    COUNT(DISTINCT evento_id) as total_eventos,
    SUM(CASE WHEN ocorrencias_registradas THEN 1 ELSE 0 END) as com_ocorrencias
FROM registros_fiscalizacao
WHERE data_turno >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(data_turno)
ORDER BY data;

-- Registros por hora do dia (heatmap de horários)
SELECT 
    EXTRACT(HOUR FROM inicio_turno) as hora,
    turno,
    COUNT(*) as total_registros
FROM registros_fiscalizacao
WHERE inicio_turno IS NOT NULL
GROUP BY EXTRACT(HOUR FROM inicio_turno), turno
ORDER BY hora;

-- ================================================
-- 3. ANÁLISE POR REGIÃO ADMINISTRATIVA
-- ================================================

-- Mapa de calor por RA
SELECT 
    e.ra,
    COUNT(DISTINCT r.id) as total_registros,
    COUNT(DISTINCT r.evento_id) as total_eventos,
    SUM(CASE WHEN r.ocorrencias_registradas THEN 1 ELSE 0 END) as total_ocorrencias,
    COUNT(DISTINCT ap.id) as total_apreensoes,
    SUM(COALESCE(i.valor_multa, 0)) as valor_multas,
    AVG(e.publico_estimado) as media_publico
FROM eventos e
LEFT JOIN registros_fiscalizacao r ON e.id = r.evento_id
LEFT JOIN apreensoes ap ON r.id = ap.registro_id
LEFT JOIN infracoes i ON r.id = i.registro_id
GROUP BY e.ra
ORDER BY total_registros DESC;

-- Lista de coordenadas para mapa (geolocalização)
SELECT 
    r.id,
    r.latitude,
    r.longitude,
    e.nome as evento,
    e.ra,
    r.data_turno,
    r.situacao_evento,
    CASE WHEN r.ocorrencias_registradas THEN 'Com Ocorrência' ELSE 'Normal' END as status
FROM registros_fiscalizacao r
JOIN eventos e ON r.evento_id = e.id
WHERE r.latitude IS NOT NULL 
  AND r.longitude IS NOT NULL;

-- ================================================
-- 4. ANÁLISE DE EVENTOS
-- ================================================

-- Top 20 eventos com mais registros
SELECT 
    e.nome as evento,
    e.ra,
    e.tipo_evento,
    COUNT(r.id) as total_registros,
    SUM(CASE WHEN r.ocorrencias_registradas THEN 1 ELSE 0 END) as total_ocorrencias,
    AVG(e.publico_estimado) as media_publico,
    COUNT(DISTINCT ap.id) as total_apreensoes
FROM eventos e
LEFT JOIN registros_fiscalizacao r ON e.id = r.evento_id
LEFT JOIN apreensoes ap ON r.id = ap.registro_id
GROUP BY e.id, e.nome, e.ra, e.tipo_evento
ORDER BY total_registros DESC
LIMIT 20;

-- Eventos por tipo
SELECT 
    tipo_evento,
    COUNT(DISTINCT id) as total_eventos,
    SUM(publico_estimado) as publico_total,
    AVG(publico_estimado) as media_publico
FROM eventos
GROUP BY tipo_evento
ORDER BY total_eventos DESC;

-- ================================================
-- 5. PERFORMANCE DE AUDITORES
-- ================================================

-- Ranking de auditores
SELECT 
    a.nome,
    a.matricula,
    a.setor,
    COUNT(DISTINCT r.id) as total_registros,
    COUNT(DISTINCT r.evento_id) as eventos_fiscalizados,
    COUNT(DISTINCT af.id) as total_acoes_fiscais,
    COUNT(DISTINCT ap.id) as total_apreensoes,
    COUNT(DISTINCT i.id) as total_infracoes,
    SUM(COALESCE(i.valor_multa, 0)) as valor_total_multas
FROM auditores a
LEFT JOIN registros_fiscalizacao r ON a.id = r.auditor_id
LEFT JOIN acoes_fiscais af ON r.id = af.registro_id
LEFT JOIN apreensoes ap ON r.id = ap.registro_id
LEFT JOIN infracoes i ON r.id = i.registro_id
GROUP BY a.id, a.nome, a.matricula, a.setor
ORDER BY total_registros DESC;

-- Distribuição de trabalho por setor
SELECT 
    a.setor,
    COUNT(DISTINCT a.id) as total_auditores,
    COUNT(DISTINCT r.id) as total_registros,
    ROUND(COUNT(DISTINCT r.id)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 2) as media_registros_por_auditor
FROM auditores a
LEFT JOIN registros_fiscalizacao r ON a.id = r.auditor_id
GROUP BY a.setor
ORDER BY total_registros DESC;

-- ================================================
-- 6. ANÁLISE DE APREENSÕES
-- ================================================

-- Top 20 bens mais apreendidos
SELECT 
    ba.nome_bem,
    SUM(ba.quantidade) as total_quantidade,
    COUNT(DISTINCT ba.apreensao_id) as total_apreensoes,
    COUNT(DISTINCT a.registro_id) as total_registros,
    ROUND(AVG(ba.quantidade), 2) as media_por_apreensao
FROM bens_apreendidos ba
JOIN apreensoes a ON ba.apreensao_id = a.id
GROUP BY ba.nome_bem
ORDER BY total_quantidade DESC
LIMIT 20;

-- Apreensões por tipo de evento
SELECT 
    e.tipo_evento,
    COUNT(DISTINCT ap.id) as total_apreensoes,
    SUM(ap.quantidade_bens) as total_bens,
    COUNT(DISTINCT ba.id) as total_itens
FROM eventos e
JOIN registros_fiscalizacao r ON e.id = r.evento_id
JOIN apreensoes ap ON r.id = ap.registro_id
LEFT JOIN bens_apreendidos ba ON ap.id = ba.apreensao_id
GROUP BY e.tipo_evento
ORDER BY total_apreensoes DESC;

-- ================================================
-- 7. ANÁLISE DE AMBULANTES
-- ================================================

-- Estatísticas gerais de ambulantes
SELECT 
    e.ra,
    COUNT(DISTINCT amb.id) as total_registros,
    SUM(amb.detectados) as total_detectados,
    SUM(amb.abordados) as total_abordados,
    SUM(amb.dispersados) as total_dispersados,
    ROUND(SUM(amb.abordados)::numeric / NULLIF(SUM(amb.detectados), 0) * 100, 2) as taxa_abordagem_pct,
    SUM(amb.com_licenca) as total_com_licenca,
    SUM(amb.sem_licenca) as total_sem_licenca,
    SUM(amb.em_desacordo) as total_em_desacordo
FROM ambulantes amb
JOIN registros_fiscalizacao r ON amb.registro_id = r.id
JOIN eventos e ON r.evento_id = e.id
GROUP BY e.ra
ORDER BY total_detectados DESC;

-- Efetividade da fiscalização de ambulantes
SELECT 
    a.nome as auditor,
    COUNT(DISTINCT amb.id) as registros_com_ambulantes,
    SUM(amb.detectados) as total_detectados,
    SUM(amb.abordados) as total_abordados,
    SUM(amb.dispersados) as total_dispersados,
    ROUND(SUM(amb.abordados)::numeric / NULLIF(SUM(amb.detectados), 0) * 100, 2) as taxa_abordagem
FROM ambulantes amb
JOIN registros_fiscalizacao r ON amb.registro_id = r.id
JOIN auditores a ON r.auditor_id = a.id
WHERE amb.detectados > 0
GROUP BY a.id, a.nome
ORDER BY total_detectados DESC;

-- ================================================
-- 8. ANÁLISE DE AÇÕES FISCAIS
-- ================================================

-- Distribuição de ações fiscais por tipo
SELECT 
    tipo_acao,
    COUNT(*) as total,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM acoes_fiscais) * 100, 2) as percentual
FROM acoes_fiscais
GROUP BY tipo_acao
ORDER BY total DESC;

-- Ações fiscais por evento
SELECT 
    e.nome as evento,
    e.ra,
    COUNT(DISTINCT af.id) as total_acoes,
    STRING_AGG(DISTINCT af.tipo_acao, ', ') as tipos_acoes
FROM eventos e
JOIN registros_fiscalizacao r ON e.id = r.evento_id
JOIN acoes_fiscais af ON r.id = af.registro_id
GROUP BY e.id, e.nome, e.ra
ORDER BY total_acoes DESC
LIMIT 20;

-- ================================================
-- 9. ANÁLISE FINANCEIRA (MULTAS)
-- ================================================

-- Resumo de multas
SELECT 
    COUNT(*) as total_multas,
    SUM(valor_multa) as valor_total,
    AVG(valor_multa) as valor_medio,
    MIN(valor_multa) as valor_minimo,
    MAX(valor_multa) as valor_maximo
FROM infracoes
WHERE valor_multa > 0;

-- Multas por RA
SELECT 
    e.ra,
    COUNT(i.id) as total_multas,
    SUM(i.valor_multa) as valor_total,
    ROUND(AVG(i.valor_multa), 2) as valor_medio
FROM infracoes i
JOIN registros_fiscalizacao r ON i.registro_id = r.id
JOIN eventos e ON r.evento_id = e.id
GROUP BY e.ra
ORDER BY valor_total DESC;

-- Evolução de multas por dia
SELECT 
    DATE(r.data_turno) as data,
    COUNT(i.id) as total_multas,
    SUM(i.valor_multa) as valor_total
FROM infracoes i
JOIN registros_fiscalizacao r ON i.registro_id = r.id
WHERE r.data_turno >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(r.data_turno)
ORDER BY data;

-- ================================================
-- 10. ANÁLISE DE CHECKLIST E QUALIDADE
-- ================================================

-- Taxa de conclusão do checklist
SELECT 
    COUNT(*) as total_registros,
    SUM(CASE WHEN checklist_local THEN 1 ELSE 0 END) as local_ok,
    SUM(CASE WHEN checklist_revisado THEN 1 ELSE 0 END) as revisado_ok,
    SUM(CASE WHEN checklist_anexos THEN 1 ELSE 0 END) as anexos_ok,
    ROUND(SUM(CASE WHEN checklist_local AND checklist_revisado AND checklist_anexos THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as taxa_conclusao_completa
FROM registros_fiscalizacao;

-- Registros com fotos por tipo
SELECT 
    tipo_foto,
    COUNT(*) as total_fotos,
    COUNT(DISTINCT registro_id) as registros_com_fotos
FROM fotos
GROUP BY tipo_foto;

-- ================================================
-- 11. ANÁLISE COMPARATIVA (MÊS A MÊS)
-- ================================================

-- Comparação mensal
SELECT 
    TO_CHAR(data_turno, 'YYYY-MM') as mes,
    COUNT(*) as total_registros,
    COUNT(DISTINCT evento_id) as total_eventos,
    COUNT(DISTINCT auditor_id) as total_auditores,
    SUM(CASE WHEN ocorrencias_registradas THEN 1 ELSE 0 END) as com_ocorrencias
FROM registros_fiscalizacao
GROUP BY TO_CHAR(data_turno, 'YYYY-MM')
ORDER BY mes DESC;

-- ================================================
-- 12. FILTROS DINÂMICOS (Para usar em dashboards)
-- ================================================

-- Lista de RAs disponíveis
SELECT DISTINCT ra 
FROM eventos 
ORDER BY ra;

-- Lista de tipos de evento
SELECT DISTINCT tipo_evento 
FROM eventos 
ORDER BY tipo_evento;

-- Lista de auditores ativos
SELECT DISTINCT 
    a.id,
    a.nome,
    a.setor
FROM auditores a
ORDER BY a.nome;

-- Período de dados disponíveis
SELECT 
    MIN(data_turno) as data_inicial,
    MAX(data_turno) as data_final,
    COUNT(*) as total_registros
FROM registros_fiscalizacao;

-- ================================================
-- 13. QUERY MESTRA (Tudo em uma tabela para export)
-- ================================================

SELECT 
    r.id,
    r.created_at as data_criacao,
    
    -- Auditor
    a.nome as auditor_nome,
    a.matricula as auditor_matricula,
    a.setor as auditor_setor,
    
    -- Evento
    e.nome as evento_nome,
    e.ra as evento_ra,
    e.tipo_evento as evento_tipo,
    e.publico_estimado as evento_publico,
    
    -- Turno
    r.data_turno,
    r.turno,
    r.inicio_turno,
    r.termino_turno,
    
    -- Localização
    r.latitude,
    r.longitude,
    
    -- Situação
    r.situacao_evento,
    r.ocorrencias_registradas,
    
    -- Contadores
    (SELECT COUNT(*) FROM acoes_fiscais WHERE registro_id = r.id) as total_acoes,
    (SELECT COUNT(*) FROM vistorias WHERE registro_id = r.id) as total_vistorias,
    (SELECT COUNT(*) FROM apreensoes WHERE registro_id = r.id) as total_apreensoes,
    (SELECT COUNT(*) FROM infracoes WHERE registro_id = r.id) as total_infracoes,
    (SELECT SUM(valor_multa) FROM infracoes WHERE registro_id = r.id) as valor_total_multas,
    
    -- Ambulantes
    (SELECT detectados FROM ambulantes WHERE registro_id = r.id) as ambulantes_detectados,
    (SELECT abordados FROM ambulantes WHERE registro_id = r.id) as ambulantes_abordados,
    (SELECT dispersados FROM ambulantes WHERE registro_id = r.id) as ambulantes_dispersados,
    
    -- Checklist
    r.checklist_local,
    r.checklist_revisado,
    r.checklist_anexos
    
FROM registros_fiscalizacao r
LEFT JOIN auditores a ON r.auditor_id = a.id
LEFT JOIN eventos e ON r.evento_id = e.id
ORDER BY r.created_at DESC;

-- ================================================
-- FIM DAS QUERIES
-- ================================================
