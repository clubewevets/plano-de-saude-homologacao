import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-browser";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

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

export const useAmplitude = () => {
  useEffect(() => {
    console.log("🟡 useAmplitude hook iniciado");

    if (!AMPLITUDE_API_KEY) {
      console.warn("❌ AMPLITUDE_API_KEY não configurada");
      return;
    }

    const initAmplitude = async () => {
      try {
        console.log("🔄 Inicializando Amplitude...");

        // Gerar ou recuperar Device ID
        storedDeviceId = generateDeviceId();

        await amplitude.init(AMPLITUDE_API_KEY, {
          deviceId: storedDeviceId, // Usar o Device ID gerado
          defaultTracking: {
            pageViews: false,
            formInteractions: true,
            fileDownloads: true,
          },
          sessionReplayTracking: false,
        });

        // Configurar custom path como propriedade do usuário via um evento especial
        // Usando track com uma propriedade que será associada ao usuário
        amplitude.track("user_properties", {
          custom_path: "/landing-page/plano",
        });

        console.log("✅ Amplitude inicializado com sucesso!");
        console.log("📍 Device ID em uso:", storedDeviceId);
        console.log("🛣️ Custom path configurado: /landing-page/plano");
      } catch (error) {
        console.error("❌ Erro na inicialização do Amplitude:", error);
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

  console.log(`📊 trackEvent: ${eventName}`, enrichedProperties);

  if (!AMPLITUDE_API_KEY) {
    console.warn("❌ Sem API key para rastrear evento");
    return;
  }

  try {
    amplitude.track(eventName, enrichedProperties);
    console.log(`✓ Evento rastreado: ${eventName}`);

    // Flush immediately to ensure event is sent
    amplitude.flush();
    console.log(`✓ Amplitude flush chamado para garantir envio`);
  } catch (error) {
    console.error(`❌ Erro ao rastrear ${eventName}:`, error);
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
