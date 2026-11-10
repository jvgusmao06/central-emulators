import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { EmulatorInfo, getStoredRomPath, setStoredRomPath } from "../types/emulator";
import "./EmulatorSettingsPage.css";

interface EmulatorSettingsPageProps {
  emulator: EmulatorInfo;
  onClose: () => void;
}

export function EmulatorSettingsPage({ emulator, onClose }: EmulatorSettingsPageProps) {
  const [inputPath, setInputPath] = useState("");
  const [defaultPath, setDefaultPath] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function initPath() {
      try {
        const def = await invoke<string>("get_default_path");
        setDefaultPath(def);
        const stored = getStoredRomPath(emulator.id, def);
        setInputPath(stored);
      } catch {
        const stored = getStoredRomPath(emulator.id, ".");
        setInputPath(stored);
      }
    }
    initPath();
  }, [emulator.id]);

  function handleSaveSettings() {
    if (!inputPath.trim()) return;
    setStoredRomPath(emulator.id, inputPath.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  function handleResetDefault() {
    if (defaultPath) {
      setInputPath(defaultPath);
    }
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Configurações: {emulator.console}</h2>
        <button onClick={onClose} className="btn-back">
          ← Voltar
        </button>
      </div>

      <hr className="settings-divider" />

      {savedSuccess && (
        <div className="settings-alert-success">
          ✅ Caminho da pasta salvo com sucesso!
        </div>
      )}

      <div className="settings-box">
        <label className="settings-label">Pasta de ROMs do {emulator.console}:</label>
        <p className="settings-description">
          O Hub buscará arquivos com as extensões{" "}
          <strong>{emulator.extensions.map((e) => `.${e}`).join(", ")}</strong> nesta pasta.
        </p>

        <div className="settings-input-group">
          <input
            type="text"
            className="settings-input"
            value={inputPath}
            placeholder="Ex: C:/Jogos/Chip8 ou /home/usuario/roms"
            onChange={(e) => setInputPath(e.target.value)}
          />
        </div>

        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="btn-save">
            Salvar Configurações
          </button>
          {defaultPath && (
            <button onClick={handleResetDefault} className="btn-reset">
              Restaurar Caminho Padrão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}