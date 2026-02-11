import express from 'express';
import pool from '../database/db.js';

const router = express.Router();

// GET - Estatísticas gerais
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {};
    
    // Total de registros
    const totalRegistros = await pool.query(
      'SELECT COUNT(*) as total FROM registros_fiscalizacao'
    );
    stats.totalRegistros = parseInt(totalRegistros.rows[0].total);
    
    // Total de eventos fiscalizados
    const totalEventos = await pool.query(
      'SELECT COUNT(DISTINCT evento_id) as total FROM registros_fiscalizacao'
    );
    stats.totalEventos = parseInt(totalEventos.rows[0].total);
    
    // Total de auditores ativos
    const totalAuditores = await pool.query(
      'SELECT COUNT(DISTINCT auditor_id) as total FROM registros_fiscalizacao'
    );
    stats.totalAuditores = parseInt(totalAuditores.rows[0].total);
    
    // Total de apreensões
    const totalApreensoes = await pool.query(
      'SELECT COUNT(*) as total, SUM(quantidade_bens) as total_bens FROM apreensoes'
    );
    stats.totalApreensoes = parseInt(totalApreensoes.rows[0].total);
    stats.totalBensApreendidos = parseInt(totalApreensoes.rows[0].total_bens) || 0;
    
    // Total de ambulantes
    const totalAmbulantes = await pool.query(
      'SELECT SUM(detectados) as detectados, SUM(abordados) as abordados, SUM(dispersados) as dispersados FROM ambulantes'
    );
    stats.ambulantes = {
      detectados: parseInt(totalAmbulantes.rows[0].detectados) || 0,
      abordados: parseInt(totalAmbulantes.rows[0].abordados) || 0,
      dispersados: parseInt(totalAmbulantes.rows[0].dispersados) || 0,
    };
    
    // Total de multas
    const totalMultas = await pool.query(
      'SELECT COUNT(*) as total, SUM(valor_multa) as valor_total FROM infracoes'
    );
    stats.totalMultas = parseInt(totalMultas.rows[0].total);
    stats.valorTotalMultas = parseFloat(totalMultas.rows[0].valor_total) || 0;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

// GET - Estatísticas por evento
router.get('/eventos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_estatisticas_eventos ORDER BY total_registros DESC');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas de eventos',
      error: error.message
    });
  }
});

// GET - Performance dos auditores
router.get('/auditores', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vw_performance_auditores ORDER BY total_registros DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar performance de auditores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar performance de auditores',
      error: error.message
    });
  }
});

// GET - Bens mais apreendidos
router.get('/bens-apreendidos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vw_bens_mais_apreendidos LIMIT 20'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar bens apreendidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar bens apreendidos',
      error: error.message
    });
  }
});

// GET - Ambulantes por região
router.get('/ambulantes-regiao', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vw_ambulantes_por_regiao ORDER BY total_detectados DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar ambulantes por região:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ambulantes por região',
      error: error.message
    });
  }
});

// GET - Timeline de registros (últimas 24h)
router.get('/timeline', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_timeline_registros');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar timeline',
      error: error.message
    });
  }
});

// GET - Filtros personalizados para BI
router.post('/consulta-personalizada', async (req, res) => {
  try {
    const { 
      data_inicio, 
      data_fim, 
      evento, 
      ra, 
      auditor,
      tipo_evento 
    } = req.body;
    
    let query = `
      SELECT 
        r.id,
        r.data_turno,
        r.turno,
        a.nome as auditor_nome,
        e.nome as evento_nome,
        e.ra,
        e.tipo_evento,
        r.situacao_evento,
        COUNT(DISTINCT af.id) as total_acoes,
        COUNT(DISTINCT ap.id) as total_apreensoes,
        SUM(COALESCE(i.valor_multa, 0)) as valor_multas
      FROM registros_fiscalizacao r
      LEFT JOIN auditores a ON r.auditor_id = a.id
      LEFT JOIN eventos e ON r.evento_id = e.id
      LEFT JOIN acoes_fiscais af ON r.id = af.registro_id
      LEFT JOIN apreensoes ap ON r.id = ap.registro_id
      LEFT JOIN infracoes i ON r.id = i.registro_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (data_inicio) {
      params.push(data_inicio);
      query += ` AND r.data_turno >= $${params.length}`;
    }
    
    if (data_fim) {
      params.push(data_fim);
      query += ` AND r.data_turno <= $${params.length}`;
    }
    
    if (evento) {
      params.push(`%${evento}%`);
      query += ` AND e.nome ILIKE $${params.length}`;
    }
    
    if (ra) {
      params.push(ra);
      query += ` AND e.ra = $${params.length}`;
    }
    
    if (auditor) {
      params.push(`%${auditor}%`);
      query += ` AND a.nome ILIKE $${params.length}`;
    }
    
    if (tipo_evento) {
      params.push(tipo_evento);
      query += ` AND e.tipo_evento = $${params.length}`;
    }
    
    query += `
      GROUP BY r.id, r.data_turno, r.turno, a.nome, e.nome, e.ra, e.tipo_evento, r.situacao_evento
      ORDER BY r.data_turno DESC, r.id DESC
    `;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Erro na consulta personalizada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na consulta personalizada',
      error: error.message
    });
  }
});

// GET - Heatmap de eventos por RA e data
router.get('/heatmap', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    
    let query = `
      SELECT 
        e.ra,
        DATE(r.data_turno) as data,
        COUNT(r.id) as total_registros,
        SUM(CASE WHEN r.ocorrencias_registradas THEN 1 ELSE 0 END) as total_ocorrencias
      FROM registros_fiscalizacao r
      JOIN eventos e ON r.evento_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (data_inicio) {
      params.push(data_inicio);
      query += ` AND r.data_turno >= $${params.length}`;
    }
    
    if (data_fim) {
      params.push(data_fim);
      query += ` AND r.data_turno <= $${params.length}`;
    }
    
    query += `
      GROUP BY e.ra, DATE(r.data_turno)
      ORDER BY data DESC, e.ra
    `;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar heatmap:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar heatmap',
      error: error.message
    });
  }
});

export default router;
