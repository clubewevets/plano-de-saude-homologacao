import { useEffect } from "react";
import { trackEvent } from "./useAmplitude";

/**
 * Hook para capturar eventos nativos de exposure do Builder.io
 * e enviá-los ao Amplitude com flag_key e variant
 */
export const useBuilderExposure = () => {
  useEffect(() => {
    console.log("🟦 useBuilderExposure inicializado");

    // Monitorar o objeto window para o Builder
    const checkBuilderExposure = setInterval(() => {
      try {
        // Verificar se o Builder está disponível
        const builder = (window as any).builderExposures;
        
        if (builder) {
          console.log("✅ Builder.io detectado, configurando exposure tracking");
          clearInterval(checkBuilderExposure);
          
          // Interceptar exposures do Builder
          setupBuilderExposureListener();
        }
      } catch (error) {
        console.debug("Builder ainda não carregado");
      }
    }, 500);

    return () => clearInterval(checkBuilderExposure);
  }, []);
};

/**
 * Configura listener para eventos de exposure do Builder
 */
function setupBuilderExposureListener() {
  // Método 1: Espionar por mudanças no localStorage (Builder salva alguns dados lá)
  const originalSetItem = Storage.prototype.setItem;
  
  Storage.prototype.setItem = function(key: string, value: string) {
    if (key.includes("builder") || key.includes("exposure")) {
      try {
        const data = JSON.parse(value);
        if (data.experimentId || data.flagKey) {
          handleBuilderExposure(data);
        }
      } catch (e) {
        // Não é JSON, ignorar
      }
    }
    return originalSetItem.call(this, key, value);
  };

  // Método 2: Monitorar console para capturar os logs do Builder
  const originalLog = console.log;
  console.log = function(...args: any[]) {
    const message = args.map((a) => 
      typeof a === "string" ? a : JSON.stringify(a)
    ).join(" ");

    // Capturar logs de exposure
    if (
      message.includes("exposure") ||
      message.includes("Enviando exposure") ||
      message.includes("teste-a-b")
    ) {
      console.debug("📤 Log de exposure detectado:", message);
      parseAndTrackExposure(message, args);
    }

    return originalLog.apply(console, args);
  };

  // Método 3: Usar MutationObserver para detectar mudanças no DOM/atributos
  setupDOMObserver();

  // Método 4: Periodicamente verificar se há dados de experiment no window
  checkWindowForBuilderData();
}

/**
 * Extrai dados de exposure dos logs e envia ao Amplitude
 */
function parseAndTrackExposure(message: string, args: any[]) {
  try {
    // Procurar por padrões conhecidos
    const experimentMatch = message.match(/teste-a-b-([a-zA-Z0-9-]+)/);
    const keyMatch = message.match(/key["\s:]*["\']([^"\']+)/i);
    const variantMatch = message.match(/variant["\s:]*["\']([^"\']+)/i);

    let flagKey = experimentMatch?.[1] || null;
    let variant = variantMatch?.[1] || null;

    // Se não encontrou, procurar nos args
    if (!flagKey || !variant) {
      for (const arg of args) {
        if (typeof arg === "object" && arg !== null) {
          if (arg.key) variant = arg.key;
          if (arg.experimentId) flagKey = arg.experimentId;
          if (arg.flagKey) flagKey = arg.flagKey;
          if (arg.name) flagKey = arg.name;
        }
      }
    }

    // Se encontrou dados suficientes, enviar ao Amplitude
    if (flagKey || variant) {
      console.log(
        "🎯 Enviando exposure ao Amplitude:",
        { flagKey, variant }
      );

      trackEvent("experiment_exposure", {
        flag_key: flagKey || "unknown",
        variant: variant || "unknown",
        source: "builder_io",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Erro ao parsear exposure:", error);
  }
}

/**
 * Observa mudanças no DOM para detectar elementos relacionados a experiments
 */
function setupDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const element = mutation.target as HTMLElement;

        // Procurar por atributos que indiquem experiment/variant
        const experimentAttr = element.getAttribute("data-experiment");
        const variantAttr = element.getAttribute("data-variant");
        const builderAttr = element.getAttribute("data-builder");

        if (experimentAttr || variantAttr || builderAttr) {
          console.log("🏷️ Elemento com experiment detectado:", {
            experimentAttr,
            variantAttr,
            builderAttr,
          });

          trackEvent("experiment_exposure", {
            flag_key: experimentAttr || builderAttr || "unknown",
            variant: variantAttr || "unknown",
            source: "dom_attribute",
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-experiment", "data-variant", "data-builder"],
  });
}

/**
 * Verifica periodicamente se há dados de experiment no objeto window
 */
function checkWindowForBuilderData() {
  const checkInterval = setInterval(() => {
    try {
      // Procurar por objetos conhecidos do Builder no window
      const win = window as any;

      if (win.__BUILDER_CONTEXT__) {
        const context = win.__BUILDER_CONTEXT__;
        if (context.experimentKey && context.variant) {
          trackEvent("experiment_exposure", {
            flag_key: context.experimentKey,
            variant: context.variant,
            source: "window_context",
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Procurar em qualquer propriedade que tenha "experiment" ou "variant"
      Object.keys(win).forEach((key) => {
        if (
          (key.toLowerCase().includes("experiment") ||
            key.toLowerCase().includes("variant")) &&
          typeof win[key] === "object"
        ) {
          console.debug(`Found builder data in window.${key}:`, win[key]);
        }
      });
    } catch (error) {
      // Ignorar erros de segurança
    }
  }, 2000);

  return () => clearInterval(checkInterval);
}

/**
 * Processa dados de exposure capturados
 */
function handleBuilderExposure(data: any) {
  console.log("🎬 Processando exposure do Builder:", data);

  const flagKey = data.flagKey || data.experimentId || data.name;
  const variant = data.variant || data.variantId || data.value;

  if (flagKey || variant) {
    trackEvent("experiment_exposure", {
      flag_key: flagKey || "unknown",
      variant: variant || "unknown",
      source: "builder_storage",
      timestamp: new Date().toISOString(),
    });
  }
}
