use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct RomItem {
    pub name: String,
    pub filename: String,
    pub path: String,
    pub extension: String,
    pub size_bytes: u64,
}

#[tauri::command]
fn get_default_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    let path = app_handle
        .path()
        .resolve(Path::new("."), tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
        
    let mut path_str = path.to_string_lossy().into_owned();
    
    if path_str.starts_with(r"\\?\") {
        path_str = path_str.replacen(r"\\?\", "", 1);
    }
    
    Ok(path_str)
}

#[tauri::command]
fn list_roms(folder_path: &str, extensions: Option<Vec<String>>) -> Result<Vec<RomItem>, String> {
    let mut roms = Vec::new();
    let path_final = PathBuf::from(folder_path);

    if !path_final.exists() {
        return Err(format!("O caminho especificado não existe: {}", folder_path));
    }

    let valid_extensions: Vec<String> = extensions.unwrap_or_else(|| {
        vec!["ch8".into(), "gb".into(), "gbc".into(), "nes".into(), "bin".into()]
    }).into_iter().map(|e| e.to_lowercase().replace('.', "")).collect();

    if let Ok(entries) = fs::read_dir(path_final) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    let ext_str = ext.to_string_lossy().to_lowercase();
                    if valid_extensions.contains(&ext_str) {
                        let filename = path.file_name().unwrap_or_default().to_string_lossy().into_owned();
                        let stem = path.file_stem().unwrap_or_default().to_string_lossy().into_owned();
                        let metadata = entry.metadata().ok();
                        let size_bytes = metadata.map(|m| m.len()).unwrap_or(0);

                        roms.push(RomItem {
                            name: stem,
                            filename,
                            path: path.to_string_lossy().into_owned(),
                            extension: ext_str,
                            size_bytes,
                        });
                    }
                }
            }
        }
        // Ordena alfabeticamente pelo nome do jogo
        roms.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        Ok(roms)
    } else {
        Err("Não foi possível ler a pasta de ROMs.".to_string())
    }
}

mod emulators;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            list_roms, 
            get_default_path,
            emulators::download_emulator,
            emulators::check_installed_emulators,
            emulators::delete_emulator,
            emulators::launch_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}