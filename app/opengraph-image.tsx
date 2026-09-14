import { ImageResponse } from "next/og";

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
          background: "#fdfcf8",
          color: "#1d1b16",
          padding: "64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Foulcopy
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.05, maxWidth: 900 }}>
          Speak once. See what you said and what you meant to send.
        </div>
        <div style={{ fontSize: 22, color: "#4a4945" }}>
          AssemblyAI Dictation API · spoken vs send ready
        </div>
      </div>
    ),
    size,
  );
}
