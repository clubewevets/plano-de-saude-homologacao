import { useEffect, useState } from "react";
import { getHeroBannerVariant } from "../hooks/useAmplitude";

export function ExperimentDebug() {
  const [variant, setVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const v = await getHeroBannerVariant();
        setVariant(v);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#f0f0f0",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        fontFamily: "monospace",
        maxWidth: "300px",
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        Experiment Debug
      </div>
      <div>
        Status: {loading ? "Loading..." : "Ready"}
      </div>
      <div>
        Variant: <strong>{variant || "null"}</strong>
      </div>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </div>
  );
}
