import { useState, useEffect } from "react";
import "./DownloadPage.css";

// Uma tela com varias opções de emuladores baixaveis

interface AvailableEmulator{
  id: string;
  console: string;
  status: "available" | "downloading" | "downloaded" | "unavailable";
}

export function DownloadPage() {  
  const [status, setStatus] = useState("Begining");
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

  async function handleDownloadEmulator(id: string){
    setEmulators(prev => prev.map(emul => emul.id === id ? {...emul, status: "downloading"}: emul));
    setStatus(`Downloading ${console}...`);

    try{
      
    }
    catch (e){
      setStatus(`Error: ${e}`);
    }
  }

  return (
    <div>
      <h2>Available for download:</h2>
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
