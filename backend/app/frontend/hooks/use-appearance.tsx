// Simplified appearance hook - JotChain uses light mode only
// This file is kept for backward compatibility with imports

export type Appearance = "light"

export function initializeTheme() {
  // Ensure we're always in light mode (remove dark class if present)
  document.documentElement.classList.remove("dark")
}

export function useAppearance() {
  return {
    appearance: "light" as const,
    updateAppearance: () => {
      // No-op: JotChain uses light mode only
    },
  } as const
}
