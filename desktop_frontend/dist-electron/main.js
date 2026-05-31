//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_fs_promises = require("node:fs/promises");
node_fs_promises = __toESM(node_fs_promises);
let node_module = require("node:module");
let C__Users_winst_Documents_SASS_word_editor_desktop_frontend_node_modules_electron_store_index_js = require("C:/Users/winst/Documents/SASS/word_editor/desktop_frontend/node_modules/electron-store/index.js");
C__Users_winst_Documents_SASS_word_editor_desktop_frontend_node_modules_electron_store_index_js = __toESM(C__Users_winst_Documents_SASS_word_editor_desktop_frontend_node_modules_electron_store_index_js);
//#region electron/ipc/file.ts
var _require = (0, node_module.createRequire)(node_path.default.join(process.cwd(), "_"));
function docsDir() {
	return node_path.default.join(electron.app.getPath("userData"), "documents");
}
async function ensureDocsDir() {
	const dir = docsDir();
	await node_fs_promises.default.mkdir(dir, { recursive: true });
	return dir;
}
function registerFileHandlers() {
	electron.ipcMain.handle("file:open", async () => {
		const win = electron.BrowserWindow.getFocusedWindow();
		if (!win) return null;
		const { canceled, filePaths } = await electron.dialog.showOpenDialog(win, {
			title: "Open Document",
			filters: [
				{
					name: "Documents",
					extensions: [
						"docx",
						"txt",
						"md"
					]
				},
				{
					name: "Word Documents (.docx)",
					extensions: ["docx"]
				},
				{
					name: "Text Files",
					extensions: ["txt", "md"]
				},
				{
					name: "All Files",
					extensions: ["*"]
				}
			],
			properties: ["openFile"]
		});
		if (canceled || !filePaths[0]) return null;
		const filePath = filePaths[0];
		const ext = node_path.default.extname(filePath).toLowerCase().replace(".", "");
		if (ext === "docx") try {
			const mammoth = _require("mammoth");
			const buffer = await node_fs_promises.default.readFile(filePath);
			return {
				content: (await mammoth.convertToHtml({ buffer })).value,
				filePath,
				ext,
				isHtml: true
			};
		} catch (err) {
			if (err.code === "MODULE_NOT_FOUND") return {
				content: null,
				filePath,
				ext,
				error: "mammoth is not installed. Run: npm install mammoth --legacy-peer-deps inside desktop_frontend/"
			};
			return {
				content: null,
				filePath,
				ext,
				error: `Could not read .docx: ${err.message}`
			};
		}
		if (ext === "odt") return {
			content: null,
			filePath,
			ext,
			error: "ODT files are not supported. Open the file in LibreOffice, save as .docx, then re-import."
		};
		return {
			content: await node_fs_promises.default.readFile(filePath, "utf-8"),
			filePath,
			ext,
			isHtml: false
		};
	});
	electron.ipcMain.handle("file:save", async (_event, content, filePath) => {
		try {
			await node_fs_promises.default.writeFile(filePath, content, "utf-8");
			return true;
		} catch {
			return false;
		}
	});
	electron.ipcMain.handle("file:saveAs", async (_event, content, defaultName = "document.txt") => {
		const win = electron.BrowserWindow.getFocusedWindow();
		if (!win) return null;
		const { canceled, filePath } = await electron.dialog.showSaveDialog(win, {
			title: "Save Document",
			defaultPath: defaultName,
			filters: [
				{
					name: "Word Document (.docx)",
					extensions: ["docx"]
				},
				{
					name: "Text File",
					extensions: ["txt"]
				},
				{
					name: "Markdown",
					extensions: ["md"]
				}
			]
		});
		if (canceled || !filePath) return null;
		await node_fs_promises.default.writeFile(filePath, content, "utf-8");
		return filePath;
	});
	electron.ipcMain.handle("file:localSave", async (_event, doc) => {
		try {
			const dir = await ensureDocsDir();
			const file = node_path.default.join(dir, `${doc.id}.json`);
			await node_fs_promises.default.writeFile(file, JSON.stringify(doc, null, 2), "utf-8");
			return true;
		} catch {
			return false;
		}
	});
	electron.ipcMain.handle("file:localLoad", async (_event, id) => {
		try {
			const file = node_path.default.join(docsDir(), `${id}.json`);
			const content = await node_fs_promises.default.readFile(file, "utf-8");
			return JSON.parse(content);
		} catch {
			return null;
		}
	});
	electron.ipcMain.handle("file:localList", async () => {
		try {
			const dir = await ensureDocsDir();
			const files = (await node_fs_promises.default.readdir(dir)).filter((f) => f.endsWith(".json"));
			return (await Promise.all(files.map(async (f) => {
				try {
					const raw = await node_fs_promises.default.readFile(node_path.default.join(dir, f), "utf-8");
					const doc = JSON.parse(raw);
					return {
						id: doc.id,
						title: doc.title,
						updated_at: doc.updated_at
					};
				} catch {
					return null;
				}
			}))).filter(Boolean).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
		} catch {
			return [];
		}
	});
	electron.ipcMain.handle("file:localDelete", async (_event, id) => {
		try {
			await node_fs_promises.default.unlink(node_path.default.join(docsDir(), `${id}.json`));
			return true;
		} catch {
			return false;
		}
	});
}
//#endregion
//#region electron/ipc/settings.ts
var store = new C__Users_winst_Documents_SASS_word_editor_desktop_frontend_node_modules_electron_store_index_js.default({
	name: "writium-settings",
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
	electron.ipcMain.handle("settings:get", (_event, key) => {
		return store.get(key);
	});
	electron.ipcMain.handle("settings:set", (_event, key, value) => {
		store.set(key, value);
	});
	electron.ipcMain.handle("settings:getAll", () => {
		return store.store;
	});
}
//#endregion
//#region electron/main.ts
var APP_ROOT = electron.app.getAppPath();
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var RENDERER_DIST = node_path.default.join(APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? node_path.default.join(APP_ROOT, "public") : RENDERER_DIST;
var win = null;
function createWindow() {
	win = new electron.BrowserWindow({
		width: 1440,
		height: 920,
		minWidth: 960,
		minHeight: 640,
		frame: false,
		icon: node_path.default.join(process.env.VITE_PUBLIC, "icon.ico"),
		backgroundColor: "#F5EFE6",
		webPreferences: {
			preload: node_path.default.join(APP_ROOT, "dist-electron", "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		},
		show: false
	});
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https://") || url.startsWith("http://")) electron.shell.openExternal(url);
		return { action: "deny" };
	});
	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		win.webContents.openDevTools({ mode: "detach" });
	} else win.loadFile(node_path.default.join(RENDERER_DIST, "index.html"));
	win.once("ready-to-show", () => win?.show());
	electron.ipcMain.on("win:minimize", () => win?.minimize());
	electron.ipcMain.on("win:maximize", () => {
		win?.isMaximized() ? win.unmaximize() : win?.maximize();
	});
	electron.ipcMain.on("win:close", () => win?.close());
	electron.ipcMain.handle("win:isMaximized", () => win?.isMaximized() ?? false);
	win.on("maximize", () => win?.webContents.send("win:maximizeChange", true));
	win.on("unmaximize", () => win?.webContents.send("win:maximizeChange", false));
}
electron.app.whenReady().then(() => {
	registerFileHandlers();
	registerSettingsHandlers();
	createWindow();
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		electron.app.quit();
		win = null;
	}
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
