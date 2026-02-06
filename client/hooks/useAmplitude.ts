import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import * as Experiment from "@amplitude/experiment-js-client";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY = import.meta.env
  .VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY;

let experimentInstance: typeof Experiment | null = null;
let heroBannerVariantCache: string | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

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

        amplitude.track("user_properties", {
          custom_path: "/landing-page/plano",
        });

        // Initialize Amplitude Experiment SDK linked to Analytics
        // Must be called AFTER amplitude.init()
        if (AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY) {
          try {
            console.log(
              "Initializing Amplitude Experiment with deployment key:",
              AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY,
            );

            // Initialize returns the instance directly (not a promise)
            experimentInstance =
              Experiment.initializeWithAmplitudeAnalytics(
                AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY,
              );

            console.log("Experiment instance created, fetching variants...");

            // Fetch feature flags - this returns a promise
            await experimentInstance.fetch();

            console.log("Variants fetched successfully");

            // Log available variants
            const variant = experimentInstance.variant(
              "teste-a-b-banner-50-100-off",
            );
            console.log(
              "Hero banner variant assigned:",
              variant ? variant.key : "null",
            );
          } catch (error) {
            console.error("Erro ao inicializar Amplitude Experiment:", error);
          }
        } else {
          console.warn(
            "VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY not set in environment",
          );
        }
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

export const getHeroBannerVariant = async (): Promise<string> => {
  // Return cached variant if available
  if (heroBannerVariantCache) {
    console.log("Returning cached variant:", heroBannerVariantCache);
    return heroBannerVariantCache;
  }

  // Return default if experiment not initialized
  if (!experimentInstance) {
    console.warn(
      "Experiment instance not initialized, returning default variant",
    );
    return "control_50off";
  }

  try {
    // Get variant from experiment SDK
    console.log("Fetching variant for: teste-a-b-banner-50-100-off");
    const variant = experimentInstance.variant(
      "teste-a-b-banner-50-100-off",
    );

    console.log("Variant result:", variant);

    if (variant && variant.key) {
      heroBannerVariantCache = variant.key;
      console.log("Banner variant assigned:", variant.key);
      return variant.key;
    } else {
      console.warn("No variant key found in response");
    }
  } catch (error) {
    console.error("Erro ao obter variante do banner:", error);
  }

  console.log("Returning default variant: control_50off");
  return "control_50off";
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
