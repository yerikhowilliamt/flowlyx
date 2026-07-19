---
name: typography
description: Font rules for the Flowlyx UI. Primary font is Plus Jakarta Sans.
---

# Typography

- **Primary Font**: `Plus Jakarta Sans` dari Google Fonts, dimuat via `next/font/google`.
- **CSS Variable**: `--font-plus-jakarta` — digunakan di `@theme inline` sebagai `--font-sans`.
- **Fallback**: `ui-sans-serif, system-ui, sans-serif`.
- **Jangan gunakan**: Inter, Geist, atau font default browser. Selalu Plus Jakarta Sans.
- **Import di layout.tsx**:
  ```tsx
  import { Plus_Jakarta_Sans } from 'next/font/google';
  const plusJakarta = Plus_Jakarta_Sans({
    variable: '--font-plus-jakarta',
    subsets: ['latin'],
  });
  ```
