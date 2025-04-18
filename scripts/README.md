# Scripturi pentru Gestionarea Bazei de Date

Acest director conține scripturi pentru gestionarea bazei de date Supabase utilizată în aplicație.

## Fișiere Disponibile

- `reset-database.js` - Script pentru resetarea completă a bazei de date (șterge toate datele)
- `seed-database.js` - Script pentru popularea bazei de date cu date de test
- `create-rpc-functions.sql` - Script SQL pentru crearea funcțiilor RPC necesare în Supabase
- `create-supabase-functions.sql` - Script SQL pentru crearea funcțiilor RPC pentru gestionarea bazei de date

## Comenzi NPM

Am adăugat următoarele comenzi în `package.json` pentru a facilita utilizarea scripturilor:

- `npm run db:reset` - Resetează baza de date (șterge toate datele)
- `npm run db:seed` - Populează baza de date cu date de test
- `npm run db:fresh` - Resetează și populează baza de date într-un singur pas

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

## Avertisment

**ATENȚIE**: Aceste scripturi sunt destinate doar pentru mediul de dezvoltare. Nu utilizați aceste operațiuni în producție, deoarece vor șterge date reale.
