use std::fs::File;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager;
use futures_util::StreamExt;

/// Retorna a lista de nomes de binários para um emulador: (windows_bin, unix_bin)
fn get_emulator_binary_names(id: &str) -> Option<(&'static str, &'static str)> {
    match id {
        "chip-8" => Some(("chip8.exe", "chip8")),
        "gameboy" => Some(("gameboy.exe", "gameboy")),
        "ps1" => Some(("ps1.exe", "ps1")),
        _ => None,
    }
}

/// Retorna o nome do binário apropriado para a plataforma atual
fn get_platform_binary_name(id: &str) -> Option<&'static str> {
    let (win, unix) = get_emulator_binary_names(id)?;
    if cfg!(target_os = "windows") {
        Some(win)
    } else {
        Some(unix)
    }
}

// Função auxiliar para descobrir/criar a pasta onde ficam os executáveis
pub fn get_emulators_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle
        .path()
        .resolve(Path::new("."), tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    
    path.push("installed_emulators");
    if !path.exists() {
        std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

/// Verifica quais emuladores estão fisicamente instalados no disco
#[tauri::command]
pub fn check_installed_emulators(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let dir = get_emulators_dir(&app_handle)?;
    let mut installed = Vec::new();

    let candidate_ids = ["chip-8", "gameboy", "ps1"];
    for id in candidate_ids {
        if let Some((win_name, unix_name)) = get_emulator_binary_names(id) {
            let win_path = dir.join(win_name);
            let unix_path = dir.join(unix_name);
            if win_path.exists() || unix_path.exists() {
                installed.push(id.to_string());
            }
        }
    }

    Ok(installed)
}

/// Remove o executável de um emulador
#[tauri::command]
pub fn delete_emulator(app_handle: tauri::AppHandle, id: String) -> Result<String, String> {
    let dir = get_emulators_dir(&app_handle)?;
    let mut deleted = false;

    if let Some((win_name, unix_name)) = get_emulator_binary_names(&id) {
        let win_path = dir.join(win_name);
        if win_path.exists() {
            let _ = std::fs::remove_file(win_path);
            deleted = true;
        }
        let unix_path = dir.join(unix_name);
        if unix_path.exists() {
            let _ = std::fs::remove_file(unix_path);
            deleted = true;
        }
    }

    if deleted {
        Ok(format!("Emulador {} removido com sucesso.", id))
    } else {
        Err(format!("Binário do emulador {} não foi encontrado.", id))
    }
}

/// Executa o emulador passando o caminho da ROM como argumento CLI
#[tauri::command]
pub fn launch_game(
    app_handle: tauri::AppHandle,
    id: String,
    rom_path: String,
) -> Result<String, String> {
    let dir = get_emulators_dir(&app_handle)?;

    // Verifica se a ROM existe
    let rom = Path::new(&rom_path);
    if !rom.exists() {
        return Err(format!("O arquivo de ROM não foi encontrado: {}", rom_path));
    }

    // Localiza o executável instalado
    let (win_name, unix_name) = get_emulator_binary_names(&id)
        .ok_or_else(|| format!("Emulador desconhecido: {}", id))?;

    let binary_path = if cfg!(target_os = "windows") {
        dir.join(win_name)
    } else {
        let unix_path = dir.join(unix_name);
        if unix_path.exists() {
            unix_path
        } else {
            // Fallback para .exe caso esteja no wine ou nome genérico
            dir.join(win_name)
        }
    };

    if !binary_path.exists() {
        return Err(format!(
            "O executável do emulador {} não está instalado. Baixe-o primeiro na aba Downloads.",
            id
        ));
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = std::fs::metadata(&binary_path) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o755);
            let _ = std::fs::set_permissions(&binary_path, perms);
        }
    }

    // Dispara o processo do emulador de forma independente (não bloqueia a interface)
    Command::new(&binary_path)
        .arg(&rom_path)
        .current_dir(&dir)
        .spawn()
        .map_err(|e| format!("Falha ao iniciar o emulador: {}", e))?;

    Ok(format!("Jogo iniciado com sucesso!"))
}

#[tauri::command]
pub async fn download_emulator(app_handle: tauri::AppHandle, id: String) -> Result<String, String> {
    let mut dir = get_emulators_dir(&app_handle)?;
    
    // 1. Define o Link da Release do GitHub e o nome do arquivo final baseado no ID e SO
    let filename = get_platform_binary_name(&id)
        .ok_or_else(|| format!("Emulador não suportado: {}", id))?;

    let url = match id.as_str() {
        "chip-8" => {
            if cfg!(target_os = "windows") {
                "https://github.com/jvgusmao06/Chip-8/releases/latest/download/chip8.exe".to_string()
            } else {
                "https://github.com/jvgusmao06/Chip-8/releases/latest/download/chip8".to_string()
            }
        }
        _ => return Err("Este emulador ainda não está disponível para download.".to_string()),
    };

    dir.push(filename);

    // 2. Cria o cliente HTTP e faz a requisição para o GitHub
    let client = reqwest::Client::new();
    let response = client.get(&url)
        .header("User-Agent", "Tauri-Emulator-Hub") 
        .send()
        .await
        .map_err(|e| format!("Erro ao conectar ao GitHub: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Erro ao baixar arquivo do GitHub (Status {}). Certifique-se de que a release existe.",
            response.status()
        ));
    }

    // 3. Cria o arquivo físico local
    let mut file = File::create(&dir)
        .map_err(|e| format!("Não foi possível criar o arquivo local: {}", e))?;
    
    // 4. Baixa o arquivo do GitHub em stream e grava
    let mut stream = response.bytes_stream();
    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| format!("Erro durante o download dos dados: {}", e))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Erro ao salvar pedaço do arquivo: {}", e))?;
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = std::fs::metadata(&dir) {
            let mut perms = metadata.permissions();
            perms.set_mode(0o755);
            let _ = std::fs::set_permissions(&dir, perms);
        }
    }

    Ok(format!("{} baixado e instalado com sucesso!", id.to_uppercase()))
}