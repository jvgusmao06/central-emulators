use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::Manager;
use futures_util::StreamExt; // Adicione isso para conseguir ler o arquivo em pedaços

// Função auxiliar que você já tinha para descobrir a pasta
fn get_emulators_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let mut path = app_handle
        .path()
        .resolve(std::path::Path::new("."), tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    
    path.push("installed_emulators");
    if !path.exists() {
        std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    Ok(path)
}

#[tauri::command]
pub async fn download_emulator(app_handle: tauri::AppHandle, id: String) -> Result<String, String> {
    let mut dir = get_emulators_dir(&app_handle)?;
    
    // 1. Define o Link da Release do GitHub e o nome do arquivo final baseado no ID
    let (url, filename) = match id.as_str() {
        "chip-8" => (
            "https://github.com/jvgusmao06/Chip-8/releases/latest/download/chip8.exe",
            "chip8.exe",
        ),
        _ => return Err("Este emulador ainda não está disponível para download.".to_string()),
    };

    dir.push(filename);

    // 2. Cria o cliente HTTP e faz a requisição para o GitHub
    let client = reqwest::Client::new();
    let response = client.get(url)
        // O GitHub exige um "User-Agent" (identificação) para permitir downloads via código
        .header("User-Agent", "Tauri-Emulator-Hub") 
        .send()
        .await
        .map_err(|e| format!("Erro ao conectar ao GitHub: {}", e))?;

    // Verifica se o link do GitHub está correto (Status 200 OK)
    if !response.status().is_success() {
        return Err(format!("Erro no servidor do GitHub: Status {}", response.status()));
    }

    // 3. Cria o arquivo físico vazio no HD do usuário
    let mut file = File::create(&dir).map_err(|e| format!("Não foi possível criar o arquivo local: {}", e))?;
    
    // 4. Baixa o arquivo do GitHub em pedaços (Stream) e vai escrevendo no HD
    let mut stream = response.bytes_stream();
    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| format!("Erro durante o download dos dados: {}", e))?;
        file.write_all(&chunk).map_err(|e| format!("Erro ao salvar pedaço do arquivo: {}", e))?;
    }

    Ok(format!("{} baixado e instalado com sucesso!", id.to_uppercase()))
}