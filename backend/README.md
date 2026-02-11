# Backend API - Sistema de Fiscalização de Eventos de Carnaval

Backend completo com Node.js + Express + PostgreSQL para gerenciar dados de fiscalização de eventos de carnaval e integração com BI em tempo real.

## 📋 Pré-requisitos

- **Node.js** v18+ instalado
- **PostgreSQL** v14+ instalado e rodando
- **npm** ou **yarn**

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carnaval_fiscalizacao
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
PORT=3000
NODE_ENV=development
```

### 3. Criar o banco de dados

No PostgreSQL, crie o banco de dados:

```sql
CREATE DATABASE carnaval_fiscalizacao;
```

### 4. Executar o setup do banco (criar tabelas e views)

```bash
npm run db:setup
```

Este comando irá:
- Criar todas as tabelas necessárias
- Criar as views para BI
- Criar índices para performance
- Configurar triggers

### 5. Iniciar o servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **auditores** - Cadastro de fiscais/auditores
- **eventos** - Catálogo de eventos de carnaval
- **registros_fiscalizacao** - Registros principais com todas as informações
- **acoes_fiscais** - Ações tomadas durante a fiscalização
- **vistorias** - Registros de vistorias realizadas
- **notificacoes** - Notificações emitidas
- **interdicoes** - Interdições realizadas
- **infracoes** - Infrações registradas e multas
- **apreensoes** - Apreensões realizadas
- **bens_apreendidos** - Detalhes dos bens apreendidos
- **ambulantes** - Informações sobre ambulantes
- **bens_ambulantes_autos** - Bens apreendidos de ambulantes
- **bens_ambulantes_trv** - Bens retidos (TRV)
- **fotos** - Armazenamento de fotos
- **documentos** - Armazenamento de documentos

### Views para BI

- **vw_registros_completos** - Visão consolidada de registros
- **vw_estatisticas_eventos** - Estatísticas por evento
- **vw_bens_mais_apreendidos** - Ranking de bens apreendidos
- **vw_performance_auditores** - Performance dos auditores
- **vw_ambulantes_por_regiao** - Análise de ambulantes por RA
- **vw_timeline_registros** - Timeline das últimas 24 horas

## 🔌 Endpoints da API

### Registros

#### POST /api/registros
Criar novo registro de fiscalização

**Body:**
```json
{
  "nomeAuditor": "João Silva",
  "matricula": "12345",
  "setor": "Fiscalização",
  "turno": "noite",
  "dataTurno": "2026-02-10",
  "inicioTurno": "18:00",
  "nomeEvento": "Bloco da Tati",
  "ra": "Plano Piloto",
  "tipoEvento": "Bloco de Rua",
  "publicoEstimado": "5000",
  "latitude": -15.7942,
  "longitude": -47.8822,
  "situacaoEvento": "Regular",
  "acoesFiscais": ["Vistoria", "Notificação"],
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registro criado com sucesso",
  "data": {
    "registroId": 1,
    "auditorId": 1,
    "eventoId": 1
  }
}
```

#### GET /api/registros
Listar todos os registros

**Query params:**
- `limit` - Limite de resultados (padrão: 50)
- `offset` - Offset para paginação (padrão: 0)
- `data_inicio` - Filtrar por data inicial (formato: YYYY-MM-DD)
- `data_fim` - Filtrar por data final (formato: YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 100
}
```

#### GET /api/registros/:id
Buscar registro específico por ID

### Analytics / BI

#### GET /api/analytics/dashboard
Dashboard com estatísticas gerais

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRegistros": 150,
    "totalEventos": 45,
    "totalAuditores": 12,
    "totalApreensoes": 89,
    "totalBensApreendidos": 234,
    "ambulantes": {
      "detectados": 450,
      "abordados": 320,
      "dispersados": 180
    },
    "totalMultas": 23,
    "valorTotalMultas": 15600.00
  }
}
```

#### GET /api/analytics/eventos
Estatísticas por evento

#### GET /api/analytics/auditores
Performance dos auditores

#### GET /api/analytics/bens-apreendidos
Ranking dos bens mais apreendidos

#### GET /api/analytics/ambulantes-regiao
Análise de ambulantes por região administrativa

#### GET /api/analytics/timeline
Timeline de registros (últimas 24 horas)

#### POST /api/analytics/consulta-personalizada
Consulta personalizada com filtros

**Body:**
```json
{
  "data_inicio": "2026-02-01",
  "data_fim": "2026-02-28",
  "evento": "Bloco",
  "ra": "Plano Piloto",
  "auditor": "João",
  "tipo_evento": "Bloco de Rua"
}
```

#### GET /api/analytics/heatmap
Heatmap de eventos por RA e data

**Query params:**
- `data_inicio` - Data inicial
- `data_fim` - Data final

## 📊 Integração com Power BI / Tableau / Metabase

### Opção 1: Conexão Direta ao PostgreSQL

Configure a conexão direto no seu BI:

- **Host:** localhost (ou IP do servidor)
- **Porta:** 5432
- **Database:** carnaval_fiscalizacao
- **User:** postgres
- **Password:** sua_senha

**Tabelas/Views recomendadas para dashboards:**
- `vw_registros_completos`
- `vw_estatisticas_eventos`
- `vw_performance_auditores`
- `vw_ambulantes_por_regiao`

### Opção 2: API REST

Use os endpoints da API para consumir dados em tempo real:

**Power BI:**
1. Get Data → Web
2. URL: `http://localhost:3000/api/analytics/dashboard`
3. Configure refresh automático

**Tableau:**
1. Connect → Web Data Connector
2. URL da API
3. Parse JSON response

**Metabase:**
1. Add Database → PostgreSQL
2. Ou use Custom Question com API

### Opção 3: Export para CSV/Excel

Adicione endpoints de exportação (implementar se necessário):
```javascript
GET /api/export/csv?table=vw_registros_completos
GET /api/export/excel?table=vw_estatisticas_eventos
```

## 📈 Queries SQL Úteis para BI

### Total de registros por dia
```sql
SELECT 
  DATE(data_turno) as data,
  COUNT(*) as total_registros
FROM registros_fiscalizacao
GROUP BY DATE(data_turno)
ORDER BY data DESC;
```

### Top 10 eventos com mais ocorrências
```sql
SELECT * FROM vw_estatisticas_eventos 
WHERE total_ocorrencias > 0
ORDER BY total_ocorrencias DESC 
LIMIT 10;
```

### Bens mais apreendidos por valor
```sql
SELECT * FROM vw_bens_mais_apreendidos 
ORDER BY total_quantidade DESC;
```

### Mapa de calor por região
```sql
SELECT 
  ra,
  COUNT(*) as total_registros,
  SUM(CASE WHEN ocorrencias_registradas THEN 1 ELSE 0 END) as com_ocorrencia
FROM vw_registros_completos
GROUP BY ra
ORDER BY total_registros DESC;
```

## 🔒 Segurança

Para produção, recomenda-se:

1. **Autenticação JWT**
   - Adicionar middleware de autenticação
   - Validar tokens em todas as rotas

2. **Rate Limiting**
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use('/api/', limiter);
   ```

3. **HTTPS**
   - Configurar certificado SSL
   - Forçar HTTPS em produção

4. **Variáveis de ambiente**
   - Nunca commitar o arquivo `.env`
   - Usar serviços de secrets management

## 🐛 Debug e Logs

Logs são exibidos no console com timestamp:
```
2026-02-10T18:30:15.234Z - POST /api/registros
```

Para logs mais detalhados, use uma lib como Winston ou Pino.

## 📱 Conectar Frontend (App React)

No seu `App.jsx`, adicione a função de envio:

```javascript
const enviarParaBackend = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/registros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        latitude: location?.lat,
        longitude: location?.lng,
        bensApreendidos: bensApreendidos,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Registro enviado com sucesso!');
      return result.data.registroId;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Erro ao enviar:', error);
    alert('Erro ao enviar registro: ' + error.message);
  }
};
```

## 🚀 Deploy

### Opção 1: VPS (DigitalOcean, AWS EC2, etc)

1. Instalar Node.js e PostgreSQL no servidor
2. Clonar o repositório
3. Configurar `.env` com credenciais de produção
4. Rodar `npm run db:setup`
5. Usar PM2 para manter o servidor rodando:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name carnaval-api
   pm2 startup
   pm2 save
   ```

### Opção 2: Heroku

1. Criar app no Heroku
2. Adicionar addon Heroku Postgres
3. Configurar variáveis de ambiente
4. Deploy via Git

### Opção 3: Railway / Render

Similar ao Heroku, com deploy automático via Git.

## 📄 Licença

Este projeto é para uso interno da fiscalização de eventos.

---

**Desenvolvido para o Carnaval 2026 🎭**
