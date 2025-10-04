"use client"

type Props = {
  score: number // 0-100
  size?: number // px
  stroke?: number // px
  className?: string
}

export function HealthScore({ score, size = 72, stroke = 8, className }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c

  // token colors: text-foreground for track contrast, and brand via [--ring] token
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Health score ${clamped} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="color-mix(in oklab, var(--muted-foreground) 25%, transparent)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-sans"
        style={{ fontSize: size * 0.28, fill: "var(--foreground)" }}
      >
        {clamped}
      </text>
    </svg>
  )
}
