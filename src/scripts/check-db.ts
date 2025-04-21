/**
 * Script pentru verificarea stării bazei de date
 * Acest script verifică dacă tabelele necesare există și sunt accesibile
 */

import { supabase } from "../lib/supabase";
import chalk from "chalk";

// Lista tabelelor care trebuie verificate
const TABLES_TO_CHECK = [
  "profiles",
  "projects",
  "materials",
  "budgets",
  "expenses",
  "budget_categories",
  "reports",
  "report_templates",
  "resources",
  "resource_allocations",
  "resource_categories",
  "resource_category_mappings",
  "tasks",
  "user_roles",
  "health_check",
  "supplier_announcements",
  "supplier_announcement_files",
  "material_orders",
  "project_order_settings",
];

/**
 * Funcție pentru verificarea unui tabel
 * @param {string} tableName Numele tabelului
 */
async function checkTable(
  tableName: string
): Promise<{ status: "ok" | "error"; message?: string }> {
  try {
    // Removed console statement
    const { data, error } = await supabase.from(tableName).select("*").limit(1);

    if (error) {
      // Removed console statement
      return { status: "error", message: error.message };
    }

    // Removed console statement
    return { status: "ok" };
  } catch (error) {
    // Removed console statement
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Funcție principală pentru verificarea bazei de date
 */
async function checkDatabase() {
  // Removed console statement

  const results: Record<string, { status: "ok" | "error"; message?: string }> =
    {};
  let hasErrors = false;

  for (const table of TABLES_TO_CHECK) {
    try {
    results[table] = await checkTable(table);
    } catch (error) {
      // Handle error appropriately
    }
    if (results[table].status === "error") {
      hasErrors = true;
    }
  }

  // Removed console statement
  // Removed console statement

  for (const [table, result] of Object.entries(results)) {
    if (result.status === "ok") {
      // Removed console statement
    } else {
      // Removed console statement
    }
  }

  // Removed console statement

  if (hasErrors) {
    // Removed console statement
    // Removed console statement
    // Removed console statement
    // Removed console statement
    // Removed console statement
    // Removed console statement
  } else {
    // Removed console statement
  }
}

// Executăm funcția principală
checkDatabase().catch((error) => {
  // Removed console statement
  process.exit(1);
});
