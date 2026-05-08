const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('node:os');
const { execFile } = require('node:child_process');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

const scriptMap = {
  'simple-clean': 'SimpleCleaner.bat',
  'pro-clean': 'ProCleaner.bat',
  'ram-optimize': 'RAMOptimizer.bat',
  'network-boost': 'BoosterNetwork.bat',
  maintenance: 'MaintenanceComplete.bat',
  'auto-mode': 'SilentCleaner.bat',
};

const getScriptsBasePath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'scripts');
  }
  return path.join(app.getAppPath(), 'scripts');
};

const runAllowedScript = (toolId) =>
  new Promise((resolve) => {
    const scriptName = scriptMap[toolId];
    if (!scriptName) {
      resolve({ ok: false, error: 'Tool non autorise.' });
      return;
    }

    const scriptPath = path.join(getScriptsBasePath(), scriptName);
    execFile('cmd.exe', ['/c', scriptPath], { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, error: stderr || error.message });
        return;
      }
      resolve({ ok: true, output: stdout || '' });
    });
  });

const cpuAverage = () => {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }

  return {
    idle: idle / cpus.length,
    total: total / cpus.length,
  };
};

const sampleCpuUsage = () =>
  new Promise((resolve) => {
    const start = cpuAverage();
    setTimeout(() => {
      const end = cpuAverage();
      const idle = end.idle - start.idle;
      const total = end.total - start.total;
      const usage = total > 0 ? 100 - Math.round((idle / total) * 100) : 0;
      resolve(Math.max(0, Math.min(100, usage)));
    }, 250);
  });

const diskUsagePercent = () =>
  new Promise((resolve) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        "$d=Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\"; if ($null -eq $d) { '0' } else { [math]::Round((($d.Size-$d.FreeSpace)/$d.Size)*100) }",
      ],
      { windowsHide: true },
      (error, stdout) => {
        if (error) {
          resolve(0);
          return;
        }
        const value = Number.parseInt((stdout || '0').trim(), 10);
        if (Number.isNaN(value)) {
          resolve(0);
          return;
        }
        resolve(Math.max(0, Math.min(100, value)));
      }
    );
  });

ipcMain.handle('system:run-tool', async (_event, toolId) => runAllowedScript(toolId));

ipcMain.handle('system:get-stats', async () => {
  const cpu = await sampleCpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const ram = Math.round(((totalMem - freeMem) / totalMem) * 100);
  const storage = await diskUsagePercent();
  return {
    cpu,
    ram,
    storage,
    lowDisk: storage >= 90,
  };
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
