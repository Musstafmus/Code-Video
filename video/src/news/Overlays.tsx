import { interpolate } from "remotion";
import { AlignedWord } from "../types";
import { NEWS } from "./theme";
import { ResolvedSection } from "./timeline";

const text = (size: number, weight = 800): React.CSSProperties => ({
  fontFamily: NEWS.font,
  fontSize: size,
  fontWeight: weight,
  color: NEWS.white,
  whiteSpace: "nowrap",
});

export const TopBar: React.FC<{ frame: number; program: string; date: string; label: string }> = ({ frame, program, date, label }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: 30, height: 64, display: "flex", alignItems: "center", gap: 18 }}>
    <div style={{ ...text(28, 900), background: NEWS.red, borderRadius: 10, padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: NEWS.white, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 10)) }} />
      CANLI
    </div>
    <div style={text(32, 900)}>{program}</div>
    <div style={{ flex: 1 }} />
    <div style={text(26, 600)}>{date}</div>
    <div style={{ ...text(20, 800), background: "rgba(255,255,255,0.18)", borderRadius: 999, padding: "6px 14px" }}>{label}</div>
  </div>
);

/** Alt bant: bölüm başlığı + o an söylenen satır, söylenen kelime vurgulu. */
export const LowerThird: React.FC<{
  frame: number;
  words: AlignedWord[];
  lines: [number, number][];
  sections: ResolvedSection[];
  top: number;
}> = ({ frame, words, lines, sections, top }) => {
  const section = sections.findLast((s) => s.start <= frame);
  const sectionAge = section ? frame - section.start : 0;
  const lineIndex = lines.findLastIndex(([a]) => words[a].start - 3 <= frame);
  const line = lines[lineIndex];
  const lineAge = line ? frame - (words[line[0]].start - 3) : 0;
  const lineIn = interpolate(lineAge, [0, 4], [0.35, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: 40, right: 40, top }}>
      {section && (
        <div
          style={{
            ...text(30, 900),
            display: "inline-block",
            background: NEWS.red,
            padding: "10px 26px",
            borderRadius: "14px 14px 0 0",
            letterSpacing: 2,
            transform: `translateY(${interpolate(sectionAge, [0, 6], [20, 0], { extrapolateRight: "clamp" })}px)`,
          }}
        >
          {section.title}
        </div>
      )}
      <div
        style={{
          background: NEWS.white,
          borderRadius: "0 14px 14px 14px",
          height: 112,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          borderLeft: `12px solid ${NEWS.red}`,
        }}
      >
        {line &&
          words.slice(line[0], line[1] + 1).map((w, i) => {
            const active = frame >= w.start && frame < w.end + 2;
            return (
              <span
                key={i}
                style={{
                  ...text(46, 900),
                  color: NEWS.navy,
                  padding: "4px 8px",
                  borderRadius: 10,
                  background: active ? NEWS.yellow : "transparent",
                  opacity: lineIn,
                  transform: `translateY(${(1 - lineIn) * 16}px)`,
                }}
              >
                {w.text}
              </span>
            );
          })}
      </div>
    </div>
  );
};

export const Ticker: React.FC<{ frame: number; items: string[]; top: number }> = ({ frame, items, top }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: 70, background: NEWS.navy, display: "flex", alignItems: "center", overflow: "hidden", borderTop: `4px solid ${NEWS.red}` }}>
    <div style={{ ...text(26, 900), background: NEWS.red, height: "100%", display: "flex", alignItems: "center", padding: "0 22px", zIndex: 1 }}>SON DAKİKA</div>
    <div style={{ ...text(28, 600), transform: `translateX(${40 - frame * 4}px)`, display: "flex", gap: 40 }}>
      {[...items, ...items].map((item, i) => (
        <span key={i}>
          <span style={{ color: NEWS.yellow, marginRight: 40 }}>●</span>
          {item}
        </span>
      ))}
    </div>
  </div>
);
