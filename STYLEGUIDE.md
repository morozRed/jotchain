Below is a **full, LLM-friendly styleguide** for **Direction A (Clean “Notion-ish” light mode)**. It’s written as a single **Markdown document** with **copy-pastable JSON blocks** for tokens + component recipes.

---

# JotChain Styleguide — “Calm Docs” (Light, text-first)

## Design goals

* Feel like a **writing tool**, not a dashboard.
* Prioritize **readability** and **low-friction capture**.
* Use **borders and spacing** over shadows and gradients.
* Make the editor feel like a **document page**.

## Brand adjectives

Calm · Crisp · Private · Professional · “Paper-like” · Minimal chrome

---

## Foundations

### Color system

* Backgrounds: warm off-white → white surfaces
* Borders: hairline neutral gray
* Text: near-black (never pure black)
* Accent: one subdued blue (no gradients)
* Status colors: muted, not saturated

#### Tokens (JSON)

```json
{
  "color": {
    "bg": {
      "canvas": "#F8F7F4",
      "subtle": "#F3F2EE",
      "surface": "#FFFFFF",
      "surfaceAlt": "#FCFBF8"
    },
    "border": {
      "subtle": "#E7E5E1",
      "default": "#DEDAD3",
      "strong": "#CFC8BE"
    },
    "text": {
      "primary": "#1F2328",
      "secondary": "#5B636D",
      "muted": "#7A828C",
      "placeholder": "#9AA2AC",
      "inverse": "#FFFFFF"
    },
    "accent": {
      "primary": "#2F5D50",
      "hover": "#274F44",
      "softBg": "#EAF2EF",
      "softBorder": "#CFE1DA"
    },
    "status": {
      "success": "#2E6B4F",
      "successBg": "#EAF4EF",
      "warning": "#7A5A00",
      "warningBg": "#FFF4D8",
      "danger": "#9E2A2B",
      "dangerBg": "#FDEAEA",
      "info": "#3A6EA5",
      "infoBg": "#EEF3F9"
    }
  }
}
```

---

### Typography

* System font stack (fast, native). Inter if available.
* Headings: confident, not huge.
* Body: comfortable line-height for writing.
* Avoid all-caps except tiny labels.

#### Tokens (JSON)

```json
{
  "typography": {
    "fontFamily": {
      "sans": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
      "mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    },
    "size": {
      "xs": 12,
      "sm": 13,
      "md": 15,
      "lg": 18,
      "xl": 22,
      "2xl": 28
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.7
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600
    },
    "letterSpacing": {
      "normal": "0",
      "tight": "-0.01em"
    }
  }
}
```

---

### Spacing & layout

* 8px grid.
* Use generous whitespace.
* Prefer **one main column** for writing and a **supporting rail**.

#### Tokens (JSON)

```json
{
  "spacing": {
    "0": 0,
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 20,
    "6": 24,
    "7": 32,
    "8": 40,
    "9": 48,
    "10": 64
  },
  "layout": {
    "pageMaxWidth": 1120,
    "contentMaxWidth": 760,
    "sidebarWidth": 248,
    "railWidth": 320
  }
}
```

---

### Radius, borders, shadows

* Roundness: subtle and consistent.
* Shadows: barely used; prefer borders.

#### Tokens (JSON)

```json
{
  "shape": {
    "radius": {
      "sm": 8,
      "md": 12,
      "lg": 16
    },
    "borderWidth": {
      "hairline": 1
    }
  },
  "shadow": {
    "none": "none",
    "sm": "0 1px 0 rgba(31,35,40,0.04)",
    "md": "0 8px 24px rgba(31,35,40,0.08)"
  }
}
```

---

## Component styling rules

### Global rules

* No gradients, glows, or neon outlines.
* Surfaces must be distinguishable by **subtle contrast**, not heavy shadows.
* Interactive states: hover uses **background tint**; focus uses **accent ring**.

#### Interaction tokens (JSON)

```json
{
  "interaction": {
    "focusRing": "0 0 0 3px rgba(47,111,235,0.18)",
    "hoverBg": "#F6F5F2",
    "activeBg": "#F1EFEA",
    "disabledOpacity": 0.55,
    "transition": "150ms ease"
  }
}
```

---

### Buttons

#### Primary

* Accent background, white text
* Hover darkens slightly
* No shadow, 1px border optional

#### Secondary

* White surface, hairline border
* Hover uses subtle background tint

#### Tokens/recipe (JSON)

```json
{
  "button": {
    "height": 36,
    "radius": 10,
    "paddingX": 12,
    "fontSize": 13,
    "fontWeight": 600,
    "primary": {
      "bg": "{color.accent.primary}",
      "text": "{color.text.inverse}",
      "border": "{color.accent.primary}",
      "hoverBg": "{color.accent.hover}",
      "focusRing": "{interaction.focusRing}"
    },
    "secondary": {
      "bg": "{color.bg.surface}",
      "text": "{color.text.primary}",
      "border": "{color.border.default}",
      "hoverBg": "{interaction.hoverBg}",
      "focusRing": "{interaction.focusRing}"
    },
    "ghost": {
      "bg": "transparent",
      "text": "{color.text.primary}",
      "border": "transparent",
      "hoverBg": "{interaction.hoverBg}",
      "focusRing": "{interaction.focusRing}"
    }
  }
}
```

---

### Inputs (text fields, selects)

* White background
* Hairline border
* Focus ring with accent

```json
{
  "input": {
    "height": 36,
    "radius": 10,
    "paddingX": 12,
    "bg": "{color.bg.surface}",
    "text": "{color.text.primary}",
    "placeholder": "{color.text.placeholder}",
    "border": "{color.border.default}",
    "hoverBorder": "{color.border.strong}",
    "focusRing": "{interaction.focusRing}"
  }
}
```

---

### Cards → “Sections” (important shift)

In this style, avoid “dashboard cards”. Use **flat sections**.

**Section**

* White surface
* 1px border
* Mild rounding
* Optional header row with title + actions

```json
{
  "section": {
    "bg": "{color.bg.surface}",
    "border": "{color.border.subtle}",
    "radius": 12,
    "padding": 20,
    "shadow": "{shadow.none}",
    "headerGap": 8
  }
}
```

---

### Sidebar

* Quiet, minimal
* No pill highlights
* Active item uses: subtle tinted background + left border indicator

```json
{
  "sidebar": {
    "bg": "{color.bg.surfaceAlt}",
    "borderRight": "{color.border.subtle}",
    "item": {
      "height": 36,
      "radius": 10,
      "paddingX": 10,
      "text": "{color.text.secondary}",
      "hoverBg": "{interaction.hoverBg}"
    },
    "itemActive": {
      "bg": "{color.accent.softBg}",
      "text": "{color.text.primary}",
      "leftIndicator": "{color.accent.primary}"
    }
  }
}
```

---

## Editor (TipTap) — “Document Page” spec

### Editor container

* Centered page feel
* Max width 760px (contentMaxWidth)
* Surface is white, with border
* Inside padding generous
* Typography relaxed

### Placeholder guidance (encourage good notes)

When empty, show ghost prompt:

* “• What moved forward today?”
* “• Decisions / blockers?”
* “• Who / what was involved? (@person / @project)”

```json
{
  "editor": {
    "container": {
      "bg": "{color.bg.surface}",
      "border": "{color.border.default}",
      "radius": 14,
      "padding": 20
    },
    "content": {
      "fontSize": 15,
      "lineHeight": 1.7,
      "text": "{color.text.primary}"
    },
    "placeholder": {
      "text": "{color.text.placeholder}"
    },
    "editor": {
      "mention": {
        "bg": "{accent.softBg}",
        "text": "{accent.primary}",
        "radius": 6,
        "paddingX": 6,
        "paddingY": 1
      }
    }
    "toolbar": {
      "bg": "transparent",
      "borderBottom": "{color.border.subtle}"
    },
    "focusRing": "{interaction.focusRing}"
  }
}
```

---

## Page templates

### Dashboard / Capture page layout

* Top: compact header (title + small subtitle)
* Main: two columns

  * Left: editor section (dominant)
  * Right: “Today” rail (supporting)
* Avoid large empty states; always show “what this becomes”.

```json
{
  "page": {
    "bg": "{color.bg.canvas}",
    "header": {
      "titleSize": 28,
      "subtitleSize": 15,
      "subtitleColor": "{color.text.secondary}"
    },
    "grid": {
      "gap": 24,
      "columns": {
        "left": 760,
        "right": 320
      }
    }
  }
}
```

---

## Content patterns

### Empty states

Rule: Empty states should **tell the user the benefit**, not just “nothing here”.

**Template**

* Title: short, positive
* Body: what appears after logging
* Action: one clear next step

Example empty state copy:

* Title: “Nothing logged today — yet”
* Body: “Add 2 bullets and your weekly update writes itself.”
* Action: “Log a note”

---

## Data visualization (Analytics)

* Prefer neutral strokes, minimal fills
* Avoid heavy gradients
* Keep charts secondary to insights text
* Use the accent color sparingly (highlights only)

---

## Do / Don’t

### Do

* Use borders more than shadows
* Make writing the hero
* Keep UI quiet so text stands out
* Use one accent color consistently

### Don’t

* Glows, gradients, “neon” accents
* Over-rounded shiny pills everywhere
* Cards inside cards inside cards
* Too many “stats” on the capture screen
