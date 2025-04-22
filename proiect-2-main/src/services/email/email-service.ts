import { supabase } from "@/services/api/supabase-client";
import welcomeEmailHtml from "@/emails/welcome-email.html?raw";
import welcomeEmailText from "@/emails/welcome-email.txt?raw";

/**
 * Serviciu pentru trimiterea emailurilor
 */
export const emailService = {
  /**
   * Trimite un email de bun venit utilizatorului nou înregistrat
   * @param email Adresa de email a utilizatorului
   * @param displayName Numele de afișare al utilizatorului
   */
  async sendWelcomeEmail(email: string, displayName: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Removed console statement
      
      // Personalizăm șabloanele de email
      const personalizedHtmlEmail = welcomeEmailHtml
        .replace(/{{email}}/g, email)
        .replace(/{{displayName}}/g, displayName || email.split('@')[0]);
      
      const personalizedTextEmail = welcomeEmailText
        .replace(/\[email\]/g, email)
        .replace(/\[displayName\]/g, displayName || email.split('@')[0]);
      
      // Folosim Supabase Edge Function pentru a trimite emailul
      // Notă: Trebuie să creați această funcție în Supabase
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject: "Bun venit la InventoryMaster!",
          html: personalizedHtmlEmail,
          text: personalizedTextEmail,
        },
      });
      
      if (error) {
        // Removed console statement
        return { success: false, error };
      }
      
      // Removed console statement
      return { success: true };
    } catch (error) {
      // Removed console statement
      return { success: false, error };
    }
  },
  
  /**
   * Trimite un email de confirmare a adresei de email
   * @param email Adresa de email a utilizatorului
   * @param confirmationLink Link-ul de confirmare
   */
  async sendEmailConfirmation(email: string, confirmationLink: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Removed console statement
      
      // Folosim Supabase Edge Function pentru a trimite emailul
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject: "Confirmă adresa de email - InventoryMaster",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Confirmă adresa de email</h2>
              <p>Mulțumim pentru înregistrare! Te rugăm să confirmi adresa de email făcând click pe butonul de mai jos:</p>
              <a href="${confirmationLink}" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 15px 0;">
                Confirmă adresa de email
              </a>
              <p>Sau copiază și lipește următorul link în browser:</p>
              <p>${confirmationLink}</p>
              <p>Dacă nu tu ai creat acest cont, te rugăm să ignori acest email.</p>
              <p>Mulțumim,<br>Echipa InventoryMaster</p>
            </div>
          `,
          text: `
            Confirmă adresa de email
            
            Mulțumim pentru înregistrare! Te rugăm să confirmi adresa de email accesând următorul link:
            
            ${confirmationLink}
            
            Dacă nu tu ai creat acest cont, te rugăm să ignori acest email.
            
            Mulțumim,
            Echipa InventoryMaster
          `,
        },
      });
      
      if (error) {
        // Removed console statement
        return { success: false, error };
      }
      
      // Removed console statement
      return { success: true };
    } catch (error) {
      // Removed console statement
      return { success: false, error };
    }
  },
};
