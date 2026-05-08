function JoyedsCleanerPro() {
  const { useMemo, useState, useEffect } = React;
  const [isDark, setIsDark] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [runningToolId, setRunningToolId] = useState('');
  const [statusMessage, setStatusMessage] = useState('Pret.');
  const [isAdmin, setIsAdmin] = useState(false);
  const [system, setSystem] = useState({ cpu: 0, ram: 0, storage: 0, lowDisk: false });

  const i18n = {
    fr: {
      title: "JoYed'S Cleaner Pro",
      subtitle: 'Suite professionnelle de nettoyage et optimisation Windows.',
      execute: 'Executer',
      state: 'Etat du systeme',
      cpu: 'CPU',
      ram: 'RAM',
      storage: 'Stockage',
      lowDisk: 'Espace disque critique detecte',
      noLowDisk: 'Espace disque normal',
      runOk: 'Termine avec succes.',
      runFail: 'Erreur execution:',
      noBridge: 'Bridge Electron indisponible. Lance via Electron.',
      running: 'Execution en cours...',
      adminOn: 'Mode administrateur actif',
      adminOff: 'Mode admin inactif - actions sensibles bloquees',
      confirmSensitive:
        'Action sensible. Un point de restauration sera cree avant execution. Continuer ?',
      needAdmin: 'Cette action exige un lancement en administrateur.',
      backupFailed: 'Sauvegarde systeme impossible. Execution annulee :',
      backupReady: 'Sauvegarde systeme creee :',
    },
    en: {
      title: "JoYed'S Cleaner Pro",
      subtitle: 'Professional suite for Windows cleanup and optimization.',
      execute: 'Run',
      state: 'System status',
      cpu: 'CPU',
      ram: 'RAM',
      storage: 'Storage',
      lowDisk: 'Critical disk space detected',
      noLowDisk: 'Disk space is healthy',
      runOk: 'Completed successfully.',
      runFail: 'Execution error:',
      noBridge: 'Electron bridge unavailable. Run inside Electron.',
      running: 'Execution in progress...',
      adminOn: 'Administrator mode enabled',
      adminOff: 'Admin mode disabled - sensitive actions are blocked',
      confirmSensitive:
        'Sensitive action. A restore point will be created before execution. Continue?',
      needAdmin: 'This action requires administrator mode.',
      backupFailed: 'System backup failed. Execution cancelled:',
      backupReady: 'System backup created:',
    },
  };

  const t = i18n[language];

  const tools = [
    {
      id: 'simple-clean',
      title: "Nettoyage Simple",
      description: "Supprime les fichiers temporaires Windows rapidement.",
      icon: "🧹",
    },
    {
      id: 'pro-clean',
      title: "Nettoyage Pro",
      description: "Nettoyage avancé avec cache Windows Update.",
      icon: "⚡",
    },
    {
      id: 'ram-optimize',
      title: "Optimisation RAM",
      description: "Ferme les processus inutiles et optimise la mémoire.",
      icon: "🧠",
    },
    {
      id: 'network-boost',
      title: "Booster Réseau",
      description: "Répare le DNS et optimise la connexion réseau.",
      icon: "🌐",
    },
    {
      id: 'maintenance',
      title: "Maintenance Windows",
      description: "Analyse et réparation système complète.",
      icon: "🛡️",
    },
    {
      id: 'auto-mode',
      title: "Mode Automatique",
      description: "Nettoyage silencieux planifié.",
      icon: "🤖",
    },
  ];

  const sensitiveTools = new Set(['pro-clean', 'network-boost', 'maintenance', 'auto-mode']);

  const palette = useMemo(
    () =>
      isDark
        ? {
            page: 'min-h-screen bg-black text-white p-8',
            card: 'bg-zinc-900 border border-zinc-800',
            inner: 'bg-black border border-zinc-800',
            muted: 'text-gray-400',
            footer: 'text-gray-500',
          }
        : {
            page: 'min-h-screen bg-slate-100 text-slate-900 p-8',
            card: 'bg-white border border-slate-300',
            inner: 'bg-slate-50 border border-slate-200',
            muted: 'text-slate-600',
            footer: 'text-slate-500',
          },
    [isDark]
  );

  const refreshStats = async () => {
    if (!window.joyedsCleaner) {
      return;
    }
    const stats = await window.joyedsCleaner.getSystemStats();
    setSystem({
      cpu: stats.cpu,
      ram: stats.ram,
      storage: stats.storage,
      lowDisk: stats.lowDisk,
    });
    setIsAdmin(Boolean(stats.isAdmin));
  };

  useEffect(() => {
    refreshStats();
    const timer = setInterval(refreshStats, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRun = async (toolId) => {
    if (!window.joyedsCleaner) {
      setStatusMessage(t.noBridge);
      return;
    }

    const isSensitive = sensitiveTools.has(toolId);
    if (isSensitive) {
      const confirmed = window.confirm(t.confirmSensitive);
      if (!confirmed) {
        return;
      }
    }

    setRunningToolId(toolId);
    setStatusMessage(t.running);

    const result = await window.joyedsCleaner.runTool({
      toolId,
      confirmed: isSensitive,
    });

    if (result.requiresAdmin) {
      setStatusMessage(t.needAdmin);
      setRunningToolId('');
      return;
    }

    if (result.requiresConfirmation) {
      setStatusMessage(t.confirmSensitive);
      setRunningToolId('');
      return;
    }

    if (result.backup && !result.backup.ok) {
      setStatusMessage(`${t.backupFailed} ${result.backup.error}`);
      setRunningToolId('');
      return;
    }

    if (result.ok) {
      if (result.backup && result.backup.ok && result.backup.restorePoint) {
        setStatusMessage(`${t.backupReady} ${result.backup.restorePoint}`);
      } else {
        setStatusMessage(t.runOk);
      }
      await refreshStats();
    } else {
      setStatusMessage(`${t.runFail} ${result.error}`);
    }
    setRunningToolId('');
  };

  const storageBarWidthClass =
    system.storage >= 90
      ? 'w-full'
      : system.storage >= 80
      ? 'w-11/12'
      : system.storage >= 70
      ? 'w-10/12'
      : system.storage >= 60
      ? 'w-8/12'
      : system.storage >= 50
      ? 'w-7/12'
      : system.storage >= 40
      ? 'w-6/12'
      : system.storage >= 30
      ? 'w-4/12'
      : system.storage >= 20
      ? 'w-3/12'
      : system.storage >= 10
      ? 'w-2/12'
      : 'w-1/12';

  return (
    <div className={palette.page}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-4 py-2 rounded-xl bg-zinc-700 text-white font-semibold"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="text-center mb-12">
          <img
            src="./assets/joyeds-logo.png"
            alt="JoYedS Cleaner"
            className="w-48 h-48 object-contain mx-auto mb-4 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]"
          />

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {t.title}
          </h1>

          <p className={`${palette.muted} text-lg max-w-2xl mx-auto`}>
            {t.subtitle} Compatible Windows 10, 11 et futures versions.
          </p>
        </div>

        <div className={`mb-8 text-center text-sm ${isAdmin ? 'text-emerald-400' : 'text-amber-400'}`}>
          {isAdmin ? t.adminOn : t.adminOff}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className={`${palette.card} rounded-3xl p-6 hover:border-cyan-400 transition-all duration-300 hover:scale-105 shadow-xl`}
            >
              <div className="text-5xl mb-4">{tool.icon}</div>

              <h2 className="text-2xl font-semibold mb-3">{tool.title}</h2>

              <p className={`${palette.muted} mb-6`}>{tool.description}</p>

              <button
                onClick={() => handleRun(tool.id)}
                disabled={runningToolId === tool.id}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded-2xl transition-all duration-300"
              >
                {runningToolId === tool.id ? t.running : t.execute}
              </button>
            </div>
          ))}
        </div>

        <div className={`${palette.card} mt-16 rounded-3xl p-8`}>
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            {t.state}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${palette.inner} rounded-2xl p-6`}>
              <p className={palette.muted}>{t.cpu}</p>
              <h3 className="text-4xl font-bold mt-2">{system.cpu}%</h3>
            </div>

            <div className={`${palette.inner} rounded-2xl p-6`}>
              <p className={palette.muted}>{t.ram}</p>
              <h3 className="text-4xl font-bold mt-2">{system.ram}%</h3>
            </div>

            <div className={`${palette.inner} rounded-2xl p-6`}>
              <p className={palette.muted}>{t.storage}</p>
              <h3 className="text-4xl font-bold mt-2">{system.storage}%</h3>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full h-3 rounded-full bg-zinc-700 overflow-hidden">
              <div className={`h-3 bg-cyan-400 transition-all duration-700 ${storageBarWidthClass}`} />
            </div>
            <p className={`mt-3 ${palette.muted}`}>
              {system.lowDisk ? t.lowDisk : t.noLowDisk}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-cyan-400 text-sm">{statusMessage}</div>

        <div className={`mt-12 text-center ${palette.footer} text-sm`}>
          Powered by JoYed'S • Future Ready • Windows Optimization Suite
        </div>
      </div>
    </div>
  );
}

window.JoyedsCleanerPro = JoyedsCleanerPro;
