import { ImageResponse } from "next/og";

export const alt =
  "Scholar Opportunity Fund — Quantitative investing in special situations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0B1221",
          color: "#F3F5F8",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top: eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: 20,
            letterSpacing: 4,
            color: "#A0755A",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Scholar Opportunity Fund
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#F3F5F8",
              maxWidth: 960,
              display: "flex",
            }}
          >
            Quantitative investing in special situations
          </div>
          <div
            style={{
              display: "flex",
              width: 120,
              height: 4,
              background: "#A0755A",
            }}
          />
        </div>

        {/* Bottom: footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "sans-serif",
            fontSize: 20,
            color: "#8892A0",
          }}
        >
          <div style={{ display: "flex" }}>Led by Dr. Jonathan Brogaard</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                background: "#A0755A",
                borderRadius: 7,
              }}
            />
            <div
              style={{
                display: "flex",
                width: 14,
                height: 14,
                background: "#7BB8D6",
                borderRadius: 7,
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
