const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('joyedsCleaner', {
	runTool: (payload) => ipcRenderer.invoke('system:run-tool', payload),
	getSystemStats: () => ipcRenderer.invoke('system:get-stats'),
	isAdmin: () => ipcRenderer.invoke('system:is-admin'),
	relaunchAsAdmin: () => ipcRenderer.invoke('system:relaunch-as-admin'),
	openBackupFolder: () => ipcRenderer.invoke('system:open-backup-folder'),
	onExecutionLog: (callback) => {
		const handler = (_event, entry) => callback(entry);
		ipcRenderer.on('system:execution-log', handler);
		return () => ipcRenderer.removeListener('system:execution-log', handler);
	},
});
