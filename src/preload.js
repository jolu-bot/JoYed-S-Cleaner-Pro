const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('joyedsCleaner', {
	runTool: (payload) => ipcRenderer.invoke('system:run-tool', payload),
	getSystemStats: () => ipcRenderer.invoke('system:get-stats'),
	isAdmin: () => ipcRenderer.invoke('system:is-admin'),
});
