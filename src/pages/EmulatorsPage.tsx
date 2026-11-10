import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { EmulatorSettingsPage } from "./EmulatorSettingsPage";
import { RomLibraryPage } from "./RomLibraryPage";
import { SUPPORTED_EMULATORS, EmulatorInfo } from "../types/emulator";
import "./EmulatorsPage.css";

interface EmulatorsPageProps {
  onNavigateToDownloads?: () => void;
}

export function EmulatorsPage({ onNavigateToDownloads }: EmulatorsPageProps) {
  const [activeView, setActiveView] = useState<"list" | "library" | "settings">("list");
  const [selectedEmulatorId, setSelectedEmulatorId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshInstalledList();
  }, []);

  async function refreshInstalledList() {
    setLoading(true);
    try {
      const list = await invoke<string[]>("check_installed_emulators");
      // Se não houver nada instalado ainda, mantém lista real
      setInstalledIds(list);
    } catch {
      // Fallback em caso de teste no browser sem runtime tauri
      setInstalledIds([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenLibrary(id: string) {
    setSelectedEmulatorId(id);
    setActiveView("library");
  }

  function handleOpenSettings(id: string) {
    setSelectedEmulatorId(id);
    setActiveView("settings");
  }

  function handleCloseView() {
    setActiveView("list");
    refreshInstalledList();
  }

  async function handleDeleteEmulator(id: string) {
    const emu = SUPPORTED_EMULATORS[id];
    const confirmDelete = window.confirm(
      `Deseja realmente remover o emulador ${emu?.console ?? id}? Você poderá baixá-lo novamente depois.`
    );
    if (!confirmDelete) return;

    try {
      await invoke("delete_emulator", { id });
      setActionMessage(`Emulador ${emu?.console ?? id} removido.`);
      setInstalledIds((prev) => prev.filter((item) => item !== id));
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e) {
      alert(`Erro ao remover: ${e}`);
    }
  }

  const selectedEmulator: EmulatorInfo =
    (selectedEmulatorId && SUPPORTED_EMULATORS[selectedEmulatorId]) ||
    SUPPORTED_EMULATORS["chip-8"];

  // 1. Visualização da Biblioteca de ROMs
  if (activeView === "library") {
    return (
      <RomLibraryPage
        emulator={selectedEmulator}
        onBack={handleCloseView}
        onOpenSettings={() => setActiveView("settings")}
      />
    );
  }

  // 2. Visualização das Configurações
  if (activeView === "settings") {
    return (
      <EmulatorSettingsPage
        emulator={selectedEmulator}
        onClose={handleCloseView}
      />
    );
  }

  // 3. Visualização da Lista de Emuladores Instalados
  return (
    <div className="container">
      <div className="emulators-header">
        <div>
          <h2>Meus Emuladores</h2>
          <p className="emulators-subtitle">
            Selecione um console para gerenciar e jogar suas ROMs
          </p>
        </div>
        <button onClick={refreshInstalledList} className="btn-refresh-list">
          🔄 Atualizar Lista
        </button>
      </div>

      {actionMessage && (
        <div className="action-feedback-banner">{actionMessage}</div>
      )}

      {loading ? (
        <div className="library-loading">
          <p>Verificando emuladores instalados...</p>
        </div>
      ) : installedIds.length === 0 ? (
        <div className="empty-installed-state">
          <div className="empty-icon">🎮</div>
          <h3>Nenhum emulador instalado ainda</h3>
          <p>
            Vá até a aba <strong>Downloads</strong> para baixar o núcleo do CHIP-8 ou outros emuladores disponíveis!
          </p>
          {onNavigateToDownloads && (
            <button onClick={onNavigateToDownloads} className="btn-go-downloads">
              Ir para Downloads
            </button>
          )}
        </div>
      ) : (
        <div className="emulators-grid">
          {installedIds.map((id) => {
            const emu = SUPPORTED_EMULATORS[id] || {
              id,
              console: id.toUpperCase(),
              name: id,
              extensions: [],
            };

            return (
              <div key={id} className="card">
                <div className="card-top">
                  <span className="card-icon">🕹️</span>
                  <h3>{emu.console}</h3>
                  <span className="card-description">
                    {emu.description || "Emulador instalado e pronto"}
                  </span>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-play"
                    onClick={() => handleOpenLibrary(emu.id)}
                  >
                    ▶ Ver ROMs
                  </button>
                  <button
                    className="btn-settings"
                    onClick={() => handleOpenSettings(emu.id)}
                    title="Configurar pasta de ROMs"
                  >
                    ⚙️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteEmulator(emu.id)}
                    title="Desinstalar emulador"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}