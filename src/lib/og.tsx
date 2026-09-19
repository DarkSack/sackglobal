import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Tarjeta OpenGraph con la misma gramática del sitio: metadata en la
 * cabecera, titular enorme, una línea de acento. Sin imágenes externas.
 */
export function ogCard({
  kicker,
  title,
  subtitle,
  footer,
  accent = "#e0506a",
}: {
  kicker: string;
  title: string;
  subtitle?: string | null;
  footer: string;
  accent?: string;
}) {
  const size = title.length > 18 ? 104 : title.length > 11 ? 140 : 180;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080a0d",
          color: "#f2f3f5",
          padding: "56px 64px",
          borderLeft: `8px solid ${accent}`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, color: "#8b929d" }}>
          <span>{kicker.toUpperCase()}</span>
          <span>SACK / DIGITAL ARCHIVE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: size, fontWeight: 800, lineHeight: 0.9, letterSpacing: -4, textTransform: "uppercase" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 28, fontSize: 32, color: "#8b929d", maxWidth: 950, lineHeight: 1.25 }}>{subtitle}</div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: accent }}>{footer.toUpperCase()}</div>
      </div>
    ),
    OG_SIZE,
  );
}
