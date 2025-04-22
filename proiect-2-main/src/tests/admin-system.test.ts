import { usersService, rolesService, logsService, settingsService } from "@/services/admin";
import { UserRoles } from "@/types/supabase-tables";

/**
 * Teste pentru sistemul de administrare
 * 
 * Aceste teste verifică funcționalitatea sistemului de administrare a utilizatorilor,
 * rolurilor, jurnalelor și setărilor.
 * 
 * Pentru a rula aceste teste, trebuie să aveți un utilizator cu rol de administrator
 * în baza de date Supabase.
 */

describe("Admin System Tests", () => {
  // Teste pentru serviciul de utilizatori
  describe("Users Service", () => {
    test("Should get all users", async () => {
      const users = await usersService.getUsers();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });

    test("Should get user by ID", async () => {
      // Obținem toți utilizatorii
      const users = await usersService.getUsers();
      
      // Verificăm dacă există utilizatori
      if (users.length === 0) {
        console.warn("No users found in the database");
        return;
      }

      // Obținem primul utilizator
      const firstUser = users[0];
      
      // Obținem utilizatorul după ID
      const user = await usersService.getUserById(firstUser.id);
      
      // Verificăm dacă utilizatorul a fost găsit
      expect(user).toBeDefined();
      expect(user?.id).toBe(firstUser.id);
    });

    test("Should create, update and delete user", async () => {
      // Creăm un utilizator nou
      const email = `test-${Date.now()}@example.com`;
      const password = "Test123!";
      const role = UserRoles.VIEWER;
      
      const createdUser = await usersService.createUser(email, password, role);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(email);
      expect(createdUser.role).toBe(role);
      
      // Actualizăm rolul utilizatorului
      const updatedUser = await usersService.updateUser(createdUser.id, {
        role: UserRoles.MANAGER,
      });
      expect(updatedUser).toBeDefined();
      expect(updatedUser.role).toBe(UserRoles.MANAGER);
      
      // Ștergem utilizatorul
      const deleteResult = await usersService.deleteUser(createdUser.id);
      expect(deleteResult).toBeDefined();
      expect(deleteResult.success).toBe(true);
    });
  });

  // Teste pentru serviciul de roluri
  describe("Roles Service", () => {
    test("Should get all roles", async () => {
      const roles = await rolesService.getRoles();
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
    });

    test("Should get role by name", async () => {
      const role = await rolesService.getRoleByName(UserRoles.ADMIN);
      expect(role).toBeDefined();
      expect(role?.name).toBe(UserRoles.ADMIN);
    });

    test("Should get users by role", async () => {
      const users = await rolesService.getUsersByRole(UserRoles.ADMIN);
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  // Teste pentru serviciul de jurnale
  describe("Logs Service", () => {
    test("Should get logs", async () => {
      const logs = await logsService.getLogs();
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
    });

    test("Should log user action", async () => {
      // Obținem toți utilizatorii
      const users = await usersService.getUsers();
      
      // Verificăm dacă există utilizatori
      if (users.length === 0) {
        console.warn("No users found in the database");
        return;
      }

      // Obținem primul utilizator
      const firstUser = users[0];
      
      // Înregistrăm o acțiune
      const result = await logsService.logUserAction(
        firstUser.id,
        "test",
        "test",
        "test-id",
        "Test action",
        "info"
      );
      
      expect(result).toBeDefined();
    });

    test("Should export logs", async () => {
      const csv = await logsService.exportLogs();
      expect(csv).toBeDefined();
      expect(typeof csv).toBe("string");
    });
  });

  // Teste pentru serviciul de setări
  describe("Settings Service", () => {
    test("Should get settings", async () => {
      const settings = await settingsService.getSettings();
      expect(settings).toBeDefined();
      expect(settings.security).toBeDefined();
      expect(settings.email).toBeDefined();
      expect(settings.maintenance).toBeDefined();
      expect(settings.backup).toBeDefined();
    });

    test("Should update security settings", async () => {
      // Obținem setările curente
      const currentSettings = await settingsService.getSettings();
      
      // Actualizăm setările de securitate
      const updatedSettings = await settingsService.updateSecuritySettings({
        ...currentSettings.security,
        passwordPolicy: {
          ...currentSettings.security.passwordPolicy,
          minLength: 10,
        },
      });
      
      expect(updatedSettings).toBeDefined();
      expect(updatedSettings.security.passwordPolicy.minLength).toBe(10);
    });

    test("Should check maintenance mode", async () => {
      const isEnabled = await settingsService.isMaintenanceModeEnabled();
      expect(typeof isEnabled).toBe("boolean");
    });
  });
});
