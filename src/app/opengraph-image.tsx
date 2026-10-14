import { ImageResponse } from "next/og";

// Tekst bez polskich znaków diakrytycznych: domyślny font next/og nie obejmuje latin-ext.
export const alt = "VELIO — marketing, technologia i automatyzacje dla firm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#0c0d10",
          color: "#eeeff3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path d="M2 5h6.6L16 20.6V28L2 5Z" fill="#eeeff3" />
            <path d="M30 5h-6.6L16 20.6V28L30 5Z" fill="#7357ff" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>VELIO</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Marketing, technologia</div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>i automatyzacje dla firm</div>
          <div style={{ fontSize: 30, color: "#b3b7c2", marginTop: 28 }}>
            Strony, SEO, reklamy, AI i branding w jednym systemie.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
