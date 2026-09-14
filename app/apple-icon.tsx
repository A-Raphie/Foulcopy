import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#fdfcf8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 112,
            height: 90,
            border: "4px solid #3923c7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 16,
            gap: 8,
          }}
        >
          <div style={{ width: 48, height: 4, background: "#1d1b16" }} />
          <div style={{ width: 72, height: 4, background: "#1d1b16" }} />
          <div style={{ width: 36, height: 4, background: "#1d1b16" }} />
        </div>
      </div>
    ),
    size,
  );
}
