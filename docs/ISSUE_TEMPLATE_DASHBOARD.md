# Issue: Implementatie Dynamisch Docenten Dashboard

## 🎯 Doel
Het doel van deze taak is om de statische homepage te vervangen door een volledig dynamisch en professioneel docentendashboard. Alle data moet live worden opgehaald uit de Supabase backend en specifiek zijn voor de ingelogde gebruiker.

---

## 📋 Functionele Vereisten

### 1. Statistiekenbalk
- **Gegevens**: Toon het aantal **Werkbladen**, **Mappen**, **Klassen**, en **Inzendingen** van de ingelogde docent.
- **Dynamisch**: Deze statistieken moeten dynamisch worden geladen vanuit de database.
- **Navigatie**: Elke statistiekkaart moet linken naar de respectievelijke beheerpagina (bv. `/worksheets`, `/folders`, etc.).
- **Laden**: Toon een laadstatus (bijv. "Laden...") terwijl de gegevens worden opgehaald.

### 2. Recente Werkbladen
- **Gegevens**: Toon een lijst van de **twee meest recente werkbladen** die door de docent zijn aangemaakt.
- **Informatie**: Voor elk werkblad, toon de titel en de creatiedatum.
- **Lege Staat**: Als de docent geen werkbladen heeft, toon een duidelijke melding zoals "Je hebt nog geen werkbladen aangemaakt."
- **Navigatie**: Elke werkbladtitel moet linken naar de detailpagina van dat werkblad.

### 3. Navigatie ("Snel naar")
- **Links**: Zorg ervoor dat alle knoppen en links in de "Snel naar" sectie en de zijbalk correct verwijzen naar de juiste routes binnen de applicatie.
- **Componenten**: Gebruik de Next.js `<Link>` component voor alle interne navigatie om client-side routing te garanderen.
- **Exacte Routes**:
    - Werkbladen: `/worksheets`
    - Mappen: `/folders`
    - Klassen: `/groups`
    - Inzendingen: `/teacher-submissions`
    - Werkblad detailpagina: `/worksheets/[id]`

### 4. Styling & Layout (CSS)
- **Algemene Layout**: De pagina gebruikt een flexbox-container met een donkergrijze achtergrond (`#F5F5F5`). De hoofdcontent heeft een maximale breedte en is gecentreerd.
- **Statistiekenbalk**:
    - Dit is een `div` die 4 statistiekkaarten bevat.
    - Gebruik `display: grid` met 4 kolommen voor een gelijke verdeling.
    - Elke kaart heeft een witte achtergrond, afgeronde hoeken (`border-radius`), en een lichte schaduw (`box-shadow`).
- **Recente Werkbladen Sectie**:
    - De sectie heeft een titel en een lijst.
    - De lijst-items hebben een witte achtergrond en een border aan de onderkant om ze te scheiden.
    - Binnen elk item staan de titel en de datum naast elkaar, gebruik `display: flex` met `justify-content: space-between`.

---

## 💻 Technische Implementatie

### 1. Component Structuur
- **Client Component**: Converteer `app/page.tsx` naar een client component (`"use client"`) om hooks zoals `useState` en `useEffect` te kunnen gebruiken.
- **State Management**: Gebruik `useState` om de laadstatus, de statistieken en de lijst met werkbladen te beheren.

```typescript
const [stats, setStats] = useState({ worksheets: 0, folders: 0, groups: 0, submissions: 0 });
const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
const [loading, setLoading] = useState(true);

interface Worksheet {
  id: string;
  title: string;
  created_at: string;
}
```

### 2. Data Fetching (`useEffect`)
- **Gebruiker**: Haal de ingelogde gebruiker op via `supabase.auth.getUser()`.
- **Queries**: Voer de volgende Supabase queries uit om de benodigde data op te halen:
    - **Aantal werkbladen**: `count` op `worksheets` tabel, gefilterd op `user_id`.
    - **Aantal mappen**: `count` op `folders` tabel, gefilterd op `user_id`.
    - **Aantal klassen**: `count` op `group_members` tabel, gefilterd op `user_id` en `role: 'teacher'`.
    - **Aantal inzendingen**: `count` op `submissions` tabel, waarbij de `worksheet_id` behoort tot een werkblad van de docent.
    - **Recente werkbladen**: `select` op `worksheets` tabel, gefilterd op `user_id`, `orderBy('created_at', { ascending: false })` en `limit(2)`.
- **Efficiëntie**: Gebruik `Promise.all` om de queries parallel uit te voeren en de laadtijd te minimaliseren.
- **Error Handling**: Implementeer `try...catch` blokken voor de data-fetching logica.
- **State Update**: Update de state met de opgehaalde gegevens en zet `loading` op `false`.

### 3. Rendering
- **Conditionele Rendering**:
    - Toon een laadindicator als `loading` `true` is.
    - Toon de statistieken en werkbladen als de data geladen is.
    - Gebruik de "lege staat" melding als de `worksheets` array leeg is.
- **Data Mapping**: Gebruik `.map()` om de `worksheets` array te renderen in de lijst.

### 4. Navigatie
- **Vervang `<a>` door `<Link>`**: Zorg ervoor dat alle `<a>` tags voor interne links worden vervangen door `<Link href="...">` om onnodige page reloads te voorkomen.

```jsx
// Voorbeeld
import Link from 'next/link';

<Link href="/worksheets">
  <div className="stat-card">
    <h3>{stats.worksheets}</h3>
    <p>Werkbladen</p>
  </div>
</Link>
```

---

## ✅ Acceptatiecriteria
- [ ] De pagina toont geen statische data meer.
- [ ] Alle statistieken reflecteren de correcte, gebruikers-specifieke data uit de database.
- [ ] De lijst met recente werkbladen toont de laatste twee werkbladen van de ingelogde docent.
- [ ] Alle links op de pagina navigeren correct zonder een full-page refresh.
- [ ] Er wordt een laadindicator getoond tijdens het ophalen van de data.
- [ ] Er wordt een duidelijke melding getoond als er geen werkbladen zijn.
