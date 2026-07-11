import { useState, useEffect } from "react";
import "./DownloadPage.css";

interface AvailableEmulator{
  id: string;
  console: string;
  status: "disponivel" | "baixando" | "instalado";
}

export function DownloadPage() {  
  const [status, setStatus] = useState("Inicio");
  const [emulators, setEmulators] = useState<AvailableEmulator[]>([
    {
      id: "chip-8",
      console: "CHIP-8",
      status: "disponivel"
    },
  ]);

  async function handleDownloadEmulator(id: string){
    setEmulators(prev => prev.map(emul => emul.id === id ? {...emul, status: "baixando"}: emul));
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
          <div key={emul.id} className="card-emulador loja">
            <h3>{emul.console.toUpperCase()}</h3>
            <br />
            
            {emul.status === "disponivel" && (
              <button onClick={() => handleDownloadEmulator(emul.id)}>Baixar e Instalar</button>
            )}
            {emul.status === "baixando" && (
              <button className="btn-loading" disabled>Baixando...</button>
            )}
            {emul.status === "instalado" && (
              <button className="btn-success" disabled>Pronto para Uso ✓</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
