const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('joyedsCleaner', {
	runTool: (toolId) => ipcRenderer.invoke('system:run-tool', toolId),
	getSystemStats: () => ipcRenderer.invoke('system:get-stats'),
});
