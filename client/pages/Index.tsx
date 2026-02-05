import { useState, useRef, useEffect, Suspense, lazy } from "react";
import {
  ChevronDown,
  Menu,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { STATS, PLANS, COVERAGE_LINKS, TESTIMONIALS } from "../data/pageData";
import { analyticsEvents } from "../utils/analyticsEvents";
import { addDeviceIdToUrl } from "../hooks/useAmplitude";
const Footer = lazy(() => import("../components/Footer"));

export default function Index() {
  // Map imported constants to local variable names for compatibility
  const stats = STATS;
  const plans = PLANS;
  const testimonials = TESTIMONIALS;

  const [billingPeriod, setBillingPeriod] = useState<"mensal" | "anual">(
    "mensal",
  );
  const [faqCategory, setFaqCategory] = useState("contratacao");
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const handleBillingPeriodChange = (period: "mensal" | "anual") => {
    setBillingPeriod(period);
  };

  const handleWhatsappClick = (type: "mobile" | "desktop") => {
    const eventName =
      type === "mobile" ? "whatsapp_click_mobile" : "whatsapp_click_desktop";

    // Push event to GTM dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        timestamp: new Date().toISOString(),
      });
    }

    // Also send to GA4 if available
    if (typeof gtag !== "undefined") {
      gtag("event", `whatsapp_click_${type}`, {
        event_category: "engagement",
        event_label: `whatsapp_${type}`,
      });
    }

    // Open WhatsApp after a brief delay to ensure event is tracked
    setTimeout(() => {
      window.open(
        "https://api.whatsapp.com/send?phone=551133360600&text=Olá%2C%20gostaria%20de%20conhecer%20os%20planos%20de%20saúde%20Pet%20da%20WeVets",
        "_blank",
      );
    }, 200);
  };

  const getCoverageLink = (index: number): string =>
    COVERAGE_LINKS[index] || "";

  const faqs = [
    {
      category: "contratacao",
      question: "Como faço para me tornar membro do Plano?",
      answer:
        "O processo para ser tornar um membro do Plano WeVets é bem simples. Acima trazemos um quadro detalhado com as quatro opções disponíveis, basta aderir a uma das opções e seguir com o fluxo de preenchimento de dados do seu pet. imediatamente poderá desfrutar de todos os benefícios do nosso plano.",
    },
    {
      category: "contratacao",
      question: "Há variação de preços de cada Plano, conforme idade do pet?",
      answer:
        "Não há qualquer limitação para doença pré-existente, idade ou complicações médicas. Todos os pets merecem um tratamento igual!",
    },
    {
      category: "contratacao",
      question: "O valor das mensalidades possui reajuste anual?",
      answer:
        "Não tem surpresas na cobrança! 🙂 As parcelas sofrerão somente a correção do IPCA, calculadas anualmente.",
    },
    {
      category: "contratacao",
      question: "Preciso ter um plano de saúde para aderir ao Plano WeVets?",
      answer:
        "Nosso maior objetivo, é proporcional acolhimento e serviços de qualidade a todos sem qualquer restrição, não é necessário ter qualquer plano de saúde para se tornar um membro do nosso plano.",
    },
    {
      category: "coberturas",
      question: "Como tenho acesso às coberturas do Plano??",
      answer:
        "Deixamos todas informações sobre as coberturas dos planos nos links Tabelas e coparticipações,  nos quadros comparativos de coberturas por planos, acima.",
    },
    {
      category: "carencias",
      question: "Há algum limite de uso para os benefícios inclusos?",
      answer:
        "Na WeVets, você pode usar o plano sempre que o seu pet precisar. As coberturas e condições de cada procedimento podem variar conforme o plano escolhido, por isso é importante consultar a tabela de coberturas para conhecer todos os detalhes.",
    },
    {
      category: "pagamentos",
      question: "Quais as formas de pagamento?",
      answer:
        "O pagamento da mensalidade é realizado mensalmente por cobrança recorrente, através de cartão de crédito, sem ocupar o limite de crédito do cartão.",
    },
    {
      category: "gestao",
      question: "Como eu posso trocar de plano?",
      answer:
        "Nossa equipe lhe atenderá com o maior cuidado possível nessa migração, entre em contato pelos nossos canais de atendimento que entraremos em contato imediatamente e realizaremos a migração para você.",
    },
    {
      category: "gestao",
      question: "Como renovo minha assinatura?",
      answer:
        "Não se preocupe, a renovação é automática. Os lançamentos ocorrerão no cartão de crédito cadastrado",
    },
    {
      category: "uso",
      question: "Como funcionam as Vacinas?",
      answer:
        "Conforme orientação e protocolo do médico veterinário, o cliente poderá marcar todas as principais vacinas (“Vacinas Obrigatórias”) conforme disponibilidade e agendamento em nossas unidades próprias.",
    },
    {
      category: "uso",
      question: "Contratei agora, consigo utilizar imediatamente?",
      answer:
        "Fique atento aos procedimentos e coberturas com uso imediato ou prazo para liberação. Deixamos todas informações de forma transparente e clara para todos. Para os serviços de Uso Imediato, basta dirigir-se à uma das unidades atendidas ou efetuar o agendamento online através do nosso site",
    },
    {
      category: "uso",
      question: "Há exigência de microchipagem para contratar?",
      answer:
        "Não há exigência alguma. Caso o pet já tenha sido microchipado anteriormente, também poderá seguir com a contratação, sem dificuldades.",
    },
    {
      category: "uso",
      question:
        "Somente o titular pode levar para a consulta ou pode ser outra pessoa?",
      answer:
        "Qualquer pessoa próxima ou familiar poderá levar o pet, desde que, forneça corretamente os dados (Nome e CPF) do titular do plano, bem como, todas informações de cadastro necessárias.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => faq.category === faqCategory);

  const floatingButtonRef = useRef<HTMLDivElement>(null);
  const beneficiosRef = useRef<HTMLElement>(null);
  const planosRef = useRef<HTMLElement>(null);
  const comparePlanosRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const promoRef = useRef<HTMLElement>(null);
  const sectionVisibilityRef = useRef({
    hero: false,
    promo: false,
    planos: false,
    beneficios: false,
  });

  useEffect(() => {
    // Track Facebook Pixel ViewContent event
    if (typeof fbq !== "undefined") {
      fbq("track", "ViewContent", {
        content_name: "Plano de Saúde Pet - WeVets",
        content_category: "pet_health_plan",
        value: 0,
        currency: "BRL",
      });
    }
  }, []);

  useEffect(() => {
    // Add canonical link tag for SEO
    const canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    canonicalLink.href = "https://wevets.com.br/plano-de-saude-pet/";
    document.head.appendChild(canonicalLink);

    // Cleanup: remove the canonical link when component unmounts
    return () => {
      document.head.removeChild(canonicalLink);
    };
  }, []);

  useEffect(() => {
    // Detect when to show/hide floating button based on visible sections
    // Hide when hero, promo, or planos sections are visible
    // Show when benefits section is visible
    let updateTimeout: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === heroRef.current) {
            sectionVisibilityRef.current.hero = entry.isIntersecting;
          } else if (entry.target === promoRef.current) {
            sectionVisibilityRef.current.promo = entry.isIntersecting;
          } else if (entry.target === planosRef.current) {
            sectionVisibilityRef.current.planos = entry.isIntersecting;
          } else if (entry.target === beneficiosRef.current) {
            sectionVisibilityRef.current.beneficios = entry.isIntersecting;
          }
        });

        // Defer state update with requestIdleCallback or setTimeout to reduce TBT
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          const { hero, promo, planos, beneficios } =
            sectionVisibilityRef.current;
          if (beneficios) {
            setShowFloatingButton(true);
          } else if (hero || promo || planos) {
            setShowFloatingButton(false);
          } else {
            setShowFloatingButton(true);
          }
        }, 0);
      },
      { threshold: 0.1 },
    );

    const refs = [heroRef, promoRef, planosRef, beneficiosRef];
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      clearTimeout(updateTimeout);
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  useEffect(() => {
    let lastViewportHeight = window.innerHeight;
    let scrollTimeout: NodeJS.Timeout;

    const adjustButtonPosition = () => {
      if (!floatingButtonRef.current) return;

      const currentViewportHeight = window.innerHeight;
      const viewportShrank = currentViewportHeight < lastViewportHeight;

      if (viewportShrank) {
        // Barra dinâmica apareceu na base - coloca bem acima dela
        floatingButtonRef.current.style.bottom = "20px";
      } else {
        // Barra não está visível ou está no topo - mantém espaço menor
        floatingButtonRef.current.style.bottom = "20px";
      }

      lastViewportHeight = currentViewportHeight;
    };

    window.addEventListener("resize", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(adjustButtonPosition, 100);
    });

    return () => {
      window.removeEventListener("resize", adjustButtonPosition);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const currentTouchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - currentTouchEndX;
    const minSwipeDistance = 50; // Minimum distance to trigger swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left, move to next
        setCarouselIndex(Math.min(testimonials.length - 1, carouselIndex + 1));
      } else {
        // Swiped right, move to previous
        setCarouselIndex(Math.max(0, carouselIndex - 1));
      }
    }
    setTouchEndX(currentTouchEndX);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header - Mobile */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              id="btn-mobile-menu"
              onClick={() => {
                analyticsEvents.clickMobileMenu();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 hover:bg-gray-50 rounded-lg"
            >
              <Menu className="w-6 h-6 text-wevets-blue" />
            </button>
            <a href="https://www.wevets.com.br/plano-de-saude-pet">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/86068ea9878ee9e346313bd89de138a771160562?width=200"
                alt="WeVets Logo"
                className="h-8"
                fetchpriority="high"
              />
            </a>
          </div>
          <a
            id="btn-tutor-area"
            href="https://portal-wevets.sydle.com/"
            onClick={() => analyticsEvents.clickMenuAreaTutor()}
            className="bg-wevets-cyan text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all inline-block cursor-pointer"
            style={{ pointerEvents: "auto" }}
          >
            Área do Tutor
          </a>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Overlay Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-30"
            style={{ top: "60px" }}
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Menu */}
          <div className="md:hidden fixed left-0 right-0 top-[60px] z-40 bg-white shadow-md">
            <nav className="flex flex-col px-6 py-4 gap-4">
              <a
                href="#inicio"
                onClick={() => {
                  analyticsEvents.clickMenuInicio();
                  setMobileMenuOpen(false);
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Início
              </a>
              <a
                href="#planos"
                onClick={() => {
                  analyticsEvents.clickMenuPlanos();
                  setMobileMenuOpen(false);
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Planos
              </a>
              <a
                href="#beneficios"
                onClick={() => {
                  analyticsEvents.clickMenuBeneficio();
                  setMobileMenuOpen(false);
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Benefícios
              </a>
              <a
                href="#compare-planos"
                onClick={() => {
                  analyticsEvents.clickMenuComparePlanos();
                  setMobileMenuOpen(false);
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Compare os planos
              </a>
              <a
                href="https://planowevets.com.br/units"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  analyticsEvents.clickMenuRedeCredenciada();
                  setMobileMenuOpen(false);
                  const urlWithDeviceId = addDeviceIdToUrl(
                    "https://planowevets.com.br/units",
                  );
                  window.open(urlWithDeviceId, "_blank");
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Rede Credenciada
              </a>
              <a
                href="#duvidas-frequentes"
                onClick={() => {
                  analyticsEvents.clickMenuDuvidas();
                  setMobileMenuOpen(false);
                }}
                className="text-wevets-blue font-bold text-base hover:text-wevets-cyan transition-colors"
              >
                Dúvidas frequentes
              </a>
            </nav>
          </div>
        </>
      )}

      {/* Header - Desktop */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white border-b border-[#E6E6E6]">
        <div className="flex justify-between items-center w-full h-[97px] px-6 max-w-[1440px] mx-auto">
          {/* Logo */}
          <a href="https://www.wevets.com.br/plano-de-saude-pet">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/43c06e9ea090c4d9e59b90fdb006f9272f78962f?width=300"
              alt="WeVets Logo"
              className="w-[150px] h-[47px] flex-shrink-0"
              fetchpriority="high"
            />
          </a>

          {/* Navigation */}
          <nav className="flex justify-center items-center gap-0 flex-1">
            <a
              id="btn-nav-inicio"
              href="#inicio"
              onClick={() => analyticsEvents.clickMenuInicio()}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Início
            </a>
            <a
              id="btn-nav-planos"
              href="#planos"
              onClick={() => analyticsEvents.clickMenuPlanos()}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Planos
            </a>
            <a
              id="btn-nav-beneficios"
              href="#beneficios"
              onClick={() => analyticsEvents.clickMenuBeneficio()}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Benefícios
            </a>
            <a
              id="btn-nav-comparar-planos"
              href="#compare-planos"
              onClick={() => analyticsEvents.clickMenuComparePlanos()}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Compare os planos
            </a>
            <a
              id="btn-nav-rede-credenciada"
              href="https://planowevets.com.br/units"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                analyticsEvents.clickMenuRedeCredenciada();
                const urlWithDeviceId = addDeviceIdToUrl(
                  "https://planowevets.com.br/units",
                );
                window.open(urlWithDeviceId, "_blank");
              }}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Rede Credenciada
            </a>
            <a
              id="btn-nav-duvidas-frequentes"
              href="#duvidas-frequentes"
              onClick={() => analyticsEvents.clickMenuDuvidas()}
              className="flex justify-center items-center px-6 text-wevets-blue text-center font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Dúvidas frequentes
            </a>
          </nav>

          {/* CTA Button */}
          <a
            id="btn-tutor-area"
            href="https://portal-wevets.sydle.com/"
            onClick={() => analyticsEvents.clickMenuAreaTutor()}
            className="bg-wevets-cyan text-white px-6 py-2 rounded-[10px] font-medium hover:bg-opacity-90 transition-all flex-shrink-0 inline-block"
            style={{
              fontFamily: "Peridot PE Variable, sans-serif",
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            Área do Tutor
          </a>
        </div>
      </header>

      {/* New Hero Section - Mobile Only */}
      <section id="inicio" className="md:hidden flex flex-col bg-[#FBF7EF]">
        <div className="px-4 py-8 flex flex-col items-center gap-4 max-w-[345px] mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center justify-center px-3 py-1 border rounded-lg hero-badge">
            <span
              className="text-center font-bold uppercase tracking-wider hero-badge-text"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "16px",
                lineHeight: "18px",
                letterSpacing: "1px",
              }}
            >
              PLANO DE SAÚDE PET
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center gap-2 w-full">
            <h1
              className="text-wevets-blue text-center font-bold w-full"
              style={{
                fontFamily: "Fields, sans-serif",
                fontSize: "36px",
                lineHeight: "130%",
                letterSpacing: "0.5px",
              }}
            >
              <span data-teams="true" className="hero-title-first">
                O amor pelo
              </span>
              <br />
              <span className="hero-title-second">seu pet é 24h</span>
            </h1>
            <p
              className="text-wevets-blue/70 text-center w-full"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "21px",
                lineHeight: "22px",
                letterSpacing: "0.5px",
              }}
            >
              <span className="hero-subtitle-line" style={{ color: "#055391" }}>
                O <strong>cuidado com a saúde</strong>
              </span>
              <br />
              <span className="hero-subtitle-line" style={{ color: "#055391" }}>
                também deve ser
              </span>
            </p>
          </div>

          {/* CTA Button */}
          <button
            id="btn-hero-contratar-mobile"
            onClick={() => {
              analyticsEvents.clickBannerContratar();
              window.location.hash = "#planos";
            }}
            className="rounded-[10px] hover:bg-opacity-90 transition-all inline-block"
            style={{
              width: "270px",
              height: "50px",
              fontFamily: "Peridot PE Variable, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "24px",
              cursor: "pointer",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              backgroundColor: "#73c8ff",
              color: "#06295b",
            }}
          >
            Contratar plano
          </button>
        </div>

        {/* Hero Image - Full Width */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2F8782c885efa144c888a7da038ae559b6?format=webp"
          alt="Pet care com vacina doada"
          className="w-screen md:opacity-70 rounded-b-3xl"
          width="640"
          height="411"
          style={{ height: "auto", display: "block", marginTop: "-33px" }}
          fetchpriority="high"
        />
      </section>

      {/* Hero Section */}
      <section id="inicio" ref={heroRef} className="relative overflow-hidden">
        {/* Mobile Hero */}
        <div className="md:hidden relative">
          <div className="absolute inset-0 opacity-70">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2F32be3ae15ad44e1e8b59ef98c1a3001d?format=webp&width=800&height=1200"
              alt="Clinic background"
              className="w-full h-full object-cover"
              fetchpriority="high"
            />
          </div>
        </div>

        {/* Desktop Hero - Text overlay on background image */}
        <div
          className="hidden md:block md:relative md:w-screen md:overflow-hidden"
          style={{
            backgroundColor: "#fbf7ef",
            height: "636px",
            backgroundImage:
              "url(https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2Fed88029a87dc48d7bcd69c24d114125d?format=webp&width=1600&height=2400)",
            backgroundSize: "auto 100%",
            backgroundPosition: "85% center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Content Overlay */}
          <div
            className="absolute inset-0 flex items-center"
            style={{
              display: heroBannerVariant === "treatment_100off" ? "none" : "flex",
            }}
          >
            <div
              className="flex flex-col items-start gap-8"
              style={{
                padding: "100px 0 100px 144px",
                maxWidth: "600px",
              }}
            >
              <div className="flex flex-col items-start gap-6">
                <div
                  className="inline-flex justify-center items-center gap-2.5 px-3 py-1.5 rounded-lg"
                  style={{
                    border: "1px solid #ff6bc0",
                  }}
                >
                  <span
                    className="text-center font-bold uppercase"
                    style={{
                      fontFamily: "Peridot PE Variable, sans-serif",
                      fontSize: "18px",
                      lineHeight: "18px",
                      letterSpacing: "1px",
                      color: "#ff6bc0",
                    }}
                  >
                    PLANO DE SAÚDE PET
                  </span>
                </div>
                <h1
                  className="font-bold"
                  style={{
                    fontFamily: "Fields, sans-serif",
                    fontSize: "62px",
                    lineHeight: "78px",
                    letterSpacing: "0.5px",
                    color: "#055391",
                  }}
                >
                  <span data-teams="true">O amor por</span>
                  <br />
                  seu pet é 24h
                </h1>
              </div>
              <p
                style={{
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "31px",
                  lineHeight: "120%",
                  letterSpacing: "0.5px",
                  opacity: 0.7,
                  color: "#055391",
                }}
              >
                <span>
                  <strong>O cuidado com a saúde</strong>
                </span>
                <br />
                <span>também deve ser</span>
              </p>
              <button
                id="btn-hero-contratar-desktop"
                onClick={() => {
                  analyticsEvents.clickBannerContratar();
                  window.location.hash = "#planos";
                }}
                className="rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center inline-flex"
                style={{
                  width: "345px",
                  height: "60px",
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  lineHeight: "24px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#73c8ff",
                  color: "#06295b",
                }}
              >
                Contratar plano
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Section Header */}
      <section style={{ padding: "16px 24px 12px", marginBottom: "-20px" }}>
        <div
          style={{ maxWidth: "100%", margin: "0 auto" }}
          className="text-center"
        >
          <div className="promo-title">
            <p>
              Contrate o melhor plano de saúde para seu pet com condições
              imperdíveis:
            </p>
          </div>
        </div>
      </section>

      {/* Banner Section - Split Content */}
      <section ref={promoRef} className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 md:gap-4 md:min-h-auto">
          {/* Left Side */}
          <div
            className="flex-1 px-6 py-3 md:py-6 flex flex-col justify-center items-center text-center md:min-h-auto rounded-2xl"
            style={{
              backgroundColor: "rgba(5, 83, 145, 1)",
            }}
          >
            <h3
              className="text-white font-bold mb-2"
              style={{
                fontFamily: "Fields, sans-serif",
                fontSize: "clamp(18px, 5vw, 24px)",
                lineHeight: "120%",
              }}
            >
              1 ano de cuidado por R$ 1
            </h3>
            <p
              className="text-white/80 font-semibold"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            >
              Até 65% OFF em check-up: consultas, vacinas, exames básicos e
              hospitais 24h.
            </p>
          </div>

          {/* Right Side */}
          <div
            className="flex-1 px-6 py-3 md:py-6 flex flex-col justify-center items-center text-center md:min-h-auto rounded-2xl"
            style={{
              backgroundColor: "rgba(5, 83, 145, 1)",
            }}
          >
            <h3
              className="text-white font-bold mb-2"
              style={{
                fontFamily: "Fields, sans-serif",
                fontSize: "clamp(18px, 5vw, 24px)",
                lineHeight: "120%",
              }}
            >
              50% OFF por 4 meses
            </h3>
            <p
              className="text-white/80"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
              }}
            >
              Escolha planos com cuidado completo, do check-up à UTI: plano
              ativo em 1h.
            </p>
            <div
              className="text-wevets-blue mt-3 font-semibold bg-white px-4 py-2 rounded-lg inline-block"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "13px",
                letterSpacing: "0.5px",
              }}
            >
              <span style={{ color: "rgba(255, 107, 192, 1)" }}>
                Cupom:{"\u00A0"}
              </span>
              <span
                data-teams="true"
                style={{ color: "rgba(255, 107, 192, 1)" }}
              >
                CUIDAR50
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Regulations Link */}
      <div
        style={{
          display: "flex",
          fontWeight: "400",
          justifyContent: "center",
          margin: "-10px 0",
          padding: "8px 24px",
        }}
      >
        <a
          id="btn-regulamento-promocao"
          href="https://wevets.sydle.one/api/1/main/_ecm/_defaultFile/www/Regulamento%20Cuidado%20que%20Multiplica%201.pdf/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analyticsEvents.clickConsulteRegulamento()}
          style={{
            display: "block",
            color: "rgb(11, 191, 198)",
            textDecoration: "underline solid rgb(11, 191, 198)",
            transitionDuration: "0.15s",
            transitionProperty:
              "color, background-color, border-color, text-decoration-color, fill, stroke",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            fontFamily: '"Peridot PE Variable", sans-serif',
            fontSize: "14px",
            fontWeight: "600",
            lineHeight: "21px",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          Consulte o regulamento da promoção
        </a>
      </div>

      {/* Stats Section */}
      <section
        id="beneficios"
        ref={beneficiosRef}
        className="px-6 py-12 md:px-0 max-w-7xl mx-auto"
      >
        <style>{`
          @media (min-width: 768px) {
            .stat-title {
              font-family: "Fields, sans-serif" !important;
              font-size: 24px !important;
              letter-spacing: 0.6px;
              margin-bottom: 0 !important;
            }
            .stat-desc {
              font-size: 20px !important;
              line-height: 140% !important;
            }
          }
        `}</style>
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 md:max-w-7xl md:mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center md:items-start gap-3 md:gap-6 p-6 border border-wevets-cyan/20 rounded-xl md:rounded-2xl hover:border-wevets-cyan/40 md:hover:border-wevets-cyan/20 transition-all"
              >
                <Icon
                  className="w-6 md:w-10 h-6 md:h-10 text-wevets-cyan"
                  strokeWidth={1.5}
                />
                <div className="text-center md:text-left md:flex md:flex-col md:items-start md:gap-1 md:w-full md:flex-1">
                  <h3
                    className="stat-title text-wevets-blue font-bold text-sm md:font-extrabold mb-1 tracking-wide w-full"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      lineHeight: "normal",
                    }}
                  >
                    {stat.title}
                  </h3>
                  <p
                    className="stat-desc text-wevets-blue text-sm leading-snug whitespace-pre-line md:w-full"
                    style={{
                      fontFamily: "Peridot PE Variable, sans-serif",
                      fontSize: "14px",
                      lineHeight: "1.2",
                    }}
                  >
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" ref={planosRef} className="px-6 py-12 bg-[#F5F1E8]">
        <div className="max-w-md md:max-w-7xl mx-auto">
          <h2
            className="text-3xl md:text-[32px] font-bold text-wevets-blue text-center mb-4 md:mb-4"
            style={{
              fontFamily: "Fields, sans-serif",
              letterSpacing: "-1.2px",
              lineHeight: "120%",
            }}
          >
            Encontre o plano ideal para o seu pet
          </h2>

          {/* Billing Toggle */}
          <div
            className="flex justify-center mb-8 sticky-mobile"
            style={{
              backgroundColor: "#F5F1E8",
              paddingTop: "8px",
              paddingBottom: "8px",
              zIndex: "10",
            }}
          >
            <div
              className="inline-flex items-center rounded-full border p-1"
              style={{
                width: "221px",
                height: "40px",
                borderColor: "#E5E7EB",
                backgroundColor: "#F5F5F5",
              }}
            >
              <button
                id="btn-plan-mensal"
                onClick={() => {
                  analyticsEvents.clickBillingPeriodMensal();
                  handleBillingPeriodChange("mensal");
                }}
                className={`flex flex-col justify-center items-center flex-1 h-full rounded-full transition-all ${
                  billingPeriod === "mensal"
                    ? "bg-wevets-pink text-white font-bold"
                    : "text-wevets-blue bg-white font-normal"
                }`}
                style={{
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "14px",
                  lineHeight: "20px",
                  ...(billingPeriod === "mensal" && {
                    boxShadow: "0 0 0 3px white",
                  }),
                }}
              >
                Mensal
              </button>
              <button
                id="btn-plan-anual"
                onClick={() => {
                  analyticsEvents.clickBillingPeriodAnual();
                  handleBillingPeriodChange("anual");
                }}
                className={`flex flex-col justify-center items-center flex-1 h-full rounded-full transition-all ${
                  billingPeriod === "anual"
                    ? "bg-wevets-pink text-white font-bold"
                    : "text-wevets-blue bg-white font-normal"
                }`}
                style={{
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Anual
              </button>
            </div>
          </div>

          {/* Plans Container - Responsive */}
          <div className="md:hidden space-y-5">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`flex flex-col p-6 rounded-2xl bg-white ${
                  plan.popular ? "border border-wevets-cyan" : ""
                }`}
              >
                {/* Plan Header */}
                <div className="flex justify-between items-start mb-4 w-full">
                  <h3
                    className="plan-heading text-2xl font-medium text-wevets-blue/60 uppercase tracking-wide"
                    style={{
                      fontFamily: "Font52602, sans-serif",
                      letterSpacing: "0.6px",
                    }}
                  >
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <div className="bg-wevets-pink px-2 py-0.5 rounded">
                      <span
                        className="text-white text-[11px] font-bold uppercase tracking-tight whitespace-nowrap"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        {index === 1
                          ? billingPeriod === "mensal"
                            ? "50% OFF 4 meses"
                            : "2 meses OFF"
                          : "Mais popular"}
                      </span>
                    </div>
                  )}
                  {!plan.popular && (
                    <div className="bg-wevets-pink px-2 py-0.5 rounded">
                      <span
                        className="text-white text-[11px] font-bold uppercase tracking-tight whitespace-nowrap"
                        style={{ letterSpacing: "0.5px" }}
                      >
                        {billingPeriod === "mensal" ? (
                          <>
                            {index === 0
                              ? "Plano anual por R$ 1"
                              : index === 2 || index === 3
                                ? "50% OFF 4 meses"
                                : ""}
                          </>
                        ) : (
                          <>
                            {index === 0
                              ? "Plano anual por R$ 1"
                              : index === 2 || index === 3
                                ? "2 meses OFF"
                                : ""}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Old Price Strikethrough */}
                {index === 1 && billingPeriod === "mensal" && (
                  <div style={{ marginBottom: "0px" }}>
                    <strike
                      style={{
                        display: "inline",
                        fontWeight: "400",
                        color: "rgb(6, 41, 91)",
                      }}
                    >
                      De R$ 49,90
                    </strike>
                  </div>
                )}
                {index === 2 && billingPeriod === "mensal" && (
                  <div style={{ marginBottom: "0px" }}>
                    <strike
                      style={{
                        display: "inline",
                        fontWeight: "400",
                        color: "rgb(6, 41, 91)",
                      }}
                    >
                      De R$ 109,90
                    </strike>
                  </div>
                )}
                {index === 3 && billingPeriod === "mensal" && (
                  <div style={{ marginBottom: "0px" }}>
                    <strike
                      style={{
                        display: "inline",
                        fontWeight: "400",
                        color: "rgb(6, 41, 91)",
                      }}
                    >
                      De R$ 209,90
                    </strike>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className="text-[40px] font-bold text-wevets-blue leading-9"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span style={{ fontSize: "24px" }}>R$</span>{" "}
                    {billingPeriod === "mensal"
                      ? plan.priceMonthly
                      : plan.priceAnnual}
                  </span>
                  <span className="text-gray-500 text-xs leading-4 mb-0.5">
                    {billingPeriod === "mensal" ? "/mês" : "/ano"}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="text-wevets-blue/70 text-base mb-4"
                  style={{ lineHeight: "22.75px" }}
                >
                  {plan.description}
                </p>

                {/* CTA Button */}
                <a
                  id={`btn-plan-${plan.name.toLowerCase()}-${billingPeriod}`}
                  href="https://planowevets.com.br/login"
                  onClick={(e) => {
                    e.preventDefault();
                    // Track carousel plan hire event
                    if (index === 0) {
                      analyticsEvents.clickHirePlanBasicoWithRedirect(
                        billingPeriod,
                        "contratar",
                        `basico-${billingPeriod}`,
                      );
                    } else if (index === 1) {
                      analyticsEvents.clickHirePlanConforto(
                        billingPeriod,
                        "contratar",
                        `conforto-${billingPeriod}`,
                      );
                    } else if (index === 2) {
                      analyticsEvents.clickHirePlanSuper(
                        billingPeriod,
                        "contratar",
                        `super-${billingPeriod}`,
                      );
                    } else if (index === 3) {
                      analyticsEvents.clickHirePlanUltra(
                        billingPeriod,
                        "contratar",
                        `ultra-${billingPeriod}`,
                      );
                    }
                  }}
                  className="w-full bg-wevets-cyan text-white py-2.5 rounded-xl font-bold text-base hover:bg-opacity-90 transition-all mb-1 block text-center"
                  style={{ pointerEvents: "auto" }}
                >
                  Contratar
                </a>

                {/* Note */}
                {plan.note && (
                  <p
                    className="text-wevets-institutional text-sm mb-4"
                    style={{ lineHeight: "22.75px" }}
                  >
                    {plan.note}
                  </p>
                )}

                {/* Features */}
                <div>
                  {index === 0 && (
                    <p
                      className="text-wevets-blue font-bold text-base mb-2"
                      style={{ lineHeight: "22.75px" }}
                    >
                      <p>Descontos exclusivos na WeVets vs. particular:</p>
                    </p>
                  )}
                  {index !== 0 && (
                    <p
                      className="text-wevets-blue font-bold text-base mb-2"
                      style={{ lineHeight: "22.75px" }}
                    >
                      {index === 1
                        ? "Benefícios do Plano Básico e mais:"
                        : index === 2
                          ? "Benefícios do Plano Conforto e mais:"
                          : "Todos os benefícios dos Planos anteriores e mais:"}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i}>
                        {typeof feature === "string" ? (
                          <li className="flex items-start gap-2">
                            <div className="mt-1.5 w-4 h-4 rounded-full bg-wevets-cyan flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 10 10"
                                strokeWidth="0.778"
                              >
                                <path
                                  d="M7.777 2.333L3.499 6.611L1.555 4.666"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div
                              className="text-wevets-institutional text-sm"
                              style={{ lineHeight: "22.75px" }}
                            >
                              {feature}
                            </div>
                          </li>
                        ) : feature.type === "structured" ? (
                          index === 0 ? (
                            <ul className="space-y-0">
                              {feature.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    marginTop: idx === 0 ? "0px" : "8px",
                                  }}
                                >
                                  <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-4 h-4 rounded-full bg-wevets-cyan flex items-center justify-center flex-shrink-0">
                                      <svg
                                        className="w-2.5 h-2.5 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 10 10"
                                        strokeWidth="0.778"
                                      >
                                        <path
                                          d="M7.777 2.333L3.499 6.611L1.555 4.666"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                    <div
                                      className="text-wevets-institutional text-sm"
                                      style={{ lineHeight: "22.75px" }}
                                    >
                                      <p>{item}</p>
                                    </div>
                                  </li>
                                </div>
                              ))}
                            </ul>
                          ) : (
                            <>
                              {feature.items.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <div className="mt-1.5 w-3 h-3 rounded-full bg-wevets-green flex items-center justify-center flex-shrink-0"></div>
                                  <div
                                    className="text-wevets-institutional text-sm"
                                    style={{ lineHeight: "22.75px" }}
                                  >
                                    <p>{item}</p>
                                  </div>
                                </li>
                              ))}
                            </>
                          )
                        ) : (
                          <li className="flex items-start gap-2">
                            <div className="mt-1.5 w-4 h-4 rounded-full bg-wevets-cyan flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 10 10"
                                strokeWidth="0.778"
                              >
                                <path
                                  d="M7.777 2.333L3.499 6.611L1.555 4.666"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div
                              className="text-wevets-institutional text-sm"
                              style={{ lineHeight: "22.75px" }}
                            >
                              {feature}
                            </div>
                          </li>
                        )}
                      </div>
                    ))}
                  </ul>
                </div>

                {/* Coverage Table Link */}
                <a
                  id={`btn-coverage-mobile-${index}`}
                  href={getCoverageLink(index)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (index === 0) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaBasicoMensal();
                      } else {
                        analyticsEvents.clickTabelaBasicoAnual();
                      }
                    } else if (index === 1) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaConfortoMensal();
                      } else {
                        analyticsEvents.clickTabelaConfortoAnual();
                      }
                    } else if (index === 2) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaSuperMensal();
                      } else {
                        analyticsEvents.clickTabelaSuperAnual();
                      }
                    } else if (index === 3) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaUltraMensal();
                      } else {
                        analyticsEvents.clickTabelaUltraAnual();
                      }
                    }
                  }}
                  className="w-full text-center text-wevets-cyan hover:underline transition-all"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    marginTop: "16px",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    textDecoration: "underline",
                  }}
                >
                  Tabela de cobertura e coparticipação
                </a>
              </div>
            ))}
          </div>

          {/* Desktop: Plans Grid */}
          <div className="hidden md:grid md:grid-cols-4 md:gap-6 md:justify-center md:w-full">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`flex flex-col items-start gap-6 p-6 rounded-2xl bg-white ${
                  plan.popular ? "border border-wevets-cyan" : ""
                }`}
              >
                {/* Plan Header */}
                <div className="flex justify-between items-start w-full gap-2">
                  <h3
                    className="text-2xl font-medium text-wevets-blue/60"
                    style={{
                      fontFamily: "Font52602, sans-serif",
                      letterSpacing: "0.6px",
                      textTransform: "capitalize",
                    }}
                  >
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <div className="bg-wevets-pink px-2 py-1 rounded text-[11px]">
                      <span
                        className="text-white font-bold uppercase whitespace-nowrap"
                        style={{
                          letterSpacing: "0.5px",
                          fontFamily: "Peridot PE Variable, sans-serif",
                        }}
                      >
                        {index === 1
                          ? billingPeriod === "mensal"
                            ? "50% OFF 4 meses"
                            : "2 meses OFF"
                          : "Mais popular"}
                      </span>
                    </div>
                  )}
                  {!plan.popular && (
                    <div className="bg-wevets-pink px-2 py-1 rounded text-[11px]">
                      <span
                        className="text-white font-bold uppercase whitespace-nowrap"
                        style={{
                          letterSpacing: "0.5px",
                          fontFamily: "Peridot PE Variable, sans-serif",
                        }}
                      >
                        {billingPeriod === "mensal" ? (
                          <>
                            {index === 0
                              ? "Plano anual por R$ 1"
                              : index === 2 || index === 3
                                ? "50% OFF 4 meses"
                                : ""}
                          </>
                        ) : (
                          <>
                            {index === 0
                              ? "Plano anual por R$ 1"
                              : index === 2 || index === 3
                                ? "2 meses OFF"
                                : ""}
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="flex flex-col gap-3 w-full">
                  {index === 0 && billingPeriod === "mensal" && (
                    <div style={{ marginBottom: "-15px" }}>
                      <div style={{ color: "rgb(255, 255, 255)" }}>
                        <p>,</p>
                      </div>
                    </div>
                  )}
                  {index === 0 && billingPeriod === "anual" && (
                    <div style={{ marginBottom: "-15px" }}>
                      <div style={{ color: "rgb(255, 255, 255)" }} />
                    </div>
                  )}
                  {index === 1 && billingPeriod === "mensal" && (
                    <div style={{ marginBottom: "-15px" }}>
                      <strike
                        style={{
                          color: "rgb(6, 41, 91)",
                          display: "inline",
                          fontWeight: "400",
                        }}
                      >
                        De R$ 49,90
                      </strike>
                    </div>
                  )}
                  {index === 2 && billingPeriod === "mensal" && (
                    <div style={{ marginBottom: "-15px" }}>
                      <strike
                        style={{
                          color: "rgb(6, 41, 91)",
                          display: "inline",
                          fontWeight: "400",
                        }}
                      >
                        De R$ 109,90
                      </strike>
                    </div>
                  )}
                  {index === 3 && billingPeriod === "mensal" && (
                    <div style={{ marginBottom: "-15px" }}>
                      <strike
                        style={{
                          color: "rgb(6, 41, 91)",
                          display: "inline",
                          fontWeight: "400",
                        }}
                      >
                        De R$ 209,90
                      </strike>
                    </div>
                  )}
                  <div className="flex items-end gap-1">
                    <span
                      className="text-[32px] font-bold text-wevets-blue leading-9"
                      style={{ fontFamily: "Fields, sans-serif" }}
                    >
                      <span style={{ fontSize: "20px" }}>R$</span>{" "}
                      {index === 1
                        ? billingPeriod === "mensal"
                          ? "24,95"
                          : plan.priceAnnual
                        : billingPeriod === "mensal"
                          ? plan.priceMonthly
                          : plan.priceAnnual}
                    </span>
                    <span
                      className="text-gray-500 text-xs leading-4"
                      style={{ fontFamily: "Peridot PE Variable, sans-serif" }}
                    >
                      {billingPeriod === "mensal" ? "/mês" : "/ano"}
                    </span>
                  </div>
                  <p
                    className="text-wevets-blue/70"
                    style={{
                      ...((index === 0 || index === 3) && {
                        marginBottom: "24px",
                      }),
                      font: '400 12px/23px "Peridot PE Variable", sans-serif',
                    }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* CTA Button */}
                <a
                  id={`btn-plan-${plan.name.toLowerCase()}-${billingPeriod}`}
                  href="https://planowevets.com.br/login"
                  onClick={(e) => {
                    e.preventDefault();
                    // Track carousel plan hire event
                    if (index === 0) {
                      analyticsEvents.clickHirePlanBasicoWithRedirect(
                        billingPeriod,
                        "contratar",
                        `basico-${billingPeriod}`,
                      );
                    } else if (index === 1) {
                      analyticsEvents.clickHirePlanConforto(
                        billingPeriod,
                        "contratar",
                        `conforto-${billingPeriod}`,
                      );
                    } else if (index === 2) {
                      analyticsEvents.clickHirePlanSuper(
                        billingPeriod,
                        "contratar",
                        `super-${billingPeriod}`,
                      );
                    } else if (index === 3) {
                      analyticsEvents.clickHirePlanUltra(
                        billingPeriod,
                        "contratar",
                        `ultra-${billingPeriod}`,
                      );
                    }
                  }}
                  className="w-full bg-wevets-cyan text-white py-2.5 rounded-lg font-bold text-base hover:bg-opacity-90 transition-all inline-block text-center"
                  style={{ fontFamily: "Peridot PE Variable, sans-serif" }}
                >
                  Contratar {plan.name}
                </a>

                {/* Features */}
                {index === 0 && (
                  <div
                    className="text-wevets-blue font-bold"
                    style={{
                      fontFamily: "Peridot PE Variable, sans-serif",
                      fontWeight: "700",
                      lineHeight: "23px",
                      marginTop: "-15px",
                    }}
                  >
                    <p style={{ fontSize: "14px", fontWeight: "700" }}>
                      <p>Descontos exclusivos na WeVets vs. particular:</p>
                    </p>
                  </div>
                )}
                <div className="w-full flex flex-col gap-2">
                  {index !== 0 && (
                    <p
                      className="text-wevets-blue font-bold text-base"
                      style={{
                        font: '700 14px/23px "Peridot PE Variable", sans-serif',
                        marginTop: "-15px",
                      }}
                    >
                      {index === 1
                        ? "Benefícios do Plano Básico e mais:"
                        : index === 2
                          ? "Benefícios do Plano Conforto e mais:"
                          : "Todos os benefícios dos Planos anteriores e mais:"}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div
                          className="text-wevets-institutional text-sm"
                          style={{
                            fontFamily: "Peridot PE Variable, sans-serif",
                            lineHeight: "22.75px",
                          }}
                        >
                          {typeof feature === "string" ? (
                            feature
                          ) : feature.type === "structured" ? (
                            <>
                              {feature.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    marginTop: idx === 0 ? "-15px" : "5px",
                                  }}
                                >
                                  <p>{item}</p>
                                </div>
                              ))}
                            </>
                          ) : (
                            feature
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coverage Table Link */}
                <a
                  id={`btn-coverage-${index}`}
                  href={getCoverageLink(index)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (index === 0) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaBasicoMensal();
                      } else {
                        analyticsEvents.clickTabelaBasicoAnual();
                      }
                    } else if (index === 1) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaConfortoMensal();
                      } else {
                        analyticsEvents.clickTabelaConfortoAnual();
                      }
                    } else if (index === 2) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaSuperMensal();
                      } else {
                        analyticsEvents.clickTabelaSuperAnual();
                      }
                    } else if (index === 3) {
                      if (billingPeriod === "mensal") {
                        analyticsEvents.clickTabelaUltraMensal();
                      } else {
                        analyticsEvents.clickTabelaUltraAnual();
                      }
                    }
                  }}
                  className="w-full text-center text-wevets-cyan hover:underline transition-all"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    marginTop: "auto",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    textDecoration: "underline",
                  }}
                >
                  Tabela de cobertura e coparticipação
                </a>
              </div>
            ))}
          </div>

          {/* Disclaimer Text */}
          <p
            className="text-center mt-6 text-wevets-blue/60"
            style={{
              fontFamily: "Peridot PE Variable, sans-serif",
              fontSize: "12px",
              lineHeight: "16px",
            }}
          >
            *Economia calculada em comparação à média nacional de preços de
            atendimentos veterinários particulares.
          </p>
        </div>
      </section>

      {/* Plan Comparison Table - Mobile */}
      <section className="md:hidden px-6 py-12">
        <div className="flex flex-col items-center gap-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <h2
              className="text-wevets-blue text-center font-bold"
              style={{
                fontFamily: "Fields, sans-serif",
                fontSize: "24px",
                lineHeight: "175%",
              }}
            >
              Compare os planos
            </h2>
            <p
              className="text-wevets-blue/70 text-center"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "16px",
                lineHeight: "150%",
              }}
            >
              Veja o que cada plano cobre e escolha o ideal para o seu pet.
            </p>
          </div>

          {/* Comparison Table - Horizontal Scroll */}
          <div className="w-full overflow-x-auto">
            <div className="inline-flex gap-3 min-w-full">
              {/* Coverage Column - Fixed */}
              <div className="flex flex-col w-[166px] flex-shrink-0 sticky left-0 z-10 bg-white">
                <div className="flex items-center justify-center h-[61px] rounded-t-xl bg-wevets-institutional">
                  <span
                    className="text-white font-normal"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      lineHeight: "150%",
                    }}
                  >
                    Cobertura
                  </span>
                </div>
                <div className="flex flex-col border border-gray-200/20 border-t-0">
                  {[
                    "Consultas e vacinas",
                    "Exames laboratoriais simples",
                    "Exames laboratoriais complexos",
                    "Exames de imagem (raio-x / ultrassom)",
                    "Consultas com especialistas",
                    "Procedimentos clínicos / ambulatoriais",
                    "Internação 24h",
                    "Cirurgias e anestesias",
                    "Exames cardiológicos",
                    "Alta complexidade (tomografia / endoscopia)",
                    "Terapias (fisioterapia / acupuntura)",
                    "UTI (Único plano com cobertura)",
                    "Rede credenciada",
                    "Hospitais 24h WeVets",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center px-[11px] text-wevets-blue border-b border-gray-200/20 last:border-b-0"
                      style={{
                        fontFamily: "Peridot PE Variable, sans-serif",
                        fontSize: "14px",
                        lineHeight: "142.857%",
                        height: "63px",
                      }}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Básico Column */}
              <div className="flex flex-col w-[150px] flex-shrink-0">
                <div className="flex items-center justify-center h-[61px] rounded-t-xl bg-wevets-blue">
                  <span
                    className="text-white font-normal"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      lineHeight: "150%",
                    }}
                  >
                    Basico
                  </span>
                </div>
                <div className="flex flex-col items-center border border-gray-200/20 border-t-0">
                  {[
                    true, // Consultas e vacinas
                    true, // Exames laboratoriais simples
                    false, // Exames laboratoriais complexos
                    false, // Exames de imagem
                    false, // Consultas com especialistas
                    false, // Procedimentos clínicos
                    false, // Internação 24h
                    false, // Cirurgias
                    false, // Exames cardiológicos
                    false, // Alta complexidade
                    false, // Terapias
                    false, // UTI 24h
                    false, // Rede credenciada
                    true, // Hospitais 24h WeVets
                  ].map((included, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center h-[63px] border-b border-gray-200/20 last:border-b-0"
                    >
                      {included ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#EDEDED" />
                          <path
                            d="M3 12H21"
                            stroke="#DCDCDC"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Conforto Column */}
              <div className="flex flex-col w-[150px] flex-shrink-0">
                <div className="flex items-center justify-center h-[61px] rounded-t-xl bg-wevets-blue">
                  <span
                    className="text-white font-normal"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      lineHeight: "150%",
                    }}
                  >
                    Conforto
                  </span>
                </div>
                <div className="flex flex-col items-center border border-gray-200/20 border-t-0">
                  {[
                    true, // Consultas e vacinas
                    true, // Exames laboratoriais simples
                    true, // Exames laboratoriais complexos
                    true, // Exames de imagem
                    false, // Consultas com especialistas
                    true, // Procedimentos clínicos
                    false, // Internação 24h
                    false, // Cirurgias
                    false, // Exames cardiológicos
                    false, // Alta complexidade
                    false, // Terapias
                    false, // UTI 24h
                    true, // Rede credenciada
                    true, // Hospitais 24h WeVets
                  ].map((included, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center h-[63px] border-b border-gray-200/20 last:border-b-0"
                    >
                      {included ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#EDEDED" />
                          <path
                            d="M3 12H21"
                            stroke="#DCDCDC"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Super Column */}
              <div className="flex flex-col w-[150px] flex-shrink-0">
                <div className="flex items-center justify-center h-[61px] rounded-t-xl bg-wevets-blue">
                  <span
                    className="text-white font-normal"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      lineHeight: "150%",
                    }}
                  >
                    Super
                  </span>
                </div>
                <div className="flex flex-col items-center border border-gray-200/20 border-t-0">
                  {[
                    true, // Consultas e vacinas
                    true, // Exames laboratoriais simples
                    true, // Exames laboratoriais complexos
                    true, // Exames de imagem
                    true, // Consultas com especialistas
                    true, // Procedimentos clínicos
                    true, // Internação 24h
                    true, // Cirurgias
                    true, // Exames cardiológicos
                    false, // Alta complexidade
                    false, // Terapias
                    false, // UTI 24h
                    true, // Rede credenciada
                    true, // Hospitais 24h WeVets
                  ].map((included, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center h-[63px] border-b border-gray-200/20 last:border-b-0"
                    >
                      {included ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#EDEDED" />
                          <path
                            d="M3 12H21"
                            stroke="#DCDCDC"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ultra Column */}
              <div className="flex flex-col w-[150px] flex-shrink-0">
                <div className="flex items-center justify-center h-[61px] rounded-t-xl bg-wevets-blue">
                  <span
                    className="text-white font-normal"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "16px",
                      lineHeight: "150%",
                    }}
                  >
                    Ultra
                  </span>
                </div>
                <div className="flex flex-col items-center border border-gray-200/20 border-t-0">
                  {[
                    true, // Consultas e vacinas
                    true, // Exames laboratoriais simples
                    true, // Exames laboratoriais complexos
                    true, // Exames de imagem
                    true, // Consultas com especialistas
                    true, // Procedimentos clínicos
                    true, // Internação 24h
                    true, // Cirurgias
                    true, // Exames cardiológicos
                    true, // Alta complexidade
                    true, // Terapias
                    true, // UTI 24h
                    true, // Rede credenciada
                    true, // Hospitais 24h WeVets
                  ].map((included, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center h-[63px] border-b border-gray-200/20 last:border-b-0"
                    >
                      {included ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" rx="12" fill="#EDEDED" />
                          <path
                            d="M3 12H21"
                            stroke="#DCDCDC"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Comparison Table - Desktop Only */}
      <section
        id="compare-planos"
        ref={comparePlanosRef}
        className="hidden md:flex md:flex-col md:items-center md:gap-8 md:py-12 md:w-full"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[603px]">
          <h2
            className="text-wevets-blue text-center font-bold"
            style={{
              fontFamily: "Fields, sans-serif",
              fontSize: "32px",
              lineHeight: "120%",
            }}
          >
            Compare os planos
          </h2>
          <p
            className="text-wevets-blue/70 text-center"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "24px",
              lineHeight: "100%",
            }}
          >
            Veja o que cada plano cobre e escolha o ideal para o seu pet.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="w-[1366px]">
          {/* Header Row */}
          <div className="flex gap-4">
            {/* Coverage Header */}
            <div className="w-[472px] flex items-center justify-center h-11 rounded-t-2xl bg-wevets-institutional">
              <span
                className="text-white font-normal"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "16px",
                  lineHeight: "150%",
                }}
              >
                Cobertura
              </span>
            </div>
            {/* Plan Headers */}
            <div className="flex gap-4 flex-1">
              <div className="flex-1 flex items-center justify-center h-11 rounded-t-2xl bg-wevets-blue">
                <span
                  className="text-white font-normal"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    lineHeight: "150%",
                  }}
                >
                  Basico
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center h-11 rounded-t-2xl bg-wevets-blue">
                <span
                  className="text-white font-normal"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    lineHeight: "150%",
                  }}
                >
                  Conforto
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center h-11 rounded-t-2xl bg-wevets-blue">
                <span
                  className="text-white font-normal"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    lineHeight: "150%",
                  }}
                >
                  Super
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center h-11 rounded-t-2xl bg-wevets-blue">
                <span
                  className="text-white font-normal"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "16px",
                    lineHeight: "150%",
                  }}
                >
                  Ultra
                </span>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="flex gap-4">
            {/* Coverage Column */}
            <div className="w-[472px] border-l border-gray-200/20">
              {[
                "Consultas e vacinas",
                "Exames laboratoriais simples",
                "Exames laboratoriais complexos",
                "Exames de imagem (raio-x / ultrassom)",
                "Consultas com especialistas",
                "Procedimentos clínicos / ambulatoriais",
                "Internação 24h",
                "Cirurgias e anestesias",
                "Exames cardiológicos",
                "Alta complexidade (tomografia / endoscopia)",
                "Terapias (fisioterapia / acupuntura)",
                "UTI (Único plano do mercado com cobertura)",
                "Rede credenciada",
                "Hospitais 24h WeVets",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center h-[48px] text-wevets-blue pl-[30px] border-b border-gray-200/20"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "16px",
                    fontWeight: 400,
                    lineHeight: "125%",
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* Plan Columns */}
            <div className="flex gap-4 flex-1">
              {/* Básico */}
              <div className="flex-1 border-l border-gray-200/20">
                {[
                  true, // Consultas e vacinas
                  true, // Exames laboratoriais simples
                  false, // Exames laboratoriais complexos
                  false, // Exames de imagem
                  false, // Consultas com especialistas
                  false, // Procedimentos clínicos
                  false, // Internação 24h
                  false, // Cirurgias
                  false, // Exames cardiológicos
                  false, // Alta complexidade
                  false, // Terapias
                  false, // UTI 24h
                  false, // Rede credenciada
                  true, // Hospitais 24h WeVets
                ].map((included, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-[48px] border-b border-gray-200/20"
                  >
                    {included ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#EDEDED" />
                        <path
                          d="M3 12H21"
                          stroke="#DCDCDC"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Conforto */}
              <div className="flex-1 border-l border-gray-200/20">
                {[
                  true, // Consultas e vacinas
                  true, // Exames laboratoriais simples
                  true, // Exames laboratoriais complexos
                  true, // Exames de imagem
                  false, // Consultas com especialistas
                  true, // Procedimentos clínicos
                  false, // Internação 24h
                  false, // Cirurgias
                  false, // Exames cardiológicos
                  false, // Alta complexidade
                  false, // Terapias
                  false, // UTI 24h
                  true, // Rede credenciada
                  true, // Hospitais 24h WeVets
                ].map((included, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-[48px] border-b border-gray-200/20"
                  >
                    {included ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#EDEDED" />
                        <path
                          d="M3 12H21"
                          stroke="#DCDCDC"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Super */}
              <div className="flex-1 border-l border-gray-200/20">
                {[
                  true, // Consultas e vacinas
                  true, // Exames laboratoriais simples
                  true, // Exames laboratoriais complexos
                  true, // Exames de imagem
                  true, // Consultas com especialistas
                  true, // Procedimentos clínicos
                  true, // Internação 24h
                  true, // Cirurgias
                  true, // Exames cardiológicos
                  false, // Alta complexidade
                  false, // Terapias
                  false, // UTI 24h
                  true, // Rede credenciada
                  true, // Hospitais 24h WeVets
                ].map((included, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-[48px] border-b border-gray-200/20"
                  >
                    {included ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#EDEDED" />
                        <path
                          d="M3 12H21"
                          stroke="#DCDCDC"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Ultra */}
              <div className="flex-1 border-l border-gray-200/20">
                {[
                  true, // Consultas e vacinas
                  true, // Exames laboratoriais simples
                  true, // Exames laboratoriais complexos
                  true, // Exames de imagem
                  true, // Consultas com especialistas
                  true, // Procedimentos clínicos
                  true, // Internação 24h
                  true, // Cirurgias
                  true, // Exames cardiológicos
                  true, // Alta complexidade
                  true, // Terapias
                  true, // UTI 24h
                  true, // Rede credenciada
                  true, // Hospitais 24h WeVets
                ].map((included, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center h-[48px] border-b border-gray-200/20"
                  >
                    {included ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#0BBFC6" />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.4674 7.76352C18.6484 7.9323 18.75 8.16119 18.75 8.39985C18.75 8.6385 18.6484 8.86739 18.4674 9.03617L10.7462 16.2365C10.5652 16.4052 10.3198 16.5 10.0639 16.5C9.80796 16.5 9.56251 16.4052 9.38152 16.2365L5.52093 12.6363C5.34512 12.4666 5.24784 12.2392 5.25004 12.0032C5.25224 11.7673 5.35374 11.5415 5.53269 11.3746C5.71163 11.2078 5.9537 11.1131 6.20676 11.1111C6.45982 11.109 6.70362 11.1997 6.88565 11.3637L10.0639 14.3275L17.1027 7.76352C17.2837 7.59479 17.5291 7.5 17.7851 7.5C18.041 7.5 18.2864 7.59479 18.4674 7.76352Z"
                          fill="white"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="24" height="24" rx="12" fill="#EDEDED" />
                        <path
                          d="M3 12H21"
                          stroke="#DCDCDC"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Network Section - Responsive */}
      <style>{`
        @media (min-width: 768px) {
          #rede-credenciada h2 {
            font-size: 46px !important;
            line-height: 120% !important;
          }
          #rede-credenciada p {
            font-size: 20px !important;
            line-height: 100% !important;
            padding: 20px 0 35px 0 !important;
          }
        }
      `}</style>
      <section
        id="rede-credenciada"
        className="px-6 py-12 md:px-0 md:py-3 md:flex md:justify-center md:items-center"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center md:w-full md:max-w-[1368px] md:px-6 gap-8 md:gap-0">
          {/* Left Content */}
          <div className="flex flex-col items-center md:items-start gap-8 md:gap-2 md:w-[689px]">
            {/* Header */}
            <div className="flex flex-col items-center md:items-start gap-4 md:gap-1 md:w-full max-w-[345px] md:max-w-none">
              <h2
                className="text-wevets-blue text-center md:text-left font-bold"
                style={{
                  fontFamily: "Fields, sans-serif",
                  fontSize: "24px",
                  lineHeight: "145.833%",
                }}
              >
                Todo cuidado que seu pet precisa, sempre perto de você
              </h2>
              <p
                className="text-wevets-blue/70 text-center md:text-left"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "16px",
                  lineHeight: "150%",
                }}
              >
                +20 hospitais 24h espalhados por São Paulo e Porto Alegre
              </p>
            </div>

            {/* Button */}
            <a
              id="btn-rede-credenciada"
              href="https://planowevets.com.br/units"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                analyticsEvents.clickRedeCredenciada();
                const urlWithDeviceId = addDeviceIdToUrl(
                  "https://planowevets.com.br/units",
                );
                window.open(urlWithDeviceId, "_blank");
              }}
              className="w-full md:w-[250px] max-w-[345px] h-[60px] flex items-center justify-center border border-wevets-cyan rounded-xl hover:bg-wevets-cyan/5 transition-colors cursor-pointer md:inline-flex"
            >
              <span
                className="text-wevets-cyan font-semibold"
                style={{
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "20px",
                  lineHeight: "120%",
                }}
              >
                Rede credenciada
              </span>
            </a>
          </div>

          {/* Circular Network Diagram */}
          <a
            href="https://planowevets.com.br/units"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              analyticsEvents.clickRedeCredenciadaImagem();
              const urlWithDeviceId = addDeviceIdToUrl(
                "https://planowevets.com.br/units",
              );
              window.open(urlWithDeviceId, "_blank");
            }}
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2F3e377bbf025340b3bed170571556b066?format=webp&width=800"
              alt="Mapa de Hospitais"
              className="w-full md:w-[480px] max-w-[345px] md:max-w-none h-auto md:flex-shrink-0 rounded-2xl"
              loading="lazy"
              width="345"
              height="345"
            />
          </a>
        </div>
      </section>

      {/* Life Stages Heading - Responsive */}
      <style>{`
        @media (min-width: 768px) {
          #life-stages-heading {
            font-size: 32px !important;
          }
        }
      `}</style>
      <h2
        id="life-stages-heading"
        className="text-2xl font-bold text-wevets-blue text-center -mb-4 md:mb-12 px-6"
        style={{ fontFamily: "Fields, sans-serif", lineHeight: "120%" }}
      >
        Presente em todas as fases do seu pet
      </h2>

      {/* Life Stages Section - Mobile Only */}
      <section
        id="life-stages"
        className="md:hidden px-6 py-12 max-w-3xl mx-auto"
      >
        <div className="relative space-y-12">
          <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-wevets-cyan/20"></div>

          {[
            {
              title: "Começo de vida",
              description:
                "Na WeVets seu filhote tem consultas, vacinas, castração, exames de check-up e hospital 24h. Isso permite que ele cresça ainda mais forte e saudável.",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/31082112c120484fccae60472aefea6e762c7814?width=132",
            },
            {
              title: "Na vida adulta",
              description:
                "Na vida adulta, prevenção é tudo. Conte com a WeVets para exames de imagem, especialistas, internações e emergência. Temos uma estrutura completa 24h pro seu pet viver bem",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/118dc61833d31e77d9ca41b3f9a2473ee546d70a?width=93",
            },
            {
              title: "Na melhor idade",
              description:
                "As necessidades mudam e nós estamos prontos. Oferecemos acompanhamento integral, cirurgias complexas, UTI e hospitais 24h. Na WeVets, seu pet idoso tem a estrutura pra viver bem e sem complicações.",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/bfeb3fd582506ac741a35b7324a479f9d70b0b97?width=104",
            },
          ].map((stage, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="relative z-10 w-16 h-16 flex-shrink-0 bg-white rounded-full flex items-center justify-center">
                <img
                  src={stage.image}
                  alt={stage.title}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 pt-3">
                <h3
                  className="text-xl font-bold text-wevets-blue mb-2"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {stage.title}
                </h3>
                <p className="text-wevets-blue/70 text-sm leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Life Stages Section - Desktop Only */}
      <section className="hidden md:flex md:flex-col md:items-center md:gap-12 md:py-16">
        <div className="flex justify-between items-start w-full max-w-[1370px] px-6">
          {[
            {
              title: "Começo de vida",
              description:
                "Na WeVets seu filhote tem consultas, vacinas, castração, exames de check-up e hospital 24h. Isso permite que ele cresça ainda mais forte e saudável.",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/0ffeb9e34ce4e047b06ed30c52f5818c76dd5506?width=188",
              imageAlt: "Filhote",
              imageSize: "w-[94px] h-[94px]",
            },
            {
              title: "Na vida adulta",
              description:
                "Na vida adulta, prevenção é tudo. Conte com a WeVets para exames de imagem, especialistas, internações e emergência. Temos uma estrutura completa 24h pro seu pet viver bem",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/ed3d5b927f59fe2b25ce19970ea3a0bbcda3d0a5?width=133",
              imageAlt: "Adulto",
              imageSize: "w-[67px] h-[101px]",
            },
            {
              title: "Na melhor idade",
              description:
                "As necessidades mudam e nós estamos prontos. Oferecemos acompanhamento integral, cirurgias complexas, UTI e hospitais 24h. Na WeVets, seu pet idoso tem a estrutura pra viver bem e sem complicações.",
              image:
                "https://api.builder.io/api/v1/image/assets/TEMP/193d64c93b276f5f659faf2052028648d4be4133?width=148",
              imageAlt: "Idoso",
              imageSize: "w-[74px] h-[100px]",
            },
          ].map((stage, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 w-[400px]"
            >
              <div className="flex items-center justify-center h-[100px] w-[100px]">
                <img
                  src={stage.image}
                  alt={stage.imageAlt}
                  className={`${stage.imageSize} object-contain`}
                  loading="lazy"
                />
              </div>
              <svg
                className="w-full h-[1px]"
                viewBox="0 0 400 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="200" cy="0.5" rx="200" ry="0.5" fill="#0BBFC6" />
              </svg>
              <div className="flex flex-col items-center gap-4 w-full">
                <p
                  className="text-wevets-blue text-center font-bold"
                  style={{
                    fontFamily: "Fields, sans-serif",
                    fontSize: "24px",
                    lineHeight: "133.333%",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {stage.title}
                </p>
                <p
                  className="text-wevets-blue/70 text-center"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "16px",
                    lineHeight: "181.25%",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {stage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section
        className="py-2 md:py-3 flex justify-center items-center"
        style={{ marginBottom: "-4px" }}
      >
        <div
          className="flex items-center justify-center gap-3 px-6 py-2 rounded-full"
          style={{ backgroundColor: "#E8F4F5" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.33594 6.33368C1.33596 5.59181 1.56101 4.8674 1.98137 4.25612C2.40173 3.64484 2.99762 3.17545 3.69035 2.90995C4.38308 2.64444 5.14005 2.59531 5.86128 2.76904C6.58252 2.94278 7.23409 3.3312 7.72994 3.88301C7.76487 3.92036 7.80709 3.95013 7.85399 3.97048C7.9009 3.99083 7.95148 4.00134 8.00261 4.00134C8.05374 4.00134 8.10432 3.99083 8.15123 3.97048C8.19813 3.95013 8.24035 3.92036 8.27528 3.88301C8.76957 3.32761 9.42129 2.93593 10.1437 2.76008C10.8661 2.58424 11.6249 2.63258 12.3192 2.89867C13.0134 3.16476 13.6102 3.63598 14.03 4.24961C14.4498 4.86325 14.6728 5.59019 14.6693 6.33368C14.6693 7.86035 13.6693 9.00035 12.6693 10.0003L9.00794 13.5423C8.88372 13.685 8.73056 13.7996 8.55864 13.8785C8.38672 13.9575 8.19997 13.9989 8.0108 14.0001C7.82163 14.0013 7.63438 13.9622 7.46147 13.8855C7.28856 13.8087 7.13396 13.6961 7.00794 13.555L3.33594 10.0003C2.33594 9.00035 1.33594 7.86701 1.33594 6.33368Z"
              stroke="#FF6BC0"
              strokeWidth="1.33333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-center"
            style={{
              fontFamily: "Peridot PE Variable, sans-serif",
              fontSize: "14px",
              lineHeight: "20px",
              color: "#2F5597",
            }}
          >
            + de 500 mil atendimentos realizados pela WeVets
          </span>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto md:px-24">
        <div className="text-center mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold text-wevets-blue mb-4"
            style={{ fontFamily: "Fields, sans-serif", lineHeight: "120%" }}
          >
            Histórias que inspiram
          </h2>
          <p className="text-wevets-blue/70 text-base">
            Veja como a WeVets transformou a vida de tutores e seus pets
          </p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out gap-4"
              style={{
                transform: `translateX(calc(-${carouselIndex * 100}% - ${carouselIndex * 16}px))`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-11px)] flex flex-col p-6 border border-wevets-cyan/20 rounded-2xl hover:border-wevets-cyan/40 transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <div className="flex-1 mb-4">
                    <p className="text-gray-700 text-base italic leading-relaxed mb-4">
                      {testimonial.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-wevets-cyan/20">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-16 h-16 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-gray-900 font-medium">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {testimonial.role ? testimonial.role : <br />}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Mobile */}
          <div className="flex md:hidden gap-4 justify-center mt-6">
            <button
              onClick={() => {
                analyticsEvents.clickHistoriasQueInspiramLeft();
                setCarouselIndex(Math.max(0, carouselIndex - 1));
              }}
              className="bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all disabled:opacity-50"
              disabled={carouselIndex === 0}
            >
              <ChevronLeft className="w-6 h-6 text-wevets-blue" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === carouselIndex
                      ? "bg-wevets-cyan w-8"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                analyticsEvents.clickHistoriasQueInspiramRight();
                setCarouselIndex(
                  Math.min(testimonials.length - 1, carouselIndex + 1),
                );
              }}
              className="bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all disabled:opacity-50"
              disabled={carouselIndex === testimonials.length - 1}
            >
              <ChevronRight className="w-6 h-6 text-wevets-blue" />
            </button>
          </div>

          {/* Navigation Buttons - Desktop */}
          <button
            onClick={() => {
              analyticsEvents.clickHistoriasQueInspiramLeft();
              setCarouselIndex(Math.max(0, carouselIndex - 1));
            }}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all disabled:opacity-50 items-center justify-center"
            disabled={carouselIndex === Math.max(0, testimonials.length - 3)}
          >
            <ChevronLeft className="w-6 h-6 text-wevets-blue" />
          </button>

          <button
            onClick={() => {
              analyticsEvents.clickHistoriasQueInspiramRight();
              setCarouselIndex(
                Math.min(
                  Math.max(0, testimonials.length - 3),
                  carouselIndex + 1,
                ),
              );
            }}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-all disabled:opacity-50 items-center justify-center"
            disabled={carouselIndex === Math.max(0, testimonials.length - 3)}
          >
            <ChevronRight className="w-6 h-6 text-wevets-blue" />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="duvidas-frequentes"
        className="px-6 py-12 max-w-3xl md:max-w-6xl mx-auto"
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-wevets-blue text-center mb-8"
          style={{ fontFamily: "Fields, sans-serif", lineHeight: "120%" }}
        >
          Dúvidas frequentes
        </h2>

        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 md:hidden">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: "contratacao", label: "Contratação" },
              { id: "coberturas", label: "Coberturas" },
              { id: "carencias", label: "Carências" },
              { id: "pagamentos", label: "Pagamentos" },
              { id: "gestao", label: "Gestão" },
              { id: "uso", label: "Uso" },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  // Track FAQ category selection
                  if (category.id === "contratacao") {
                    analyticsEvents.clickDuvidasContratacao();
                  } else if (category.id === "coberturas") {
                    analyticsEvents.clickDuvidasCoberturas();
                  } else if (category.id === "carencias") {
                    analyticsEvents.clickDuvidasCarencias();
                  } else if (category.id === "pagamentos") {
                    analyticsEvents.clickDuvidasPagamentos();
                  } else if (category.id === "gestao") {
                    analyticsEvents.clickDuvidasGestao();
                  } else if (category.id === "uso") {
                    analyticsEvents.clickDuvidasUso();
                  }
                  setFaqCategory(category.id);
                  setExpandedFaqIndex(null);
                }}
                className={`px-6 py-2 rounded-full text-xs font-semibold transition-all ${
                  faqCategory === category.id
                    ? "bg-wevets-pink text-white"
                    : "border border-gray-200 text-wevets-blue hover:border-gray-300"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedFaqIndex(
                      expandedFaqIndex === index ? null : index,
                    )
                  }
                  className="flex justify-between items-start w-full text-left p-6"
                >
                  <span className="text-wevets-blue text-base font-normal pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-wevets-blue flex-shrink-0 mt-1 transition-transform ${
                      expandedFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaqIndex === index && (
                  <div className="px-6 pb-6 text-wevets-blue text-base font-normal border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:items-center md:gap-8">
          <div className="flex items-center gap-3 justify-center max-w-full flex-wrap">
            {[
              { id: "contratacao", label: "Contratação" },
              { id: "coberturas", label: "Coberturas" },
              { id: "carencias", label: "Carências" },
              { id: "pagamentos", label: "Pagamentos" },
              { id: "gestao", label: "Gestão" },
              { id: "uso", label: "Uso" },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  // Track FAQ category selection
                  if (category.id === "contratacao") {
                    analyticsEvents.clickDuvidasContratacao();
                  } else if (category.id === "coberturas") {
                    analyticsEvents.clickDuvidasCoberturas();
                  } else if (category.id === "carencias") {
                    analyticsEvents.clickDuvidasCarencias();
                  } else if (category.id === "pagamentos") {
                    analyticsEvents.clickDuvidasPagamentos();
                  } else if (category.id === "gestao") {
                    analyticsEvents.clickDuvidasGestao();
                  } else if (category.id === "uso") {
                    analyticsEvents.clickDuvidasUso();
                  }
                  setFaqCategory(category.id);
                  setExpandedFaqIndex(null);
                }}
                className={`flex justify-center items-center px-7 py-3 rounded-full text-base font-semibold transition-all ${
                  faqCategory === category.id
                    ? "bg-wevets-pink text-white shadow-[0_4px_15px_0_rgba(6,41,91,0.15)]"
                    : "border border-gray-200 text-wevets-blue hover:border-gray-300"
                }`}
                style={{
                  fontFamily:
                    "Peridot PE Variable, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 w-full">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="flex flex-col border border-[rgba(243,244,246,0.5)] rounded-2xl shadow-[0_2px_20px_0_rgba(0,0,0,0.04)]"
              >
                <button
                  onClick={() =>
                    setExpandedFaqIndex(
                      expandedFaqIndex === index ? null : index,
                    )
                  }
                  className="flex h-14 justify-between items-center w-full px-6"
                >
                  <span
                    className="text-wevets-blue text-lg font-normal leading-6"
                    style={{
                      fontFamily:
                        "Peridot PE Variable, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      expandedFaqIndex === index ? "rotate-180" : ""
                    }`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.8307 7.5L9.9974 13.3333L4.16406 7.5"
                      stroke="#06295B"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expandedFaqIndex === index && (
                  <div
                    className="px-6 pb-6 text-wevets-blue text-base font-normal border-t border-[rgba(243,244,246,0.5)]"
                    style={{
                      fontFamily:
                        "Peridot PE Variable, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Desktop Section - Pet Health Plan Promo */}
      <section className="hidden md:flex md:justify-center md:items-center md:py-16 md:px-6">
        <div className="flex items-center gap-24 max-w-[1368px] w-full">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-10 w-[760px]">
            <h2
              className="text-wevets-blue font-bold"
              style={{
                fontFamily: "Fields, sans-serif",
                fontSize: "48px",
                lineHeight: "normal",
              }}
            >
              Proteja seu pet com o plano de saúde pet WeVets
            </h2>
            <p
              className="text-wevets-blue/70 w-[520px]"
              style={{
                fontFamily: "Peridot PE Variable, sans-serif",
                fontSize: "24px",
                lineHeight: "normal",
              }}
            >
              Da rotina à emergência, com hospital veterinário 24h e rede
              credenciada.
            </p>
            <div className="flex items-center gap-4">
              {/* Primary CTA Button */}
              <a
                id="btn-proteja-seu-pet-contratar"
                href="https://planowevets.com.br/login"
                onClick={() => {
                  analyticsEvents.clickProtejaContrataAgora();
                  analyticsEvents.clickHirePlan("hero");
                }}
                className="flex justify-center items-center gap-2 w-[257px] h-[60px] bg-wevets-cyan rounded-[10px] hover:bg-opacity-90 transition-all inline-flex"
              >
                <span
                  className="text-white text-center font-bold"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  Contratar plano agora
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33594 8H12.6693"
                    stroke="white"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 3.33301L12.6667 7.99968L8 12.6664"
                    stroke="white"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              {/* WhatsApp Button */}
              <a
                id="btn-proteja-seu-pet-whatsapp"
                href="https://api.whatsapp.com/send?phone=551133360600&text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20os%20planos%20de%20sa%C3%BAde%20Pet%20da%20WeVets"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analyticsEvents.clickDuvidasFalarWhatsapp()}
                className="flex justify-center items-center gap-2 w-[239px] h-[60px] border border-wevets-cyan rounded-[10px] hover:bg-wevets-cyan/5 transition-all inline-flex"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_whatsapp)">
                    <path
                      d="M14.5594 11.985C14.3119 11.8609 13.0944 11.2625 12.8677 11.1792C12.6402 11.0967 12.4752 11.0559 12.3094 11.3042C12.1452 11.5517 11.6702 12.1092 11.526 12.2742C11.3819 12.44 11.2369 12.46 10.9894 12.3367C10.7419 12.2117 9.94354 11.9509 8.99771 11.1075C8.26188 10.4509 7.76438 9.64003 7.62021 9.3917C7.47604 9.1442 7.60521 9.01003 7.72854 8.8867C7.84021 8.77587 7.97687 8.59753 8.10021 8.45337C8.22437 8.30837 8.26521 8.20503 8.34854 8.0392C8.43104 7.8742 8.39021 7.73003 8.32771 7.60587C8.26521 7.4817 7.77021 6.26253 7.56437 5.7667C7.36271 5.2842 7.15854 5.35003 7.00688 5.3417C6.86271 5.33503 6.69771 5.33337 6.53188 5.33337C6.36687 5.33337 6.09854 5.39503 5.87187 5.64337C5.64521 5.89087 5.00521 6.49003 5.00521 7.7092C5.00521 8.92753 5.89271 10.105 6.01604 10.2709C6.14021 10.4359 7.76271 12.9375 10.2469 14.01C10.8377 14.265 11.2985 14.4175 11.6585 14.5309C12.2519 14.72 12.7919 14.6934 13.2177 14.6292C13.6935 14.5584 14.6827 14.03 14.8894 13.4517C15.096 12.8734 15.096 12.3775 15.0335 12.2742C14.9719 12.1709 14.8077 12.1092 14.5594 11.985ZM10.041 18.1542H10.0377C8.56252 18.1543 7.11444 17.7577 5.84521 17.0059L5.54437 16.8275L2.42688 17.6459L3.25854 14.6059L3.06271 14.2942C2.23807 12.9811 1.80183 11.4614 1.80437 9.91087C1.80521 5.3692 5.50104 1.6742 10.0444 1.6742C12.2444 1.6742 14.3127 2.53253 15.8677 4.0892C16.6349 4.85305 17.2431 5.76147 17.6569 6.7619C18.0707 7.76233 18.282 8.8349 18.2785 9.91753C18.276 14.4592 14.581 18.1542 10.041 18.1542ZM17.0519 2.9067C16.1337 1.98247 15.0412 1.24965 13.8378 0.750701C12.6343 0.251754 11.3438 -0.00339687 10.041 3.4148e-05C4.57854 3.4148e-05 0.132708 4.44587 0.130208 9.91003C0.130208 11.6567 0.586042 13.3617 1.45354 14.8642L0.046875 20L5.30104 18.6217C6.75403 19.4133 8.38224 19.8282 10.0369 19.8284H10.041C15.5027 19.8284 19.9494 15.3825 19.9519 9.91753C19.9559 8.61526 19.7017 7.32512 19.2039 6.12173C18.7061 4.91834 17.9747 3.82559 17.0519 2.9067Z"
                      fill="#055391"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_whatsapp">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span
                  className="text-wevets-institutional text-center font-bold"
                  style={{
                    fontFamily: "Peridot PE Variable, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  Falar no WhatsApp
                </span>
              </a>
            </div>
          </div>

          {/* Right Content - Image with Testimonial Card */}
          <div className="relative w-[456px] h-[456px] flex-shrink-0">
            {/* Main Pet Image */}
            <div className="w-[456px] h-[456px] rounded-[19.826px] shadow-[0_20.652px_41.304px_-9.913px_rgba(0,0,0,0.25)] overflow-hidden">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fad3b24e0eebc41a888274aae2381ca13%2F8412a33ad8e8467fa7a946062a3ea320?format=webp"
                alt="Pet feliz"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Testimonial Card Overlay */}
            <div className="absolute left-[-122px] top-[345px] w-[291px] h-[126px] bg-white rounded-[13.217px] shadow-[0_16.522px_20.652px_-4.13px_rgba(0,0,0,0.10),0_6.609px_8.261px_-4.957px_rgba(0,0,0,0.10)] flex flex-col justify-center px-5 py-6 gap-[22px]">
              {/* Quote */}
              <p
                className="text-[#5A7B9C]"
                style={{
                  fontFamily: "Peridot PE Variable, sans-serif",
                  fontSize: "13.217px",
                  lineHeight: "19.826px",
                }}
              >
                "Melhor decisão que tomei para o Thor!"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-[10px]">
                <div className="w-[39.641px] h-[39.641px] rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/8e1d13109a1a9e354decb046f7302ac050d3fe29?width=79"
                    alt="Carlos Santos"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center gap-0">
                  <p
                    className="text-[#1A3768]"
                    style={{
                      fontFamily: "Peridot PE Variable, sans-serif",
                      fontSize: "13.217px",
                      lineHeight: "19.826px",
                    }}
                  >
                    Carlos Santos
                  </p>
                  <p
                    className="text-[#5A7B9C]"
                    style={{
                      fontFamily: "Peridot PE Variable, sans-serif",
                      fontSize: "13.217px",
                      lineHeight: "19.826px",
                    }}
                  >
                    Cliente desde 2023
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-32" />}>
        <Footer />
      </Suspense>

      {/* Floating Action Button - Mobile Only */}
      <div
        ref={floatingButtonRef}
        className="md:hidden fixed left-5 right-5 z-40 transition-all duration-300"
        style={{
          bottom: "20px",
          opacity: showFloatingButton ? 1 : 0,
          pointerEvents: showFloatingButton ? "auto" : "none",
        }}
      >
        <div
          className="flex items-center gap-4 bg-white rounded-3xl border-b border-[#F4F4F4] px-4 py-5"
          style={{
            boxShadow: "0 0 30px 0 rgba(6, 41, 91, 0.25)",
          }}
        >
          {/* Contratar plano Button */}
          <a
            id="btn-mobile-contratar-plano"
            href="https://planowevets.com.br/login"
            onClick={() => {
              analyticsEvents.clickBotaoFlutanteContratar();
            }}
            className="flex-1 flex justify-center items-center h-12 bg-wevets-cyan rounded-xl text-white font-bold hover:bg-opacity-90 transition-all cursor-pointer"
            style={{
              fontFamily: "Peridot PE Variable, sans-serif",
              fontSize: "16px",
              lineHeight: "24px",
              pointerEvents: "auto",
            }}
          >
            Contratar plano
          </a>

          {/* WhatsApp Button */}
          <a
            id="btn-mobile-whatsapp"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              analyticsEvents.clickBotaoFlutanteWhatsappMobile();
              handleWhatsappClick("mobile");
            }}
            className="flex items-center justify-center w-12 h-12 bg-[#25D366] rounded-full hover:bg-[#25D366]/90 transition-all flex-shrink-0 cursor-pointer"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_whatsapp_mobile)">
                <path
                  d="M16.31 13.4243C16.0327 13.2852 14.669 12.615 14.4152 12.5217C14.1603 12.4292 13.9755 12.3836 13.7898 12.6617C13.6059 12.9389 13.0739 13.5633 12.9123 13.7481C12.7509 13.9339 12.5885 13.9563 12.3112 13.8182C12.034 13.6781 11.1398 13.386 10.0804 12.4414C9.2562 11.7059 8.69896 10.7977 8.53751 10.5195C8.37597 10.2423 8.52071 10.092 8.6588 9.95385C8.78393 9.82976 8.93698 9.62999 9.07515 9.46853C9.2142 9.30612 9.25996 9.19035 9.35325 9.00458C9.44566 8.81976 9.39997 8.65831 9.32997 8.51926C9.25996 8.38013 8.70552 7.01458 8.47494 6.4592C8.24908 5.91876 8.02035 5.9925 7.85049 5.98317C7.68902 5.9757 7.5042 5.97384 7.31845 5.97384C7.13364 5.97384 6.83308 6.04291 6.57919 6.32106C6.32531 6.59829 5.60845 7.2694 5.60845 8.63495C5.60845 9.99962 6.60253 11.3185 6.74067 11.5043C6.87975 11.6891 8.69712 14.4912 11.4796 15.6925C12.1414 15.9781 12.6575 16.1489 13.0607 16.2759C13.7254 16.4877 14.3302 16.4579 14.8072 16.386C15.3401 16.3067 16.4481 15.7149 16.6796 15.067C16.911 14.4193 16.911 13.8639 16.841 13.7481C16.772 13.6325 16.5881 13.5633 16.31 13.4243ZM11.249 20.3343H11.2453C9.59295 20.3344 7.97097 19.8901 6.54933 19.0481L6.21237 18.8483L2.72049 19.7649L3.65203 16.3599L3.43269 16.0107C2.50902 14.54 2.02038 12.8378 2.02324 11.1011C2.02418 6.01397 6.16383 1.87525 11.2528 1.87525C13.7169 1.87525 16.0337 2.83666 17.7754 4.58026C18.6348 5.43584 19.3159 6.45335 19.7794 7.57392C20.243 8.69447 20.4796 9.89585 20.4757 11.1085C20.4729 16.1955 16.3342 20.3343 11.249 20.3343ZM19.1018 3.25575C18.0734 2.22054 16.8497 1.39971 15.5017 0.840847C14.1537 0.281986 12.7082 -0.00380479 11.249 3.82487e-05C5.13055 3.82487e-05 0.150828 4.97976 0.148028 11.1001C0.148028 13.0565 0.658601 14.9662 1.63027 16.6492L0.0546875 22.4018L5.93981 20.8579C7.56729 21.7446 9.39101 22.2093 11.2444 22.2095H11.249C17.3666 22.2095 22.3472 17.2298 22.35 11.1085C22.3545 9.64983 22.0698 8.20476 21.5122 6.85687C20.9546 5.50897 20.1354 4.285 19.1018 3.25575Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_whatsapp_mobile">
                  <rect width="22.4017" height="22.4017" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </a>
        </div>
      </div>

      {/* WhatsApp Floating Button - Desktop Only */}
      <a
        id="btn-whatsapp-floating"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          analyticsEvents.clickBotaoFlutanteWhatsappDesktop();
          handleWhatsappClick("desktop");
        }}
        className="hidden md:flex fixed bottom-8 right-8 z-40 items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#25D366]/90 rounded-full shadow-lg transition-all hover:scale-110 cursor-pointer"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 23 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_whatsapp_desktop)">
            <path
              d="M16.31 13.4243C16.0327 13.2852 14.669 12.615 14.4152 12.5217C14.1603 12.4292 13.9755 12.3836 13.7898 12.6617C13.6059 12.9389 13.0739 13.5633 12.9123 13.7481C12.7509 13.9339 12.5885 13.9563 12.3112 13.8182C12.034 13.6781 11.1398 13.386 10.0804 12.4414C9.2562 11.7059 8.69896 10.7977 8.53751 10.5195C8.37597 10.2423 8.52071 10.092 8.6588 9.95385C8.78393 9.82976 8.93698 9.62999 9.07515 9.46853C9.2142 9.30612 9.25996 9.19035 9.35325 9.00458C9.44566 8.81976 9.39997 8.65831 9.32997 8.51926C9.25996 8.38013 8.70552 7.01458 8.47494 6.4592C8.24908 5.91876 8.02035 5.9925 7.85049 5.98317C7.68902 5.9757 7.5042 5.97384 7.31845 5.97384C7.13364 5.97384 6.83308 6.04291 6.57919 6.32106C6.32531 6.59829 5.60845 7.2694 5.60845 8.63495C5.60845 9.99962 6.60253 11.3185 6.74067 11.5043C6.87975 11.6891 8.69712 14.4912 11.4796 15.6925C12.1414 15.9781 12.6575 16.1489 13.0607 16.2759C13.7254 16.4877 14.3302 16.4579 14.8072 16.386C15.3401 16.3067 16.4481 15.7149 16.6796 15.067C16.911 14.4193 16.911 13.8639 16.841 13.7481C16.772 13.6325 16.5881 13.5633 16.31 13.4243ZM11.249 20.3343H11.2453C9.59295 20.3344 7.97097 19.8901 6.54933 19.0481L6.21237 18.8483L2.72049 19.7649L3.65203 16.3599L3.43269 16.0107C2.50902 14.54 2.02038 12.8378 2.02324 11.1011C2.02418 6.01397 6.16383 1.87525 11.2528 1.87525C13.7169 1.87525 16.0337 2.83666 17.7754 4.58026C18.6348 5.43584 19.3159 6.45335 19.7794 7.57392C20.243 8.69447 20.4796 9.89585 20.4757 11.1085C20.4729 16.1955 16.3342 20.3343 11.249 20.3343ZM19.1..."
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_whatsapp_desktop">
              <rect width="22.4017" height="22.4017" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </a>
    </div>
  );
}
