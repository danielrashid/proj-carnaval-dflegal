import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'carnaval_fiscalizacao',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Iniciando setup do banco de dados...');
    
    // Lê o arquivo SQL do schema
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    
    // Executa o schema
    await client.query(schemaSQL);
    
    console.log('✅ Schema criado com sucesso!');
    console.log('✅ Tabelas criadas:');
    console.log('   - auditores');
    console.log('   - eventos');
    console.log('   - registros_fiscalizacao');
    console.log('   - acoes_fiscais');
    console.log('   - vistorias');
    console.log('   - notificacoes');
    console.log('   - interdicoes');
    console.log('   - infracoes');
    console.log('   - apreensoes');
    console.log('   - bens_apreendidos');
    console.log('   - ambulantes');
    console.log('   - bens_ambulantes_autos');
    console.log('   - bens_ambulantes_trv');
    console.log('   - fotos');
    console.log('   - documentos');
    console.log('');
    console.log('✅ Views para BI criadas:');
    console.log('   - vw_registros_completos');
    console.log('   - vw_estatisticas_eventos');
    console.log('   - vw_bens_mais_apreendidos');
    console.log('   - vw_performance_auditores');
    console.log('   - vw_ambulantes_por_regiao');
    console.log('   - vw_timeline_registros');
    console.log('');
    console.log('🎉 Banco de dados pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar schema:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);
