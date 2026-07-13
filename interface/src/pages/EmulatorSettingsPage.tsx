import {useState} from "react";
import "./EmulatorSettingsPage.css";

// Por enquanto a pessoa só escolhe onde ela baixou as roms

interface EmulatorSettings{
    romFolderPath: string;
}


export function EmulatorSettingsPage({console, onClose} : {console:string; onClose: () => void}){
    const [settings, setSettings] = useState<EmulatorSettings>({
        romFolderPath: "C:/"
    })

    const [inputPath, setInputPath] = useState(settings.romFolderPath);

    function saveSettings(){
        setSettings({
            romFolderPath: inputPath
        });
    }

    return (
    <div className="settings-container">
        <h2>{console} settings:</h2>
        <hr />
        <div className="settings-box">
            <h3>Rom Folder Path:</h3>
            <p>Actual path: <code>{settings.romFolderPath}</code></p>

            <input 
                type="text"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
            />
        </div>
        <button onClick={saveSettings} className="btn-save">Save settings</button>
        <button onClick={onClose} className="btn-back">Back</button>
    </div>)
}