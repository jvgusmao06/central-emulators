export interface EmulatorInfo {
  id: string;
  console: string;
  name: string;
  extensions: string[];
  description?: string;
}

export interface RomItem {
  name: string;
  filename: string;
  path: string;
  extension: string;
  size_bytes: number;
}

export const SUPPORTED_EMULATORS: Record<string, EmulatorInfo> = {
  "chip-8": {
    id: "chip-8",
    console: "CHIP-8",
    name: "CHIP-8 Emulator",
    extensions: ["ch8"],
    description: "Máquina virtual retro clássica dos anos 70",
  },
  "gameboy": {
    id: "gameboy",
    console: "Game Boy",
    name: "Game Boy Emulator",
    extensions: ["gb", "gbc"],
    description: "Console portátil lendário de 8-bits",
  },
  "ps1": {
    id: "ps1",
    console: "PlayStation 1",
    name: "PS1 Emulator",
    extensions: ["bin", "iso", "cue"],
    description: "Console 32-bits da Sony",
  },
};

export function getStoredRomPath(emulatorId: string, defaultPath: string = ""): string {
  return localStorage.getItem(`rom_path_${emulatorId}`) || defaultPath;
}

export function setStoredRomPath(emulatorId: string, path: string): void {
  localStorage.setItem(`rom_path_${emulatorId}`, path);
}
