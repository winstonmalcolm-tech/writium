let electron = require("electron");
//#region electron/preload.ts
console.log("[preload] loaded");
electron.contextBridge.exposeInMainWorld("electronAPI", {
	minimize: () => electron.ipcRenderer.send("win:minimize"),
	maximize: () => electron.ipcRenderer.send("win:maximize"),
	close: () => electron.ipcRenderer.send("win:close"),
	isMaximized: () => electron.ipcRenderer.invoke("win:isMaximized"),
	onMaximizeChange: (cb) => {
		electron.ipcRenderer.on("win:maximizeChange", (_event, value) => cb(value));
	},
	openFile: () => electron.ipcRenderer.invoke("file:open"),
	saveFile: (content, filePath) => electron.ipcRenderer.invoke("file:save", content, filePath),
	saveFileAs: (content, defaultName) => electron.ipcRenderer.invoke("file:saveAs", content, defaultName),
	getSetting: (key) => electron.ipcRenderer.invoke("settings:get", key),
	setSetting: (key, value) => electron.ipcRenderer.invoke("settings:set", key, value),
	getAllSettings: () => electron.ipcRenderer.invoke("settings:getAll")
});
//#endregion
