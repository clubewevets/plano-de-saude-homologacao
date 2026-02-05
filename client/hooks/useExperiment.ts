import { useEffect, useState } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import { Experiment } from "@amplitude/experiment-js-client";

const AMPLITUDE_EXPERIMENT_KEY = import.meta.env.VITE_AMPLITUDE_EXPERIMENT_KEY;

let experimentClient: any = null;

/**
 * Simple hook to get a feature flag variant
 * @param flagKey - The feature flag key
 * @returns Object with variant and loading state
 */
export const useFeatureFlag = (
  flagKey: string,
): { variant: string; isLoading: boolean } => {
  const [variant, setVariant] = useState<string>("control");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        if (!AMPLITUDE_EXPERIMENT_KEY) {
          console.error("❌ VITE_AMPLITUDE_EXPERIMENT_KEY não configurada!");
          setIsLoading(false);
          return;
        }

        // Initialize experiment client
        if (!experimentClient) {
          console.log("🔄 Inicializando Experiment Client...");
          experimentClient = Experiment.initialize(AMPLITUDE_EXPERIMENT_KEY);
        }

        // Wait a bit for Amplitude to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch variants
        console.log("🔄 Buscando variants do Amplitude...");
        const deviceId = amplitude.getDeviceId();
        const userId = amplitude.getUserId();

        console.log("📍 Device ID:", deviceId);
        console.log("📍 User ID:", userId);

        await experimentClient.fetch({
          device_id: deviceId || "anonymous",
          user_id: userId || undefined,
        });

        // Get the variant
        const variantResult = experimentClient.variant(flagKey);
        const variantValue = variantResult?.value || "control";

        console.log(`✅ Flag "${flagKey}" recebeu variant: ${variantValue}`);
        console.log(`📊 Variant objeto completo:`, variantResult);
        
        setVariant(variantValue);
      } catch (error) {
        console.error(`❌ Erro ao buscar variant:`, error);
        setVariant("control");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariant();
  }, [flagKey]);

  return { variant, isLoading };
};
