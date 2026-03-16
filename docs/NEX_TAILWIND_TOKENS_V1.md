# NEX Tailwind Tokens v1

## 1) Color Tokens
```js
colors: {
  brand: {
    DEFAULT: '#050579',
    hover: '#07079A',
    dark: '#03034F',
  },
  accent: {
    orange: '#F97316',
    orangeHover: '#EA580C',
    green: '#84CC16',
    greenHover: '#65A30D',
  },
  neutral: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF2FF',
    border: '#E2E8F0',
    divider: '#CBD5E1',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    onDark: '#FFFFFF',
  },
  semantic: {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#2563EB',
  },
}
```

## 2) Suggested Usage Mapping
- `bg-brand` = section หรือ navbar หลัก
- `text-brand` = headline / brand emphasis
- `bg-accent-orange` = primary CTA
- `bg-accent-green` = success badge / positive stat
- `bg-neutral-bg` = page background
- `bg-neutral-surface` = card background
- `border-neutral-border` = standard border
- `text-text-primary` = main paragraph/headline

## 3) Button Token Suggestion
```js
button: {
  primary: {
    bg: '#F97316',
    hover: '#EA580C',
    text: '#FFFFFF',
  },
  secondary: {
    bg: '#050579',
    hover: '#07079A',
    text: '#FFFFFF',
  },
  outline: {
    border: '#050579',
    text: '#050579',
    hoverBg: '#EEF2FF',
  },
}
```

## 4) Example Tailwind Extend
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#050579',
          hover: '#07079A',
          dark: '#03034F',
        },
        accent: {
          orange: '#F97316',
          'orange-hover': '#EA580C',
          green: '#84CC16',
          'green-hover': '#65A30D',
        },
        neutral: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-alt': '#EEF2FF',
          border: '#E2E8F0',
          divider: '#CBD5E1',
        },
        textc: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
          'on-dark': '#FFFFFF',
        },
        semantic: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
        },
      },
    },
  },
}
```

## 5) Sample Class Usage
```html
<section class="bg-neutral-bg text-textc-primary">
  <div class="bg-neutral-surface border border-neutral-border rounded-2xl p-6">
    <h1 class="text-brand">NEX Solution</h1>
    <p class="text-textc-secondary">Modern digital platform for business growth.</p>
    <button class="bg-accent-orange hover:bg-accent-orange-hover text-white rounded-xl px-5 py-3">
      สมัครใช้งาน
    </button>
  </div>
</section>
```
