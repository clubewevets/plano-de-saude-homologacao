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
  }

  return deviceId;
};

let storedDeviceId: string | null = null;
let variantCache: {
  "teste-a-b-banner-50-100-off"?: string;
} = {};

export const useAmplitude = () => {
  useEffect(() => {
    if (!AMPLITUDE_API_KEY) {
      return;
    }

    const initAmplitude = async () => {
      try {
        // Gerar ou recuperar Device ID
        storedDeviceId = generateDeviceId();

        await amplitude.init(AMPLITUDE_API_KEY, {
          deviceId: storedDeviceId,
          defaultTracking: {
            pageViews: false,
            formInteractions: true,
            fileDownloads: true,
          },
          sessionReplayTracking: false,
        });

        // Inicializar Amplitude Experiment
        try {
          console.log("🔴 Inicializando Experiment com:", {
            deploymentKey: AMPLITUDE_DEPLOYMENT_KEY,
            deviceId: storedDeviceId,
          });

          experiment = Experiment.initialize(
            AMPLITUDE_DEPLOYMENT_KEY,
            storedDeviceId
          );

          console.log("🟢 Experiment inicializado:", experiment);

          // Pré-carregar feature flags
          if (
            experiment &&
            typeof experiment.fetch === "function"
          ) {
            try {
              console.log("🔵 Chamando experiment.fetch()");
              await experiment.fetch();
              console.log("🟢 Feature flags carregadas com sucesso");

              // Armazenar variante em cache assim que carregar
              const variant = experiment!.variant(
                "teste-a-b-banner-50-100-off"
              );
              console.log("🔵 Variante obtida:", variant);

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
                  console.log("✅ Variante em cache:", variantName);
                }
              }
            } catch (fetchError) {
              console.error("❌ Erro ao fazer fetch:", fetchError);
            }
          } else {
            console.error("❌ Experiment não tem método fetch");
          }
        } catch (expError) {
          console.error("❌ Erro ao inicializar Experiment:", expError);
        }

        amplitude.track("user_properties", {
          custom_path: "/landing-page/plano",
        });
      } catch (error) {
        console.error("Erro ao inicializar Amplitude:", error);
      }
    };

    initAmplitude();
  }, []);
};

export const trackEvent = (
  eventName: string,
  eventProperties?: Record<string, any>,
) => {
  // Construir propriedades do evento com parâmetros automáticos
  const enrichedProperties = {
    custom_path: "/landing-page/plano",
    device_category: getDeviceCategory(),
    event: eventName,
    event_timestamp: new Date().toISOString(),
    event_type: eventName,
    operating_system: getOperatingSystem(),
    ...eventProperties,
  };

  if (!AMPLITUDE_API_KEY) {
    return;
  }

  try {
    amplitude.track(eventName, enrichedProperties);
    amplitude.flush();
  } catch (error) {
    console.error(`Erro ao rastrear ${eventName}:`, error);
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
    if (storedDeviceId) {
      return storedDeviceId;
    }

    const deviceId = generateDeviceId();
    return deviceId;
  } catch (error) {
    console.error("Erro ao capturar Device ID:", error);
    return null;
  }
};

export const addDeviceIdToUrl = (baseUrl: string): string => {
  const deviceId = getDeviceId();

  if (!deviceId) {
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  const urlWithDeviceId = `${baseUrl}${separator}amp_device_id=${encodeURIComponent(deviceId)}`;
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
  const flagKey = "teste-a-b-banner-50-100-off";

  // Use native Amplitude Experiment exposure tracking
  if (experiment && typeof experiment.exposure === "function") {
    try {
      experiment.exposure(flagKey);
    } catch (error) {
      console.error("Erro ao rastrear exposure:", error);
    }
  }
};
