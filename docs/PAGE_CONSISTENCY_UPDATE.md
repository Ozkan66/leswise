# Leswise Page Consistency Update - Documentation

## Overzicht

Deze update harmoniseert alle pagina's van het Leswise platform om een consistente gebruikerservaring te bieden. Alle wijzigingen zijn minimaal en gefocust op consistentie zonder functionaliteit te wijzigen.

## Datum

Juni 2025

## Probleem

De verschillende pagina's van Leswise waren niet consistent in:
- Ontwerp (mix van inline styles, Tailwind classes en CSS modules)
- Layout (verschillende container widths: 400px, 600px, 1200px, 1280px)
- Functionaliteit (inconsistente form validatie en error handling)
- Gebruikerservaring (verschillende button styles, kleuren, hover states)

## Oplossing

### 1. Nieuwe Gestandaardiseerde Componenten

#### PageLayout Component
**Locatie**: `web/src/components/PageLayout.tsx`

Een wrapper component voor consistente page layouts met:
- Uniforme headers met titel en beschrijving
- Gestandaardiseerde container widths (sm, md, lg, xl, full)
- Consistente padding en spacing
- Dark mode ondersteuning

**Gebruik**:
```tsx
<PageLayout
  title="Page Title"
  description="Optional description"
  maxWidth="xl"
  headerAction={<Button>Action</Button>}
>
  {children}
</PageLayout>
```

#### Button Component
**Locatie**: `web/src/components/Button.tsx`

Gestandaardiseerde button met:
- Variants: primary, secondary, danger, ghost
- Sizes: sm, md, lg
- Consistente hover states en transitions
- Dark mode support
- Disabled states

**Gebruik**:
```tsx
<Button variant="primary" size="md" fullWidth>
  Click Me
</Button>
```

#### Card Component
**Locatie**: `web/src/components/Card.tsx`

Container component voor content met:
- Consistente borders en shadows
- Padding options (none, sm, md, lg)
- Dark mode ondersteuning
- Hover effects

**Gebruik**:
```tsx
<Card padding="md">
  {content}
</Card>
```

#### Input Component
**Locatie**: `web/src/components/Input.tsx`

Formulier input met:
- Labels en placeholder text
- Error states en error messages
- Helper text ondersteuning
- Consistente focus states
- Dark mode support

**Gebruik**:
```tsx
<Input
  label="E-mail"
  type="email"
  value={email}
  onChange={handleChange}
  error={errorMessage}
  helperText="We'll never share your email"
/>
```

#### Alert Component
**Locatie**: `web/src/components/Alert.tsx`

Melding component met:
- Variants: info, success, warning, error
- Consistente kleuren per type
- Dark mode ondersteuning

**Gebruik**:
```tsx
<Alert variant="error">
  Er is een fout opgetreden
</Alert>
```

### 2. Geüpdatete Pagina's

#### Authenticatie Pagina's
- ✅ **Login** (`/login`): Gebruikt nu Card, Input, Button en Alert
- ✅ **Register** (`/register`): Consistent met login styling
- ✅ **Forgot Password** (`/forgot-password`): Gestandaardiseerde form
- ✅ **Reset Password** (`/reset-password`): Consistent met andere auth flows

#### Hoofdpagina's
- ✅ **Dashboard** (`/dashboard`): Gebruikt PageLayout wrapper
- ✅ **Profile** (`/profile`): Geüpdatete layout met PageLayout
- ✅ **Worksheets** (`/worksheets`): Grote refactor met Card components voor worksheet items
- ✅ **Folders** (`/folders`): PageLayout met consistente spacing
- ✅ **Groups** (`/groups`): Gestandaardiseerde layout en forms
- ✅ **Shared Worksheets** (`/shared-worksheets`): PageLayout wrapper toegevoegd

#### Navigation
- ✅ **Navigation Component**: Volledig gerefactored van inline styles naar Tailwind classes
- Consistente link styling
- Responsive design
- Dark mode support

### 3. Styling Patterns

#### Container Widths
Gestandaardiseerde max-width classes:
- `sm` (max-w-2xl): 672px - voor forms en profiles
- `md` (max-w-4xl): 896px - voor medium content
- `lg` (max-w-6xl): 1152px - voor lists en dashboards
- `xl` (max-w-7xl): 1280px - voor wide layouts
- `full` (max-w-full): Full width

#### Kleuren
Consistente kleurgebruik:
- **Primary**: Blue-600 (buttons, links)
- **Secondary**: Gray-600 (secondary actions)
- **Danger**: Red-600 (delete, destructive actions)
- **Success**: Green-600 (success states)
- **Warning**: Yellow-600 (warnings)

#### Typography
Gestandaardiseerde text sizes:
- **H1**: `text-3xl font-bold` (page titles)
- **H2**: `text-2xl font-bold` (section titles)
- **H3**: `text-lg font-semibold` (card titles)
- **Body**: `text-base` (normal text)
- **Small**: `text-sm` (helper text)

#### Spacing
Consistente spacing patterns:
- **Page padding**: `px-4 sm:px-6 lg:px-8 py-8`
- **Card padding**: `p-6` (default)
- **Form spacing**: `space-y-4` (tussen form velden)
- **Section spacing**: `space-y-8` (tussen secties)

### 4. Dark Mode

Alle componenten ondersteunen nu consistent dark mode:
- Achtergronden: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-700`
- Inputs: `bg-white dark:bg-gray-800`

### 5. Responsive Design

Alle pagina's zijn nu responsive met:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Consistente grid layouts
- Responsive typography

## Impact

### Voor Docenten
- ✅ Consistente ervaring bij navigeren tussen cursuspagina's
- ✅ Uniforme button styling en hover effects
- ✅ Herkenbare form patterns
- ✅ Consistente feedback via alerts en messages

### Voor Leerlingen
- ✅ Overal dezelfde menu's en navigatie
- ✅ Herkenbare knoppen ongeacht waar ze zijn
- ✅ Consistente worksheet views
- ✅ Uniforme submission flows

### Voor Ontwikkelaars
- ✅ Herbruikbare componenten
- ✅ Makkelijker onderhoud
- ✅ Consistente code patterns
- ✅ Betere developer experience

## Testing

### Linting
Alle wijzigingen passeren ESLint zonder warnings:
```bash
npm run lint
# ✔ No ESLint warnings or errors
```

### Functionaliteit
- Alle bestaande functionaliteit blijft werken
- Geen breaking changes
- Forms behouden validatie logica
- Authentication flows ongewijzigd

## Best Practices voor Toekomstige Ontwikkeling

### Nieuwe Pagina's
Gebruik altijd PageLayout wrapper:
```tsx
<PageLayout title="New Page" maxWidth="xl">
  <Card>
    {/* Content */}
  </Card>
</PageLayout>
```

### Nieuwe Forms
Gebruik de Input en Button components:
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Field Name"
    value={value}
    onChange={handleChange}
  />
  <Button type="submit" fullWidth>
    Submit
  </Button>
</form>
```

### Error Handling
Gebruik Alert component voor feedback:
```tsx
{error && (
  <Alert variant="error">
    {error}
  </Alert>
)}
```

### Styling
- Gebruik Tailwind classes in plaats van inline styles
- Volg de gedefinieerde color scheme
- Gebruik de spacing patterns
- Implementeer dark mode support

## Migratiepad voor Overige Componenten

Voor componenten die nog niet gemigreerd zijn:
1. Identificeer inline styles
2. Vervang met Tailwind classes
3. Gebruik de nieuwe Button, Input, Card components waar mogelijk
4. Test dark mode
5. Verify responsive behavior
6. Run lint checks

## Conclusie

Deze update brengt consistentie in het hele Leswise platform zonder functionaliteit te wijzigen. Alle pagina's volgen nu dezelfde design patterns en bieden een uniforme gebruikerservaring.

## Referenties

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Best Practices](https://react.dev/learn)
- [Leswise GitHub Copilot Instructions](../.github/copilot-instructions.md)
