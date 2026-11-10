import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./DownloadPage.css";

// Uma tela com varias opções de emuladores baixaveis

interface AvailableEmulator {
  id: string;
  console: string;
  status: "available" | "downloading" | "downloaded" | "unavailable";
}

export function DownloadPage() {  
  const [downloadMessage, setDownloadMessage] = useState<string>("");
  const [emulators, setEmulators] = useState<AvailableEmulator[]>([
    {
      id: "chip-8",
      console: "CHIP-8",
      status: "available"
    },
    {
      id: "gameboy",
      console: "GameBoy",
      status: "unavailable"
    },
    {
      id: "ps1",
      console: "PS1",
      status: "unavailable"
    }
  ]);

  useEffect(() => {
    async function checkStatus() {
      try {
        const installed = await invoke<string[]>("check_installed_emulators");
        setEmulators((prev) =>
          prev.map((emul) =>
            installed.includes(emul.id) ? { ...emul, status: "downloaded" } : emul
          )
        );
      } catch {
        // Ignora caso esteja executando no browser
      }
    }
    checkStatus();
  }, []);

  async function handleDownloadEmulator(id: string) {
    const target = emulators.find(e => e.id === id);
    setEmulators(prev => prev.map(emul => emul.id === id ? { ...emul, status: "downloading" } : emul));
    setDownloadMessage(`Downloading ${target?.console ?? id}...`);

    try {
      const result = await invoke<string>("download_emulator", { id });
      setEmulators(prev => prev.map(emul => emul.id === id ? { ...emul, status: "downloaded" } : emul));
      setDownloadMessage(result);
    } catch (e) {
      setEmulators(prev => prev.map(emul => emul.id === id ? { ...emul, status: "available" } : emul));
      setDownloadMessage(`Error: ${e}`);
    }
  }

  return (
    <div>
      <h2>Available for download:</h2>
      {downloadMessage && <p className="download-status-message">{downloadMessage}</p>}
      <div className="emulators-grid">
        {emulators.map((emul) => (
          <div key={emul.id} className="card">
            <h3>{emul.console}</h3>
            <br />
            
            {emul.status === "available" && (
              <button onClick={() => handleDownloadEmulator(emul.id)}>Baixar e Instalar</button>
            )}
            {emul.status === "downloading" && (
              <button className="btn-loading" disabled>downloading...</button>
            )}
            {emul.status === "downloaded" && (
              <button className="btn-success" disabled>Pronto para Uso</button>
            )}
            {emul.status === "unavailable" && (
                <button className="btn-unavailable" disabled>Em breve...</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
