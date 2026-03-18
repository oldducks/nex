# NEX Tailwind Tokens v2

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
    bg: '#EEF0FF',
    bgAlt: '#F6F8FF',
    surface: '#FFFFFF',
    surfaceAlt: '#E8ECFF',
    border: '#D9E1F2',
    divider: '#C7D2E5',
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
- `bg-brand` = navbar, gateway panel, section เน้นแบรนด์
- `text-brand` = headline / brand emphasis
- `bg-accent-orange` = primary CTA
- `bg-accent-green` = success badge / positive stat
- `bg-neutral-bg` = page background หลัก
- `bg-neutral-bgAlt` = section alternate background
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
    hoverBg: '#E8ECFF',
  },
}
```

## 4) Gateway Landing Suggestion
```js
landing: {
  outerBg: '#EEF0FF',
  panelBg: '#050579',
  panelText: '#FFFFFF',
  optionPrimaryBg: '#F97316',
  optionSecondaryBg: '#1C1C95',
  optionBorder: '#3B45C9',
}
```

## 5) Example Tailwind Extend
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
          bg: '#EEF0FF',
          'bg-alt': '#F6F8FF',
          surface: '#FFFFFF',
          'surface-alt': '#E8ECFF',
          border: '#D9E1F2',
          divider: '#C7D2E5',
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

## 6) Sample Class Usage
```html
<section class="bg-neutral-bg text-textc-primary min-h-screen">
  <div class="mx-auto max-w-md rounded-[32px] bg-brand p-6 text-textc-on-dark">
    <div class="mb-8 text-center">
      <img src="/logo.svg" alt="NEX" class="mx-auto h-16 w-auto" />
    </div>

    <a class="mb-4 flex items-center justify-between rounded-2xl bg-accent-orange px-6 py-5 text-white">
      <span>เข้าสู่ระบบ</span>
      <span>→</span>
    </a>

    <a class="mb-4 flex items-center justify-between rounded-2xl border border-[#3B45C9] bg-[#1C1C95] px-6 py-5 text-white">
      <span>NEX คืออะไร</span>
      <span>→</span>
    </a>
  </div>
</section>
```
