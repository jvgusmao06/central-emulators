import { useState } from "react";
import { DownloadPage } from "./pages/DownloadPage"; // <-- Importa a sua nova tela modularizada!
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<"downloads" | "emulators">("downloads");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1 className="app-title">Emulator Hub</h1>

        <div className="buttons-vertical">
          <button
            className={activeTab === "downloads" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("downloads")}
          >
            Downloads
          </button>
          <button
            className={activeTab === "emulators" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("emulators")}
          >
            My Emulators
          </button>
        </div>
      </aside>
      <main className="content-area">
        {activeTab === "downloads" && <DownloadPage />}
        {activeTab === "emulators" && <div>(Tela de Jogos virá aqui no futuro)</div>}
      </main>
    </div>
  );
}

export default App;