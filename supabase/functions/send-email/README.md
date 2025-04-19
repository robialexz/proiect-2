# Supabase Edge Function pentru trimiterea emailurilor

Această funcție permite trimiterea de emailuri din aplicația InventoryMaster.

## Configurare

Pentru a configura și implementa această funcție, urmați pașii de mai jos:

### 1. Instalați Supabase CLI

```bash
npm install -g supabase
```

### 2. Autentificați-vă în Supabase

```bash
supabase login
```

### 3. Configurați variabilele de mediu

Creați un fișier `.env` în directorul `supabase/functions/send-email` cu următoarele variabile:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@inventorymaster.app
EMAIL_FROM_NAME=InventoryMaster
```

Înlocuiți valorile cu datele dvs. reale.

### 4. Implementați funcția

```bash
supabase functions deploy send-email --project-ref btvpnzsmrfrlwczanbcg
```

## Utilizare

Funcția poate fi apelată din aplicație folosind Supabase Client:

```typescript
const { data, error } = await supabase.functions.invoke("send-email", {
  body: {
    to: "user@example.com",
    subject: "Subiect email",
    html: "<p>Conținut HTML</p>",
    text: "Conținut text",
  },
});
```

## Parametri

- `to`: Adresa de email a destinatarului
- `subject`: Subiectul emailului
- `html`: Conținutul HTML al emailului (opțional dacă `text` este furnizat)
- `text`: Conținutul text al emailului (opțional dacă `html` este furnizat)

## Răspuns

Funcția returnează un obiect JSON cu următoarea structură:

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

Sau în caz de eroare:

```json
{
  "error": "Mesaj de eroare"
}
```

## Note

- Această funcție necesită permisiuni corespunzătoare pentru a fi apelată din aplicație
- Pentru a testa funcția local, puteți folosi comanda `supabase functions serve`
- Asigurați-vă că serviciul SMTP configurat permite trimiterea de emailuri din Supabase Edge Functions
