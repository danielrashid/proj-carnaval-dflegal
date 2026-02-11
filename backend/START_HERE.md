# 🎭 Backend Sistema de Fiscalização - Carnaval 2026

## ✅ Estrutura Criada

Backend completo com Node.js + Express + PostgreSQL para gerenciar dados de fiscalização em tempo real e integração com ferramentas de BI.

### 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── database/
│   │   ├── db.js              # Conexão com PostgreSQL
│   │   ├── schema.sql         # Schema completo do banco
│   │   ├── setup.js           # Script para criar tabelas
│   │   └── seed.sql           # Dados de exemplo
│   ├── routes/
│   │   ├── registros.js       # CRUD de registros
│   │   └── analytics.js       # Endpoints para BI
│   └── server.js              # Servidor Express
├── .env.example               # Exemplo de variáveis
├── .gitignore
├── docker-compose.yml         # Setup do PostgreSQL
├── package.json
├── README.md                  # Documentação completa
├── INTEGRACAO_FRONTEND.md     # Guia de integração
└── QUERIES_BI.sql             # Queries prontas para BI
```

### 🗄️ Banco de Dados

**15 Tabelas:**
- auditores
- eventos
- registros_fiscalizacao (principal)
- acoes_fiscais
- vistorias
- notificacoes
- interdicoes
- infracoes
- apreensoes
- bens_apreendidos
- ambulantes
- bens_ambulantes_autos
- bens_ambulantes_trv
- fotos
- documentos

**6 Views para BI:**
- vw_registros_completos
- vw_estatisticas_eventos
- vw_bens_mais_apreendidos
- vw_performance_auditores
- vw_ambulantes_por_regiao
- vw_timeline_registros

### 🔌 API REST

**Registros:**
- POST `/api/registros` - Criar novo registro
- GET `/api/registros` - Listar registros (com filtros)
- GET `/api/registros/:id` - Buscar por ID

**Analytics:**
- GET `/api/analytics/dashboard` - KPIs principais
- GET `/api/analytics/eventos` - Estatísticas por evento
- GET `/api/analytics/auditores` - Performance de auditores
- GET `/api/analytics/bens-apreendidos` - Ranking de bens
- GET `/api/analytics/ambulantes-regiao` - Análise por RA
- GET `/api/analytics/timeline` - Últimas 24 horas
- POST `/api/analytics/consulta-personalizada` - Filtros customizados
- GET `/api/analytics/heatmap` - Mapa de calor

## 🚀 Como Usar

### Opção 1: Com Docker (Recomendado)

1. **Subir o PostgreSQL:**
```bash
cd backend
docker-compose up -d
```

Isso vai:
- Criar banco PostgreSQL na porta 5432
- Criar PgAdmin na porta 5050 (http://localhost:5050)
- Aplicar o schema automaticamente
- Inserir dados de exemplo

2. **Criar arquivo .env:**
```bash
cp .env.example .env
```

3. **Instalar dependências:**
```bash
npm install
```

4. **Iniciar servidor:**
```bash
npm run dev
```

Acesse: http://localhost:3000

### Opção 2: PostgreSQL Local

1. **Instale o PostgreSQL**

2. **Crie o banco:**
```sql
CREATE DATABASE carnaval_fiscalizacao;
```

3. **Configure o .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carnaval_fiscalizacao
DB_USER=postgres
DB_PASSWORD=sua_senha
PORT=3000
```

4. **Setup do banco:**
```bash
npm install
npm run db:setup
```

5. **Inicie o servidor:**
```bash
npm run dev
```

## 📊 Conectar com BI

### Power BI

**Método 1: Conexão Direta**
1. Get Data → PostgreSQL
2. Server: localhost:5432
3. Database: carnaval_fiscalizacao
4. Use as views: `vw_registros_completos`, `vw_estatisticas_eventos`

**Método 2: API REST**
1. Get Data → Web
2. URL: http://localhost:3000/api/analytics/dashboard
3. Parse JSON

### Tableau

1. Connect → PostgreSQL
2. Server: localhost
3. Port: 5432
4. Database: carnaval_fiscalizacao

### Metabase

1. Add Database → PostgreSQL
2. Configure conexão
3. Explore as views prontas

### Usar Queries Prontas

O arquivo `QUERIES_BI.sql` contém 13 categorias de queries prontas:
1. Visão geral (KPIs)
2. Série temporal
3. Análise por região
4. Análise de eventos
5. Performance de auditores
6. Análise de apreensões
7. Análise de ambulantes
8. Ações fiscais
9. Análise financeira
10. Checklist e qualidade
11. Comparação mensal
12. Filtros dinâmicos
13. Query mestra (export completo)

## 📱 Integrar com o App

Veja o arquivo `INTEGRACAO_FRONTEND.md` para:
- Código pronto para adicionar no App.jsx
- Função de envio ao backend
- Indicador de status de conexão
- Tratamento de erros
- Configuração para app móvel

## 🧪 Testar API

### Com cURL:

```bash
# Health check
curl http://localhost:3000/health

# Dashboard
curl http://localhost:3000/api/analytics/dashboard

# Criar registro
curl -X POST http://localhost:3000/api/registros \
  -H "Content-Type: application/json" \
  -d '{
    "nomeAuditor": "João Silva",
    "matricula": "12345",
    "turno": "noite"
  }'
```

### Com Postman/Insomnia:

Importe os endpoints e teste interativamente.

## 📈 Dashboards Sugeridos

### Dashboard 1: Visão Geral
- Total de registros (KPI)
- Total de eventos fiscalizados (KPI)
- Total de auditores ativos (KPI)
- Timeline de registros (últimas 24h)
- Mapa de calor por RA

### Dashboard 2: Apreensões
- Top 20 bens apreendidos (gráfico de barras)
- Total de bens por tipo (pizza)
- Apreensões por RA (mapa)
- Tendência temporal (linha)

### Dashboard 3: Ambulantes
- Detectados vs Abordados vs Dispersados (funil)
- Taxa de abordagem por RA (%)
- Situação de licenciamento (empilhado)
- Performance por auditor (tabela)

### Dashboard 4: Performance
- Ranking de auditores (tabela)
- Distribuição de trabalho por setor (pizza)
- Evolução mensal (linha)
- Checklist de qualidade (gauge)

## 🎯 Próximos Passos

1. ✅ Backend estruturado
2. ✅ Banco de dados normalizado
3. ✅ APIs REST funcionais
4. ✅ Views para BI prontas
5. 📱 Integrar com o app React
6. 📊 Criar dashboards no Power BI/Tableau
7. 🚀 Deploy em produção
8. 🔒 Adicionar autenticação JWT (opcional)

## 📞 Suporte

Para dúvidas sobre:
- **Banco de dados:** Veja `README.md` e `schema.sql`
- **API:** Veja `README.md` seção de endpoints
- **Integração:** Veja `INTEGRACAO_FRONTEND.md`
- **Queries BI:** Veja `QUERIES_BI.sql`

---

**🎉 Tudo pronto para BI em tempo real!**
