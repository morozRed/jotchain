import type { SVGAttributes } from "react"

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#E8734A", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#D35F3E", stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#B54E32", stopOpacity: 0.85 }} />
          <stop offset="100%" style={{ stopColor: "#C4533A", stopOpacity: 0.85 }} />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#F5A882", stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: "#E8734A", stopOpacity: 0.9 }} />
        </linearGradient>
      </defs>

      <circle cx="20" cy="32" r="13" fill="url(#grad1)" />
      <circle cx="32" cy="32" r="13" fill="url(#grad2)" style={{ mixBlendMode: "screen" }} />
      <circle cx="44" cy="32" r="13" fill="url(#grad3)" />
    </svg>
  )
}
