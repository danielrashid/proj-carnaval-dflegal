# Guia de Integração: Frontend React → Backend API

Este guia mostra como conectar seu app React ao backend para enviar dados em tempo real.

## 📱 Modificações no Frontend

### 1. Adicionar função de envio ao backend

Adicione esta função no seu `App.jsx`:

```javascript
// No início do componente, adicione a URL da API
const API_URL = 'http://localhost:3000/api';

// Função para enviar dados ao backend
const enviarParaBackend = async (dadosCompletos) => {
  try {
    console.log('Enviando dados para o backend...');
    
    const response = await fetch(`${API_URL}/registros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosCompletos),
    });
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registro enviado com sucesso!');
      console.log('ID do registro:', result.data.registroId);
      return result.data;
    } else {
      throw new Error(result.message || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('❌ Erro ao enviar para o backend:', error);
    throw error;
  }
};
```

### 2. Modificar a função de geração de PDF

Modifique a função que gera o PDF para também enviar ao backend:

```javascript
const generatePDF = async () => {
  try {
    setPdfLoading(true);
    
    // Preparar dados completos
    const dadosCompletos = {
      // Etapa 1 - Auditor
      nomeAuditor: formData.nomeAuditor,
      matricula: formData.matricula,
      setor: formData.setor,
      setorOutro: formData.setorOutro,
      turno: formData.turno,
      dataTurno: formData.dataTurno,
      inicioTurno: formData.inicioTurno,
      terminoTurno: formData.terminoTurno,
      
      // Etapa 2 - Evento
      nomeEvento: formData.nomeEvento,
      nomeEventoOutro: formData.nomeEventoOutro,
      ra: formData.ra,
      tipoEvento: formData.tipoEvento,
      publicoEstimado: formData.publicoEstimado,
      
      // GPS
      latitude: location?.lat,
      longitude: location?.lng,
      
      // Etapa 3 - Situação
      situacaoEvento: formData.situacaoEvento,
      acoesFiscais: formData.acoesFiscais,
      
      // Vistorias
      vistoriaQtde: formData.vistoriaQtde,
      
      // Notificações
      notificacaoResponsavel: formData.notificacaoResponsavel,
      notificacaoDocumento: formData.notificacaoDocumento,
      
      // Interdição
      responsavelInterdição: formData.responsavelInterdição,
      cpfCnpjInterdição: formData.cpfCnpjInterdição,
      
      // Infrações
      infracaoResponsavel: formData.infracaoResponsavel,
      infracaoDocumento: formData.infracaoDocumento,
      valorMulta: formData.valorMulta,
      
      // Apreensões
      apreensaoResponsavel: formData.apreensaoResponsavel,
      apreensaoDocumento: formData.apreensaoDocumento,
      apreensaoQtdeBens: formData.apreensaoQtdeBens,
      apreensaoDescricaoBens: formData.apreensaoDescricaoBens,
      bensApreendidos: bensApreendidos,
      
      // Ambulantes
      temAmbulantes: formData.temAmbulantes,
      ambulantes: formData.ambulantes,
      
      // Estabelecimento
      tipoEstabelecimento: formData.tipoEstabelecimento,
      estabelecimentoOutro: formData.estabelecimentoOutro,
      estabelecimentoLicenciado: formData.estabelecimentoLicenciado,
      tipoAtividadeCarnavalesca: formData.tipoAtividadeCarnavalesca,
      
      // TRV
      temTRV: formData.temTRV,
      trv: formData.trv,
      
      // Recursos
      recursos: formData.recursos,
      
      // Informações Complementares
      ocorrenciasRegistrados: formData.ocorrenciasRegistrados,
      ocorrenciasDescricao: formData.ocorrenciasDescricao,
      outrosFatosObservados: formData.outrosFatosObservados,
      outrosFatosDescricao: formData.outrosFatosDescricao,
      
      // Fotos
      fotosApreensoes: formData.fotosApreensoes,
      fotosAutos: formData.fotosAutos,
      outrosFotos: formData.outrosFotos,
      
      // Documentos
      outrosDocumentos: formData.outrosDocumentos,
      
      // Checklist
      checklist: formData.checklist,
    };
    
    // ENVIAR PARA O BACKEND PRIMEIRO
    try {
      const resultado = await enviarParaBackend(dadosCompletos);
      console.log('Dados salvos no banco com ID:', resultado.registroId);
      
      // Mostrar mensagem de sucesso
      alert(`✅ Dados enviados com sucesso!\nID do Registro: ${resultado.registroId}`);
    } catch (error) {
      console.error('Erro ao enviar para o backend:', error);
      // Perguntar se quer continuar gerando o PDF mesmo com erro
      const continuar = confirm(
        'Erro ao enviar dados para o servidor.\nDeseja continuar e gerar o PDF mesmo assim?'
      );
      if (!continuar) {
        setPdfLoading(false);
        return;
      }
    }
    
    // DEPOIS gerar o PDF (seu código existente)
    const doc = new jsPDF();
    // ... resto do código de geração de PDF
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF: ' + error.message);
  } finally {
    setPdfLoading(false);
  }
};
```

### 3. Adicionar indicador de conexão

Adicione um componente para mostrar o status da conexão:

```javascript
const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'

// Verificar status do backend
useEffect(() => {
  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };
  
  checkBackend();
  // Verificar a cada 30 segundos
  const interval = setInterval(checkBackend, 30000);
  return () => clearInterval(interval);
}, []);

// No JSX, adicione o indicador
<div className="fixed top-4 right-4 z-50">
  {backendStatus === 'checking' && (
    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
      🔍 Verificando conexão...
    </div>
  )}
  {backendStatus === 'online' && (
    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      Backend Online
    </div>
  )}
  {backendStatus === 'offline' && (
    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
      ⚠️ Backend Offline
    </div>
  )}
</div>
```

### 4. Configurar CORS no desenvolvimento

Se você estiver rodando o app em `localhost:5173` (Vite) ou `localhost:3000` (Create React App), o CORS já está configurado no backend.

Para produção, configure a URL do seu app no backend em `src/server.js`:

```javascript
app.use(cors({
  origin: 'https://seu-app.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

## 🔧 Variáveis de Ambiente no Frontend

Crie um arquivo `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

E use no código:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

## 📊 Testar a Integração

### 1. Iniciar o backend

```bash
cd backend
npm run dev
```

### 2. Iniciar o frontend

```bash
cd proj-carnaval
npm run dev
```

### 3. Preencher um formulário

- Abra o app no navegador
- Preencha um registro completo
- Clique em "Gerar PDF"
- Verifique no console do navegador se os dados foram enviados
- Verifique no console do backend se recebeu os dados

### 4. Verificar no banco de dados

Conecte-se ao PostgreSQL e execute:

```sql
SELECT * FROM vw_registros_completos ORDER BY created_at DESC LIMIT 1;
```

## 🐛 Troubleshooting

### Erro: fetch failed

**Problema:** Backend não está rodando ou URL incorreta

**Solução:**
- Verifique se o backend está rodando em `http://localhost:3000`
- Verifique a URL no código
- Abra `http://localhost:3000/health` no navegador

### Erro: CORS policy

**Problema:** Navegador bloqueando requisições cross-origin

**Solução:**
- Verifique se `cors` está configurado no backend
- Adicione a origem do seu app no CORS

### Erro: Network request failed

**Problema:** Firewall ou antivírus bloqueando

**Solução:**
- Desabilite temporariamente o firewall
- Configure exceção para a porta 3000

### Dados não aparecem no banco

**Problema:** Transação com erro ou campo faltando

**Solução:**
- Verifique os logs do backend
- Verifique se todos os campos obrigatórios estão sendo enviados
- Teste a rota diretamente com Postman/Insomnia

## 📱 App Móvel (Capacitor)

Para o app compilado Android, você precisa usar o IP da sua máquina ao invés de `localhost`:

```javascript
// Detectar se está no dispositivo móvel
const isNative = Capacitor.isNativePlatform();
const API_URL = isNative 
  ? 'http://192.168.1.100:3000/api' // Use o IP da sua máquina
  : 'http://localhost:3000/api';
```

### Permitir HTTP no Android

Edite `android/app/src/main/AndroidManifest.xml`:

```xml
<application
  android:usesCleartextTraffic="true"
  ...>
```

## 🚀 Deploy em Produção

### Backend em servidor

1. Deploy o backend em um servidor (Heroku, Railway, VPS)
2. Anote a URL do servidor (ex: `https://api-carnaval.herokuapp.com`)

### Atualizar URL no frontend

```javascript
const API_URL = 'https://api-carnaval.herokuapp.com/api';
```

### Build do app

```bash
npm run build
npx cap sync
npx cap open android
```

---

**✅ Pronto! Seu app agora envia dados em tempo real para o backend e você pode criar dashboards de BI conectando diretamente ao banco PostgreSQL.**
