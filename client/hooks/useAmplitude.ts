import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import { Experiment } from "@amplitude/experiment-js-client";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const AMPLITUDE_DEPLOYMENT_KEY = "client-TcXHfrz7NjtkopltLEIOekKyEV2kssqh";

let experiment: Experiment | null = null;

// Detectar categoria do dispositivo (mobile ou desktop)
const getDeviceCategory = (): string => {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  return isMobile ? "mobile" : "desktop";
};

// Detectar sistema operacional
const getOperatingSystem = (): string => {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return "Windows";
  if (userAgent.includes("mac")) return "macOS";
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) return "iOS";
  if (userAgent.includes("android")) return "Android";
  if (userAgent.includes("linux")) return "Linux";

  return "Unknown";
};

// Gerar ou recuperar Device ID local
const generateDeviceId = (): string => {
  const storageKey = "amp_device_id";

  // Tentar recuperar do localStorage
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    // Gerar novo Device ID se não existir
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
    console.log("✨ Novo Device ID gerado:", deviceId);
  } else {
    console.log("♻️ Device ID recuperado do localStorage:", deviceId);
  }

  return deviceId;
};

let storedDeviceId: string | null = null;
let variantCache: {
  "teste-a-b-banner-50-100-off"?: string;
} = {};

export const useAmplitude = () => {
  useEffect(() => {
    console.log("\n🟡 ===== useAmplitude HOOK INICIADO =====");
    console.log(`🔑 AMPLITUDE_API_KEY: ${AMPLITUDE_API_KEY || "NÃO CONFIGURADA"}`);

    if (!AMPLITUDE_API_KEY) {
      console.warn("❌ AMPLITUDE_API_KEY não configurada");
      console.log("🟡 ===== useAmplitude FIM (SEM API KEY) =====\n");
      return;
    }

    const initAmplitude = async () => {
      try {
        console.log("\n🟣 ===== INICIALIZANDO AMPLITUDE =====");
        console.log(`🔑 API Key: ${AMPLITUDE_API_KEY}`);

        // Gerar ou recuperar Device ID
        storedDeviceId = generateDeviceId();
        console.log(`📱 Device ID gerado/recuperado: ${storedDeviceId}`);

        console.log("🔄 Chamando amplitude.init()...");
        await amplitude.init(AMPLITUDE_API_KEY, {
          deviceId: storedDeviceId, // Usar o Device ID gerado
          defaultTracking: {
            pageViews: false,
            formInteractions: true,
            fileDownloads: true,
          },
          sessionReplayTracking: false,
        });

        console.log("✅ amplitude.init() completado");

        // Inicializar Amplitude Experiment
        try {
          experiment = Experiment.initialize(
            AMPLITUDE_DEPLOYMENT_KEY,
            storedDeviceId
          );

          // Pré-carregar feature flags
          if (
            experiment &&
            typeof experiment.fetch === "function"
          ) {
            try {
              await experiment.fetch();

              // Armazenar variante em cache assim que carregar
              const variant = experiment!.variant(
                "teste-a-b-banner-50-100-off"
              );
              if (variant) {
                let variantName: any = variant;
                if (
                  variant &&
                  typeof variant === "object" &&
                  variant.key
                ) {
                  variantName = variant.key;
                }
                if (
                  variantName === "control_50off" ||
                  variantName === "treatment_100off"
                ) {
                  variantCache["teste-a-b-banner-50-100-off"] = variantName;
                }
              }
            } catch (fetchError) {
              // Silencioso se falhar
            }
          }
        } catch (expError) {
          // Silencioso se falhar
        }

        // Configurar custom path como propriedade do usuário via um evento especial
        // Usando track com uma propriedade que será associada ao usuário
        console.log("🔄 Rastreando user_properties...");
        amplitude.track("user_properties", {
          custom_path: "/landing-page/plano",
        });

        console.log("✅ Amplitude inicializado com sucesso!");
        console.log("📍 Device ID em uso:", storedDeviceId);
        console.log("🛣️ Custom path configurado: /landing-page/plano");
        console.log("🟣 ===== AMPLITUDE INICIALIZADO COM SUCESSO =====\n");
      } catch (error) {
        console.error("❌ Erro na inicialização do Amplitude:", error);
        console.log("🟣 ===== ERRO NA INICIALIZAÇÃO =====\n");
      }
    };

    console.log("🔄 Chamando initAmplitude()...");
    initAmplitude();
    console.log("🟡 ===== useAmplitude FIM =====\n");
  }, []);
};

export const trackEvent = (
  eventName: string,
  eventProperties?: Record<string, any>,
) => {
  console.log(`\n🔴 ===== trackEvent INÍCIO =====`);
  console.log(`📌 Nome do evento: ${eventName}`);
  console.log(`📌 AMPLITUDE_API_KEY configurada: ${!!AMPLITUDE_API_KEY}`);

  // Construir propriedades do evento com parâmetros automáticos
  const enrichedProperties = {
    // Parâmetros obrigatórios
    custom_path: "/landing-page/plano",
    device_category: getDeviceCategory(),
    event: eventName,
    event_timestamp: new Date().toISOString(),
    event_type: eventName,
    operating_system: getOperatingSystem(),

    // Adicionar propriedades customizadas passadas
    ...eventProperties,
  };

  console.log(`📊 Propriedades enriquecidas:`, enrichedProperties);

  if (!AMPLITUDE_API_KEY) {
    console.warn("❌ Sem API key para rastrear evento");
    console.log(`🔴 ===== trackEvent FIM (SEM API KEY) =====\n`);
    return;
  }

  try {
    console.log(`🚀 Chamando amplitude.track()...`);
    amplitude.track(eventName, enrichedProperties);
    console.log(`✓ amplitude.track() executado com sucesso`);

    // Flush immediately to ensure event is sent
    console.log(`🚀 Chamando amplitude.flush()...`);
    amplitude.flush();
    console.log(`✓ amplitude.flush() executado com sucesso`);
    console.log(`🔴 ===== trackEvent FIM (SUCESSO) =====\n`);
  } catch (error) {
    console.error(`❌ Erro ao rastrear ${eventName}:`, error);
    console.log(`🔴 ===== trackEvent FIM (ERRO) =====\n`);
  }
};

export const setUserId = (userId: string) => {
  if (!AMPLITUDE_API_KEY) {
    return;
  }

  amplitude.setUserId(userId);
};

export const setUserProperties = (properties: Record<string, any>) => {
  if (!AMPLITUDE_API_KEY) {
    return;
  }

  // Enviar como um evento de propriedades do usuário
  amplitude.track("user_properties", properties);
};

export const getDeviceId = (): string | null => {
  try {
    console.log("🔍 Tentando capturar Device ID...");

    // Se Amplitude já foi inicializado, usar o Device ID armazenado
    if (storedDeviceId) {
      console.log("✓ Device ID encontrado:", storedDeviceId);
      return storedDeviceId;
    }

    // Tentar gerar se ainda não foi
    const deviceId = generateDeviceId();
    console.log("✓ Device ID (gerado):", deviceId);
    return deviceId;
  } catch (error) {
    console.error("❌ Erro ao capturar Device ID:", error);
    return null;
  }
};

export const addDeviceIdToUrl = (baseUrl: string): string => {
  console.log("🔵 addDeviceIdToUrl chamado");

  const deviceId = getDeviceId();

  if (!deviceId) {
    console.warn("⚠️ Device ID não encontrado, usando URL sem parâmetro");
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  const urlWithDeviceId = `${baseUrl}${separator}amp_device_id=${encodeURIComponent(deviceId)}`;
  console.log("✅ URL com Device ID:", urlWithDeviceId);
  return urlWithDeviceId;
};

export const trackScreenView = (
  screenName?: string,
  additionalProps?: Record<string, any>,
) => {
  if (typeof window === "undefined") {
    console.warn("⚠️ trackScreenView chamado em ambiente SSR");
    return;
  }

  // Coletar informações comprehensive da página e do navegador
  const screenViewProps = {
    // Informações de página
    screen_name: screenName || document.title || "landing-page",
    page_title: document.title,
    page_url: window.location.href,
    page_pathname: window.location.pathname,
    page_hostname: window.location.hostname,
    page_referrer: document.referrer || "direct",

    // Informações de viewport e tela
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    device_pixel_ratio: window.devicePixelRatio,

    // Informações de dispositivo
    device_category: getDeviceCategory(),
    operating_system: getOperatingSystem(),
    user_agent: navigator.userAgent,

    // Informações de navegador
    language: navigator.language,
    languages: navigator.languages?.join(",") || navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),

    // Informações de memória e performance (se disponível)
    ...(navigator.deviceMemory && { device_memory_gb: navigator.deviceMemory }),
    ...(navigator.hardwareConcurrency && {
      cpu_cores: navigator.hardwareConcurrency,
    }),

    // Informações de conexão (se disponível)
    ...((navigator as any).connection && {
      connection_type: (navigator as any).connection.effectiveType,
      connection_downlink: (navigator as any).connection.downlink,
      connection_rtt: (navigator as any).connection.rtt,
      connection_save_data: (navigator as any).connection.saveData,
    }),

    // Timestamp do evento
    event_timestamp: new Date().toISOString(),
    timestamp_unix: Date.now(),

    // Informações customizadas adicionais
    ...additionalProps,
  };

  console.log("📊 trackScreenView - Informações Coletadas:", screenViewProps);

  trackEvent("screen_view", screenViewProps);
};

// A/B Testing - Get variant from Amplitude Experiment
export const getHeroBannerVariant = async (): Promise<
  "control_50off" | "treatment_100off"
> => {
  console.log("\n🔵 ===== getHeroBannerVariant() INICIADO =====");

  if (typeof window === "undefined") {
    console.log("⚠️ SSR environment detected, retornando control_50off");
    return "control_50off";
  }

  try {
    const featureFlagName = "teste-a-b-banner-50-100-off";

    // Primeiro, tentar obter do cache
    const cachedVariant = variantCache[featureFlagName];
    if (cachedVariant) {
      return cachedVariant as "control_50off" | "treatment_100off";
    }

    // Delay mínimo para garantir que o SDK carregou
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!experiment) {
      return "control_50off";
    }

    let variant: any;
    try {
      variant = experiment.variant(featureFlagName);
    } catch (variantError) {
      return "control_50off";
    }

    // Se for um objeto, pega a key
    let variantName: any = variant;
    if (variant && typeof variant === "object" && variant.key) {
      variantName = variant.key;
    }

    // Validar variante
    if (
      variantName !== "control_50off" &&
      variantName !== "treatment_100off"
    ) {
      return "control_50off";
    }

    // Armazenar em cache
    variantCache[featureFlagName] = variantName;
    return variantName as "control_50off" | "treatment_100off";
  } catch (error) {
    return "control_50off";
  }
};

// Track when user is exposed to variant from feature flag
export const trackHeroBannerVariant = (variant: string) => {
  const eventData = {
    feature_flag_name: "teste-a-b-banner-50-100-off",
    variant_name: variant,
    variant_type:
      variant === "treatment_100off"
        ? "blank_hero"
        : "hero_with_content",
  };

  trackEvent("hero_banner_variant_exposure", eventData);
};
