# Design System

Acest folder va conține componente atomice, design tokens, utilitare și documentație pentru sistemul de design modern al aplicației.

## Structură propusă:
- `/tokens` — variabile de culoare, spațiere, fonturi, umbre, etc. (ex: `colors.ts`, `spacing.ts`, `typography.ts`)
- `/components` — componente atomice și molecule (Button, Input, Card, Modal, Avatar, Badge, Tooltip, etc.)
- `/themes` — fișiere pentru dark mode, light mode și teme custom
- `/utils` — funcții de utilitate pentru stilizare și accesibilitate

## Tehnologii recomandate
- [Shadcn UI v2](https://ui.shadcn.com/) pentru componente moderne
- [Tailwind CSS](https://tailwindcss.com/) pentru utilitare rapide
- [Framer Motion](https://www.framer.com/motion/) pentru animații

## Exemplu de utilizare
```tsx
import { Button } from "@/design-system/components/Button";
<Button variant="primary">Click me</Button>
```

---

**Voi popula acest folder incremental cu componente și tokens pe măsură ce modernizăm interfața.**
