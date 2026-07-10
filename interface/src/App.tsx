import { useState } from "react";
import { DownloadPage } from "./pages/DownloadPage"; // <-- Importa a sua nova tela modularizada!
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<"downloads" | "emulators">("downloads");

  return (
    <div className="container">
      <h1>Minha Central de Emuladores</h1>
      
      {/* Menu de Abas para navegação */}
      <div className="tabs-menu">
        <button 
          className={activeTab === "downloads" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("downloads")}
        >
          📥 Downloads
        </button>
        <button 
          className={activeTab === "emulators" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("emulators")}
        >
          🎮 Meus Emuladores
        </button>
      </div>

      <hr />

      {/* Renderização Condicional baseada na aba ativa */}
      {activeTab === "downloads" && <DownloadPage />}
      {activeTab === "emulators" && <div>(Tela de Jogos virá aqui no futuro)</div>}
    </div>
  );
}

export default App;