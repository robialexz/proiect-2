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
    console.log(chalk.blue(`Checking table: ${tableName}`));
    const { data, error } = await supabase.from(tableName).select("*").limit(1);

    if (error) {
      console.error(chalk.red(`Error checking table ${tableName}:`), error);
      return { status: "error", message: error.message };
    }

    console.log(chalk.green(`Table ${tableName} exists and is accessible`));
    return { status: "ok" };
  } catch (error) {
    console.error(chalk.red(`Error checking table ${tableName}:`), error);
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
  console.log(chalk.yellow("Starting database check..."));

  const results: Record<string, { status: "ok" | "error"; message?: string }> =
    {};
  let hasErrors = false;

  for (const table of TABLES_TO_CHECK) {
    results[table] = await checkTable(table);
    if (results[table].status === "error") {
      hasErrors = true;
    }
  }

  console.log(chalk.yellow("\nDatabase check summary:"));
  console.log("----------------------------------------");

  for (const [table, result] of Object.entries(results)) {
    if (result.status === "ok") {
      console.log(`${chalk.green("✓")} ${table}: ${chalk.green("OK")}`);
    } else {
      console.log(
        `${chalk.red("✗")} ${table}: ${chalk.red("ERROR")} - ${result.message}`
      );
    }
  }

  console.log("----------------------------------------");

  if (hasErrors) {
    console.log(
      chalk.red(
        "\nSome tables have issues. Please check the database configuration."
      )
    );
    console.log(
      chalk.yellow("You can use the following commands to fix the database:")
    );
    console.log(
      chalk.blue("  npm run db:reset    - Reset the database (delete all data)")
    );
    console.log(
      chalk.blue("  npm run db:seed     - Seed the database with test data")
    );
    console.log(
      chalk.blue("  npm run db:fresh    - Reset and seed the database")
    );
    console.log(
      chalk.yellow(
        "\nOr use the Database Manager in the Debug page of the application."
      )
    );
  } else {
    console.log(chalk.green("\nAll tables are OK!"));
  }
}

// Executăm funcția principală
checkDatabase().catch((error) => {
  console.error(chalk.red("Error checking database:"), error);
  process.exit(1);
});
