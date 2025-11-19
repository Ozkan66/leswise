# Layout Instructions: Inline CSS voor Leswise Pagina's

## Doel
Alle nieuwe pagina layouts in Leswise dienen gebouwd te worden met **moderne, inline CSS** (React style objects), zonder gebruik van Tailwind, externe CSS-bestanden of CSS-modules.

---

## Richtlijnen

### 1. Gebruik alleen inline CSS (React style objects)
- Gebruik het `style` attribuut op React componenten.
- Definieer styles als objecten of direct inline.
- Geen Tailwind, geen `className`, geen externe stylesheets.

**Voorbeeld:**
```tsx
return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(to bottom, #fff, #e0e7ff)',
    minHeight: '100vh',
    padding: '2rem 1rem',
  }}>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e3a8a' }}>Welkom</h1>
    {/* ... */}
  </div>
)
```

### 2. Responsiveness
- Gebruik flexbox (`display: 'flex'`, `flexDirection`, `gap`, etc.) en media queries via inline styles waar nodig.
- Voor eenvoudige breakpoints kun je conditioneel styles aanpassen op basis van `window.innerWidth` of React state.

### 3. Kleuren & Typografie
- Gebruik moderne kleuren (`#1e3a8a`, `#2563eb`, etc.) en duidelijke font-sizes/font-weights.
- Gebruik border-radius, box-shadow en padding voor een moderne look.

### 4. Buttons & Links
- Style `<a>` en `<button>` elementen inline voor kleur, padding, border-radius, hover, etc.
- Gebruik `Link` van Next.js met het `style` attribuut.

**Voorbeeld:**
```tsx
<Link href="/login" style={{
  padding: '18px 40px',
  background: '#2563eb',
  color: '#fff',
  borderRadius: 12,
  fontWeight: 600,
  fontSize: '1.15rem',
  boxShadow: '0 2px 8px #dbeafe',
  textDecoration: 'none',
  transition: 'background 0.2s',
}}>Aanmelden</Link>
```

### 5. Afbeeldingen
- Gebruik `<img>` met inline styles voor externe afbeeldingen.
- Voor lokale afbeeldingen: plaats in `/public` en gebruik `<img src="/mijn-afbeelding.png" ... />`.

### 6. Geen globale of externe CSS
- Verwijder alle niet-gebruikte CSS-bestanden.
- Gebruik geen `globals.css`, CSS-modules of Tailwind voor nieuwe pagina's.

---

## Review Checklist
- [ ] Alle layout en styling via inline CSS (geen className)
- [ ] Buttons en links zijn modern en consistent gestyled
- [ ] Pagina is responsive (flexbox, eventueel media queries)
- [ ] Geen Tailwind, geen externe CSS, geen CSS-modules
- [ ] Afbeeldingen correct gestyled

---

**Laatste update:** 25 juni 2025
