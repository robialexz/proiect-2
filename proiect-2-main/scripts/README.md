# Scripturi pentru Gestionarea Aplicației

Acest director conține scripturi pentru gestionarea bazei de date Supabase și verificarea erorilor în aplicație.

## Fișiere Disponibile

### Scripturi pentru Baza de Date

- `reset-database.js` - Script pentru resetarea completă a bazei de date (șterge toate datele)
- `seed-database.js` - Script pentru popularea bazei de date cu date de test
- `create-rpc-functions.sql` - Script SQL pentru crearea funcțiilor RPC necesare în Supabase
- `create-supabase-functions.sql` - Script SQL pentru crearea funcțiilor RPC pentru gestionarea bazei de date

### Scripturi pentru Verificarea Erorilor

- `check-code-errors.js` - Script pentru verificarea erorilor în fișierele de cod
- `check-pages-errors.js` - Script pentru verificarea erorilor pe fiecare pagină
- `check-browser-errors.js` - Script pentru verificarea erorilor în browser
- `run-all-checks.js` - Script pentru rularea tuturor verificărilor

## Comenzi NPM

Am adăugat următoarele comenzi în `package.json` pentru a facilita utilizarea scripturilor:

### Comenzi pentru Baza de Date

- `npm run db:reset` - Resetează baza de date (șterge toate datele)
- `npm run db:seed` - Populează baza de date cu date de test
- `npm run db:fresh` - Resetează și populează baza de date într-un singur pas

### Comenzi pentru Verificarea Erorilor

- `npm run check:code` - Verifică erorile în fișierele de cod
- `npm run check:pages` - Verifică erorile pe fiecare pagină
- `npm run check:browser` - Verifică erorile în browser
- `npm run check:all` - Rulează toate verificările

## Instrucțiuni de Utilizare

### Configurare Inițială

1. Asigurați-vă că aveți variabilele de mediu configurate corect:

   - `VITE_SUPABASE_URL` - URL-ul proiectului Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Cheia service_role pentru acces complet la baza de date

2. Creați funcțiile RPC în Supabase:
   - Copiați conținutul fișierului `create-rpc-functions.sql` în editorul SQL din Supabase
   - Executați scriptul pentru a crea funcțiile necesare pentru crearea tabelelor
   - Copiați conținutul fișierului `create-supabase-functions.sql` în editorul SQL din Supabase
   - Executați scriptul pentru a crea funcțiile necesare pentru resetarea și popularea bazei de date

### Resetarea Bazei de Date

Pentru a șterge toate datele din baza de date:

```bash
npm run db:reset
```

Acest script va șterge toate datele din tabelele existente, dar va păstra structura tabelelor.

### Popularea Bazei de Date

Pentru a adăuga date de test în baza de date:

```bash
npm run db:seed
```

Acest script va crea un utilizator de test (dacă nu există deja) și va adăuga proiecte și materiale de test.

### Resetarea și Popularea Bazei de Date

Pentru a șterge toate datele și a adăuga date de test într-un singur pas:

```bash
npm run db:fresh
```

Această comandă va executa atât `db:reset` cât și `db:seed` într-o singură operațiune.

## Interfața Grafică

Am adăugat și o interfață grafică pentru gestionarea bazei de date, accesibilă la ruta `/debug` în aplicație (doar în modul de dezvoltare).

## Verificarea Erorilor

### Verificarea Erorilor în Cod

Scriptul `check-code-errors.js` verifică fișierele de cod pentru probleme comune, cum ar fi console.log, debugger, TODO, FIXME, etc.

```bash
npm run check:code
```

Acest script va genera un raport în format JSON `code-issues-report.json` care conține toate problemele găsite.

### Verificarea Erorilor pe Pagini

Scriptul `check-pages-errors.js` deschide fiecare pagină din aplicație și verifică erorile din consolă.

```bash
npm run check:pages
```

Acest script va genera un raport în format JSON `page-errors-report.json` care conține toate erorile găsite pe fiecare pagină.

### Verificarea Erorilor în Browser

Scriptul `check-browser-errors.js` deschide aplicația în browser și monitorizează erorile din consolă în timp ce efectuează acțiuni pe pagină.

```bash
npm run check:browser
```

Acest script va genera un raport în format JSON `browser-errors-report.json` care conține toate erorile găsite în browser.

### Rularea Tuturor Verificărilor

Scriptul `run-all-checks.js` rulează toate scripturile de verificare și generează un raport final.

```bash
npm run check:all
```

Acest script va genera un raport final în format JSON `final-report.json` care combină toate rapoartele.

## Avertisment

**ATENȚIE**: Aceste scripturi sunt destinate doar pentru mediul de dezvoltare. Nu utilizați aceste operațiuni în producție, deoarece vor șterge date reale.
