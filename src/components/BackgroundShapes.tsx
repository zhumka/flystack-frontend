// Декоративный фон: разные фиолетовые 3D-фигуры (куб, сфера, кристалл, призма).
// Плотные (непрозрачные), расставлены по краям, анимация на CSS.

function Cube({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <div className="scene" style={style}>
      <div className="cube" style={{ ["--s" as string]: `${size}px` }}>
        <div className="face face-front" />
        <div className="face face-back" />
        <div className="face face-right" />
        <div className="face face-left" />
        <div className="face face-top" />
        <div className="face face-bottom" />
      </div>
    </div>
  );
}

function Shape({
  kind,
  size,
  style,
}: {
  kind: "sphere" | "gem" | "prism";
  size: number;
  style?: React.CSSProperties;
}) {
  return (
    <div className="shape-wrap" style={style}>
      <div className={kind} style={{ width: size, height: size }} />
    </div>
  );
}

export function BackgroundShapes() {
  return (
    <div className="bg-decor" aria-hidden="true">
      <Cube size={210} style={{ top: "9%", right: "7%" }} />
      <Shape kind="sphere" size={170} style={{ top: "66%", left: "4%" }} />
      <Shape
        kind="gem"
        size={150}
        style={{ top: "30%", left: "5%", animationDelay: "-4s" }}
      />
      <Shape
        kind="prism"
        size={140}
        style={{ bottom: "8%", right: "12%", animationDelay: "-7s" }}
      />
      <Shape
        kind="sphere"
        size={90}
        style={{ top: "16%", left: "22%", animationDelay: "-9s" }}
      />
    </div>
  );
}
