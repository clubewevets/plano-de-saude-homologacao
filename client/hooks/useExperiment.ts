import { useEffect, useState } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import {
  Experiment,
  ExperimentClient,
} from "@amplitude/experiment-js-client";

const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;

let experimentClient: ExperimentClient | null = null;

/**
 * Initialize Experiment client with Amplitude Analytics
 */
const initializeExperimentClient = async () => {
  if (experimentClient) {
    return experimentClient;
  }

  if (!AMPLITUDE_API_KEY) {
    console.warn("❌ AMPLITUDE_API_KEY não configurada para experiments");
    return null;
  }

  try {
    experimentClient = Experiment.initialize(AMPLITUDE_API_KEY, {
      exposureTrackingProvider: amplitude,
    });

    await experimentClient.fetch({
      user: {
        user_id: amplitude.getUserId() || "anonymous",
        device_id: amplitude.getDeviceId() || undefined,
      },
    });

    console.log("✅ Experiment client inicializado com sucesso!");
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
        const variantObj = client.variant(flagKey);
        const variantValue = variantObj?.value || "control";

        console.log(`📊 Variant para "${flagKey}": ${variantValue}`);
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
