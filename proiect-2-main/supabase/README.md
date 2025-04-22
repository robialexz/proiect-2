# Configurarea Supabase pentru monitorizarea erorilor

Acest director conține scripturile SQL necesare pentru configurarea bazei de date Supabase pentru a stoca erorile capturate de sistemul de monitorizare a erorilor.

## Tabela error_logs

Scriptul `error_logs_table.sql` creează tabela `error_logs` și configurează politicile de securitate Row Level Security (RLS) pentru a proteja datele.

### Cum să rulezi scriptul

1. Deschide consola SQL din Supabase Studio
2. Copiază și lipește conținutul fișierului `error_logs_table.sql`
3. Execută scriptul

### Activarea stocării erorilor în Supabase

După ce ai creat tabela, poți activa stocarea erorilor în Supabase modificând fișierul `src/lib/error-monitoring.ts`:

1. Modifică parametrul `useSupabase` la `true` în constructor și în metoda `getInstance`:

```typescript
private constructor(useSupabase = true) { // Activăm stocarea în Supabase
  this.storage = useSupabase
    ? new SupabaseErrorStorage()
    : new LocalErrorStorage();
  this.setupGlobalHandlers();
}

public static getInstance(useSupabase = true): ErrorMonitoringService { // Activăm stocarea în Supabase
  // ...
}
```

2. Dacă dorești, poți reactiva și captarea erorilor din consolă decomentând codul respectiv.

## Notă importantă

Asigură-te că tabela `error_logs` există în baza de date înainte de a activa stocarea erorilor în Supabase, altfel vei primi erori în consolă.
