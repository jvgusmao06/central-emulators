import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { EmulatorInfo, RomItem, getStoredRomPath } from "../types/emulator";
import "./RomLibraryPage.css";

interface RomLibraryPageProps {
  emulator: EmulatorInfo;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function RomLibraryPage({ emulator, onBack, onOpenSettings }: RomLibraryPageProps) {
  const [roms, setRoms] = useState<RomItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [activeRomPath, setActiveRomPath] = useState("");

  useEffect(() => {
    loadRomList();
  }, [emulator.id]);

  async function loadRomList() {
    setLoading(true);
    setError(null);
    setLaunchMessage(null);

    try {
      // Obtém o caminho padrão caso o usuário ainda não tenha configurado um específico
      let folder = getStoredRomPath(emulator.id);
      if (!folder) {
        try {
          const defaultAppPath = await invoke<string>("get_default_path");
          folder = defaultAppPath;
        } catch {
          folder = ".";
        }
      }
      setActiveRomPath(folder);

      const items = await invoke<RomItem[]>("list_roms", {
        folderPath: folder,
        extensions: emulator.extensions,
      });
      setRoms(items);
    } catch (err) {
      setError(String(err));
      setRoms([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayRom(rom: RomItem) {
    setLaunchMessage(`Iniciando ${rom.name}...`);
    try {
      const res = await invoke<string>("launch_game", {
        id: emulator.id,
        romPath: rom.path,
      });
      setLaunchMessage(`🎮 ${rom.name}: ${res}`);
    } catch (err) {
      setLaunchMessage(`❌ Erro ao iniciar ${rom.name}: ${err}`);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const filteredRoms = roms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rom-library-container">
      {/* Barra superior de navegação */}
      <div className="library-header">
        <button onClick={onBack} className="btn-back">
          ← Voltar aos Emuladores
        </button>
        <div className="header-info">
          <h2>Biblioteca: {emulator.console}</h2>
          <span className="extensions-badge">
            Arquivos suportados: {emulator.extensions.map((e) => `.${e}`).join(", ")}
          </span>
        </div>
        <button onClick={onOpenSettings} className="btn-settings-header">
          ⚙️ Configurar Pasta
        </button>
      </div>

      {/* Indicador de pasta atual */}
      <div className="path-bar">
        <span>Pasta de ROMs: <code>{activeRomPath || "Não configurada"}</code></span>
        <button onClick={loadRomList} className="btn-refresh" title="Recarregar lista">
          🔄 Atualizar
        </button>
      </div>

      {/* Notificação de lançamento */}
      {launchMessage && (
        <div className={`status-banner ${launchMessage.includes("❌") ? "error" : "success"}`}>
          {launchMessage}
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={`Buscar jogo do ${emulator.console}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="games-count">
          {filteredRoms.length} {filteredRoms.length === 1 ? "jogo encontrado" : "jogos encontrados"}
        </span>
      </div>

      {/* Conteúdo: Lista ou Estados Vazios */}
      {loading ? (
        <div className="library-loading">
          <p>Carregando ROMs...</p>
        </div>
      ) : error ? (
        <div className="library-empty error-state">
          <h3>Pasta de ROMs não encontrada</h3>
          <p>{error}</p>
          <button onClick={onOpenSettings} className="btn-primary">
            Escolher Pasta de ROMs
          </button>
        </div>
      ) : filteredRoms.length === 0 ? (
        <div className="library-empty">
          <div className="empty-icon">📂</div>
          <h3>Nenhuma ROM encontrada</h3>
          <p>
            Não encontramos nenhum arquivo compatível ({emulator.extensions.map((e) => `.${e}`).join(", ")}) na pasta configurada.
          </p>
          <div className="empty-actions">
            <button onClick={onOpenSettings} className="btn-primary">
              Alterar Pasta de ROMs
            </button>
            <button onClick={loadRomList} className="btn-secondary">
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : (
        <div className="roms-grid">
          {filteredRoms.map((rom) => (
            <div key={rom.path} className="rom-card">
              <div className="rom-card-icon">👾</div>
              <div className="rom-card-info">
                <h4 className="rom-title" title={rom.name}>
                  {rom.name}
                </h4>
                <div className="rom-meta">
                  <span className="rom-badge">{rom.extension.toUpperCase()}</span>
                  <span className="rom-size">{formatFileSize(rom.size_bytes)}</span>
                </div>
              </div>
              <button
                className="btn-play-game"
                onClick={() => handlePlayRom(rom)}
              >
                ▶ Jogar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
