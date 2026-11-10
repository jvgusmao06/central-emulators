import {useState} from "react";
import {EmulatorSettingsPage} from "./EmulatorSettingsPage"
import "./EmulatorsPage.css";

// O titulo
// Uma barra de pesquisa
// Um grid com os emuladores 
// Uma seleção de exibição
// Um botão de atualizar a lista

export interface InstalledEmulator{
    id: string;
    console: string;
}

export function EmulatorsPage(){
    const [activeView, setActiveView] = useState<"list" | "settings">("list");
    const [selectedEmulator, setSelectedEmulator] = useState<string | null>(null);

    const [installedEmulators, setInstalledEmulators] = useState<InstalledEmulator[]>([
      { id: "chip-8", console: "CHIP-8" }
    ]); // Isso vai mudar para ler de fato o repositorio de emuladores

    function handleOpenSettings(id: string){
        setSelectedEmulator(id);
        setActiveView("settings");
    }

    function handleCloseSetting(){
        setActiveView("list");
    }

    function handleDeleteEmulator(id: string) {
    // Remove o emulador da lista visual (futuramente deletará o arquivo via Rust)
    setInstalledEmulators(prev => prev.filter(emu => emu.id !== id));
  }

    if(activeView === "settings")
    {
        const selectedConsole = installedEmulators.find(e => e.id === selectedEmulator)?.console;
        return <EmulatorSettingsPage
            console={selectedConsole || "unknown"}
            onClose={handleCloseSetting}/>
    }
    return (
    <div className="container">
      <h2>Downloaded Emulators:</h2>
      
      <div className="emulators-grid">
        {installedEmulators.length === 0 ? (
          <p>Nenhum emulador instalado ainda. Vá na aba Downloads!</p>
        ) : (
          installedEmulators.map((emu) => (
            <div key={emu.id} className="card">
              <h3>{emu.console}</h3>
              
              {/* Grupo de botões de ação */}
              <div className="card-actions">
                <button className="btn-play">Play</button>
                <button className="btn-settings" onClick={() => handleOpenSettings(emu.id)}>Settings</button>
                <button className="btn-delete" onClick={() => handleDeleteEmulator(emu.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}