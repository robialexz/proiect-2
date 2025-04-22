import { supabase } from "@/lib/supabase";
import { SupabaseTables } from "@/types/supabase-tables";
import { logsService } from "./logs-service";

// Tipul pentru setările de securitate
export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  accountLockDuration: number;
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
  };
}

// Tipul pentru setările de email
export interface EmailSettings {
  sender: string;
  enableWelcomeEmail: boolean;
  enablePasswordResetEmail: boolean;
  enableNotificationEmails: boolean;
}

// Tipul pentru setările de mentenanță
export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

// Tipul pentru setările de backup
export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: number;
  retentionDays: number;
}

// Tipul pentru toate setările sistemului
export interface SystemSettings {
  security: SecuritySettings;
  email: EmailSettings;
  maintenance: MaintenanceSettings;
  backup: BackupSettings;
}

// Setările implicite ale sistemului
const DEFAULT_SETTINGS: SystemSettings = {
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
    },
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    accountLockDuration: 15,
    twoFactorAuth: {
      enabled: false,
      required: false,
    },
  },
  email: {
    sender: "noreply@example.com",
    enableWelcomeEmail: true,
    enablePasswordResetEmail: true,
    enableNotificationEmails: true,
  },
  maintenance: {
    enabled: false,
    message: "The system is currently under maintenance. Please try again later.",
  },
  backup: {
    autoBackup: true,
    backupFrequency: 24,
    retentionDays: 30,
  },
};

/**
 * Serviciu pentru gestionarea setărilor sistemului
 */
class SettingsService {
  /**
   * Obține toate setările sistemului
   * @returns Setările sistemului
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const { data, error } = await supabase
        .from(SupabaseTables.SYSTEM_SETTINGS)
        .select("*")
        .single();

      if (error) {
        // Dacă nu există setări, returnăm setările implicite
        if (error.code === "PGRST116") {
          return DEFAULT_SETTINGS;
        }
        throw error;
      }

      // Combinăm setările din baza de date cu cele implicite pentru a asigura
      // că toate câmpurile sunt prezente
      return {
        security: {
          ...DEFAULT_SETTINGS.security,
          ...(data.security || {}),
        },
        email: {
          ...DEFAULT_SETTINGS.email,
          ...(data.email || {}),
        },
        maintenance: {
          ...DEFAULT_SETTINGS.maintenance,
          ...(data.maintenance || {}),
        },
        backup: {
          ...DEFAULT_SETTINGS.backup,
          ...(data.backup || {}),
        },
      };
    } catch (error) {
      console.error("Error fetching settings:", error);
      // În caz de eroare, returnăm setările implicite
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Salvează setările sistemului
   * @param settings Setările de salvat
   * @returns Setările salvate
   */
  async saveSettings(settings: SystemSettings): Promise<SystemSettings> {
    try {
      // Verificăm dacă există deja setări
      const { data: existingData, error: checkError } = await supabase
        .from(SupabaseTables.SYSTEM_SETTINGS)
        .select("id")
        .single();

      let updateError = null;

      if (checkError && checkError.code === "PGRST116") {
        // Nu există setări, le inserăm
        const { error } = await supabase
          .from(SupabaseTables.SYSTEM_SETTINGS)
          .insert([settings]);

        updateError = error;
      } else if (!checkError) {
        // Există setări, le actualizăm
        const { error } = await supabase
          .from(SupabaseTables.SYSTEM_SETTINGS)
          .update(settings)
          .eq("id", existingData.id);

        updateError = error;
      } else {
        // Altă eroare
        throw checkError;
      }

      if (updateError) throw updateError;

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system",
        "update",
        "settings",
        undefined,
        "Updated system settings",
        "info"
      );

      return settings;
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  /**
   * Actualizează setările de securitate
   * @param securitySettings Setările de securitate
   * @returns Setările actualizate
   */
  async updateSecuritySettings(securitySettings: SecuritySettings): Promise<SystemSettings> {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        security: securitySettings,
      };

      return this.saveSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating security settings:", error);
      throw error;
    }
  }

  /**
   * Actualizează setările de email
   * @param emailSettings Setările de email
   * @returns Setările actualizate
   */
  async updateEmailSettings(emailSettings: EmailSettings): Promise<SystemSettings> {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        email: emailSettings,
      };

      return this.saveSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating email settings:", error);
      throw error;
    }
  }

  /**
   * Actualizează setările de mentenanță
   * @param maintenanceSettings Setările de mentenanță
   * @returns Setările actualizate
   */
  async updateMaintenanceSettings(maintenanceSettings: MaintenanceSettings): Promise<SystemSettings> {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        maintenance: maintenanceSettings,
      };

      return this.saveSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating maintenance settings:", error);
      throw error;
    }
  }

  /**
   * Actualizează setările de backup
   * @param backupSettings Setările de backup
   * @returns Setările actualizate
   */
  async updateBackupSettings(backupSettings: BackupSettings): Promise<SystemSettings> {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        backup: backupSettings,
      };

      return this.saveSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating backup settings:", error);
      throw error;
    }
  }

  /**
   * Resetează setările la valorile implicite
   * @returns Setările implicite
   */
  async resetSettings(): Promise<SystemSettings> {
    try {
      return this.saveSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error("Error resetting settings:", error);
      throw error;
    }
  }

  /**
   * Verifică dacă modul de mentenanță este activat
   * @returns True dacă modul de mentenanță este activat
   */
  async isMaintenanceModeEnabled(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.maintenance.enabled;
    } catch (error) {
      console.error("Error checking maintenance mode:", error);
      return false;
    }
  }

  /**
   * Obține mesajul de mentenanță
   * @returns Mesajul de mentenanță
   */
  async getMaintenanceMessage(): Promise<string> {
    try {
      const settings = await this.getSettings();
      return settings.maintenance.message;
    } catch (error) {
      console.error("Error getting maintenance message:", error);
      return "The system is currently under maintenance. Please try again later.";
    }
  }
}

export const settingsService = new SettingsService();
