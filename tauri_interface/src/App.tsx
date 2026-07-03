import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [folderPath, setFolderPath] = useState("default"); // Guarda o caminho da pasta
  const [romsList, setRomsList] = useState<string[]>([]); // Guarda a lista de ROMs vindas do Rust
  const [status, setStatus] = useState("Clique para escanear as ROMs da pasta.");

  // Função que pede para o Rust listar as ROMs
  async function handleScanFolder() {
    setStatus("Escaneando pasta...");
    try {
      // Chama a função 'list_roms' passando o caminho que está no input
      const resultado = await invoke<string[]>("list_roms", { folderPath });
      setRomsList(resultado);
      setStatus(`Sucesso! Encontradas ${resultado.length} ROMs.`);
    } catch (erro) {
      setStatus(`Erro: ${erro}`);
      setRomsList([]);
    }
  }

  // Função que pede para o Rust abrir o jogo clicado
  async function handlePlayGame(romName: string) {
    setStatus(`Iniciando ${romName}...`);
    try {
      // Descobre o tipo de emulador pela extensão do arquivo
      const tipoEmulador = romName.endsWith(".gb") ? "Game Boy" : "CHIP-8";
      
      const resposta = await invoke<string>("open_game", { 
        emulatorType: tipoEmulador, 
        romName: romName 
      });
      setStatus(resposta);
    } catch (erro) {
      setStatus(`Erro ao abrir jogo: ${erro}`);
    }
  }

  return (
    <div className="container">
      <h1>Minha Central de Emuladores</h1>
      <p className="status-bar">{status}</p>

      <div className="config-box">
        <input 
          type="text" 
          value={folderPath} 
          onChange={(e) => setFolderPath(e.target.value)} 
          placeholder="Ex: C:\Jogos\Gameboy"
        />
        <button onClick={handleScanFolder}>Escanear Pasta</button>
      </div>

      <h2>Jogos Encontrados</h2>
      <div className="grid-emuladores">
        {romsList.length === 0 ? (
          <p>Nenhuma ROM carregada. Esqueceu de escanear ou a pasta está vazia?</p>
        ) : (
          romsList.map((rom, index) => (
            <div key={index} className="card-emulador">
              <h3>{rom}</h3>
              <p><strong>Console:</strong> {rom.endsWith(".gb") ? "Game Boy" : "CHIP-8"}</p>
              <button onClick={() => handlePlayGame(rom)}>Jogar</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;