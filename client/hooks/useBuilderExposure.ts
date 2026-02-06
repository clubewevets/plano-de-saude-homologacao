import { useEffect } from "react";
import { trackEvent } from "./useAmplitude";

/**
 * Hook para capturar eventos nativos de exposure do Builder.io
 * e enviá-los ao Amplitude com flag_key e variant
 */
export const useBuilderExposure = () => {
  useEffect(() => {
    console.log("🟦 useBuilderExposure inicializado");

    const cleanups: (() => void)[] = [];

    // Configurar todos os listeners
    const setupListeners = () => {
      // Método 1: Monitorar Storage
      cleanups.push(setupStorageListener());

      // Método 2: Monitorar DOM
      cleanups.push(setupDOMObserver());

      // Método 3: Verificar window periodicamente
      cleanups.push(checkWindowForBuilderData());
    };

    setupListeners();

    // Cleanup
    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);
};

/**
 * Monitora mudanças no localStorage
 */
function setupStorageListener(): () => void {
  const originalSetItem = Storage.prototype.setItem;
  let isTracked = false;

  Storage.prototype.setItem = function (key: string, value: string) {
    if (
      (key.includes("builder") || key.includes("exposure")) &&
      !isTracked
    ) {
      try {
        const data = JSON.parse(value);
        if (data.experimentId || data.flagKey || data.variant) {
          isTracked = true;
          handleBuilderExposure(data);
          isTracked = false;
        }
      } catch (e) {
        // Não é JSON, ignorar
      }
    }
    return originalSetItem.call(this, key, value);
  };

  return () => {
    Storage.prototype.setItem = originalSetItem;
  };
}

/**
 * Observa mudanças no DOM para detectar elementos relacionados a experiments
 */
function setupDOMObserver(): () => void {
  let observer: MutationObserver | null = null;
  const trackedElements = new Set<HTMLElement>();

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        const element = mutation.target as HTMLElement;

        // Evitar tracking duplicado
        if (trackedElements.has(element)) {
          return;
        }

        // Procurar por atributos que indiquem experiment/variant
        const experimentAttr = element.getAttribute("data-experiment");
        const variantAttr = element.getAttribute("data-variant");
        const builderAttr = element.getAttribute("data-builder");

        if (experimentAttr || variantAttr || builderAttr) {
          trackedElements.add(element);
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

  return () => {
    if (observer) {
      observer.disconnect();
    }
  };
}

/**
 * Verifica periodicamente se há dados de experiment no objeto window
 */
function checkWindowForBuilderData(): () => void {
  const trackedExperiments = new Set<string>();

  const checkInterval = setInterval(() => {
    try {
      const win = window as any;

      // Verificar __BUILDER_CONTEXT__
      if (win.__BUILDER_CONTEXT__) {
        const context = win.__BUILDER_CONTEXT__;
        if (context.experimentKey && context.variant) {
          const key = `${context.experimentKey}-${context.variant}`;
          if (!trackedExperiments.has(key)) {
            trackedExperiments.add(key);
            trackEvent("experiment_exposure", {
              flag_key: context.experimentKey,
              variant: context.variant,
              source: "window_context",
              timestamp: new Date().toISOString(),
            });
          }
        }
      }

      // Verificar se há dados em builderExposures ou similar
      if (win.builderExposures) {
        console.log("📦 Builder exposures encontrado:", win.builderExposures);
        handleBuilderExposure(win.builderExposures);
      }
    } catch (error) {
      // Ignorar erros de segurança
    }
  }, 3000);

  return () => clearInterval(checkInterval);
}

/**
 * Processa dados de exposure capturados
 */
function handleBuilderExposure(data: any) {
  console.log("🎬 Processando exposure do Builder:", data);

  const flagKey = data.flagKey || data.experimentId || data.name || data.key;
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
