const { app, BrowserWindow, ipcMain } = require('electron');
const os = require('node:os');
const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const iconPath = app.isPackaged
    ? path.join(app.getAppPath(), 'src', 'assets', 'joyeds-logo.png')
    : path.join(app.getAppPath(), 'src', 'assets', 'joyeds-logo.png');

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    icon: existsSync(iconPath) ? iconPath : undefined,
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

const sensitiveTools = new Set(['pro-clean', 'network-boost', 'maintenance', 'auto-mode']);

const getScriptsBasePath = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'scripts');
  }
  return path.join(app.getAppPath(), 'scripts');
};

const runPowershell = (command) =>
  new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { windowsHide: true, maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim(),
          error,
        });
      }
    );
  });

const isUserAdmin = async () => {
  const probe = await runPowershell(
    '$p=[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent();$p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)'
  );
  return probe.ok && probe.stdout.toLowerCase() === 'true';
};

const createSafetyBackup = async (toolId) => {
  const backupRoot = path.join(app.getPath('documents'), 'JoYedsCleanerBackups');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(backupRoot, `${stamp}-${toolId}`);

  try {
    await fs.mkdir(backupFolder, { recursive: true });
    await fs.writeFile(
      path.join(backupFolder, 'metadata.json'),
      JSON.stringify(
        {
          toolId,
          createdAt: new Date().toISOString(),
          host: os.hostname(),
          platform: os.platform(),
          release: os.release(),
        },
        null,
        2
      ),
      'utf8'
    );

    const services = await runPowershell('Get-Service | Select-Object Name,Status,StartType | ConvertTo-Json -Depth 3');
    if (services.ok) {
      await fs.writeFile(path.join(backupFolder, 'services.json'), services.stdout, 'utf8');
    }

    const startup = await runPowershell('Get-CimInstance Win32_StartupCommand | Select-Object Name,Command,Location | ConvertTo-Json -Depth 3');
    if (startup.ok) {
      await fs.writeFile(path.join(backupFolder, 'startup.json'), startup.stdout, 'utf8');
    }

    const restorePointName = `JoYedS-${toolId}-${stamp}`.slice(0, 250);
    const restore = await runPowershell(
      `Checkpoint-Computer -Description \"${restorePointName}\" -RestorePointType \"MODIFY_SETTINGS\" | Out-Null; Write-Output \"${restorePointName}\"`
    );

    if (!restore.ok) {
      return {
        ok: false,
        folder: backupFolder,
        error: restore.stderr || restore.error?.message || 'Echec creation point de restauration.',
      };
    }

    return {
      ok: true,
      folder: backupFolder,
      restorePoint: restore.stdout || restorePointName,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
};

const runAllowedScript = (toolId) =>
  new Promise((resolve) => {
    const scriptName = scriptMap[toolId];
    if (!scriptName) {
      resolve({ ok: false, error: 'Tool non autorise.' });
      return;
    }

    const scriptPath = path.join(getScriptsBasePath(), scriptName);
    if (!existsSync(scriptPath)) {
      resolve({ ok: false, error: `Script introuvable: ${scriptName}` });
      return;
    }

    execFile('cmd.exe', ['/c', scriptPath], { windowsHide: true, cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
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

ipcMain.handle('system:is-admin', async () => isUserAdmin());

ipcMain.handle('system:run-tool', async (_event, payload) => {
  const request = typeof payload === 'string' ? { toolId: payload, confirmed: false } : payload || {};
  const toolId = request.toolId;

  if (!toolId || !scriptMap[toolId]) {
    return { ok: false, error: 'Action invalide.' };
  }

  const sensitive = sensitiveTools.has(toolId);
  if (sensitive && !request.confirmed) {
    return { ok: false, requiresConfirmation: true, error: 'Confirmation requise.' };
  }

  const admin = await isUserAdmin();
  if (sensitive && !admin) {
    return { ok: false, requiresAdmin: true, error: 'Execution admin requise.' };
  }

  let backup = null;
  if (sensitive) {
    backup = await createSafetyBackup(toolId);
    if (!backup.ok) {
      return { ok: false, backup, error: backup.error };
    }
  }

  const result = await runAllowedScript(toolId);
  return {
    ...result,
    backup,
  };
});

ipcMain.handle('system:get-stats', async () => {
  const cpu = await sampleCpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const ram = Math.round(((totalMem - freeMem) / totalMem) * 100);
  const storage = await diskUsagePercent();
  const isAdmin = await isUserAdmin();
  return {
    cpu,
    ram,
    storage,
    lowDisk: storage >= 90,
    isAdmin,
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
