use std::fs;
use tauri::Manager;

#[tauri::command]
fn get_default_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let path = app_handle
        .path()
        .resolve(std::path::Path::new("."), tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
        
    let mut path_str = path.to_string_lossy().into_owned();
    
    if path_str.starts_with(r"\\?\") {
        path_str = path_str.replacen(r"\\?\", "", 1);
    }
    
    Ok(path_str)
}

#[tauri::command]
fn list_roms(folder_path: &str) -> Result<Vec<String>, String> {
    let mut roms = Vec::new();
    let path_final = std::path::PathBuf::from(folder_path);

    if let Ok(entries) = fs::read_dir(path_final) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    if let Some(ext) = path.extension() {
                        if ext == "gb" || ext == "ch8" || ext == "GB" || ext == "CH8" {
                            if let Some(name) = path.file_name() {
                                roms.push(name.to_string_lossy().into_owned());
                            }
                        }
                    }
                }
            }
        }
        Ok(roms)
    } else {
        Err("Não foi possível ler a pasta".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_roms, 
            get_default_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}