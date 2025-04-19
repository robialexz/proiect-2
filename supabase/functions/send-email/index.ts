// Supabase Edge Function pentru trimiterea emailurilor
// Pentru a implementa această funcție, trebuie să o deployați în proiectul Supabase

// NOTĂ: Acest fișier va afișa erori TypeScript în mediul de dezvoltare local
// deoarece folosește module Deno care nu sunt disponibile în Node.js.
// Aceste erori sunt normale și nu vor afecta funcționalitatea când funcția
// va fi implementată în Supabase Edge Functions.

// @ts-nocheck - Dezactivăm complet verificările TypeScript pentru acest fișier

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Configurare SMTP - înlocuiți cu datele dvs. reale
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.example.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "your-email@example.com";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "your-password";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@inventorymaster.app";
const EMAIL_FROM_NAME = Deno.env.get("EMAIL_FROM_NAME") || "InventoryMaster";

serve(async (req) => {
  // Verificăm metoda HTTP
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parsăm corpul cererii
    const { to, subject, html, text } = await req.json();

    // Validăm datele de intrare
    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Configurăm clientul SMTP
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    });

    // Trimitem emailul
    await client.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: to,
      subject: subject,
      content: text,
      html: html,
    });

    // Închidem conexiunea
    await client.close();

    // Returnăm răspunsul de succes
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    // Gestionăm erorile
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
