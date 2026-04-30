import { ImageResponse } from "next/og";

function IconMarkup({ size, maskable = false }) {
  const safeInset = maskable ? Math.round(size * 0.16) : Math.round(size * 0.12);
  const frameSize = size - safeInset * 2;
  const frameRadius = Math.round(frameSize * 0.24);
  const symbolSize = Math.round(frameSize * 0.58);
  const symbolRadius = Math.round(symbolSize * 0.26);
  const checkWidth = Math.round(symbolSize * 0.34);
  const checkHeight = Math.round(symbolSize * 0.22);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(145deg, #0f172a 0%, #162033 55%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: Math.round(size * 0.07),
          borderRadius: Math.round(size * 0.26),
          border: `${Math.max(2, Math.round(size * 0.009))}px solid rgba(255, 255, 255, 0.1)`
        }}
      />

      <div
        style={{
          position: "absolute",
          top: Math.round(size * 0.14),
          left: Math.round(size * 0.14),
          width: Math.round(size * 0.24),
          height: Math.round(size * 0.24),
          borderRadius: "999px",
          background: "rgba(59, 130, 246, 0.18)",
          filter: "blur(22px)"
        }}
      />

      <div
        style={{
          position: "absolute",
          right: Math.round(size * 0.12),
          bottom: Math.round(size * 0.12),
          width: Math.round(size * 0.28),
          height: Math.round(size * 0.28),
          borderRadius: "999px",
          background: "rgba(14, 165, 233, 0.14)",
          filter: "blur(24px)"
        }}
      />

      <div
          style={{
            display: "flex",
            width: frameSize,
            height: frameSize,
            borderRadius: frameRadius,
            background: "#eef2f7",
            border: `${Math.max(2, Math.round(size * 0.01))}px solid rgba(255, 255, 255, 0.4)`,
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.34)",
            position: "relative",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
        <div
          style={{
            display: "flex",
            width: symbolSize,
            height: symbolSize,
            borderRadius: symbolRadius,
            background: "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
            boxShadow: "0 18px 32px rgba(37, 99, 235, 0.28)",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              width: checkWidth,
              height: checkHeight,
              transform: "rotate(-45deg) translateY(-2%)"
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: Math.max(8, Math.round(symbolSize * 0.12)),
                height: Math.round(symbolSize * 0.26),
                borderRadius: "999px",
                background: "#ffffff"
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: Math.round(symbolSize * 0.34),
                height: Math.max(8, Math.round(symbolSize * 0.12)),
                borderRadius: "999px",
                background: "#ffffff"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function createIconResponse(size, options = {}) {
  return new ImageResponse(<IconMarkup size={size} maskable={options.maskable} />, {
    width: size,
    height: size
  });
}
