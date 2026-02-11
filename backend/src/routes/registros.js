import express from 'express';
import pool from '../database/db.js';

const router = express.Router();

// POST - Criar novo registro de fiscalização
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      // Etapa 1 - Auditor
      nomeAuditor,
      matricula,
      setor,
      setorOutro,
      turno,
      dataTurno,
      inicioTurno,
      terminoTurno,
      
      // Etapa 2 - Evento
      nomeEvento,
      nomeEventoOutro,
      ra,
      tipoEvento,
      publicoEstimado,
      
      // GPS
      latitude,
      longitude,
      
      // Etapa 3 - Situação
      situacaoEvento,
      acoesFiscais,
      
      // Vistorias
      vistoriaQtde,
      
      // Notificações
      notificacaoResponsavel,
      notificacaoDocumento,
      
      // Interdição
      responsavelInterdição,
      cpfCnpjInterdição,
      
      // Infrações
      infracaoResponsavel,
      infracaoDocumento,
      valorMulta,
      
      // Apreensões
      apreensaoResponsavel,
      apreensaoDocumento,
      apreensaoQtdeBens,
      apreensaoDescricaoBens,
      bensApreendidos,
      
      // Ambulantes
      temAmbulantes,
      ambulantes,
      
      // Estabelecimento
      tipoEstabelecimento,
      estabelecimentoOutro,
      estabelecimentoLicenciado,
      tipoAtividadeCarnavalesca,
      
      // TRV
      temTRV,
      trv,
      
      // Recursos
      recursos,
      
      // Informações Complementares
      ocorrenciasRegistrados,
      ocorrenciasDescricao,
      outrosFatosObservados,
      outrosFatosDescricao,
      
      // Fotos
      fotosApreensoes,
      fotosAutos,
      outrosFotos,
      
      // Documentos
      outrosDocumentos,
      
      // Checklist
      checklist,
    } = req.body;
    
    // 1. Inserir ou buscar auditor
    let auditorResult = await client.query(
      `INSERT INTO auditores (nome, matricula, setor, setor_outro)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (matricula) 
       DO UPDATE SET nome = $1, setor = $3, setor_outro = $4
       RETURNING id`,
      [nomeAuditor, matricula, setor, setorOutro]
    );
    const auditorId = auditorResult.rows[0].id;
    
    // 2. Inserir evento
    const eventoResult = await client.query(
      `INSERT INTO eventos (nome, nome_outro, ra, tipo_evento, publico_estimado, data_evento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [nomeEvento, nomeEventoOutro, ra, tipoEvento, parseInt(publicoEstimado) || null, dataTurno]
    );
    const eventoId = eventoResult.rows[0].id;
    
    // 3. Inserir registro principal
    const registroResult = await client.query(
      `INSERT INTO registros_fiscalizacao (
        auditor_id, evento_id, turno, data_turno, inicio_turno, termino_turno,
        latitude, longitude, situacao_evento, tipo_estabelecimento, 
        estabelecimento_outro, estabelecimento_licenciado, tipo_atividade_carnavalesca,
        recursos_apoio, recursos_motoristas, recursos_veiculos,
        ocorrencias_registradas, ocorrencias_descricao,
        outros_fatos_observados, outros_fatos_descricao,
        checklist_local, checklist_revisado, checklist_anexos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id`,
      [
        auditorId, eventoId, turno, dataTurno, inicioTurno, terminoTurno,
        latitude, longitude, situacaoEvento, tipoEstabelecimento,
        estabelecimentoOutro, estabelecimentoLicenciado, tipoAtividadeCarnavalesca,
        recursos?.apoio || 0, recursos?.motoristas || 0, recursos?.veiculos || 0,
        ocorrenciasRegistrados, ocorrenciasDescricao,
        outrosFatosObservados, outrosFatosDescricao,
        checklist?.local || false, checklist?.revisado || false, checklist?.anexos || false
      ]
    );
    const registroId = registroResult.rows[0].id;
    
    // 4. Inserir ações fiscais
    if (acoesFiscais && acoesFiscais.length > 0) {
      for (const acao of acoesFiscais) {
        await client.query(
          'INSERT INTO acoes_fiscais (registro_id, tipo_acao) VALUES ($1, $2)',
          [registroId, acao]
        );
      }
    }
    
    // 5. Inserir vistoria
    if (vistoriaQtde) {
      await client.query(
        'INSERT INTO vistorias (registro_id, quantidade) VALUES ($1, $2)',
        [registroId, parseInt(vistoriaQtde)]
      );
    }
    
    // 6. Inserir notificação
    if (notificacaoResponsavel) {
      await client.query(
        'INSERT INTO notificacoes (registro_id, responsavel, documento) VALUES ($1, $2, $3)',
        [registroId, notificacaoResponsavel, notificacaoDocumento]
      );
    }
    
    // 7. Inserir interdição
    if (responsavelInterdição) {
      await client.query(
        'INSERT INTO interdicoes (registro_id, responsavel, cpf_cnpj) VALUES ($1, $2, $3)',
        [registroId, responsavelInterdição, cpfCnpjInterdição]
      );
    }
    
    // 8. Inserir infração
    if (infracaoResponsavel) {
      await client.query(
        'INSERT INTO infracoes (registro_id, responsavel, documento, valor_multa) VALUES ($1, $2, $3, $4)',
        [registroId, infracaoResponsavel, infracaoDocumento, parseFloat(valorMulta) || null]
      );
    }
    
    // 9. Inserir apreensão e bens
    if (apreensaoResponsavel) {
      const apreensaoResult = await client.query(
        'INSERT INTO apreensoes (registro_id, responsavel, documento, quantidade_bens, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [registroId, apreensaoResponsavel, apreensaoDocumento, parseInt(apreensaoQtdeBens) || 0, apreensaoDescricaoBens]
      );
      const apreensaoId = apreensaoResult.rows[0].id;
      
      // Inserir bens apreendidos
      if (bensApreendidos && Array.isArray(bensApreendidos)) {
        for (const bem of bensApreendidos) {
          await client.query(
            'INSERT INTO bens_apreendidos (apreensao_id, nome_bem, quantidade) VALUES ($1, $2, $3)',
            [apreensaoId, bem.nome, bem.quantidade || 1]
          );
        }
      }
    }
    
    // 10. Inserir dados de ambulantes
    if (temAmbulantes && ambulantes) {
      const ambulanteResult = await client.query(
        `INSERT INTO ambulantes (
          registro_id, detectados, abordados, dispersados, vistoria_qtde,
          com_licenca, sem_licenca, em_desacordo,
          tem_autos_apreensao, autos_qtde, autos_bens_qtde, autos_outros_descricao,
          tem_trv, trv_qtde, trv_bens_qtde, trv_outros_descricao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
          registroId,
          parseInt(ambulantes.detectados) || 0,
          parseInt(ambulantes.abordados) || 0,
          parseInt(ambulantes.dispersados) || 0,
          parseInt(ambulantes.vistoriaQtde) || 0,
          parseInt(ambulantes.abordadosSituacao?.comLicenca) || 0,
          parseInt(ambulantes.abordadosSituacao?.semLicenca) || 0,
          parseInt(ambulantes.abordadosSituacao?.emDesacordo) || 0,
          ambulantes.temAutosApreensao || false,
          parseInt(ambulantes.autosQtde) || 0,
          parseInt(ambulantes.autosBensQtde) || 0,
          ambulantes.autosOutrosDescricao,
          ambulantes.temTRV || false,
          parseInt(ambulantes.trvQtde) || 0,
          parseInt(ambulantes.trvBensQtde) || 0,
          ambulantes.trvOutrosDescricao
        ]
      );
      const ambulanteId = ambulanteResult.rows[0].id;
      
      // Inserir bens de autos
      if (ambulantes.autosTipos && Array.isArray(ambulantes.autosTipos)) {
        for (const bem of ambulantes.autosTipos) {
          await client.query(
            'INSERT INTO bens_ambulantes_autos (ambulante_id, nome_bem, quantidade) VALUES ($1, $2, $3)',
            [ambulanteId, bem.nome, bem.quantidade || 1]
          );
        }
      }
      
      // Inserir bens de TRV
      if (ambulantes.trvTipos && Array.isArray(ambulantes.trvTipos)) {
        for (const bem of ambulantes.trvTipos) {
          await client.query(
            'INSERT INTO bens_ambulantes_trv (ambulante_id, nome_bem, quantidade) VALUES ($1, $2, $3)',
            [ambulanteId, bem.nome, bem.quantidade || 1]
          );
        }
      }
    }
    
    // 11. Inserir fotos
    const todasFotos = [
      ...(fotosApreensoes || []).map(f => ({ ...f, tipo: 'apreensoes' })),
      ...(fotosAutos || []).map(f => ({ ...f, tipo: 'autos' })),
      ...(outrosFotos || []).map(f => ({ ...f, tipo: 'outros' })),
    ];
    
    for (const foto of todasFotos) {
      await client.query(
        'INSERT INTO fotos (registro_id, tipo_foto, base64_data, filename) VALUES ($1, $2, $3, $4)',
        [registroId, foto.tipo, foto.base64 || foto.data, foto.filename || '']
      );
    }
    
    // 12. Inserir documentos
    if (outrosDocumentos && Array.isArray(outrosDocumentos)) {
      for (const doc of outrosDocumentos) {
        await client.query(
          'INSERT INTO documentos (registro_id, tipo_documento, filename) VALUES ($1, $2, $3)',
          [registroId, doc.tipo || 'documento', doc.filename || '']
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Registro criado com sucesso',
      data: { registroId, auditorId, eventoId }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar registro',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// GET - Listar todos os registros
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, data_inicio, data_fim } = req.query;
    
    let query = 'SELECT * FROM vw_registros_completos';
    let params = [];
    let whereConditions = [];
    
    if (data_inicio) {
      whereConditions.push(`data_turno >= $${params.length + 1}`);
      params.push(data_inicio);
    }
    
    if (data_fim) {
      whereConditions.push(`data_turno <= $${params.length + 1}`);
      params.push(data_fim);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Erro ao listar registros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar registros',
      error: error.message
    });
  }
});

// GET - Buscar registro por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM vw_registros_completos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar registro',
      error: error.message
    });
  }
});

export default router;
