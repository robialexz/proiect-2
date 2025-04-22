// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;

// Comandă pentru a obține informații despre sistem
#[tauri::command]
fn get_system_info() -> String {
    let os_info = format!("OS: {}", std::env::consts::OS);
    let arch_info = format!("Architecture: {}", std::env::consts::ARCH);
    let family_info = format!("OS Family: {}", std::env::consts::FAMILY);

    format!("{}, {}, {}", os_info, arch_info, family_info)
}

// Comandă pentru a verifica dacă un fișier există
#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

// Comandă pentru a citi un fișier
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

// Comandă pentru a scrie într-un fișier
#[tauri::command]
fn write_file(path: String, contents: String) -> Result<(), String> {
    fs::write(path, contents).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            file_exists,
            read_file,
            write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
