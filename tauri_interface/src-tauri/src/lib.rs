use std::process::Command;
use std::fs;
use std::env;

#[tauri::command]
fn list_roms(folder_path: &str) -> Result<Vec<String>, String>{
    let mut roms = Vec::new();

    // 1. Descobre qual caminho usar
    let path_final = if folder_path == "default" {
        // Se for "padrao", pega a pasta atual do projeto e adiciona "/files/roms"
        let mut atual = env::current_dir().map_err(|e| e.to_string())?;
        atual.push("files");
        atual.push("roms");
        atual
    } else {
        // Se o usuário digitou algo, usa o que ele digitou
        std::path::PathBuf::from(folder_path)
    };

    if let Ok(entries) = fs::read_dir(path_final){
        for entry in entries{
            if let Ok(entry) = entry{
                let path = entry.path();

                if path.is_file(){
                    if let Some(ext) = path.extension(){
                        if ext == "gb" || ext == "ch8"{
                            if let Some(name) = path.file_name(){
                                roms.push(name.to_string_lossy().into_owned());
                            }
                        }
                    }
                }
            }
        }
        Ok(roms)
    }
    else{
        Err("Não foi possível ler a pasta".to_string())
    }
}

#[tauri::command]
fn open_game(emulator_id: &str, rom_path: &str) -> Result<String, String>{
    let emulator_exe = match emulator_id{
        "chip8" => "emulator/chip8.exe",
        _ => return Err("Emulador inválido".to_string()),
    };

    Command::new(emulator_exe)
        .arg(rom_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok("Jogo iniciado com sucesso".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_roms, open_game])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
