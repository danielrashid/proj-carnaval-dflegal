# 🗄️ Documentação Completa do Schema do Banco de Dados

## Sistema de Fiscalização de Eventos de Carnaval 2026

Este documento contém a estrutura completa de todas as tabelas do banco de dados PostgreSQL, incluindo campos, tipos, constraints, índices e relacionamentos.

---

## 📋 Índice

1. [Tabelas Principais](#tabelas-principais)
   - [auditores](#1-auditores)
   - [eventos](#2-eventos)
   - [registros_fiscalizacao](#3-registros_fiscalizacao)
2. [Tabelas de Ações e Fiscalização](#tabelas-de-ações-e-fiscalização)
   - [acoes_fiscais](#4-acoes_fiscais)
   - [vistorias](#5-vistorias)
   - [notificacoes](#6-notificacoes)
   - [interdicoes](#7-interdicoes)
   - [infracoes](#8-infracoes)
3. [Tabelas de Apreensões](#tabelas-de-apreensões)
   - [apreensoes](#9-apreensoes)
   - [bens_apreendidos](#10-bens_apreendidos)
4. [Tabelas de Ambulantes](#tabelas-de-ambulantes)
   - [ambulantes](#11-ambulantes)
   - [bens_ambulantes_autos](#12-bens_ambulantes_autos)
   - [bens_ambulantes_trv](#13-bens_ambulantes_trv)
5. [Tabelas de Mídia](#tabelas-de-mídia)
   - [fotos](#14-fotos)
   - [documentos](#15-documentos)
6. [Diagrama de Relacionamentos](#diagrama-de-relacionamentos)

---

## Tabelas Principais

### 1. auditores

Armazena o cadastro de todos os auditores/fiscais do sistema.

```sql
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
```

**Campos:**
- `id` - Identificador único (auto-incremento)
- `nome` - Nome completo do auditor
- `matricula` - Matrícula única do auditor (UNIQUE)
- `setor` - Setor de trabalho
- `setor_outro` - Campo livre para outros setores
- `ativo` - Status do auditor (ativo/inativo)
- `created_at` - Data de criação do registro
- `updated_at` - Data da última atualização

**Constraints:**
- PRIMARY KEY em `id`
- UNIQUE em `matricula`

**Índices:**
Nenhum índice adicional (UNIQUE já cria índice automático)

**Relacionamentos:**
- 1:N com `registros_fiscalizacao` (um auditor tem vários registros)

---

### 2. eventos

Catálogo de todos os eventos de carnaval fiscalizados.

```sql
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_eventos_nome ON eventos(nome);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_ra ON eventos(ra);
```

**Campos:**
- `id` - Identificador único (auto-incremento)
- `nome` - Nome do evento
- `nome_outro` - Campo livre para outros eventos
- `ra` - Região Administrativa (RA) do evento
- `tipo_evento` - Tipo do evento (Bloco de Rua, Show, etc.)
- `publico_estimado` - Estimativa de público
- `data_evento` - Data de realização do evento
- `created_at` - Data de criação do registro

**Constraints:**
- PRIMARY KEY em `id`

**Índices:**
- `idx_eventos_nome` - Busca otimizada por nome
- `idx_eventos_data` - Busca otimizada por data
- `idx_eventos_ra` - Busca otimizada por RA

**Relacionamentos:**
- 1:N com `registros_fiscalizacao` (um evento pode ter vários registros)

---

### 3. registros_fiscalizacao

**Tabela principal** do sistema. Armazena todos os registros de fiscalização realizados.

```sql
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
```

**Campos:**

*Chaves Estrangeiras:*
- `auditor_id` - FK para `auditores(id)`
- `evento_id` - FK para `eventos(id)`

*Informações do Turno:*
- `turno` - Período do turno (manhã, tarde, noite, madrugada)
- `data_turno` - Data do turno (obrigatório)
- `inicio_turno` - Horário de início
- `termino_turno` - Horário de término

*Localização GPS:*
- `latitude` - Coordenada de latitude (8 casas decimais)
- `longitude` - Coordenada de longitude (8 casas decimais)

*Situação e Tipo:*
- `situacao_evento` - Situação encontrada no evento
- `tipo_estabelecimento` - Tipo de estabelecimento
- `estabelecimento_outro` - Campo livre
- `estabelecimento_licenciado` - Se está licenciado
- `tipo_atividade_carnavalesca` - Tipo da atividade

*Recursos:*
- `recursos_apoio` - Quantidade de apoio
- `recursos_motoristas` - Número de motoristas
- `recursos_veiculos` - Número de veículos

*Ocorrências:*
- `ocorrencias_registradas` - Booleano se houve ocorrências
- `ocorrencias_descricao` - Descrição das ocorrências
- `outros_fatos_observados` - Booleano para outros fatos
- `outros_fatos_descricao` - Descrição de outros fatos

*Checklist:*
- `checklist_local` - Verificação de local
- `checklist_revisado` - Se foi revisado
- `checklist_anexos` - Se tem anexos

*Metadados:*
- `created_at` - Data de criação
- `updated_at` - Data de atualização

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `auditores(id)`
- FOREIGN KEY para `eventos(id)`
- CHECK constraint em `turno`

**Índices:**
- `idx_registros_data` - Busca por data
- `idx_registros_auditor` - Busca por auditor
- `idx_registros_evento` - Busca por evento
- `idx_registros_created` - Busca por data de criação

**Relacionamentos:**
- N:1 com `auditores`
- N:1 com `eventos`
- 1:N com várias tabelas de detalhes

---

## Tabelas de Ações e Fiscalização

### 4. acoes_fiscais

Registra todas as ações fiscais realizadas em cada fiscalização.

```sql
CREATE TABLE IF NOT EXISTS acoes_fiscais (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_acao VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_acoes_registro ON acoes_fiscais(registro_id);
CREATE INDEX IF NOT EXISTS idx_acoes_tipo ON acoes_fiscais(tipo_acao);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `tipo_acao` - Tipo de ação (Vistoria, Notificação, etc.)
- `created_at` - Data da ação

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_acoes_registro` - Busca por registro
- `idx_acoes_tipo` - Busca por tipo de ação

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

### 5. vistorias

Registra as vistorias realizadas.

```sql
CREATE TABLE IF NOT EXISTS vistorias (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    tipo VARCHAR(50) DEFAULT 'geral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vistorias_registro ON vistorias(registro_id);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `quantidade` - Quantidade de vistorias
- `tipo` - Tipo de vistoria
- `created_at` - Data da vistoria

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_vistorias_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

### 6. notificacoes

Registra as notificações emitidas durante as fiscalizações.

```sql
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    tipo VARCHAR(50) DEFAULT 'notificacao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_registro ON notificacoes(registro_id);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `responsavel` - Nome do responsável notificado
- `documento` - CPF ou CNPJ do responsável
- `tipo` - Tipo de notificação
- `created_at` - Data da notificação

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_notificacoes_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

### 7. interdicoes

Registra as interdições realizadas.

```sql
CREATE TABLE IF NOT EXISTS interdicoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    cpf_cnpj VARCHAR(18),
    data_interdicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interdicoes_registro ON interdicoes(registro_id);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `responsavel` - Nome do responsável
- `cpf_cnpj` - CPF ou CNPJ (formatado)
- `data_interdicao` - Data e hora da interdição

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_interdicoes_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

### 8. infracoes

Registra as infrações e multas aplicadas.

```sql
CREATE TABLE IF NOT EXISTS infracoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    valor_multa DECIMAL(10, 2),
    data_infracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infracoes_registro ON infracoes(registro_id);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `responsavel` - Nome do infrator
- `documento` - CPF ou CNPJ
- `valor_multa` - Valor da multa (2 casas decimais)
- `data_infracao` - Data e hora da infração

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_infracoes_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

## Tabelas de Apreensões

### 9. apreensoes

Registra as apreensões realizadas (cabeçalho).

```sql
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
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `responsavel` - Nome do responsável pela apreensão
- `documento` - CPF ou CNPJ
- `quantidade_bens` - Total de bens apreendidos
- `descricao` - Descrição geral da apreensão
- `tipo` - Tipo de apreensão
- `created_at` - Data da apreensão

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_apreensoes_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`
- 1:N com `bens_apreendidos`

---

### 10. bens_apreendidos

Detalhamento dos bens apreendidos em cada apreensão.

```sql
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
```

**Campos:**
- `id` - Identificador único
- `apreensao_id` - FK para apreensão
- `nome_bem` - Nome do bem (Garrafa Cerveja, Lata Refrigerante, etc.)
- `quantidade` - Quantidade do bem
- `tipo` - Tipo do bem
- `created_at` - Data do registro

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `apreensoes(id)` com CASCADE DELETE

**Índices:**
- `idx_bens_apreensao` - Busca por apreensão
- `idx_bens_nome` - Busca por nome do bem (útil para estatísticas)

**Relacionamentos:**
- N:1 com `apreensoes`

---

## Tabelas de Ambulantes

### 11. ambulantes

Registra informações sobre ambulantes detectados e ações tomadas.

```sql
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
```

**Campos:**

*Básico:*
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `detectados` - Total de ambulantes detectados
- `abordados` - Total de ambulantes abordados
- `dispersados` - Total de ambulantes dispersados
- `vistoria_qtde` - Quantidade de vistorias

*Situação dos Abordados:*
- `com_licenca` - Quantidade com licença
- `sem_licenca` - Quantidade sem licença
- `em_desacordo` - Quantidade em desacordo

*Autos de Apreensão:*
- `tem_autos_apreensao` - Se houve autos
- `autos_qtde` - Quantidade de autos
- `autos_bens_qtde` - Quantidade de bens nos autos
- `autos_outros_descricao` - Descrição adicional

*TRV (Termo de Retenção de Volumes):*
- `tem_trv` - Se houve TRV
- `trv_qtde` - Quantidade de TRVs
- `trv_bens_qtde` - Quantidade de bens no TRV
- `trv_outros_descricao` - Descrição adicional

*Metadados:*
- `created_at` - Data do registro

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_ambulantes_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`
- 1:N com `bens_ambulantes_autos`
- 1:N com `bens_ambulantes_trv`

---

### 12. bens_ambulantes_autos

Detalhamento dos bens apreendidos de ambulantes (Autos).

```sql
CREATE TABLE IF NOT EXISTS bens_ambulantes_autos (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_autos ON bens_ambulantes_autos(ambulante_id);
```

**Campos:**
- `id` - Identificador único
- `ambulante_id` - FK para registro de ambulantes
- `nome_bem` - Nome do bem apreendido
- `quantidade` - Quantidade
- `created_at` - Data do registro

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `ambulantes(id)` com CASCADE DELETE

**Índices:**
- `idx_bens_ambulantes_autos` - Busca por ambulante

**Relacionamentos:**
- N:1 com `ambulantes`

---

### 13. bens_ambulantes_trv

Detalhamento dos bens retidos de ambulantes (TRV - Termo de Retenção de Volumes).

```sql
CREATE TABLE IF NOT EXISTS bens_ambulantes_trv (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_trv ON bens_ambulantes_trv(ambulante_id);
```

**Campos:**
- `id` - Identificador único
- `ambulante_id` - FK para registro de ambulantes
- `nome_bem` - Nome do bem retido
- `quantidade` - Quantidade
- `created_at` - Data do registro

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `ambulantes(id)` com CASCADE DELETE

**Índices:**
- `idx_bens_ambulantes_trv` - Busca por ambulante

**Relacionamentos:**
- N:1 com `ambulantes`

---

## Tabelas de Mídia

### 14. fotos

Armazena as fotos dos registros de fiscalização.

```sql
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
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `tipo_foto` - Tipo da foto (apreensoes, autos, outros)
- `url_foto` - URL da foto (se armazenada externamente)
- `base64_data` - Dados da foto em base64 (se armazenada no banco)
- `filename` - Nome do arquivo
- `created_at` - Data do upload

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_fotos_registro` - Busca por registro
- `idx_fotos_tipo` - Busca por tipo de foto

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

**Observações:**
- Pode armazenar fotos de duas formas: URL (storage externo) ou base64 (no banco)
- Para produção, recomenda-se usar storage externo (S3, Google Cloud Storage)

---

### 15. documentos

Armazena documentos anexados aos registros.

```sql
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50),
    url_documento TEXT,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_registro ON documentos(registro_id);
```

**Campos:**
- `id` - Identificador único
- `registro_id` - FK para registro de fiscalização
- `tipo_documento` - Tipo do documento
- `url_documento` - URL do documento
- `filename` - Nome do arquivo
- `created_at` - Data do upload

**Constraints:**
- PRIMARY KEY em `id`
- FOREIGN KEY para `registros_fiscalizacao(id)` com CASCADE DELETE

**Índices:**
- `idx_documentos_registro` - Busca por registro

**Relacionamentos:**
- N:1 com `registros_fiscalizacao`

---

## Diagrama de Relacionamentos

```
┌─────────────┐
│  auditores  │
│             │
│  id (PK)    │───┐
│  nome       │   │
│  matricula  │   │
└─────────────┘   │
                  │
┌─────────────┐   │      ┌────────────────────────────┐
│   eventos   │   │      │  registros_fiscalizacao    │
│             │   │      │                            │
│  id (PK)    │───┼─────→│  id (PK)                   │
│  nome       │   │      │  auditor_id (FK)           │←────┘
│  ra         │   │      │  evento_id (FK)            │
│  tipo       │   │      │  data_turno                │
└─────────────┘   │      │  turno                     │
                  │      │  latitude, longitude       │
                  │      │  situacao_evento           │
                  │      │  recursos_*                │
                  └─────→│  ocorrencias_*             │
                         │  checklist_*               │
                         └──────────┬─────────────────┘
                                    │
                ┌───────────────────┼────────────────────┬──────────────────┐
                │                   │                    │                  │
                ▼                   ▼                    ▼                  ▼
         ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   ┌─────────────┐
         │acoes_fiscais│     │  vistorias  │     │notificacoes │   │ interdicoes │
         │             │     │             │     │             │   │             │
         │id (PK)      │     │id (PK)      │     │id (PK)      │   │id (PK)      │
         │registro_id  │     │registro_id  │     │registro_id  │   │registro_id  │
         │tipo_acao    │     │quantidade   │     │responsavel  │   │responsavel  │
         └─────────────┘     └─────────────┘     │documento    │   │cpf_cnpj     │
                                                  └─────────────┘   └─────────────┘
                │                   │
                ▼                   ▼
         ┌─────────────┐     ┌─────────────┐
         │  infracoes  │     │ apreensoes  │
         │             │     │             │
         │id (PK)      │     │id (PK)      │
         │registro_id  │     │registro_id  │
         │responsavel  │     │responsavel  │
         │valor_multa  │     │qtde_bens    │
         └─────────────┘     └──────┬──────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │bens_apreendidos │
                            │                 │
                            │id (PK)          │
                            │apreensao_id (FK)│
                            │nome_bem         │
                            │quantidade       │
                            └─────────────────┘
                │
                ▼
         ┌─────────────┐
         │ ambulantes  │
         │             │
         │id (PK)      │
         │registro_id  │
         │detectados   │
         │abordados    │
         │dispersados  │
         │com_licenca  │
         │sem_licenca  │
         └──────┬──────┘
                │
          ┌─────┴──────┐
          ▼            ▼
    ┌──────────────┐  ┌──────────────┐
    │bens_amb_autos│  │bens_amb_trv  │
    │              │  │              │
    │id (PK)       │  │id (PK)       │
    │ambulante_id  │  │ambulante_id  │
    │nome_bem      │  │nome_bem      │
    └──────────────┘  └──────────────┘

                │
          ┌─────┴──────┐
          ▼            ▼
    ┌──────────┐  ┌──────────────┐
    │  fotos   │  │ documentos   │
    │          │  │              │
    │id (PK)   │  │id (PK)       │
    │registro  │  │registro_id   │
    │tipo_foto │  │tipo_documento│
    │base64    │  │url_documento │
    └──────────┘  └──────────────┘
```

---

## Script SQL Completo

Para criar todas as tabelas de uma vez, execute o script abaixo:

### Passo 1: Criar Tabelas Principais

```sql
-- 1. Tabela de Auditores
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

-- 2. Tabela de Eventos
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

CREATE INDEX IF NOT EXISTS idx_eventos_nome ON eventos(nome);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_ra ON eventos(ra);

-- 3. Tabela Principal de Registros
CREATE TABLE IF NOT EXISTS registros_fiscalizacao (
    id SERIAL PRIMARY KEY,
    auditor_id INTEGER REFERENCES auditores(id),
    evento_id INTEGER REFERENCES eventos(id),
    turno VARCHAR(20),
    data_turno DATE NOT NULL,
    inicio_turno TIME,
    termino_turno TIME,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    situacao_evento VARCHAR(100),
    tipo_estabelecimento VARCHAR(100),
    estabelecimento_outro VARCHAR(255),
    estabelecimento_licenciado VARCHAR(10),
    tipo_atividade_carnavalesca VARCHAR(100),
    recursos_apoio INTEGER DEFAULT 0,
    recursos_motoristas INTEGER DEFAULT 0,
    recursos_veiculos INTEGER DEFAULT 0,
    ocorrencias_registradas BOOLEAN DEFAULT false,
    ocorrencias_descricao TEXT,
    outros_fatos_observados BOOLEAN DEFAULT false,
    outros_fatos_descricao TEXT,
    checklist_local BOOLEAN DEFAULT false,
    checklist_revisado BOOLEAN DEFAULT false,
    checklist_anexos BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_turno CHECK (turno IN ('manhã', 'tarde', 'noite', 'madrugada'))
);

CREATE INDEX IF NOT EXISTS idx_registros_data ON registros_fiscalizacao(data_turno);
CREATE INDEX IF NOT EXISTS idx_registros_auditor ON registros_fiscalizacao(auditor_id);
CREATE INDEX IF NOT EXISTS idx_registros_evento ON registros_fiscalizacao(evento_id);
CREATE INDEX IF NOT EXISTS idx_registros_created ON registros_fiscalizacao(created_at);
```

### Passo 2: Criar Tabelas de Ações e Fiscalização

```sql
-- 4. Ações Fiscais
CREATE TABLE IF NOT EXISTS acoes_fiscais (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_acao VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_acoes_registro ON acoes_fiscais(registro_id);
CREATE INDEX IF NOT EXISTS idx_acoes_tipo ON acoes_fiscais(tipo_acao);

-- 5. Vistorias
CREATE TABLE IF NOT EXISTS vistorias (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    tipo VARCHAR(50) DEFAULT 'geral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vistorias_registro ON vistorias(registro_id);

-- 6. Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    tipo VARCHAR(50) DEFAULT 'notificacao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_registro ON notificacoes(registro_id);

-- 7. Interdições
CREATE TABLE IF NOT EXISTS interdicoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    cpf_cnpj VARCHAR(18),
    data_interdicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interdicoes_registro ON interdicoes(registro_id);

-- 8. Infrações
CREATE TABLE IF NOT EXISTS infracoes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    responsavel VARCHAR(255),
    documento VARCHAR(50),
    valor_multa DECIMAL(10, 2),
    data_infracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infracoes_registro ON infracoes(registro_id);
```

### Passo 3: Criar Tabelas de Apreensões

```sql
-- 9. Apreensões
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

-- 10. Bens Apreendidos
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
```

### Passo 4: Criar Tabelas de Ambulantes

```sql
-- 11. Ambulantes
CREATE TABLE IF NOT EXISTS ambulantes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    detectados INTEGER DEFAULT 0,
    abordados INTEGER DEFAULT 0,
    dispersados INTEGER DEFAULT 0,
    vistoria_qtde INTEGER DEFAULT 0,
    com_licenca INTEGER DEFAULT 0,
    sem_licenca INTEGER DEFAULT 0,
    em_desacordo INTEGER DEFAULT 0,
    tem_autos_apreensao BOOLEAN DEFAULT false,
    autos_qtde INTEGER DEFAULT 0,
    autos_bens_qtde INTEGER DEFAULT 0,
    autos_outros_descricao TEXT,
    tem_trv BOOLEAN DEFAULT false,
    trv_qtde INTEGER DEFAULT 0,
    trv_bens_qtde INTEGER DEFAULT 0,
    trv_outros_descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ambulantes_registro ON ambulantes(registro_id);

-- 12. Bens de Ambulantes (Autos)
CREATE TABLE IF NOT EXISTS bens_ambulantes_autos (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_autos ON bens_ambulantes_autos(ambulante_id);

-- 13. Bens de Ambulantes (TRV)
CREATE TABLE IF NOT EXISTS bens_ambulantes_trv (
    id SERIAL PRIMARY KEY,
    ambulante_id INTEGER REFERENCES ambulantes(id) ON DELETE CASCADE,
    nome_bem VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bens_ambulantes_trv ON bens_ambulantes_trv(ambulante_id);
```

### Passo 5: Criar Tabelas de Mídia

```sql
-- 14. Fotos
CREATE TABLE IF NOT EXISTS fotos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_foto VARCHAR(50),
    url_foto TEXT,
    base64_data TEXT,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fotos_registro ON fotos(registro_id);
CREATE INDEX IF NOT EXISTS idx_fotos_tipo ON fotos(tipo_foto);

-- 15. Documentos
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_fiscalizacao(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50),
    url_documento TEXT,
    filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_registro ON documentos(registro_id);
```

### Passo 6: Criar Triggers

```sql
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auditores_updated_at 
    BEFORE UPDATE ON auditores
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at 
    BEFORE UPDATE ON registros_fiscalizacao
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Resumo das Tabelas

| # | Tabela | Propósito | Registros Típicos |
|---|--------|-----------|-------------------|
| 1 | auditores | Cadastro de fiscais | ~50 |
| 2 | eventos | Catálogo de eventos | ~100 |
| 3 | registros_fiscalizacao | **Tabela principal** | ~1000+ |
| 4 | acoes_fiscais | Ações por registro | ~3000 |
| 5 | vistorias | Vistorias realizadas | ~1000 |
| 6 | notificacoes | Notificações emitidas | ~500 |
| 7 | interdicoes | Interdições | ~100 |
| 8 | infracoes | Infrações e multas | ~200 |
| 9 | apreensoes | Apreensões (cabeçalho) | ~300 |
| 10 | bens_apreendidos | Bens detalhados | ~1500 |
| 11 | ambulantes | Registros de ambulantes | ~500 |
| 12 | bens_ambulantes_autos | Bens apreendidos (autos) | ~800 |
| 13 | bens_ambulantes_trv | Bens retidos (TRV) | ~600 |
| 14 | fotos | Fotos dos registros | ~2000 |
| 15 | documentos | Documentos anexados | ~500 |

**Total:** 15 tabelas

---

## Notas Importantes

### Performance
- Todos os índices foram criados para otimizar as queries mais comuns
- Foreign keys com `ON DELETE CASCADE` para manter integridade referencial
- Campos de texto usam `VARCHAR` com tamanho apropriado ou `TEXT` para conteúdo grande

### Escalabilidade
- SERIAL para auto-incremento suporta até 2 bilhões de registros
- Índices em campos frequentemente usados em WHERE, JOIN e ORDER BY
- Possibilidade de particionar `registros_fiscalizacao` por data se necessário

### Segurança
- Triggers para auditoria (updated_at)
- Constraints para garantir integridade
- Possibilidade de adicionar triggers para log de mudanças

### Backup
- Recomenda-se backup diário do schema e dados
- Retenção de pelo menos 30 dias
- Teste de restore regularmente

---

**Documentação gerada em:** Fevereiro 2026  
**Versão do Schema:** 1.0  
**Banco de Dados:** PostgreSQL 14+
