import { BrowserWindow, app, dialog, ipcMain, shell } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import Store from "C:/Users/winst/Documents/SASS/word_editor/desktop_frontend/node_modules/electron-store/index.js";
//#region electron/ipc/file.ts
function registerFileHandlers() {
	ipcMain.handle("file:open", async () => {
		const win = BrowserWindow.getFocusedWindow();
		if (!win) return null;
		const { canceled, filePaths } = await dialog.showOpenDialog(win, {
			title: "Open Document",
			filters: [{
				name: "Text Documents",
				extensions: ["txt", "md"]
			}, {
				name: "All Files",
				extensions: ["*"]
			}],
			properties: ["openFile"]
		});
		if (canceled || !filePaths[0]) return null;
		const filePath = filePaths[0];
		return {
			content: await fs.readFile(filePath, "utf-8"),
			filePath,
			ext: path.extname(filePath).toLowerCase().replace(".", "")
		};
	});
	ipcMain.handle("file:save", async (_event, content, filePath) => {
		try {
			await fs.writeFile(filePath, content, "utf-8");
			return true;
		} catch {
			return false;
		}
	});
	ipcMain.handle("file:saveAs", async (_event, content, defaultName = "document.txt") => {
		const win = BrowserWindow.getFocusedWindow();
		if (!win) return null;
		const { canceled, filePath } = await dialog.showSaveDialog(win, {
			title: "Save Document",
			defaultPath: defaultName,
			filters: [{
				name: "Text File",
				extensions: ["txt"]
			}, {
				name: "Markdown",
				extensions: ["md"]
			}]
		});
		if (canceled || !filePath) return null;
		await fs.writeFile(filePath, content, "utf-8");
		return filePath;
	});
}
//#endregion
//#region electron/ipc/settings.ts
var store = new Store({
	name: "scholarly-settings",
	defaults: {
		theme: "light",
		citationStyle: "apa7",
		fontSize: 16,
		geminiApiKey: "",
		firecrawlApiKey: "",
		zoteroApiKey: ""
	}
});
function registerSettingsHandlers() {
	ipcMain.handle("settings:get", (_event, key) => {
		return store.get(key);
	});
	ipcMain.handle("settings:set", (_event, key, value) => {
		store.set(key, value);
	});
	ipcMain.handle("settings:getAll", () => {
		return store.store;
	});
}
//#endregion
//#region electron/main.ts
var APP_ROOT = app.getAppPath();
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var RENDERER_DIST = path.join(APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;
var win = null;
function createWindow() {
	win = new BrowserWindow({
		width: 1440,
		height: 920,
		minWidth: 960,
		minHeight: 640,
		frame: false,
		backgroundColor: "#F5EFE6",
		webPreferences: {
			preload: path.join(APP_ROOT, "dist-electron", "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		},
		show: false
	});
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
		return { action: "deny" };
	});
	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		win.webContents.openDevTools({ mode: "detach" });
	} else win.loadFile(path.join(RENDERER_DIST, "index.html"));
	win.once("ready-to-show", () => win?.show());
	ipcMain.on("win:minimize", () => win?.minimize());
	ipcMain.on("win:maximize", () => {
		win?.isMaximized() ? win.unmaximize() : win?.maximize();
	});
	ipcMain.on("win:close", () => win?.close());
	ipcMain.handle("win:isMaximized", () => win?.isMaximized() ?? false);
	win.on("maximize", () => win?.webContents.send("win:maximizeChange", true));
	win.on("unmaximize", () => win?.webContents.send("win:maximizeChange", false));
}
app.whenReady().then(() => {
	registerFileHandlers();
	registerSettingsHandlers();
	createWindow();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
