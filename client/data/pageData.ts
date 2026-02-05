import { Heart, MessageCircle, Users, Flame } from "lucide-react";

export const STATS = [
  {
    icon: Heart,
    title: "+20 hospitais 24h",
    description: "São Paulo e\nPorto Alegre",
  },
  {
    icon: Users,
    title: "+500 mil",
    description: "Atendimentos realizados",
  },
  {
    icon: MessageCircle,
    title: "Plano ativo em 1h",
    description: "Sem carência em consultas e vacinas",
  },
  {
    icon: Flame,
    title: "R$ 70 milhões",
    description: "Economizados pelos nossos clientes",
  },
];

export const PLANS = [
  {
    name: "Básico",
    priceMonthly: "4,90",
    priceAnnual: "1,00",
    description: "Essencial para manter a saúde em dia.",
    note: "",
    features: [
      {
        type: "structured",
        title: "Plano com coparticipação. Descontos na WeVets vs. particular:",
        items: [
          "63% OFF em consultas",
          "66% OFF em vacinas obrigatórias",
          "50% OFF em exames básicos",
          "62% OFF em check-up",
          "Hospitais 24h WeVets",
        ],
      },
    ],
    popular: false,
  },
  {
    name: "Conforto",
    priceMonthly: "24,95",
    priceAnnual: "499,00",
    description: "Mais exames, menos coparticipação: até 90% de economia*.",
    note: "",
    features: [
      "Exames laboratoriais",
      "Exames de imagem",
      "Hospitais 24h WeVets",
      "Rede Credenciada",
    ],
    popular: true,
  },
  {
    name: "Super",
    priceMonthly: "54,95",
    priceAnnual: "1099,00",
    description: "Da rotina à emergência: até 90% de economia*.",
    note: "",
    features: [
      "Especialistas",
      "Exames cardiológicos.",
      "Internação, anestesia e cirurgia.",
      "Hospitais 24h WeVets",
      "Rede Credenciada",
    ],
    popular: false,
  },
  {
    name: "Ultra",
    priceMonthly: "104,95",
    priceAnnual: "2099,00",
    description: "Do check-up à UTI: até 90% de economia*.",
    note: "",
    features: [
      "Fisioterapia e acupuntura.",
      "Tomografia e endoscopia.",
      "Único plano do mercado com UTI.",
      "Hospitais 24h WeVets",
      "Rede Credenciada",
    ],
    popular: false,
  },
];

export const COVERAGE_LINKS: { [key: number]: string } = {
  0: "https://wevets.sydle.one/api/1/main/landingPage/PlanConfig/getCoverageFile/684a2acceb5b413daff84553/basico_tabela%20(1).pdf",
  1: "https://wevets.sydle.one/api/1/main/landingPage/PlanConfig/getCoverageFile/684a2c0beb5b413daf005874/Cobertura%20de%20Procedimentos%20-%20Conforto%20(1).pdf",
  2: "https://wevets.sydle.one/api/1/main/landingPage/PlanConfig/getCoverageFile/684a2cb5eb5b413daf0214c1/Cobertura%20de%20Procedimentos%20-%20Super%20(1).pdf",
  3: "https://wevets.sydle.one/api/1/main/landingPage/PlanConfig/getCoverageFile/68ba28dea405457534858487/Cobertura%20de%20Procedimentos%20-%20Ultra%20(2).pdf",
};

export const TESTIMONIALS = [
  {
    stars: 5,
    type: "Febre",
    text: '"Eu adoro a WeVets da Sena Madureira. Sou muito grata à Dra Vitória, à Dra Juliana e a Dra Rebeca. Indico muito o atendimento, carinho e competência delas."',
    paid: "R$ 30,00",
    savings: "R$ 140,00",
    author: "Maria Silva",
    role: "",
    image:
      "https://wevets.sydle.one/api/1/main/landingPage/ClientFeedback/getFeedbackImageLink/67d9ba14e32aa40170559fe7/depo-sandra%20(1).webp",
  },
  {
    stars: 5,
    type: "Emergência",
    text: '"Atendimento impecável para minha filhota! Desde a entrada até a saída, todas as condutas médicas foram tomadas e recebemos o carinho de toda equipe. Obrigada WeVets Washington Luís, Lola Maria está ótima se recuperando em casa 💖"',
    paid: "R$ 30,00",
    savings: "R$ 140,00",
    author: "Thay Araújo",
    role: "",
    image:
      "https://wevets.sydle.one/api/1/main/landingPage/ClientFeedback/getFeedbackImageLink/67d9bb69989fea6ed7d435eb/depo-thay%20(1).webp",
  },
  {
    stars: 5,
    type: "Check-ups",
    text: '"Excelente hospital! Tudo bem organizado e limpo. Equipe atenciosa e acolhedora!"',
    paid: "R$ 30,00",
    savings: "R$ 140,00",
    author: "Nicolas Santos",
    role: "",
    image:
      "https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2Ff98880e2b2b547c6bb7369b327110e29?format=webp",
  },
  {
    stars: 5,
    type: "Cirurgia",
    text: '"Uma unidade excelente!! Meus animais foram super bem tratados e com certeza trarei eles de volta."',
    paid: "R$ 50,00",
    savings: "R$ 250,00",
    author: "Luiza Gurgel",
    role: "",
    image:
      "https://wevets.sydle.one/api/1/main/landingPage/ClientFeedback/getFeedbackImageLink/67d9bb22e32aa401705ff37e/depo-luiza%20(1).webp",
  },
  {
    stars: 5,
    type: "Internação",
    text: '"Minha cachorrinha Nina foi muito bem atendida. Ambiente maravilhoso, veterinários super competentes. Um ambiente e profissionais que inspiram confiança."',
    paid: "R$ 40,00",
    savings: "R$ 180,00",
    author: "Maria Alice Gonçalves",
    role: "",
    image:
      "https://wevets.sydle.one/api/1/main/landingPage/ClientFeedback/getFeedbackImageLink/67d9bbbce32aa40170673fd8/depo-maria%20(1).webp",
  },
  {
    stars: 5,
    type: "Consulta",
    text: '"Atendimento excelente, desde a recepção. A Sabrina, responsável pela abertura das fichas durante a madrugada, foi super prestativa e ágil na solução dos questionamentos."',
    paid: "R$ 25,00",
    savings: "R$ 120,00",
    author: "Raphaell Marden",
    role: "",
    image:
      "https://lh3.googleusercontent.com/a-/ALV-UjX3A5g9J2_uuOFPMHQIAqRsh9v65VV5fKxWyZAgLHTfGOjoepgeVg=s36-c-rp-mo-br100",
  },
];
