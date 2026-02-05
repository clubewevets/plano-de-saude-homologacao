import { useEffect, useState } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import {
  Experiment,
  ExperimentClient,
} from "@amplitude/experiment-js-client";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const AMPLITUDE_EXPERIMENT_KEY = import.meta.env.VITE_AMPLITUDE_EXPERIMENT_KEY;

let experimentClient: ExperimentClient | null = null;

/**
 * Initialize Experiment client with Amplitude Analytics
 */
const initializeExperimentClient = async () => {
  if (experimentClient) {
    return experimentClient;
  }

  if (!AMPLITUDE_EXPERIMENT_KEY) {
    console.warn("❌ AMPLITUDE_EXPERIMENT_KEY não configurada");
    console.warn("❌ Adicione VITE_AMPLITUDE_EXPERIMENT_KEY ao .env.local");
    return null;
  }

  try {
    console.log("🔄 Inicializando Experiment client...");

    if (!AMPLITUDE_EXPERIMENT_KEY) {
      console.error("❌ AMPLITUDE_EXPERIMENT_KEY não configurada!");
      console.error("❌ Adicione VITE_AMPLITUDE_EXPERIMENT_KEY ao .env.local");
      return null;
    }

    console.log("📍 Analytics API Key:", AMPLITUDE_API_KEY?.substring(0, 10) + "...");
    console.log("📍 Experiment Deployment Key:", AMPLITUDE_EXPERIMENT_KEY.substring(0, 10) + "...");

    // Aguardar um pouco para garantir que Amplitude SDK foi inicializado
    await new Promise(resolve => setTimeout(resolve, 500));

    experimentClient = Experiment.initialize(AMPLITUDE_EXPERIMENT_KEY, {
      exposureTrackingProvider: amplitude,
    });

    // Tentar obter IDs do Amplitude, com fallback para localStorage
    let userId = amplitude.getUserId();
    let deviceId = amplitude.getDeviceId();

    // Se não conseguir do Amplitude, tentar do localStorage
    if (!deviceId) {
      const storageKey = "amp_device_id";
      deviceId = localStorage.getItem(storageKey) || undefined;
      console.warn("⚠️ Device ID não encontrado no Amplitude, usando localStorage:", deviceId);
    }

    console.log("📍 User ID:", userId);
    console.log("📍 Device ID:", deviceId);

    // Fazer fetch com retry
    let maxRetries = 3;
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 Tentativa ${i + 1}/${maxRetries} de fazer fetch...`);
        const fetchResult = await experimentClient.fetch({
          user: {
            user_id: userId || "anonymous",
            device_id: deviceId || undefined,
          },
        });
        console.log("✅ Fetch realizado com sucesso!");
        console.log("📋 Fetch result:", fetchResult);
        console.log("🚩 Flags após fetch:", experimentClient.flags);
        break;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Tentativa ${i + 1}/${maxRetries} falhou:`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (lastError && maxRetries > 0) {
      console.error("❌ Erro final ao fazer fetch:", lastError);
    }

    console.log("✅ Experiment client inicializado com sucesso!");
    console.log("📍 Experiment client flags:", experimentClient.flags);
    console.log("📍 Todas as features:", Object.keys(experimentClient.flags || {}));

    // Verificação adicional
    if (!experimentClient.flags || Object.keys(experimentClient.flags).length === 0) {
      console.warn("⚠️ AVISO: Nenhuma flag foi retornada pelo Amplitude!");
      console.warn("⚠️ Possíveis causas:");
      console.warn("  1. A chave de deployment está incorreta");
      console.warn("  2. Nenhuma flag foi criada ou está ativa no projeto");
      console.warn("  3. O projeto no Amplitude é diferente da chave");
      console.warn("  4. A flag precisa de targeting que não corresponde ao seu usuário");
    }

    return experimentClient;
  } catch (error) {
    console.error("❌ Erro ao inicializar Experiment client:", error);
    return null;
  }
};

/**
 * Hook to use feature flags from Amplitude Experiments
 * @param flagKey - The feature flag key
 * @param defaultValue - Default value if flag not found
 * @returns The variant value from the feature flag
 */
export const useExperiment = (
  flagKey: string,
  defaultValue: string = "control",
): string => {
  const [variant, setVariant] = useState<string>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAndFetchVariant = async () => {
      try {
        const client = await initializeExperimentClient();

        if (!client) {
          console.warn(`⚠️ Experiment client não disponível para flag: ${flagKey}`);
          setVariant(defaultValue);
          setLoading(false);
          return;
        }

        // Get the variant for the feature flag
        const variant = client.variant(flagKey)?.value || defaultValue;

        console.log(`📊 Variant para "${flagKey}": ${variant}`);
        setVariant(variant);
      } catch (error) {
        console.error(
          `❌ Erro ao buscar variant para flag "${flagKey}":`,
          error,
        );
        setVariant(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchVariant();
  }, [flagKey, defaultValue]);

  return variant;
};

/**
 * Hook to check if a feature flag is enabled
 * @param flagKey - The feature flag key
 * @param enabledVariant - The variant value that means enabled (default: "on")
 * @returns Boolean indicating if feature is enabled
 */
export const useFeatureFlag = (
  flagKey: string,
  enabledVariant: string = "on",
): boolean => {
  const variant = useExperiment(flagKey, "off");
  return variant === enabledVariant;
};

/**
 * Hook to get experiment variant for A/B testing
 * @param flagKey - The feature flag key
 * @returns Object with variant and loading state
 */
export const useExperimentVariant = (
  flagKey: string,
): { variant: string; loading: boolean } => {
  const [variant, setVariant] = useState<string>("control");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAndFetchVariant = async () => {
      try {
        const client = await initializeExperimentClient();

        if (!client) {
          console.warn(`⚠️ Experiment client não disponível para flag: ${flagKey}`);
          setLoading(false);
          return;
        }

        // Get the variant for the feature flag
        console.log(`🔍 Buscando variante para flag: "${flagKey}"`);
        const allFlags = client.flags || {};
        const flagKeys = Object.keys(allFlags);

        console.log(`📊 Todas as flags disponíveis:`, flagKeys);
        console.log(`📊 Listando cada flag disponível:`);
        flagKeys.forEach((key) => {
          console.log(`  - "${key}":`, allFlags[key]);
        });

        const variantObj = client.variant(flagKey);
        const variantValue = variantObj?.value || "control";

        console.log(`📊 Variant para "${flagKey}": ${variantValue}`);
        console.log(`📊 Variant objeto completo:`, variantObj);
        console.log(`📊 Raw flag object:`, allFlags[flagKey]);

        if (!variantObj || !variantObj.value) {
          console.warn(
            `⚠️ Flag "${flagKey}" não encontrada ou sem valor. Retornando padrão "control"`
          );
          console.warn(
            `⚠️ Verifique se a feature flag foi criada no Amplitude e está ativa`
          );

          // Log detalhado de debug
          console.error("🐛 DEBUG CRÍTICO:");
          console.error("  - Flags count:", flagKeys.length);
          console.error("  - Flags encontradas:", flagKeys);
          console.error("  - Flag procurada:", flagKey);
          console.error("  - PROBLEMA: Flag procurada NÃO está na lista!");
          console.error("  - Possíveis soluções:");
          console.error("    1. Usar um dos nomes acima");
          console.error("    2. Verificar o nome exato no painel do Amplitude");
          console.error("    3. A flag pode estar em draft ou arquivada");
        }

        setVariant(variantValue);
      } catch (error) {
        console.error(
          `❌ Erro ao buscar variant para flag "${flagKey}":`,
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchVariant();
  }, [flagKey]);

  return { variant, loading };
};
