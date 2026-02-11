import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  MapPin,
  User,
  Users,
  AlertTriangle,
  Camera,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Package,
  Truck,
  Clock,
  CheckSquare,
  X,
  Calendar1Icon,
  Image,
  Share2,
  Download,
  ClipboardPasteIcon,
  NotebookIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import { Camera as CapCamera, CameraResultType } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

const formatarDocumento = (value) => {
  const cleanValue = value.replace(/\D/g, "");

  if (cleanValue.length <= 11) {
    // Máscara CPF: 000.000.000-00
    return cleanValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // Máscara CNPJ: 00.000.000/0000-00
    return cleanValue
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  }
};

const EVENTOS_LIST = [
  "backup para add",
  "Aparelhinho",
  "Bailinho Infantil",
  "Beco Elétrico",
  "Bloco As Meninas De Dolores",
  "Bloco Baile da Piki",
  "Bloco Baratinha 2026",
  "Bloco Baratona 2026",
  "Bloco Brilho Cor e Som",
  "Bloco Calango Alternativo",
  "Bloco CarnaSarau - DF Folia 2026",
  "Bloco Carnaval Delas",
  "Bloco Carnavalesco - Junto e Misturado",
  "Bloco Charanga da Alegria",
  "Bloco da Classe Trabalhadora",
  "Bloco da Delmina As Piriguetys",
  "Bloco da Inclusão",
  "Bloco da Tati",
  "Bloco da Terceirona - 2ª Edição",
  "Bloco da Tesourinha",
  "Bloco da Tesourinhazinha",
  "Bloco da Toca",
  "Bloco Dança Comigo Aí Varjão",
  "Bloco Eu Acho É Pouco",
  "Bloco Seca Pimenteira",
  "Bloco de Pífanos Ventoinha de Canudo",
  "Bloco Deficiente É a Mãe",
  "Bloco Desmaiô",
  "Bloco Desodorante do Suvaco",
  "Bloco do Amor",
  "Bloco do Fófs",
  "Bloco do My - Esquenta De Carnaval",
  "Bloco do Porão Do Rock",
  "Bloco do Pretinho",
  "Bloco do Rock - Quaresmada",
  "Bloco do Seu Júlio",
  "Bloco dos Artistas",
  "Bloco dos Raparigueiros 2026",
  "Bloco Du Nada Um Samba",
  "Bloco Florestinos",
  "Bloco Galo Cego",
  "Bloco Groove do Bem 2026",
  "Bloco Guardiões do Samba",
  "Bloco Joaninha Carnaval 2026",
  "Bloco Leds Bora",
  "Bloco Mamãe Taguá 2026",
  "Bloco Manga Botânica 2026",
  "Bloco Marchinha 60+",
  "Bloco Maria Vai Casoutras",
  "Bloco Pacotão 2026",
  "Bloco Portadores da Alegria (PCD)",
  "Bloco Ressaca do Carnaval de Brasília",
  "Bloco Samba Flores",
  "Bloco Só Contatinho",
  "Bloco Sustentável do PATUBATÊ",
  "Bloco System Safadown",
  "Bloco T.H.C (Techno, House e Carnaval)",
  "Bloco Unindo Tribos",
  "Bloco Vassourinhas de Brasília",
  "Bloco Vem Kem Ker",
  "Bloquinho Barriguda Festa",
  "Bloquinho De Carnaval Da SQS 409",
  "Bora Bora Itapoã",
  "Bregueday",
  "CAFUÇU do Cerrado",
  "Carna Brega",
  "Carna Lobo e Bloquinho do Lobinho",
  "Carnabatuque/Carnaquente",
  "Carnafercal",
  "Carnaflash",
  "Carnaguariba 2026",
  "Carnamuseu Territory Folia",
  "Carnaquente 2026",
  "Carnaval 2026 - Brasileirinho",
  "Carnaval 2026 com Bloco da 11",
  "Carnaval AABB Monobloco",
  "Carnaval Arteiro",
  "Carnaval dessa Espelunca",
  "Carnaval do Ásé Dúdú 2026",
  "Carnaval do Di Maria",
  "Carnaval do Mimobar",
  "Carnaval do Ordi",
  "Carnaval do Pisa",
  "Carnaval do Solto",
  "Carnaval Literário - Arniqueira",
  "Carnaval Urgente 2026",
  "Carnavalito",
  "Chame Sua Mãe: Samba, Reggae e Resistência",
  "Charrete",
  "Circuito Alternativo de Carnaval",
  "Concentra Mas Não Sai",
  "Concentrinha",
  "Desfile de Rua da ARUC No Cruzeiro",
  "Discotecagem - Carnaflow",
  "Eletro Bloco & Carna Vibe",
  "Eminha Kids",
  "Ensaio Geral da Mocidade do Gama",
  "Estrutural Folia 2026",
  "Festival CarnaCONIC",
  "Festival de Verão no Bancário",
  "Festival Ludicidade",
  "Galinho De Brasília",
  "Gran Folia 2026",
  "Grito De Carnaval Menino da Ceilândia",
  "Lokapalloza Carnarock",
  "Manu Chao - Ultra Acústico",
  "Parque Folia Kids",
  "Pérolas do Varjão",
  "Pintinho de Brasília",
  "Plataforma Carnaval Monumental",
  "Plataforma da Diversidade 2026",
  "Pré Carnaval Bloco Tá Chic Tá Bacana",
  "Rainha de Corpas",
  "Samba Quente",
  "Suvaco da Asa 20 Anos",
  "Suvaquinho da Asa",
  "Unidos Do Recanto (Pet Folia, Ratinho Folia e Melhor Idade)",
];

const BENS_APREENDIDOS = [
  "Garrafa Cerveja (vidro)",
  "Garrafa Refrigerante (vidro)",
  "Garrafa Destilado (vidro)",
  "Garrafa Destilado (plástico)",
  "Garrafa Água (plástico)",
  "Lata Cerveja",
  "Lata Refrigerante",
  "Lata Destilado",
  "Lata Energético",
  "Bebida não alcoólica Lata",
  "Bebida não alcoólica Garrafa",
  "Cigarro normal",
  "Cigarro eletrônico",
  "Acessórios de Carnaval",
  "Alimentos",
  "Outros",
];

const RA_LIST = [
  "Água Quente",
  "Águas Claras",
  "Arapoanga",
  "Arniqueira",
  "Brazlândia",
  "Candangolândia",
  "Ceilândia",
  "Cruzeiro",
  "Fercal",
  "Gama",
  "Guará",
  "Itapoã",
  "Jardim Botânico",
  "Lago Norte",
  "Lago Sul",
  "Núcleo Bandeirante",
  "Paranoá",
  "Park Way",
  "Planaltina",
  "Plano Piloto",
  "Recanto das Emas",
  "Riacho Fundo",
  "Riacho Fundo II",
  "Samambaia",
  "São Sebastião",
  "SCIA/Estrutural",
  "SIA",
  "Sobradinho",
  "Sobradinho II",
  "Sol Nascente/Pôr do Sol",
  "Sudoeste/Octogonal",
  "Taguatinga",
  "Varjão",
  "Vicente Pires",
];

const App = () => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [pdfList, setPdfList] = useState([]);
  const [fromStep1, setFromStep1] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Estado inicial do formulário
  const initialFormData = {
    // Etapa 1
    nomeAuditor: "",
    matricula: "",
    setor: "",
    setorOutro: "",
    turno: "",
    dataTurno: "",
    inicioTurno: (() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    })(),
    // Etapa 2
    nomeEvento: "",
    nomeEventoOutro: "",
    ra: "",
    tipoEvento: "",
    publicoEstimado: "",
    // Etapa 3 - Comum
    situacaoEvento: "",
    acoesFiscais: [],
    vistoriaQtde: "",
    notificacaoResponsavel: "",
    notificacaoDocumento: "",
    responsavelInterdição: "",
    cpfCnpjInterdição: "",
    infracaoResponsavel: "",
    infracaoDocumento: "",
    valorMulta: "",
    apreensaoResponsavel: "",
    apreensaoDocumento: "",
    apreensaoQtdeBens: "",
    apreensaoDescricaoBens: "",
    bensApreendidos: { qtde: "", tipos: [], outrosDescricao: "" },
    // Ambulantes
    temAmbulantes: false,
    ambulantes: {
      detectados: "",
      abordados: "",
      dispersados: "",
      vistoriaQtde: "",
      temAutosApreensao: false,
      autosQtde: "",
      autosBensQtde: "",
      autosTipos: [],
      autosOutrosDescricao: "",
      abordadosSituacao: {
        comLicenca: null,
        semLicenca: null,
        emDesacordo: null,
      },
      temTRV: false,
      trvQtde: "",
      trvBensQtde: "",
      trvTipos: [],
      trvOutrosDescricao: "",
    },
    // Para Atividade Carnavalesca em Estabelecimento Comercial
    tipoEstabelecimento: "",
    estabelecimentoOutro: "",
    estabelecimentoLicenciado: "",
    tipoAtividadeCarnavalesca: "",
    // TRV (Termo de Retenção de Volumes)
    temTRV: false,
    trv: { qtde: "", bens: "", tipos: [] },
    // Etapa 4 - Recursos
    recursos: { apoio: "", motoristas: "", veiculos: "" },
    // Etapa 5 - Informações Complementares
    ocorrenciasRegistrados: false,
    ocorrenciasDescricao: "",
    outrosFatosObservados: false,
    outrosFatosDescricao: "",
    fotosApreensoes: [],
    fotosAutos: [],
    outrosFotos: [],
    outrosDocumentos: [],
    // Etapa 6 - Finalização
    terminoTurno: "",
    checklist: { local: false, revisado: false, anexos: false },
    photos: [],
  };

  const [bensApreendidos, setBensApreendidos] = useState([]); // Lista final
  const [bemSelecionado, setBemSelecionado] = useState(""); // Item do select
  const [quantidadeBem, setQuantidadeBem] = useState(1); // Quantidade no input

  // Estados para TRV
  const [bensTRV, setBensTRV] = useState([]);
  const [bemSelecionadoTRV, setBemSelecionadoTRV] = useState("");
  const [quantidadeBemTRV, setQuantidadeBemTRV] = useState(1);

  // Função para adicionar à lista
  const adicionarBem = () => {
    if (bemSelecionado) {
      const novoBem = { nome: bemSelecionado, quantidade: quantidadeBem };
      setBensApreendidos([...bensApreendidos, novoBem]);
      setBemSelecionado(""); // Limpa seleção
      setQuantidadeBem(1); // Reseta quantidade
    }
  };

  // Função para remover da lista
  const removerBem = (index) => {
    setBensApreendidos(bensApreendidos.filter((_, i) => i !== index));
  };

  // Função para adicionar à lista TRV
  const adicionarBemTRV = () => {
    if (bemSelecionadoTRV) {
      const novoBem = { nome: bemSelecionadoTRV, quantidade: quantidadeBemTRV };
      setBensTRV([...bensTRV, novoBem]);
      setBemSelecionadoTRV("");
      setQuantidadeBemTRV(1);
    }
  };

  // Função para remover da lista TRV
  const removerBemTRV = (index) => {
    setBensTRV(bensTRV.filter((_, i) => i !== index));
  };

  const [formData, setFormData] = useState(initialFormData);

  const captureLocation = () => {
    setGpsStatus("loading");
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("success");
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    captureLocation();
    // Preencher data atual no campo dataTurno
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    setFormData((prev) => ({ ...prev, dataTurno: formattedDate }));
  }, []);

  // Limpar dados da etapa 3 quando tipo de evento mudar
  useEffect(() => {
    if (formData.tipoEvento !== "") {
      setFormData((prev) => ({
        ...prev,
        situacaoEvento: "",
        acoesFiscais: [],
        notificacaoResponsavel: "",
        notificacaoDocumento: "",
        responsavelInterdição: "",
        cpfCnpjInterdição: "",
        infracaoResponsavel: "",
        infracaoDocumento: "",
        valorMulta: "",
        apreensaoResponsavel: "",
        apreensaoDocumento: "",
        apreensaoQtdeBens: "",
        apreensaoDescricaoBens: "",
        bensApreendidos: { qtde: "", tipos: [], outrosDescricao: "" },
        temAmbulantes: false,
        ambulantes: {
          detectados: "",
          abordados: "",
          dispersados: "",
          temAutosApreensao: false,
          autosQtde: "",
          autosBensQtde: "",
          autosTipos: [],
          autosOutrosDescricao: "",
          abordadosSituacao: {
            comLicenca: null,
            semLicenca: null,
            emDesacordo: null,
          },
          temTRV: false,
          trvQtde: "",
          trvBensQtde: "",
          trvTipos: [],
          trvOutrosDescricao: "",
        },
        tipoEstabelecimento: "",
        estabelecimentoOutro: "",
        estabelecimentoLicenciado: "",
        tipoAtividadeCarnavalesca: "",
      }));
      setBensApreendidos([]);
      setBensTRV([]);
    }
  }, [formData.tipoEvento]);

  const fileInputRef = useRef(null);

  const takePhoto = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });
      console.log("Foto da câmera capturada:", image.dataUrl ? "OK" : "ERRO");
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, image.dataUrl],
      }));
    } catch (error) {
      alert("Erro ao tirar foto: " + error.message);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("[handleFileSelect] Arquivo selecionado:", {
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        console.log("[handleFileSelect] DataURL criada:", {
          tipo: typeof dataUrl,
          comprimento: dataUrl.length,
          comeco: dataUrl.substring(0, 50),
        });

        console.log("[handleFileSelect] Adicionando ao estado...", {
          fotosAntes: formData.photos.length,
        });

        setFormData((prev) => {
          const newPhotos = [...prev.photos, dataUrl];
          console.log("[handleFileSelect] Estado atualizado:", {
            fotosDepois: newPhotos.length,
          });
          return {
            ...prev,
            photos: newPhotos,
          };
        });
      };
      reader.onerror = (error) => {
        console.error("Erro ao ler arquivo:", error);
        alert("Erro ao processar imagem da galeria");
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleInput = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleNestedInput = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const toggleArrayItem = (listName, item) => {
    setFormData((prev) => {
      const list = prev[listName];
      return {
        ...prev,
        [listName]: list.includes(item)
          ? list.filter((i) => i !== item)
          : [...list, item],
      };
    });
  };

  const toggleNestedArrayItem = (parent, listName, item) => {
    setFormData((prev) => {
      const list = prev[parent][listName];
      const newList = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return {
        ...prev,
        [parent]: { ...prev[parent], [listName]: newList },
      };
    });
  };

  const loadImageAsDataUrl = async (imagePath) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Erro ao carregar imagem ${imagePath}:`, error);
      return null;
    }
  };

  // Função para calcular dimensões mantendo aspect ratio
  const getImageDimensions = (dataUrl) => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const maxWidth = 70; // largura máxima em mm
        const maxHeight = 70; // altura máxima em mm

        let width = maxWidth;
        let height = maxHeight;

        const aspectRatio = img.width / img.height;

        if (aspectRatio > 1) {
          // Paisagem (horizontal)
          height = maxWidth / aspectRatio;
        } else {
          // Retrato (vertical)
          width = maxHeight * aspectRatio;
        }

        resolve({ width, height });
      };
      img.onerror = () => {
        // Se erro, retorna dimensões padrão
        console.error("Erro ao carregar imagem para calcular dimensões");
        resolve({ width: 60, height: 60 });
      };
      img.src = dataUrl;
    });
  };

  const compressImageForPdf = (dataUrl, maxDimension = 1280, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const scale = Math.min(
          1,
          maxDimension / Math.max(img.width, img.height),
        );
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      };
      img.onerror = () => {
        console.error("Erro ao comprimir imagem");
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  // Carregar lista de PDFs ao entrar na tela 7
  const loadPdfList = async () => {
    try {
      const result = await Filesystem.readdir({
        path: "",
        directory: Directory.Documents,
      });

      const pdfFiles = result.files
        .filter(
          (file) => file.name.startsWith("C-") && file.name.endsWith(".pdf"),
        )
        .sort((a, b) => b.name.localeCompare(a.name));

      setPdfList(pdfFiles);
      console.log("PDFs encontrados:", pdfFiles.length);
    } catch (error) {
      console.error("Erro ao listar PDFs:", error);
      setPdfList([]);
    }
  };

  // Compartilhar PDF
  const sharePdf = async (pdfName) => {
    try {
      const fileUri = await Filesystem.getUri({
        path: pdfName,
        directory: Directory.Documents,
      });

      await Share.share({
        title: "Relatório de Fiscalização",
        text: `Compartilhando relatório: ${pdfName}`,
        url: fileUri.uri,
        dialogTitle: "Compartilhar PDF",
      });
    } catch (error) {
      console.error("Erro ao compartilhar PDF:", error);
      alert("Erro ao compartilhar PDF: " + error.message);
    }
  };

  // Deletar PDF
  const deletePdf = async (pdfName) => {
    try {
      const confirmDelete = confirm(
        `Tem certeza que deseja deletar ${pdfName}?`,
      );
      if (!confirmDelete) return;

      await Filesystem.deleteFile({
        path: pdfName,
        directory: Directory.Documents,
      });
      alert("PDF deletado com sucesso!");
      await loadPdfList();
    } catch (error) {
      console.error("Erro ao deletar PDF:", error);
      alert("Erro ao deletar PDF: " + error.message);
    }
  };

  // Abrir PDF em modal
  const openPdf = async (pdfName) => {
    try {
      setPdfLoading(true);
      const fileContent = await Filesystem.readFile({
        path: pdfName,
        directory: Directory.Documents,
      });

      // fileContent.data é uma string em base64
      // Criar data URL direto do base64
      const pdfUrl = `data:application/pdf;base64,${fileContent.data}`;

      // Armazenar no estado para exibir no modal
      setViewingPdf(pdfName);
      setViewingPdfUrl(pdfUrl);
      setPdfLoading(false);
    } catch (error) {
      console.error("Erro ao abrir PDF:", error);
      setPdfLoading(false);
      alert("Erro ao abrir PDF: " + error.message);
    }
  };

  const generatePDF = async () => {
    try {
      // DEBUG: Verificar estado das fotos
      console.log(
        "=== INICIANDO GERAÇÃO DE PDF ===",
        "Fotos no estado:",
        formData.photos.length,
      );
      console.log(
        "Primeiro 100 chars de cada foto:",
        formData.photos.map((p) => (p ? p.substring(0, 100) + "..." : "NULL")),
      );

      const doc = new jsPDF({ compress: true });

      console.log("Iniciando carregamento de logos...");
      const logoLegalDataUrl = await loadImageAsDataUrl(
        "/images/logolegal.png",
      );
      const logoGdfDataUrl = await loadImageAsDataUrl("/images/logogdf.png");
      console.log("Logos carregadas:", {
        logoLegal: logoLegalDataUrl ? "OK" : "FALHOU",
        logoGdf: logoGdfDataUrl ? "OK" : "FALHOU",
      });

      const logoLegalForPdf = logoLegalDataUrl
        ? await compressImageForPdf(logoLegalDataUrl, 600, 0.6)
        : null;
      const logoGdfForPdf = logoGdfDataUrl
        ? await compressImageForPdf(logoGdfDataUrl, 600, 0.6)
        : null;

      if (logoLegalForPdf) {
        doc.addImage(logoLegalForPdf, "JPEG", 15, 10, 21, 24.86);
      }

      if (logoGdfForPdf) {
        doc.addImage(logoGdfForPdf, "JPEG", 175, 10, 20, 23.68);
      }

      doc.setFontSize(14);
      const drawHeader = () => {
        // Logos nos cantos
        if (logoLegalForPdf) {
          doc.addImage(logoLegalForPdf, "JPEG", 15, 10, 21, 24.86);
        }

        if (logoGdfForPdf) {
          doc.addImage(logoGdfForPdf, "JPEG", 175, 10, 20, 23.68);
        }

        // Textos do cabeçalho
        doc.setFontSize(14);
        doc.text("GOVERNO DO DISTRITO FEDERAL", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(
          "SECRETARIA DE ESTADO DE PROTEÇÃO DA ORDEM URBANÍSTICA DO DF",
          105,
          28,
          { align: "center" },
        );
        doc.text("DF-LEGAL", 105, 35, { align: "center" });
        doc.setFontSize(16);
        doc.text("Relatório de Fiscalização - Carnaval 2026", 105, 45, {
          align: "center",
        });
        doc.line(20, 50, 190, 50);
        doc.setFontSize(12);
      };

      drawHeader();

      doc.setFontSize(12);
      let y = 60;

      const checkPageBreak = () => {
        if (y > 250) {
          doc.addPage();
          drawHeader();
          y = 60;
        }
      };

      const addText = (text, x, yPos, maxWidth = 180) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, yPos);
        return yPos + lines.length * 7;
      };

      const formatDateBR = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };

      // Etapa 1
      doc.setFont("helvetica", "bold");
      doc.text("1. Identificação do Servidor", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(`Data: ${formatDateBR(formData.dataTurno)}`, 20, y);
      doc.text(`Nome: ${formData.nomeAuditor}`, 110, y);
      y += 7;
      doc.text(`Matrícula: ${formData.matricula}`, 20, y);
      doc.text(`Turno: ${formData.turno}`, 110, y);
      y += 7;
      doc.text(`Início: ${formData.inicioTurno}`, 110, y);
      y += 7;
      doc.text(
        `Setor: ${formData.setor}${formData.setor === "OUTRO" ? " - " + formData.setorOutro : ""}`,
        20,
        y,
      );
      y += 15;

      checkPageBreak();

      // Etapa 2
      doc.setFont("helvetica", "bold");
      doc.text("2. Identificação do Evento", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(
        `Evento: ${formData.nomeEvento}${formData.nomeEvento === "OUTROS" ? " - " + formData.nomeEventoOutro : ""}`,
        20,
        y,
      );
      doc.text(
        `Localização: ${location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Não capturado"}`,
        110,
        y,
      );
      y += 10;
      doc.text(`RA: ${formData.ra}`, 20, y);
      doc.text(`Tipo: ${formData.tipoEvento}`, 110, y);
      y += 10;
      doc.text(`Público Estimado: ${formData.publicoEstimado}`, 20, y);
      y += 20;

      checkPageBreak();

      // Etapa 3
      doc.setFont("helvetica", "bold");
      y = addText(`3. ${formData.tipoEvento}`, 20, y);
      doc.setFont("helvetica", "normal");
      if (
        formData.tipoEvento ===
        "Atividade Carnavalesca em Estabelecimento Comercial (Show/Festa)"
      ) {
        doc.text(
          `Tipo de Estabelecimento: ${formData.tipoEstabelecimento}${formData.tipoEstabelecimento === "Outro" ? " - " + formData.estabelecimentoOutro : ""}`,
          20,
          y,
        );
        if (
          formData.acoesFiscais.includes("Vistoria de Ambulante") &&
          formData.ambulantes.vistoriaQtde === ""
        )
          return false;
        y += 10;
        doc.text(`Licenciado: ${formData.estabelecimentoLicenciado}`, 20, y);
        y += 10;
        if (formData.estabelecimentoLicenciado === "Não") {
          y = addText(
            `Ações no Estabelecimento: ${formData.acoesFiscais.join(", ")}`,
            20,
            y,
          );
          if (
            !(
              formData.tipoAtividadeCarnavalesca === "Show" ||
              formData.tipoAtividadeCarnavalesca === "Festa"
            ) &&
            formData.acoesFiscais.includes("Vistoria")
          ) {
            doc.text(`Vistoria - Quantidade: ${formData.vistoriaQtde}`, 20, y);
            y += 10;
          }
        }
        doc.text(
          `Tipo de Atividade: ${formData.tipoAtividadeCarnavalesca}`,
          20,
          y,
        );
        y += 10;
        if (
          formData.tipoAtividadeCarnavalesca === "Show" ||
          formData.tipoAtividadeCarnavalesca === "Festa"
        ) {
          doc.text(`Situação: ${formData.situacaoEvento}`, 20, y);
          y += 10;
          doc.text(`Ações: ${formData.acoesFiscais.join(", ")}`, 20, y);
          y += 10;
          if (formData.acoesFiscais.includes("Vistoria")) {
            doc.text(`Vistoria - Quantidade: ${formData.vistoriaQtde}`, 20, y);
            y += 10;
          }
        }
      } else {
        doc.text(`Situação: ${formData.situacaoEvento}`, 20, y);
        y += 10;
        y = addText(`Ações: ${formData.acoesFiscais.join(", ")}`, 20, y);
        if (formData.acoesFiscais.includes("Vistoria")) {
          doc.text(`Vistoria - Quantidade: ${formData.vistoriaQtde}`, 20, y);
          y += 10;
        }
      }

      // Detalhes de Infração
      if (formData.acoesFiscais.includes("Auto de Infração")) {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Detalhes da Infração:", 20, y);
        doc.setFont("helvetica", "normal");
        y += 7;
        doc.text(`Responsável: ${formData.infracaoResponsavel}`, 20, y);
        y += 7;
        doc.text(`CPF/CNPJ: ${formData.infracaoDocumento}`, 20, y);
        y += 7;
        doc.text(`Valor: R$ ${formData.valorMulta}`, 20, y);
        y += 10;
      }

      // Detalhes de Notificação
      if (formData.acoesFiscais.includes("Auto de Notificação")) {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Detalhes da Notificação:", 20, y);
        doc.setFont("helvetica", "normal");
        y += 7;
        doc.text(`Notificado: ${formData.notificacaoResponsavel}`, 20, y);
        y += 7;
        doc.text(`CPF/CNPJ: ${formData.notificacaoDocumento}`, 20, y);
        y += 10;
      }

      // Detalhes de Interdição
      if (formData.acoesFiscais.includes("Auto de Interdição")) {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Detalhes da Interdição:", 20, y);
        doc.setFont("helvetica", "normal");
        y += 7;
        doc.text(`Responsável: ${formData.responsavelInterdição}`, 20, y);
        y += 7;
        doc.text(`CPF/CNPJ: ${formData.cpfCnpjInterdição}`, 20, y);
        y += 10;
      }

      if (formData.temAmbulantes) {
        doc.text(
          `Ambulantes - Detectados: ${formData.ambulantes.detectados}, Se dispersaram: ${formData.ambulantes.dispersados}`,
          20,
          y,
        );
        y += 10;
      }

      // Ambulantes Abordados (ação fiscal)
      if (formData.ambulantes.temAutosApreensao) {
        y += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Ambulantes Abordados (Ação Fiscal):", 20, y);
        doc.setFont("helvetica", "normal");
        y += 7;

        // Formatar situações marcadas
        const situacoes = [];
        if (formData.ambulantes.abordadosSituacao.comLicenca !== null) {
          situacoes.push(
            `Com Licença: ${formData.ambulantes.abordadosSituacao.comLicenca}`,
          );
        }
        if (formData.ambulantes.abordadosSituacao.semLicenca !== null) {
          situacoes.push(
            `Sem Licença: ${formData.ambulantes.abordadosSituacao.semLicenca}`,
          );
        }
        if (formData.ambulantes.abordadosSituacao.emDesacordo !== null) {
          situacoes.push(
            `Em desacordo: ${formData.ambulantes.abordadosSituacao.emDesacordo}`,
          );
        }
        doc.text(`Situação: ${situacoes.join(", ")}`, 20, y);
        y += 7;

        const acoesAmbulantesSelecionadas = [
          "Vistoria de Ambulante",
          "Auto de Apreensão (ambulante)",
          "Termo de Retenção de Volume (TRV)",
        ].filter((a) => formData.acoesFiscais.includes(a));

        const acoesAmbulantesExibicao = acoesAmbulantesSelecionadas.map(
          (acao) =>
            acao === "Auto de Apreensão (ambulante)"
              ? "Auto de Apreensão"
              : acao,
        );

        y = addText(`Ações: ${acoesAmbulantesExibicao.join(", ")}`, 20, y);

        if (formData.acoesFiscais.includes("Vistoria de Ambulante")) {
          y += 5;
          doc.text(
            `Vistoria de Ambulante - Quantidade: ${formData.ambulantes.vistoriaQtde}`,
            20,
            y,
          );
          y += 10;
        }

        if (formData.acoesFiscais.includes("Auto de Apreensão (ambulante)")) {
          y += 5;
          doc.text(
            `Auto de Apreensão - Quantidade de Autos: ${formData.ambulantes.autosQtde}, Total de bens apreendidos: ${formData.ambulantes.autosBensQtde}`,
            20,
            y,
          );
          y += 10;
        }

        if (formData.acoesFiscais.includes("Auto de Apreensão (ambulante)")) {
          // Listagem detalhada dos bens apreendidos
          if (bensApreendidos.length > 0) {
            checkPageBreak();
            doc.setFont("helvetica", "bold");
            doc.text("Detalhamento dos Bens Apreendidos:", 20, y);
            doc.setFont("helvetica", "normal");
            y += 8;
            bensApreendidos.forEach((bem, idx) => {
              checkPageBreak();
              doc.text(
                `${idx + 1}. ${bem.nome} (Quantidade: ${bem.quantidade})`,
                25,
                y,
              );
              y += 7;
            });
            y += 5;
          }
        }

        if (
          formData.acoesFiscais.includes("Termo de Retenção de Volume (TRV)")
        ) {
          y += 5;
          doc.text(
            `TRV - Quantidade: ${formData.ambulantes.trvQtde}, Total de bens retidos: ${formData.ambulantes.trvBensQtde}`,
            20,
            y,
          );
          y += 10;

          // Listagem detalhada dos bens retidos do TRV
          if (bensTRV.length > 0) {
            checkPageBreak();
            doc.setFont("helvetica", "bold");
            doc.text("Detalhamento dos Bens Retidos (TRV):", 20, y);
            doc.setFont("helvetica", "normal");
            y += 8;
            bensTRV.forEach((bem, idx) => {
              checkPageBreak();
              doc.text(
                `${idx + 1}. ${bem.nome} (Quantidade: ${bem.quantidade})`,
                25,
                y,
              );
              y += 7;
            });
            y += 5;
          }
        }
      }

      checkPageBreak();

      // Etapa 4
      doc.setFont("helvetica", "bold");
      doc.text("4. Recursos Empregados e Informações Complementares", 20, y);
      doc.setFont("helvetica", "normal");
      y += 8;
      doc.text(`Total de Apoio: ${formData.recursos.apoio}`, 20, y);
      y += 6;
      doc.text(`Total de Motoristas: ${formData.recursos.motoristas}`, 20, y);
      y += 6;
      doc.text(`Total de Veículos: ${formData.recursos.veiculos}`, 20, y);
      y += 10;
      doc.text(
        `Ocorrência Policial Registrada: ${formData.ocorrenciasRegistrados ? "Sim" : "Não"}`,
        20,
        y,
      );
      y += 10;
      if (formData.ocorrenciasRegistrados) {
        y = addText(`Descrição: ${formData.ocorrenciasDescricao}`, 20, y);
      }
      doc.text(
        `Outros Fatos Observados: ${formData.outrosFatosObservados ? "Sim" : "Não"}`,
        20,
        y,
      );
      y += 10;
      if (formData.outrosFatosObservados) {
        y = addText(`Descrição: ${formData.outrosFatosDescricao}`, 20, y);
      }
      y += 10;

      checkPageBreak();

      // Etapa 6
      doc.setFont("helvetica", "bold");
      doc.text("Finalização", 20, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      doc.text(`Fim do Turno: ${formData.terminoTurno}`, 20, y);
      y += 10;

      const addPhotoSection = async (title, photos, yStart) => {
        if (!photos || photos.length === 0) {
          console.log(`Nenhuma foto para adicionar em: ${title}`);
          return yStart;
        }

        console.log(`Adicionando ${photos.length} fotos ao PDF (${title})`);

        // Verificar se há espaço para título + pelo menos uma foto
        const spaceForTitle = 20;
        const spaceForOnePhoto = 75; // ~60 foto + 15 margem
        if (yStart + spaceForTitle + spaceForOnePhoto > 260) {
          console.log(
            "Criando nova página para fotos (não há espaço na atual)",
          );
          doc.addPage();
          drawHeader();
          yStart = 70;
        }

        // Título das fotos
        doc.text(title, 20, yStart);
        let photoStartY = yStart + 15;

        // Grid: 2 colunas
        const gapX = 15;
        const gapY = 12;
        const pageLimit = 260;

        let pageY = photoStartY;
        let photosInPage = 0; // Contador de fotos nesta página

        for (let index = 0; index < photos.length; index++) {
          const photo = photos[index];

          console.log(`[DEBUG Foto ${index + 1}]`, {
            tipo: typeof photo,
            comprimento: photo ? photo.length : 0,
            comeco: photo ? photo.substring(0, 50) : "NULL",
            isDataUrl: photo && photo.startsWith("data:") ? "SIM" : "NÃO",
          });

          const compressedPhoto = await compressImageForPdf(photo, 1280, 0.7);

          // Calcular dimensões mantendo aspect ratio
          const { width: photoWidth, height: photoHeight } =
            await getImageDimensions(compressedPhoto);
          console.log(
            `Foto ${index + 1} dimensões: ${photoWidth.toFixed(1)}×${photoHeight.toFixed(1)}mm`,
          );

          const colPosition = photosInPage % 2; // Coluna dentro da página
          const rowInPage = Math.floor(photosInPage / 2); // Linha dentro da página

          const maxPhotoWidth = 70;
          const photoX = 20 + colPosition * (maxPhotoWidth + gapX);
          let photoY = pageY + rowInPage * (80 + gapY); // 80mm = espaço max por linha

          // Verificar se cabe na página atual
          if (photoY + photoHeight > pageLimit) {
            // Não cabe, criar nova página
            console.log(
              `Foto ${index + 1}: não cabe (y=${photoY}), criando nova página`,
            );
            doc.addPage();
            drawHeader();
            pageY = 70;
            photosInPage = 0; // Reset contador

            // Recalcular posição na nova página (sempre primeira posição)
            photoY = pageY;
            const newPhotoX = 20; // Primeira coluna

            try {
              doc.addImage(
                compressedPhoto,
                "JPEG",
                newPhotoX,
                photoY,
                photoWidth,
                photoHeight,
                undefined,
                "FAST",
              );
              console.log(
                `✓ Foto ${index + 1} na nova página (${newPhotoX}, ${photoY})`,
              );
              photosInPage = 1;
            } catch (error) {
              console.error(`✗ Erro foto ${index + 1}:`, error.message);
            }
          } else {
            // Cabe na página atual
            try {
              doc.addImage(
                compressedPhoto,
                "JPEG",
                photoX,
                photoY,
                photoWidth,
                photoHeight,
                undefined,
                "FAST",
              );
              console.log(`✓ Foto ${index + 1} em (${photoX}, ${photoY})`);
              photosInPage++;
            } catch (error) {
              console.error(`✗ Erro foto ${index + 1}:`, error.message);
            }
          }
        }

        // Atualizar y com base em quantas fotos foram adicionadas na última página
        const lastPageRows = Math.ceil(photosInPage / 2);
        return pageY + lastPageRows * (80 + gapY) + 15;
      };

      y = await addPhotoSection("Fotos Capturadas:", formData.photos, y);
      const fotosAutoApreensao = [
        ...formData.fotosApreensoes,
        ...formData.fotosAutos,
        ...formData.outrosFotos,
      ];

      y = await addPhotoSection(
        "Fotos - Auto de Apreensão:",
        fotosAutoApreensao,
        y,
      );

      // Gerar nome do arquivo com contador
      const matricula = formData.matricula;
      const counterKey = `pdfCounter_${matricula}`;
      let counter = parseInt(localStorage.getItem(counterKey) || "0", 10);
      counter += 1;
      localStorage.setItem(counterKey, counter.toString());
      const paddedCounter = counter.toString().padStart(2, "0");
      const filename = `C-${matricula}${paddedCounter}.pdf`;

      const pdfBlob = doc.output("blob");

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        try {
          // Salvar o PDF
          const writeResult = await Filesystem.writeFile({
            path: filename,
            data: base64,
            directory: Directory.Documents,
          });

          console.log("PDF salvo:", writeResult.uri);

          // Abrir PDF de forma diferente dependendo da plataforma
          alert("✓ PDF gerado e salvo com sucesso!\n" + filename);

          // Ir para tela de relatórios gerados
          setTimeout(() => {
            loadPdfList();
            setStep(7);
          }, 1500);
        } catch (error) {
          console.error("Erro ao salvar/abrir PDF:", error);
          alert("Erro ao salvar PDF: " + error.message);
        }
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF: " + error.message);
    }
  };

  const isStep1Valid = () => {
    return (
      formData.nomeAuditor.trim() !== "" &&
      formData.matricula.trim() !== "" &&
      formData.setor !== "" &&
      (formData.setor !== "OUTRO" || formData.setorOutro.trim() !== "") &&
      formData.turno !== "" &&
      formData.inicioTurno !== ""
    );
  };

  const isStep2Valid = () => {
    return (
      formData.nomeEvento !== "" &&
      (formData.nomeEvento !== "OUTROS" ||
        formData.nomeEventoOutro.trim() !== "") &&
      formData.ra !== "" &&
      formData.tipoEvento !== "" &&
      formData.publicoEstimado !== ""
    );
  };

  const isStep3Valid = () => {
    if (
      formData.tipoEvento ===
      "Atividade Carnavalesca em Estabelecimento Comercial (Show/Festa)"
    ) {
      if (formData.tipoEstabelecimento === "") return false;
      if (
        formData.tipoEstabelecimento === "Outro" &&
        formData.estabelecimentoOutro.trim() === ""
      )
        return false;
      if (formData.estabelecimentoLicenciado === "") return false;
      if (formData.tipoAtividadeCarnavalesca === "") return false;
      if (
        (formData.tipoAtividadeCarnavalesca === "Show" ||
          formData.tipoAtividadeCarnavalesca === "Festa") &&
        formData.situacaoEvento === ""
      )
        return false;

      if (formData.temAmbulantes) {
        if (
          formData.ambulantes.detectados === "" ||
          formData.ambulantes.dispersados === ""
        )
          return false;
      }

      if (formData.ambulantes.temAutosApreensao) {
        const temSituacao =
          formData.ambulantes.abordadosSituacao.comLicenca !== null ||
          formData.ambulantes.abordadosSituacao.semLicenca !== null ||
          formData.ambulantes.abordadosSituacao.emDesacordo !== null;
        if (!temSituacao) return false;

        const acoesAmbulantes = [
          "Vistoria de Ambulante",
          "Auto de Apreensão (ambulante)",
          "Termo de Retenção de Volume (TRV)",
        ];
        const temAcaoAmbulante = acoesAmbulantes.some((acao) =>
          formData.acoesFiscais.includes(acao),
        );
        if (!temAcaoAmbulante) return false;

        if (
          formData.acoesFiscais.includes("Vistoria de Ambulante") &&
          formData.ambulantes.vistoriaQtde === ""
        )
          return false;

        if (formData.acoesFiscais.includes("Auto de Apreensão (ambulante)")) {
          if (
            formData.ambulantes.autosQtde === "" ||
            formData.ambulantes.autosBensQtde === ""
          )
            return false;
          if (bensApreendidos.length === 0) return false;
        }

        if (
          formData.acoesFiscais.includes("Termo de Retenção de Volume (TRV)")
        ) {
          if (
            formData.ambulantes.trvQtde === "" ||
            formData.ambulantes.trvBensQtde === ""
          )
            return false;
          if (bensTRV.length === 0) return false;
        }
      }

      if (
        formData.acoesFiscais.includes("Vistoria de Ambulante") &&
        formData.ambulantes.vistoriaQtde === ""
      )
        return false;

      if (formData.estabelecimentoLicenciado === "Sim") {
        return true;
      }

      if (formData.situacaoEvento === "") return false;
      if (formData.acoesFiscais.length === 0) return false;
      if (
        formData.acoesFiscais.includes("Vistoria") &&
        formData.vistoriaQtde === ""
      )
        return false;
      if (
        formData.acoesFiscais.includes("Auto de Infração") &&
        (formData.valorMulta.trim() === "" ||
          formData.infracaoResponsavel.trim() === "" ||
          formData.infracaoDocumento.trim() === "")
      )
        return false;
      if (
        formData.acoesFiscais.includes("Auto de Interdição") &&
        (formData.responsavelInterdição.trim() === "" ||
          formData.cpfCnpjInterdição.trim() === "")
      )
        return false;

      if (formData.acoesFiscais.includes("Auto de Apreensão")) {
        if (
          formData.apreensaoResponsavel.trim() === "" ||
          formData.apreensaoDocumento.trim() === "" ||
          formData.apreensaoQtdeBens === "" ||
          formData.apreensaoDescricaoBens.trim() === ""
        )
          return false;
      }
      return true;
    } else {
      if (formData.situacaoEvento.trim() === "") return false;
      if (formData.acoesFiscais.length === 0) return false;
      if (
        formData.acoesFiscais.includes("Auto de Infração") &&
        (formData.valorMulta.trim() === "" ||
          formData.infracaoResponsavel.trim() === "" ||
          formData.infracaoDocumento.trim() === "")
      )
        return false;
      if (
        formData.acoesFiscais.includes("Auto de Interdição") &&
        (formData.responsavelInterdição.trim() === "" ||
          formData.cpfCnpjInterdição.trim() === "")
      )
        return false;

      if (
        formData.acoesFiscais.includes("Auto de Notificação") &&
        (formData.notificacaoDocumento.trim() === "" ||
          formData.notificacaoResponsavel.trim() === "")
      )
        return false;

      if (
        formData.acoesFiscais.includes("Vistoria") &&
        formData.vistoriaQtde === ""
      )
        return false;

      if (formData.acoesFiscais.includes("Auto de Apreensão")) {
        if (
          formData.apreensaoResponsavel.trim() === "" ||
          formData.apreensaoDocumento.trim() === "" ||
          formData.apreensaoQtdeBens === "" ||
          formData.apreensaoDescricaoBens.trim() === ""
        )
          return false;
      }

      if (formData.temAmbulantes) {
        if (
          formData.ambulantes.detectados === "" ||
          formData.ambulantes.dispersados === ""
        )
          return false;
      }
      if (formData.ambulantes.temAutosApreensao) {
        const temSituacao =
          formData.ambulantes.abordadosSituacao.comLicenca !== null ||
          formData.ambulantes.abordadosSituacao.semLicenca !== null ||
          formData.ambulantes.abordadosSituacao.emDesacordo !== null;
        if (!temSituacao) return false;

        const acoesAmbulantes = [
          "Vistoria de Ambulante",
          "Auto de Apreensão (ambulante)",
          "Termo de Retenção de Volume (TRV)",
        ];
        const temAcaoAmbulante = acoesAmbulantes.some((acao) =>
          formData.acoesFiscais.includes(acao),
        );
        if (!temAcaoAmbulante) return false;

        if (
          formData.acoesFiscais.includes("Vistoria de Ambulante") &&
          formData.ambulantes.vistoriaQtde === ""
        )
          return false;

        if (formData.acoesFiscais.includes("Auto de Apreensão (ambulante)")) {
          if (
            formData.ambulantes.autosQtde === "" ||
            formData.ambulantes.autosBensQtde === ""
          )
            return false;
          if (bensApreendidos.length === 0) return false;
        }

        if (
          formData.acoesFiscais.includes("Termo de Retenção de Volume (TRV)")
        ) {
          if (
            formData.ambulantes.trvQtde === "" ||
            formData.ambulantes.trvBensQtde === ""
          )
            return false;
          if (bensTRV.length === 0) return false;
        }
      }
    }
    return true;
  };

  const isStep4Valid = () => {
    return (
      formData.recursos.apoio.trim() !== "" &&
      formData.recursos.motoristas.trim() !== "" &&
      formData.recursos.veiculos.trim() !== ""
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans text-slate-800"
      style={{
        backgroundImage: "url(/images/bg-carnaval.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="fixed inset-0 bg-white/70 pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* HEADER */}
        <header className="bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
              <Shield className="text-blue-900" size={24} />
            </div>
            <div>
              <h1 className="font-black text-sm leading-none uppercase">
                DF LEGAL
              </h1>
              <p className="text-[9px] font-bold opacity-70 uppercase">
                Carnaval 2026
              </p>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[9px] font-black border ${gpsStatus === "success" ? "bg-green-500/20 border-green-500 text-green-300" : "bg-red-500/20 border-red-500 text-red-300"}`}
          >
            {gpsStatus === "success" ? "GPS OK" : "SEM GPS"}
          </div>
        </header>

        <main className="flex-1 max-w-xl mx-auto w-full p-4 pb-24">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
            {/* Barra de Progresso */}
            <div className="flex w-full h-1.5 bg-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 transition-all duration-500 ${step >= i ? "bg-blue-600" : "bg-transparent"}`}
                />
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* ETAPA 1: IDENTIFICAÇÃO */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <User className="text-blue-900" size={20} />
                      <h2 className="text-lg font-black text-blue-900 uppercase">
                        1. Identificação do Servidor
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar1Icon size={16} className="text-slate-400" />
                    <input
                      type="date"
                      className="flex-1 p-2 bg-white border rounded-lg text-sm font-bold"
                      value={formData.dataTurno}
                      onChange={(e) => handleInput("dataTurno", e.target.value)}
                    />
                    <span className="text-xs font-black uppercase text-slate-400">
                      Data do Turno
                    </span>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nome do Auditor"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-900"
                      value={formData.nomeAuditor}
                      onChange={(e) =>
                        handleInput("nomeAuditor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Matrícula"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-900"
                      value={formData.matricula}
                      onChange={(e) => handleInput("matricula", e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                        value={formData.setor}
                        onChange={(e) => handleInput("setor", e.target.value)}
                      >
                        <option value="">Setor:</option>
                        <option value="SUFAE">SUFAE</option>
                        <option value="SUFIR">SUFIR</option>
                        <option value="SEINT">SEINT</option>
                        <option value="UFOPE">UFOPE</option>
                        <option value="OUTRO">OUTRO</option>
                      </select>
                      <select
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                        value={formData.turno}
                        onChange={(e) => handleInput("turno", e.target.value)}
                      >
                        <option value="">Turno:</option>
                        <option value=" (MATUTINO/VESPERTINO)">
                          MATUTINO/VESPERTINO
                        </option>
                        <option value="VESPERTINO/NOTURNO">
                          VESPERTINO/NOTURNO
                        </option>
                        <option value="NOTURNO">NOTURNO</option>
                      </select>
                    </div>

                    {formData.setor === "OUTRO" && (
                      <input
                        type="text"
                        placeholder="Descreva o setor"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-900"
                        value={formData.setorOutro}
                        onChange={(e) =>
                          handleInput("setorOutro", e.target.value)
                        }
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="time"
                        className="flex-1 p-2 bg-white border rounded-lg text-sm font-bold"
                        value={formData.inicioTurno}
                        onChange={(e) =>
                          handleInput("inicioTurno", e.target.value)
                        }
                      />
                      <span className="text-xs font-black uppercase text-slate-400">
                        Início do Turno
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        await loadPdfList();
                        setStep(7);
                      }}
                      className="w-full p-4 bg-green-400 text-white rounded-xl font-black shadow-lg hover:bg-green-500 flex items-center justify-center gap-2 uppercase text-sm tracking-wider mt-14"
                    >
                      <FileText size={18} /> PDF dos relatórios Gerados
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: LOCALIZAÇÃO */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <MapPin className="text-blue-900" size={20} />
                    <h2 className="text-lg font-black text-blue-900 uppercase">
                      2. Identificação do Evento
                    </h2>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-blue-400" />
                      <span className="text-xs font-mono font-bold">
                        {location
                          ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                          : "Aguardando GPS..."}
                      </span>
                    </div>
                    <button
                      onClick={captureLocation}
                      className="p-2 bg-white/10 rounded-full"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                      value={formData.nomeEvento}
                      onChange={(e) =>
                        handleInput("nomeEvento", e.target.value)
                      }
                    >
                      <option value="">Selecione o Evento:</option>
                      {EVENTOS_LIST.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}{" "}
                      <option value="OUTROS">Outro (Descrever):</option>{" "}
                    </select>

                    {formData.nomeEvento === "OUTROS" && (
                      <input
                        type="text"
                        placeholder="Nome do evento..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-900"
                        value={formData.nomeEventoOutro}
                        onChange={(e) =>
                          handleInput("nomeEventoOutro", e.target.value)
                        }
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Select da RA */}
                      <select
                        className={`p-4 border rounded-xl font-bold outline-none transition-colors ${
                          formData.ra
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                        value={formData.ra}
                        onChange={(e) => handleInput("ra", e.target.value)}
                      >
                        <option value="">Região Administrativa:</option>
                        {RA_LIST.map((r) => (
                          <option key={r} value={r} className="text-black">
                            {r}
                          </option>
                        ))}
                      </select>

                      <select
                        className={`p-4 border rounded-xl font-bold outline-none transition-colors ${
                          formData.tipoEvento ===
                          "Bloco de Rua (Desfile/Deslocamento)"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : formData.tipoEvento === "Show (possui Palco)"
                              ? "bg-orange-50 border-orange-200 text-orange-700"
                              : formData.tipoEvento === "Festa (sem Palco)"
                                ? "bg-pink-50 border-pink-200 text-pink-700"
                                : formData.tipoEvento ===
                                    "Atividade Carnavalesca em Estabelecimento Comercial (Show/Festa)"
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                        value={formData.tipoEvento}
                        onChange={(e) =>
                          handleInput("tipoEvento", e.target.value)
                        }
                      >
                        <option value="" className="text-slate-500">
                          Tipo de evento:
                        </option>
                        <option
                          value="Bloco de Rua (Desfile/Deslocamento)"
                          className="text-black"
                        >
                          Bloco de Rua (Desfile/Deslocamento)
                        </option>
                        <option
                          value="Show (possui Palco)"
                          className="text-black"
                        >
                          Show (possui Palco)
                        </option>
                        <option
                          value="Festa (sem Palco)"
                          className="text-black"
                        >
                          Festa (sem Palco)
                        </option>
                        <option
                          value="Atividade Carnavalesca em Estabelecimento Comercial (Show/Festa)"
                          className="text-black"
                        >
                          Atividade Carnavalesca em Estabelecimento Comercial
                          (Show/Festa)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[12px] font-black uppercase text-slate-400 ml-1">
                        Público estimado no local:
                      </label>

                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {
                            id: "pequeno",
                            label: "Pequeno: até 1.000 pessoas",
                            color:
                              "border-emerald-100 bg-emerald-50 text-emerald-700",
                            active:
                              "bg-emerald-600 text-white border-emerald-600",
                          },
                          {
                            id: "medio",
                            label: "Médio: de 1.001 a 5.000 pessoas",
                            color: "border-blue-100 bg-blue-50 text-blue-700",
                            active: "bg-blue-600 text-white border-blue-600",
                          },
                          {
                            id: "grande",
                            label: "Grande: de 5.001 a 15.000 pessoas",
                            color:
                              "border-amber-100 bg-amber-50 text-amber-700",
                            active: "bg-amber-600 text-white border-amber-600",
                          },
                          {
                            id: "super",
                            label: "Super: de 15.000 até 30.000 pessoas",
                            color:
                              "border-orange-100 bg-orange-50 text-orange-700",
                            active:
                              "bg-orange-600 text-white border-orange-600",
                          },
                          {
                            id: "mega",
                            label: "Mega: acima de 30.000 pessoas",
                            color: "border-red-100 bg-red-50 text-red-700",
                            active: "bg-red-600 text-white border-red-600",
                          },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleInput("publicoEstimado", item.label)
                            }
                            className={`w-full p-4 rounded-xl border-2 text-left text-xs font-bold transition-all flex justify-between items-center ${
                              formData.publicoEstimado === item.label
                                ? item.active + " shadow-md scale-[1.02]"
                                : item.color + " border-transparent opacity-80"
                            }`}
                          >
                            {item.label}
                            {formData.publicoEstimado === item.label && (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 3: AÇÕES E FISCALIZAÇÃO */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Shield className="text-blue-900" size={20} />
                    <h2 className="text-lg font-black text-blue-900 uppercase">
                      3. {formData.tipoEvento || "Ações Fiscais"}
                    </h2>
                  </div>

                  {formData.tipoEvento ===
                  "Atividade Carnavalesca em Estabelecimento Comercial (Show/Festa)" ? (
                    <>
                      {/* Tipo de Estabelecimento */}
                      <div className="space-y-2">
                        <label className="text-[12px] font-black text-slate-400 uppercase">
                          Tipo de Estabelecimento Comercial
                        </label>
                        <select
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                          value={formData.tipoEstabelecimento}
                          onChange={(e) =>
                            handleInput("tipoEstabelecimento", e.target.value)
                          }
                        >
                          <option value="">Selecionar:</option>
                          <option value="Bar">Bar</option>
                          <option value="Distribuidora de Bebidas">
                            Distribuidora de Bebidas
                          </option>
                          <option value="Restaurante">Restaurante</option>
                          <option value="Outro">Outro</option>
                        </select>
                        {formData.tipoEstabelecimento === "Outro" && (
                          <input
                            type="text"
                            placeholder="Descreva o tipo de estabelecimento:"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-900"
                            value={formData.estabelecimentoOutro}
                            onChange={(e) =>
                              handleInput(
                                "estabelecimentoOutro",
                                e.target.value,
                              )
                            }
                          />
                        )}
                      </div>

                      {/* Licenciado */}
                      <div className="space-y-2">
                        <label className="text-[12px] font-black text-slate-400 uppercase">
                          Estabelecimento Comercial Licenciado
                        </label>
                        <div className="flex bg-slate-200 rounded-full p-1">
                          <button
                            onClick={() =>
                              handleInput("estabelecimentoLicenciado", "Sim")
                            }
                            className={`px-4 py-2 rounded-full text-xs font-bold ${formData.estabelecimentoLicenciado === "Sim" ? "bg-white shadow" : "text-slate-500"}`}
                          >
                            SIM
                          </button>
                          <button
                            onClick={() =>
                              handleInput("estabelecimentoLicenciado", "Não")
                            }
                            className={`px-4 py-2 rounded-full text-xs font-bold ${formData.estabelecimentoLicenciado === "Não" ? "bg-blue-600 text-white shadow" : "text-slate-500"}`}
                          >
                            NÃO
                          </button>
                        </div>
                      </div>

                      {/* Ações if not licenciado */}
                      {formData.estabelecimentoLicenciado === "Não" && (
                        <div className="space-y-2">
                          <label className="text-[12px] font-black text-slate-400 uppercase">
                            Ações Fiscais (Estabelecimento)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Vistoria",
                              "Auto de Notificação",
                              "Auto de Infração",
                              "Auto de Interdição",
                              "Auto de Apreensão",
                            ].map((acao) => (
                              <button
                                key={acao}
                                onClick={() =>
                                  toggleArrayItem("acoesFiscais", acao)
                                }
                                className={`p-3 rounded-xl border text-xs font-black uppercase transition-all ${formData.acoesFiscais.includes(acao) ? "bg-blue-100 border-blue-500 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                              >
                                {acao}
                              </button>
                            ))}
                          </div>
                          {/* Condicional: Vistorias */}
                          {formData.acoesFiscais.includes("Vistoria") && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in zoom-in-95 space-y-3 mt-2">
                              <label className="flex items-center gap-2 text-xs font-black text-blue-800 uppercase">
                                <NotebookIcon size={14} /> Quantidade de
                                Vistorias
                              </label>
                              <input
                                type="number"
                                placeholder="Quantidade"
                                className="w-full p-2 rounded-lg border border-blue-200 font-medium bg-white outline-blue-400 text-xs"
                                value={formData.vistoriaQtde}
                                onChange={(e) =>
                                  handleInput("vistoriaQtde", e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Condicional: Infração com detalhes */}
                      {formData.acoesFiscais.includes("Auto de Infração") && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-orange-800 uppercase">
                            <AlertTriangle size={14} /> Detalhes da Infração
                          </label>

                          <div className="space-y-3">
                            {/* Nome do Responsável */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                Responsável / Infrator
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do responsável ou infrator"
                                className="w-full p-2 rounded-lg border border-orange-200 font-medium bg-white outline-orange-400"
                                value={formData.infracaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "infracaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {/* CPF/CNPJ */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                  CPF / CNPJ
                                </span>
                                <input
                                  type="text"
                                  placeholder="CPF ou CNPJ"
                                  className="w-full p-2 rounded-lg border border-orange-200 font-medium bg-white outline-orange-400"
                                  value={formData.infracaoDocumento}
                                  onChange={(e) =>
                                    handleInput(
                                      "infracaoDocumento",
                                      formatarDocumento(e.target.value),
                                    )
                                  }
                                />
                              </div>

                              {/* Valor da Multa */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                  Valor (R$)
                                </span>
                                <input
                                  type="number"
                                  placeholder="0,00"
                                  className="w-full p-2 rounded-lg border border-orange-200 font-bold bg-white outline-orange-400"
                                  value={formData.valorMulta}
                                  onChange={(e) =>
                                    handleInput("valorMulta", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Auto de Apreensão */}
                      {formData.acoesFiscais.includes("Auto de Apreensão") && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-red-800 uppercase">
                            <Package size={14} /> Detalhes da Apreensão
                          </label>

                          <div className="space-y-3">
                            {/* Responsável */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do responsável"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* CPF/CNPJ */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoDocumento}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoDocumento",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>

                            {/* Quantidade de Bens */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Quantidade de Bens Apreendidos
                              </span>
                              <input
                                type="number"
                                placeholder="Quantidade"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoQtdeBens}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoQtdeBens",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* Descrição dos Bens */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Descrever o tipo de bens apreendidos
                              </span>
                              <textarea
                                placeholder="Descreva os bens apreendidos"
                                rows="3"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400 resize-none"
                                value={formData.apreensaoDescricaoBens}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoDescricaoBens",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Notificação */}
                      {formData.acoesFiscais.includes(
                        "Auto de Notificação",
                      ) && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-purple-800 uppercase">
                            <FileText size={14} /> Detalhes da Notificação
                          </label>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-purple-700 uppercase ml-1">
                                Notificado / Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do notificado ou responsável"
                                className="w-full p-2 rounded-lg border border-purple-200 font-medium bg-white outline-purple-400"
                                value={formData.notificacaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "notificacaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-purple-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-purple-200 font-medium bg-white outline-purple-400"
                                value={formData.notificacaoDocumento}
                                onChange={(e) =>
                                  handleInput(
                                    "notificacaoDocumento",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Interdição */}
                      {formData.acoesFiscais.includes("Auto de Interdição") && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase">
                            <FileText size={14} /> Detalhes da Interdição
                          </label>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-green-700 uppercase ml-1">
                                Notificado / Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do notificado ou responsável"
                                className="w-full p-2 rounded-lg border border-green-200 font-medium bg-white outline-green-400"
                                value={formData.responsavelInterdição}
                                onChange={(e) =>
                                  handleInput(
                                    "responsavelInterdição",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-green-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-green-200 font-medium bg-white outline-green-400"
                                value={formData.cpfCnpjInterdição}
                                onChange={(e) =>
                                  handleInput(
                                    "cpfCnpjInterdição",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tipo de Atividade Carnavalesca */}
                      <div className="space-y-2">
                        <label className="text-[12px] font-black text-slate-400 uppercase">
                          Tipo de Atividade Carnavalesca
                        </label>
                        <select
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                          value={formData.tipoAtividadeCarnavalesca}
                          onChange={(e) =>
                            handleInput(
                              "tipoAtividadeCarnavalesca",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Selecionar:</option>
                          <option value="Show">Show</option>
                          <option value="Festa">Festa</option>
                        </select>
                      </div>

                      {/* If Show or Festa, show the activity details */}
                      {(formData.tipoAtividadeCarnavalesca === "Show" ||
                        formData.tipoAtividadeCarnavalesca === "Festa") && (
                        <>
                          {/* Situação */}
                          <div className="space-y-2">
                            <label className="text-[14px] font-black text-slate-600 uppercase">
                              Situação do Evento
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                "Com Licença",
                                "Sem Licença",
                                "Em desacordo com a Licença",
                              ].map((sit) => (
                                <button
                                  key={sit}
                                  onClick={() =>
                                    handleInput("situacaoEvento", sit)
                                  }
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${formData.situacaoEvento === sit ? "bg-blue-900 border-blue-900 text-white" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                                >
                                  {sit}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Ambulantes Toggle */}
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-2">
                                <Users size={18} className="text-slate-500" />
                                <span className="text-sm font-black text-slate-700 uppercase">
                                  Foram detectados ambulantes?
                                </span>
                              </div>
                              <div className="flex bg-slate-200 rounded-full p-1">
                                <button
                                  onClick={() =>
                                    handleInput("temAmbulantes", false)
                                  }
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${!formData.temAmbulantes ? "bg-white shadow" : "text-slate-500"}`}
                                >
                                  NÃO
                                </button>
                                <button
                                  onClick={() =>
                                    handleInput("temAmbulantes", true)
                                  }
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${formData.temAmbulantes ? "bg-blue-600 text-white shadow" : "text-slate-500"}`}
                                >
                                  SIM
                                </button>
                              </div>
                            </div>

                            {formData.temAmbulantes && (
                              <div className="space-y-4 animate-in slide-in-from-top-2">
                                {/* Grid de Detalhamento */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold uppercase text-slate-400 block text-center">
                                      Detectados
                                    </span>
                                    <input
                                      type="number"
                                      className="w-full p-2 text-center border rounded-lg font-bold"
                                      value={formData.ambulantes.detectados}
                                      onChange={(e) =>
                                        handleNestedInput(
                                          "ambulantes",
                                          "detectados",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold uppercase text-slate-400 block text-center">
                                      Se dispersaram
                                    </span>
                                    <input
                                      type="number"
                                      className="w-full p-2 text-center border rounded-lg font-bold"
                                      value={formData.ambulantes.dispersados}
                                      onChange={(e) =>
                                        handleNestedInput(
                                          "ambulantes",
                                          "dispersados",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {/* Ambulantes abordados (ação fiscal) */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                      <Package
                                        size={18}
                                        className="text-slate-500"
                                      />
                                      <span className="text-sm font-black text-slate-700 uppercase">
                                        Abordados (ação fiscal)
                                      </span>
                                    </div>
                                    <div className="flex bg-slate-200 rounded-full p-1">
                                      <button
                                        onClick={() =>
                                          handleNestedInput(
                                            "ambulantes",
                                            "temAutosApreensao",
                                            false,
                                          )
                                        }
                                        className={`px-4 py-1 rounded-full text-xs font-bold ${!formData.ambulantes.temAutosApreensao ? "bg-white shadow" : "text-slate-500"}`}
                                      >
                                        NÃO
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleNestedInput(
                                            "ambulantes",
                                            "temAutosApreensao",
                                            true,
                                          )
                                        }
                                        className={`px-4 py-1 rounded-full text-xs font-bold ${formData.ambulantes.temAutosApreensao ? "bg-blue-600 text-white shadow" : "text-slate-500"}`}
                                      >
                                        SIM
                                      </button>
                                    </div>
                                  </div>
                                  {formData.ambulantes.temAutosApreensao && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2">
                                      <div className="space-y-2">
                                        <span className="text-xs font-bold text-slate-700 uppercase">
                                          Situação dos Abordados:
                                        </span>

                                        {/* Com Licença */}
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                          <input
                                            type="checkbox"
                                            id="comLicenca2"
                                            checked={
                                              formData.ambulantes
                                                .abordadosSituacao
                                                .comLicenca !== null
                                            }
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    comLicenca: "0",
                                                  },
                                                );
                                              } else {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    comLicenca: null,
                                                  },
                                                );
                                              }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                          />
                                          <label
                                            htmlFor="comLicenca2"
                                            className="flex-1 text-xs font-bold text-slate-700"
                                          >
                                            Com Licença
                                          </label>
                                          {formData.ambulantes.abordadosSituacao
                                            .comLicenca !== null && (
                                            <input
                                              type="number"
                                              placeholder="Qtd"
                                              className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                              value={
                                                formData.ambulantes
                                                  .abordadosSituacao.comLicenca
                                              }
                                              onChange={(e) =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    comLicenca: e.target.value,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                          {formData.ambulantes.abordadosSituacao
                                            .comLicenca === null && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    comLicenca: "0",
                                                  },
                                                )
                                              }
                                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                            >
                                              + Adicionar
                                            </button>
                                          )}
                                        </div>

                                        {/* Sem Licença */}
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                          <input
                                            type="checkbox"
                                            id="semLicenca2"
                                            checked={
                                              formData.ambulantes
                                                .abordadosSituacao
                                                .semLicenca !== null
                                            }
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    semLicenca: "0",
                                                  },
                                                );
                                              } else {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    semLicenca: null,
                                                  },
                                                );
                                              }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                          />
                                          <label
                                            htmlFor="semLicenca2"
                                            className="flex-1 text-xs font-bold text-slate-700"
                                          >
                                            Sem Licença
                                          </label>
                                          {formData.ambulantes.abordadosSituacao
                                            .semLicenca !== null && (
                                            <input
                                              type="number"
                                              placeholder="Qtd"
                                              className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                              value={
                                                formData.ambulantes
                                                  .abordadosSituacao.semLicenca
                                              }
                                              onChange={(e) =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    semLicenca: e.target.value,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                          {formData.ambulantes.abordadosSituacao
                                            .semLicenca === null && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    semLicenca: "0",
                                                  },
                                                )
                                              }
                                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                            >
                                              + Adicionar
                                            </button>
                                          )}
                                        </div>

                                        {/* Em desacordo com a Licença */}
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                          <input
                                            type="checkbox"
                                            id="emDesacordo2"
                                            checked={
                                              formData.ambulantes
                                                .abordadosSituacao
                                                .emDesacordo !== null
                                            }
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    emDesacordo: "0",
                                                  },
                                                );
                                              } else {
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    emDesacordo: null,
                                                  },
                                                );
                                              }
                                            }}
                                            className="w-4 h-4 text-blue-600 rounded"
                                          />
                                          <label
                                            htmlFor="emDesacordo2"
                                            className="flex-1 text-xs font-bold text-slate-700"
                                          >
                                            Em desacordo com a Licença
                                          </label>
                                          {formData.ambulantes.abordadosSituacao
                                            .emDesacordo !== null && (
                                            <input
                                              type="number"
                                              placeholder="Qtd"
                                              className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                              value={
                                                formData.ambulantes
                                                  .abordadosSituacao.emDesacordo
                                              }
                                              onChange={(e) =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    emDesacordo: e.target.value,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                          {formData.ambulantes.abordadosSituacao
                                            .emDesacordo === null && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleNestedInput(
                                                  "ambulantes",
                                                  "abordadosSituacao",
                                                  {
                                                    ...formData.ambulantes
                                                      .abordadosSituacao,
                                                    emDesacordo: "0",
                                                  },
                                                )
                                              }
                                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                            >
                                              + Adicionar
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-3 mt-4">
                                        <span className="text-xs font-bold text-slate-700 uppercase">
                                          Ações Fiscais Realizadas (Ambulantes
                                          Abordados)
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 acoes-ambulantes-abordados">
                                          {[
                                            "Vistoria de Ambulante",
                                            "Auto de Apreensão (ambulante)",
                                            "Termo de Retenção de Volume (TRV)",
                                          ].map((acao) => (
                                            <button
                                              key={acao}
                                              onClick={() =>
                                                toggleArrayItem(
                                                  "acoesFiscais",
                                                  acao,
                                                )
                                              }
                                              className={`p-3 rounded-xl border text-xs font-black uppercase transition-all acoes-ambulantes-abordados-btn ${formData.acoesFiscais.includes(acao) ? "bg-blue-100 border-blue-500 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                            >
                                              {acao}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      {/* Vistoria de Ambulante*/}
                                      {formData.acoesFiscais.includes(
                                        "Vistoria de Ambulante",
                                      ) && (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in zoom-in-95 space-y-3 mt-2">
                                          <label className="flex items-center gap-2 text-xs font-black text-blue-800 uppercase">
                                            <NotebookIcon size={14} />{" "}
                                            Quantidade de Vistorias
                                          </label>
                                          <input
                                            type="number"
                                            placeholder="Quantidade"
                                            className="w-full p-2 rounded-lg border border-blue-200 font-medium bg-white outline-blue-400 text-xs"
                                            value={
                                              formData.ambulantes.vistoriaQtde
                                            }
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "vistoriaQtde",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                      )}

                                      {/* Auto de Apreensão - Campos Específicos */}
                                      {formData.acoesFiscais.includes(
                                        "Auto de Apreensão (ambulante)",
                                      ) && (
                                        <div className="space-y-2 pt-4 mt-4 border-t-2 border-blue-200">
                                          <h3 className="text-sm font-black text-blue-900 uppercase">
                                            📋 Auto de Apreensão
                                          </h3>
                                          <input
                                            type="number"
                                            placeholder="Quantos Autos aplicados?"
                                            className="w-full p-2 border rounded-lg text-xs"
                                            value={
                                              formData.ambulantes.autosQtde
                                            }
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "autosQtde",
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Quantidade total de bens apreendidos"
                                            className="w-full p-2 border rounded-lg text-xs"
                                            value={
                                              formData.ambulantes.autosBensQtde
                                            }
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "autosBensQtde",
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-slate-100">
                                            <h3 className="text-sm font-black text-blue-900 uppercase">
                                              Bens Apreendidos
                                            </h3>
                                            <div className="space-y-3">
                                              <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                                  Selecione o item:
                                                </label>
                                                <select
                                                  value={bemSelecionado}
                                                  onChange={(e) =>
                                                    setBemSelecionado(
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none"
                                                >
                                                  <option value="">
                                                    Selecione o item:
                                                  </option>
                                                  {BENS_APREENDIDOS.map(
                                                    (opcao) => (
                                                      <option
                                                        key={opcao}
                                                        value={opcao}
                                                      >
                                                        {opcao}
                                                      </option>
                                                    ),
                                                  )}
                                                </select>
                                              </div>
                                              <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                                  Quantidade:
                                                </label>
                                                <input
                                                  type="number"
                                                  value={quantidadeBem}
                                                  onChange={(e) =>
                                                    setQuantidadeBem(
                                                      parseInt(e.target.value),
                                                    )
                                                  }
                                                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-center"
                                                  min="1"
                                                />
                                              </div>
                                              <button
                                                onClick={adicionarBem}
                                                className="w-full bg-blue-900 text-white p-3 rounded-xl hover:bg-blue-800 font-bold"
                                              >
                                                Adicionar à Lista
                                              </button>
                                            </div>
                                            <div className="space-y-2">
                                              {bensApreendidos.map(
                                                (item, index) => (
                                                  <div
                                                    key={index}
                                                    className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100"
                                                  >
                                                    <span className="text-sm font-bold text-blue-900">
                                                      {item.quantidade}x{" "}
                                                      {item.nome}
                                                    </span>
                                                    <button
                                                      onClick={() =>
                                                        removerBem(index)
                                                      }
                                                      className="text-red-500 p-1"
                                                    >
                                                      <X size={18} />
                                                    </button>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* TRV - Campos Específicos */}
                                      {formData.acoesFiscais.includes(
                                        "Termo de Retenção de Volume (TRV)",
                                      ) && (
                                        <div className="space-y-2 pt-4 mt-4 border-t-2 border-red-200">
                                          <h3 className="text-sm font-black text-red-900 uppercase">
                                            📦 Termo de Retenção de Volume (TRV)
                                          </h3>
                                          <input
                                            type="number"
                                            placeholder="Quantos Termos aplicados?"
                                            className="w-full p-2 border rounded-lg text-xs"
                                            value={formData.ambulantes.trvQtde}
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "trvQtde",
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <input
                                            type="number"
                                            placeholder="Quantidade total de bens retidos"
                                            className="w-full p-2 border rounded-lg text-xs"
                                            value={
                                              formData.ambulantes.trvBensQtde
                                            }
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "trvBensQtde",
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-slate-100">
                                            <h3 className="text-sm font-black text-red-900 uppercase">
                                              Bens Retidos
                                            </h3>
                                            <div className="space-y-3">
                                              <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                                  Selecione o item:
                                                </label>
                                                <select
                                                  value={bemSelecionadoTRV}
                                                  onChange={(e) =>
                                                    setBemSelecionadoTRV(
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none"
                                                >
                                                  <option value="">
                                                    Selecione o item:
                                                  </option>
                                                  {BENS_APREENDIDOS.map(
                                                    (opcao) => (
                                                      <option
                                                        key={opcao}
                                                        value={opcao}
                                                      >
                                                        {opcao}
                                                      </option>
                                                    ),
                                                  )}
                                                </select>
                                              </div>
                                              <div>
                                                <label className="text-xs font-bold text-slate-700 block mb-1">
                                                  Quantidade:
                                                </label>
                                                <input
                                                  type="number"
                                                  value={quantidadeBemTRV}
                                                  onChange={(e) =>
                                                    setQuantidadeBemTRV(
                                                      parseInt(e.target.value),
                                                    )
                                                  }
                                                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-center"
                                                  min="1"
                                                />
                                              </div>
                                              <button
                                                onClick={adicionarBemTRV}
                                                className="w-full bg-red-900 text-white p-3 rounded-xl hover:bg-red-800 font-bold"
                                              >
                                                Adicionar à Lista
                                              </button>
                                            </div>
                                            <div className="space-y-2">
                                              {bensTRV.map((item, index) => (
                                                <div
                                                  key={index}
                                                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100"
                                                >
                                                  <span className="text-sm font-bold text-red-900">
                                                    {item.quantidade}x{" "}
                                                    {item.nome}
                                                  </span>
                                                  <button
                                                    onClick={() =>
                                                      removerBemTRV(index)
                                                    }
                                                    className="text-red-500 p-1"
                                                  >
                                                    <X size={18} />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <input
                                            type="text"
                                            placeholder="Descreva outros bens: (Se não encontrar na lista)"
                                            className="w-full p-2 border rounded-lg text-xs"
                                            value={
                                              formData.ambulantes
                                                .trvOutrosDescricao
                                            }
                                            onChange={(e) =>
                                              handleNestedInput(
                                                "ambulantes",
                                                "trvOutrosDescricao",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Situação */}
                      <div className="space-y-2">
                        <label className="text-[14px] font-black text-slate-600 uppercase">
                          Situação do Evento
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Com Licença",
                            "Sem Licença",
                            "Em desacordo com a Licença",
                          ].map((sit) => (
                            <button
                              key={sit}
                              onClick={() => handleInput("situacaoEvento", sit)}
                              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${formData.situacaoEvento === sit ? "bg-blue-900 border-blue-900 text-white" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                            >
                              {sit}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="space-y-2">
                        <label className="text-[14px] font-black text-slate-600 uppercase">
                          Ações Fiscais Realizadas
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Vistoria",
                            "Auto de Notificação",
                            "Auto de Infração",
                            "Auto de Interdição",
                            "Auto de Apreensão",
                          ].map((acao) => (
                            <button
                              key={acao}
                              onClick={() =>
                                toggleArrayItem("acoesFiscais", acao)
                              }
                              className={`p-3 rounded-xl border text-xs font-black uppercase transition-all ${formData.acoesFiscais.includes(acao) ? "bg-blue-100 border-blue-500 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                            >
                              {acao}
                            </button>
                          ))}
                        </div>
                        {/* Condicional: Vistorias */}
                        {formData.acoesFiscais.includes("Vistoria") && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in zoom-in-95 space-y-3 mt-2">
                            <label className="flex items-center gap-2 text-xs font-black text-blue-800 uppercase">
                              <NotebookIcon size={14} /> Quantidade de Vistorias
                            </label>
                            <input
                              type="number"
                              placeholder="Quantidade"
                              className="w-full p-2 rounded-lg border border-blue-200 font-medium bg-white outline-blue-400 text-xs"
                              value={formData.vistoriaQtde}
                              onChange={(e) =>
                                handleInput("vistoriaQtde", e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>

                      {/* Condicional: Multa */}
                      {formData.acoesFiscais.includes("Auto de Infração") && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-orange-800 uppercase">
                            <AlertTriangle size={14} /> Detalhes da Infração
                          </label>

                          <div className="space-y-3">
                            {/* Nome do Responsável */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                Responsável / Infrator
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do responsável ou infrator"
                                className="w-full p-2 rounded-lg border border-orange-200 font-medium bg-white outline-orange-400"
                                value={formData.infracaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "infracaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {/* CPF/CNPJ */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                  CPF / CNPJ
                                </span>
                                <input
                                  type="text"
                                  placeholder="CPF ou CNPJ"
                                  className="w-full p-2 rounded-lg border border-orange-200 font-medium bg-white outline-orange-400"
                                  value={formData.infracaoDocumento}
                                  onChange={(e) =>
                                    handleInput(
                                      "infracaoDocumento",
                                      formatarDocumento(e.target.value),
                                    )
                                  }
                                />
                              </div>

                              {/* Valor da Multa */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-700 uppercase ml-1">
                                  Valor (R$)
                                </span>
                                <input
                                  type="number"
                                  placeholder="0,00"
                                  className="w-full p-2 rounded-lg border border-orange-200 font-bold bg-white outline-orange-400"
                                  value={formData.valorMulta}
                                  onChange={(e) =>
                                    handleInput("valorMulta", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Notificação */}
                      {formData.acoesFiscais.includes(
                        "Auto de Notificação",
                      ) && (
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-purple-800 uppercase">
                            <FileText size={14} /> Detalhes da Notificação
                          </label>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-purple-700 uppercase ml-1">
                                Notificado / Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do notificado ou responsável"
                                className="w-full p-2 rounded-lg border border-purple-200 font-medium bg-white outline-purple-400"
                                value={formData.notificacaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "notificacaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-purple-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-purple-200 font-medium bg-white outline-purple-400"
                                value={formData.notificacaoDocumento}
                                onChange={(e) =>
                                  handleInput(
                                    "notificacaoDocumento",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Interdicao */}
                      {formData.acoesFiscais.includes("Auto de Interdição") && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-green-800 uppercase">
                            <FileText size={14} /> Detalhes da Interdição
                          </label>

                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-green-700 uppercase ml-1">
                                Notificado / Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do notificado ou responsável"
                                className="w-full p-2 rounded-lg border border-green-200 font-medium bg-white outline-green-400"
                                value={formData.responsavelInterdição}
                                onChange={(e) =>
                                  handleInput(
                                    "responsavelInterdição",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-green-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-green-200 font-medium bg-white outline-green-400"
                                value={formData.cpfCnpjInterdição}
                                onChange={(e) =>
                                  handleInput(
                                    "cpfCnpjInterdição",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Condicional: Auto de Apreensão */}
                      {formData.acoesFiscais.includes("Auto de Apreensão") && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 animate-in zoom-in-95 space-y-3 mt-2">
                          <label className="flex items-center gap-2 text-xs font-black text-red-800 uppercase">
                            <Package size={14} /> Detalhes da Apreensão
                          </label>

                          <div className="space-y-3">
                            {/* Responsável */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Responsável
                              </span>
                              <input
                                type="text"
                                placeholder="Nome do responsável"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoResponsavel}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoResponsavel",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* CPF/CNPJ */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                CPF / CNPJ
                              </span>
                              <input
                                type="text"
                                placeholder="CPF ou CNPJ"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoDocumento}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoDocumento",
                                    formatarDocumento(e.target.value),
                                  )
                                }
                              />
                            </div>

                            {/* Quantidade de Bens */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Quantidade de Bens Apreendidos
                              </span>
                              <input
                                type="number"
                                placeholder="Quantidade"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400"
                                value={formData.apreensaoQtdeBens}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoQtdeBens",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* Descrição dos Bens */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-red-700 uppercase ml-1">
                                Descrever o tipo de bens apreendidos
                              </span>
                              <textarea
                                placeholder="Descreva os bens apreendidos"
                                rows="3"
                                className="w-full p-2 rounded-lg border border-red-200 font-medium bg-white outline-red-400 resize-none"
                                value={formData.apreensaoDescricaoBens}
                                onChange={(e) =>
                                  handleInput(
                                    "apreensaoDescricaoBens",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SEÇÃO: AMBULANTES*/}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-slate-500" />
                            <span className="text-sm font-black text-slate-700 uppercase">
                              Foram detectados ambulantes?
                            </span>
                          </div>
                          <div className="flex bg-slate-200 rounded-full p-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleInput("temAmbulantes", false)
                              }
                              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${!formData.temAmbulantes ? "bg-white shadow" : "text-slate-500"}`}
                            >
                              NÃO
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInput("temAmbulantes", true)}
                              className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${formData.temAmbulantes ? "bg-blue-600 text-white shadow" : "text-slate-500"}`}
                            >
                              SIM
                            </button>
                          </div>
                        </div>

                        {formData.temAmbulantes && (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                              <span className="text-[14px] font-bold uppercase text-blue-600 block text-center">
                                Quantidade de ambulantes
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase text-slate-600 block text-center">
                                  Detectados
                                </span>
                                <input
                                  type="number"
                                  className="w-full p-2 text-center border rounded-lg font-bold"
                                  value={formData.ambulantes.detectados}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "detectados",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase text-slate-600 block text-center">
                                  Se dispersaram
                                </span>
                                <input
                                  type="number"
                                  className="w-full p-2 text-center border rounded-lg font-bold"
                                  value={formData.ambulantes.dispersados}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "dispersados",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Ambulantes abordados geral */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                  <Package
                                    size={18}
                                    className="text-slate-500"
                                  />
                                  <span className="text-sm font-black text-slate-700 uppercase">
                                    Abordados (ação fiscal)
                                  </span>
                                </div>
                                <div className="flex bg-slate-200 rounded-full p-1">
                                  <button
                                    onClick={() =>
                                      handleNestedInput(
                                        "ambulantes",
                                        "temAutosApreensao",
                                        false,
                                      )
                                    }
                                    className={`px-4 py-1 rounded-full text-xs font-bold ${!formData.ambulantes.temAutosApreensao ? "bg-white shadow" : "text-slate-500"}`}
                                  >
                                    NÃO
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleNestedInput(
                                        "ambulantes",
                                        "temAutosApreensao",
                                        true,
                                      )
                                    }
                                    className={`px-4 py-1 rounded-full text-xs font-bold ${formData.ambulantes.temAutosApreensao ? "bg-blue-600 text-white shadow" : "text-slate-500"}`}
                                  >
                                    SIM
                                  </button>
                                </div>
                              </div>
                              {formData.ambulantes.temAutosApreensao && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                  <div className="space-y-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase">
                                      Situação dos Abordados:
                                    </span>

                                    {/* Com Licença */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                      <input
                                        type="checkbox"
                                        id="comLicenca"
                                        checked={
                                          formData.ambulantes.abordadosSituacao
                                            .comLicenca !== null
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                comLicenca: "0",
                                              },
                                            );
                                          } else {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                comLicenca: null,
                                              },
                                            );
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      <label
                                        htmlFor="comLicenca"
                                        className="flex-1 text-xs font-bold text-slate-700"
                                      >
                                        Com Licença
                                      </label>
                                      {formData.ambulantes.abordadosSituacao
                                        .comLicenca !== null && (
                                        <input
                                          type="number"
                                          placeholder="Qtd"
                                          className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                          value={
                                            formData.ambulantes
                                              .abordadosSituacao.comLicenca
                                          }
                                          onChange={(e) =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                comLicenca: e.target.value,
                                              },
                                            )
                                          }
                                        />
                                      )}
                                      {formData.ambulantes.abordadosSituacao
                                        .comLicenca === null && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                comLicenca: "0",
                                              },
                                            )
                                          }
                                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                        >
                                          + Adicionar
                                        </button>
                                      )}
                                    </div>

                                    {/* Sem Licença */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                      <input
                                        type="checkbox"
                                        id="semLicenca"
                                        checked={
                                          formData.ambulantes.abordadosSituacao
                                            .semLicenca !== null
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                semLicenca: "0",
                                              },
                                            );
                                          } else {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                semLicenca: null,
                                              },
                                            );
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      <label
                                        htmlFor="semLicenca"
                                        className="flex-1 text-xs font-bold text-slate-700"
                                      >
                                        Sem Licença
                                      </label>
                                      {formData.ambulantes.abordadosSituacao
                                        .semLicenca !== null && (
                                        <input
                                          type="number"
                                          placeholder="Qtd"
                                          className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                          value={
                                            formData.ambulantes
                                              .abordadosSituacao.semLicenca
                                          }
                                          onChange={(e) =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                semLicenca: e.target.value,
                                              },
                                            )
                                          }
                                        />
                                      )}
                                      {formData.ambulantes.abordadosSituacao
                                        .semLicenca === null && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                semLicenca: "0",
                                              },
                                            )
                                          }
                                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                        >
                                          + Adicionar
                                        </button>
                                      )}
                                    </div>

                                    {/* Em desacordo com a Licença */}
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                                      <input
                                        type="checkbox"
                                        id="emDesacordo2"
                                        checked={
                                          formData.ambulantes.abordadosSituacao
                                            .emDesacordo !== null
                                        }
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                emDesacordo: "0",
                                              },
                                            );
                                          } else {
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                emDesacordo: null,
                                              },
                                            );
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 rounded"
                                      />
                                      <label
                                        htmlFor="emDesacordo2"
                                        className="flex-1 text-xs font-bold text-slate-700"
                                      >
                                        Em desacordo com a Licença
                                      </label>
                                      {formData.ambulantes.abordadosSituacao
                                        .emDesacordo !== null && (
                                        <input
                                          type="number"
                                          placeholder="Qtd"
                                          className="w-20 p-2 text-center border rounded-lg font-bold text-xs"
                                          value={
                                            formData.ambulantes
                                              .abordadosSituacao.emDesacordo
                                          }
                                          onChange={(e) =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                emDesacordo: e.target.value,
                                              },
                                            )
                                          }
                                        />
                                      )}
                                      {formData.ambulantes.abordadosSituacao
                                        .emDesacordo === null && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleNestedInput(
                                              "ambulantes",
                                              "abordadosSituacao",
                                              {
                                                ...formData.ambulantes
                                                  .abordadosSituacao,
                                                emDesacordo: "0",
                                              },
                                            )
                                          }
                                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
                                        >
                                          + Adicionar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-700 uppercase">
                                    Ações Fiscais Realizadas (Ambulantes
                                    Abordados):
                                  </span>

                                  <div className="grid grid-cols-2 gap-2 acoes-ambulantes-abordados">
                                    {[
                                      "Vistoria de Ambulante",
                                      "Auto de Apreensão (ambulante)",
                                      "Termo de Retenção de Volume (TRV)",
                                    ].map((acao) => (
                                      <button
                                        key={acao}
                                        onClick={() =>
                                          toggleArrayItem("acoesFiscais", acao)
                                        }
                                        className={`p-3 rounded-xl border text-xs font-black uppercase transition-all acoes-ambulantes-abordados-btn ${formData.acoesFiscais.includes(acao) ? "bg-blue-100 border-blue-500 text-blue-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                                      >
                                        {acao}
                                      </button>
                                    ))}
                                  </div>
                                  {/* Vistoria de Ambulante */}
                                  {formData.acoesFiscais.includes(
                                    "Vistoria de Ambulante",
                                  ) && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in zoom-in-95 space-y-3 mt-2">
                                      <label className="flex items-center gap-2 text-xs font-black text-blue-800 uppercase">
                                        <NotebookIcon size={14} /> Quantidade de
                                        Vistorias
                                      </label>
                                      <input
                                        type="number"
                                        placeholder="Quantidade"
                                        className="w-full p-2 rounded-lg border border-blue-200 font-medium bg-white outline-blue-400 text-xs"
                                        value={formData.ambulantes.vistoriaQtde}
                                        onChange={(e) =>
                                          handleNestedInput(
                                            "ambulantes",
                                            "vistoriaQtde",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Auto de Apreensão - Campos Específicos */}
                            {formData.acoesFiscais.includes(
                              "Auto de Apreensão (ambulante)",
                            ) && (
                              <div className="space-y-2 pt-4 mt-4 border-t-2 border-blue-200">
                                <h3 className="text-sm font-black text-blue-900 uppercase">
                                  📋 Auto de Apreensão
                                </h3>
                                <input
                                  type="number"
                                  placeholder="Quantos Autos aplicados?"
                                  className="w-full p-2 border rounded-lg text-xs"
                                  value={formData.ambulantes.autosQtde}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "autosQtde",
                                      e.target.value,
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Quantidade total de bens apreendidos"
                                  className="w-full p-2 border rounded-lg text-xs"
                                  value={formData.ambulantes.autosBensQtde}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "autosBensQtde",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-slate-100">
                                  <h3 className="text-sm font-black text-blue-900 uppercase">
                                    Bens Apreendidos
                                  </h3>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Selecione o item:
                                      </label>
                                      <select
                                        value={bemSelecionado}
                                        onChange={(e) =>
                                          setBemSelecionado(e.target.value)
                                        }
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none"
                                      >
                                        <option value="">
                                          Selecione o item:
                                        </option>
                                        {BENS_APREENDIDOS.map((opcao) => (
                                          <option key={opcao} value={opcao}>
                                            {opcao}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Quantidade:
                                      </label>
                                      <input
                                        type="number"
                                        value={quantidadeBem}
                                        onChange={(e) =>
                                          setQuantidadeBem(
                                            parseInt(e.target.value),
                                          )
                                        }
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-center"
                                        min="1"
                                      />
                                    </div>
                                    <button
                                      onClick={adicionarBem}
                                      className="w-full bg-blue-900 text-white p-3 rounded-xl hover:bg-blue-800 font-bold"
                                    >
                                      Adicionar à Lista
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {bensApreendidos.map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100"
                                      >
                                        <span className="text-sm font-bold text-blue-900">
                                          {item.quantidade}x {item.nome}
                                        </span>
                                        <button
                                          onClick={() => removerBem(index)}
                                          className="text-red-500 p-1"
                                        >
                                          <X size={18} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TRV Ambulantes */}
                            {formData.acoesFiscais.includes(
                              "Termo de Retenção de Volume (TRV)",
                            ) && (
                              <div className="space-y-2 pt-4 mt-4 border-t-2 border-red-200">
                                <h3 className="text-sm font-black text-red-900 uppercase">
                                  📦 Termo de Retenção de Volume (TRV)
                                </h3>
                                <input
                                  type="number"
                                  placeholder="Quantos Termos aplicados?"
                                  className="w-full p-2 border rounded-lg text-xs"
                                  value={formData.ambulantes.trvQtde}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "trvQtde",
                                      e.target.value,
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Quantidade total de bens retidos"
                                  className="w-full p-2 border rounded-lg text-xs"
                                  value={formData.ambulantes.trvBensQtde}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "trvBensQtde",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-slate-100">
                                  <h3 className="text-sm font-black text-red-900 uppercase">
                                    Bens Retidos
                                  </h3>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Selecione o item:
                                      </label>
                                      <select
                                        value={bemSelecionadoTRV}
                                        onChange={(e) =>
                                          setBemSelecionadoTRV(e.target.value)
                                        }
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none"
                                      >
                                        <option value="">
                                          Selecione o item:
                                        </option>
                                        {BENS_APREENDIDOS.map((opcao) => (
                                          <option key={opcao} value={opcao}>
                                            {opcao}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-slate-700 block mb-1">
                                        Quantidade:
                                      </label>
                                      <input
                                        type="number"
                                        value={quantidadeBemTRV}
                                        onChange={(e) =>
                                          setQuantidadeBemTRV(
                                            parseInt(e.target.value),
                                          )
                                        }
                                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-center"
                                        min="1"
                                      />
                                    </div>
                                    <button
                                      onClick={adicionarBemTRV}
                                      className="w-full bg-red-900 text-white p-3 rounded-xl hover:bg-red-800 font-bold"
                                    >
                                      Adicionar à Lista
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {bensTRV.map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100"
                                      >
                                        <span className="text-sm font-bold text-red-900">
                                          {item.quantidade}x {item.nome}
                                        </span>
                                        <button
                                          onClick={() => removerBemTRV(index)}
                                          className="text-red-500 p-1"
                                        >
                                          <X size={18} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Descreva outros bens: (Se não encontrar na lista)"
                                  className="w-full p-2 border rounded-lg text-xs"
                                  value={formData.ambulantes.trvOutrosDescricao}
                                  onChange={(e) =>
                                    handleNestedInput(
                                      "ambulantes",
                                      "trvOutrosDescricao",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ETAPA 4: RECURSOS EMPREGADOS E INFORMAÇÕES COMPLEMENTARES */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Truck className="text-blue-900" size={20} />
                    <h2 className="text-lg font-black text-blue-900 uppercase">
                      4. Recursos Empregados e Informações Complementares
                    </h2>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 text-center">
                      <span className="text-[12px] font-black uppercase text-slate-400">
                        Total de Apoios
                      </span>
                      <input
                        type="number"
                        className="w-full p-3 text-center border-2 border-slate-100 rounded-xl font-bold text-lg"
                        value={formData.recursos.apoio}
                        onChange={(e) =>
                          handleNestedInput("recursos", "apoio", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <span className="text-[12px] font-black uppercase text-slate-400">
                        Total de Motoristas
                      </span>
                      <input
                        type="number"
                        className="w-full p-3 text-center border-2 border-slate-100 rounded-xl font-bold text-lg"
                        value={formData.recursos.motoristas}
                        onChange={(e) =>
                          handleNestedInput(
                            "recursos",
                            "motoristas",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <span className="text-[12px] font-black uppercase text-slate-400">
                        Total de Veículos
                      </span>
                      <input
                        type="number"
                        className="w-full p-3 text-center border-2 border-slate-100 rounded-xl font-bold text-lg"
                        value={formData.recursos.veiculos}
                        onChange={(e) =>
                          handleNestedInput(
                            "recursos",
                            "veiculos",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Informações Complementares */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-black text-slate-600 uppercase mb-4">
                      Informações Complementares
                    </h3>

                    {/* Ocorrências Registradas */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-900"
                          checked={formData.ocorrenciasRegistrados}
                          onChange={(e) =>
                            handleInput(
                              "ocorrenciasRegistrados",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-sm font-bold text-slate-600">
                          Houve registro de ocorrências policiais?
                        </span>
                      </label>
                      {formData.ocorrenciasRegistrados && (
                        <textarea
                          placeholder="Descrever ocorrências:"
                          className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-300 focus:outline-none"
                          value={formData.ocorrenciasDescricao}
                          onChange={(e) =>
                            handleInput("ocorrenciasDescricao", e.target.value)
                          }
                          rows={3}
                        />
                      )}
                    </div>

                    {/* Outros Fatos Observados */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-900"
                          checked={formData.outrosFatosObservados}
                          onChange={(e) =>
                            handleInput(
                              "outrosFatosObservados",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-sm font-bold text-slate-600">
                          Algum outro fato observado relevante?
                        </span>
                      </label>
                      {formData.outrosFatosObservados && (
                        <textarea
                          placeholder="Descrever fatos observados..."
                          className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-300 focus:outline-none"
                          value={formData.outrosFatosDescricao}
                          onChange={(e) =>
                            handleInput("outrosFatosDescricao", e.target.value)
                          }
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 5: FOTOS E ANEXOS */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Camera className="text-blue-900" size={20} />
                    <h2 className="text-lg font-black text-blue-900 uppercase">
                      5. Fotos e Anexos
                    </h2>
                  </div>

                  {/* Fotos Gerais */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-600 uppercase">
                      Fotos Gerais
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={takePhoto}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      >
                        <Camera
                          size={32}
                          className="text-slate-400 group-hover:text-blue-600 mb-2"
                        />
                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-blue-600">
                          Tirar Foto
                        </span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      >
                        <Image
                          size={32}
                          className="text-slate-400 group-hover:text-blue-600 mb-2"
                        />
                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-blue-600">
                          Fotos da Galeria
                        </span>
                      </button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />

                    {formData.photos.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">
                          Fotos Tiradas ({formData.photos.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.photos.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    photos: prev.photos.filter(
                                      (_, i) => i !== index,
                                    ),
                                  }))
                                }
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fotos de Auto de Apreensão */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-black text-slate-600 uppercase">
                      Fotos - Auto de Apreensão
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fotos do Local, dos bens apreendidos e dos autos de
                      apreensão (obrigatório se houver apreensão de bens,
                      mercadorias, documentos e equipamentos)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={async () => {
                          try {
                            const image = await CapCamera.getPhoto({
                              quality: 60,
                              allowEditing: false,
                              resultType: CameraResultType.DataUrl,
                            });
                            setFormData((prev) => ({
                              ...prev,
                              fotosApreensoes: [
                                ...prev.fotosApreensoes,
                                image.dataUrl,
                              ],
                            }));
                          } catch (error) {
                            alert("Erro ao tirar foto: " + error.message);
                          }
                        }}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      >
                        <Camera
                          size={32}
                          className="text-slate-400 group-hover:text-blue-600 mb-2"
                        />
                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-blue-600">
                          Tirar Foto
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  fotosApreensoes: [
                                    ...prev.fotosApreensoes,
                                    ev.target.result,
                                  ],
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      >
                        <Image
                          size={32}
                          className="text-slate-400 group-hover:text-blue-600 mb-2"
                        />
                        <span className="text-xs font-black uppercase text-slate-500 group-hover:text-blue-600">
                          Fotos da Galeria
                        </span>
                      </button>
                    </div>

                    {formData.fotosApreensoes.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">
                          Fotos de Apreensão ({formData.fotosApreensoes.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {formData.fotosApreensoes.map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`Apreensão ${index + 1}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    fotosApreensoes:
                                      prev.fotosApreensoes.filter(
                                        (_, i) => i !== index,
                                      ),
                                  }))
                                }
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 6: CONFIRMAÇÃO */}
              {step === 6 && (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <CheckSquare size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase">
                      Confirmação
                    </h2>
                    <p className="text-sm text-slate-500 px-4">
                      Revise os dados antes de gerar o relatório final.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="time"
                        className="flex-1 p-2 bg-white border rounded-lg text-sm font-bold"
                        value={formData.terminoTurno}
                        onChange={(e) =>
                          handleInput("terminoTurno", e.target.value)
                        }
                      />
                      <span className="text-xs font-black uppercase text-slate-400">
                        Fim do Turno
                      </span>
                    </div>

                    <div className="pt-2 space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-900"
                          checked={formData.checklist.local}
                          onChange={(e) =>
                            handleNestedInput(
                              "checklist",
                              "local",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-xs font-bold text-slate-600">
                          Estou no local da fiscalização
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-900"
                          checked={formData.checklist.revisado}
                          onChange={(e) =>
                            handleNestedInput(
                              "checklist",
                              "revisado",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-xs font-bold text-slate-600">
                          As informações foram revisadas
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:border-blue-300">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-blue-900"
                          checked={formData.checklist.anexos}
                          onChange={(e) =>
                            handleNestedInput(
                              "checklist",
                              "anexos",
                              e.target.checked,
                            )
                          }
                        />
                        <span className="text-xs font-bold text-slate-600">
                          Anexei documentos e fotos (caso existam)
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={generatePDF}
                    disabled={
                      !formData.checklist.local ||
                      !formData.checklist.revisado ||
                      gpsStatus !== "success" ||
                      formData.terminoTurno === ""
                    }
                    className="w-full bg-blue-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    GERAR PDF DO RELATÓRIO
                  </button>
                </div>
              )}

              {/* ETAPA 7: RELATÓRIOS GERADOS */}
              {step === 7 && (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileText size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Relatórios Gerados
                    </h2>
                    <p className="text-sm text-slate-500">
                      {pdfList.length} arquivo{pdfList.length !== 1 ? "s" : ""}{" "}
                      encontrado{pdfList.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {pdfList.length > 0 ? (
                    <div className="space-y-3">
                      {pdfList.map((pdf, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {pdf.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {pdf.size
                                  ? `${(pdf.size / 1024).toFixed(1)} KB`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => sharePdf(pdf.name)}
                              className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Compartilhar"
                            >
                              <Share2 size={18} />
                            </button>
                            <button
                              onClick={() => deletePdf(pdf.name)}
                              className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Deletar"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg font-semibold">
                        Nenhum relatório gerado ainda
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Complete um formulário de fiscalização para gerar seu
                        primeiro relatório.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NAVEGAÇÃO */}
            <div className="bg-white p-4 border-t border-slate-100 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              {step > 1 && step !== 7 && (
                <button
                  onClick={() => {
                    setStep((s) => s - 1);
                  }}
                  className="flex-1 p-4 border-2 border-slate-200 rounded-xl font-black text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                >
                  <ChevronLeft size={16} /> Voltar
                </button>
              )}
              {step < 6 ? (
                <button
                  onClick={() => {
                    setStep((s) => s + 1);
                  }}
                  disabled={
                    (step === 1 && !isStep1Valid()) ||
                    (step === 2 && !isStep2Valid()) ||
                    (step === 3 && !isStep3Valid()) ||
                    (step === 4 && !isStep4Valid())
                  }
                  className={`flex-[2] bg-blue-900 text-white p-4 rounded-xl font-black shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 uppercase text-xs tracking-wider ${(step === 1 && !isStep1Valid()) || (step === 2 && !isStep2Valid()) || (step === 3 && !isStep3Valid()) || (step === 4 && !isStep4Valid()) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Próximo <ChevronRight size={16} />
                </button>
              ) : step === 7 ? (
                <button
                  onClick={() => {
                    setFormData(initialFormData);
                    setStep(1);
                  }}
                  className="flex-[2] bg-green-600 text-white p-4 rounded-xl font-black shadow-lg hover:bg-green-700 flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                >
                  Nova Fiscalização
                </button>
              ) : null}
            </div>
          </div>
        </main>

        {/* MODAL DE VISUALIZAÇÃO DE PDF */}
        {viewingPdf && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header do Modal */}
              <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <FileText size={24} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-lg">{viewingPdf}</h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setViewingPdf(null);
                    setViewingPdfUrl(null);
                  }}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Visualizador PDF */}
              <div className="flex-1 overflow-auto bg-gray-100 flex flex-col">
                {pdfLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Carregando PDF...</p>
                  </div>
                ) : viewingPdfUrl ? (
                  <div className="flex-1 flex items-center justify-center">
                    <object
                      data={viewingPdfUrl}
                      type="application/pdf"
                      width="100%"
                      height="100%"
                      style={{ minHeight: "400px" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Erro ao carregar PDF</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
