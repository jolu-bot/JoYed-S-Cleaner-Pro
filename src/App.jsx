export default function JoyedsCleanerPro() {
  const tools = [
    {
      title: "Nettoyage Simple",
      description: "Supprime les fichiers temporaires Windows rapidement.",
      icon: "🧹",
    },
    {
      title: "Nettoyage Pro",
      description: "Nettoyage avancé avec cache Windows Update.",
      icon: "⚡",
    },
    {
      title: "Optimisation RAM",
      description: "Ferme les processus inutiles et optimise la mémoire.",
      icon: "🧠",
    },
    {
      title: "Booster Réseau",
      description: "Répare le DNS et optimise la connexion réseau.",
      icon: "🌐",
    },
    {
      title: "Maintenance Windows",
      description: "Analyse et réparation système complète.",
      icon: "🛡️",
    },
    {
      title: "Mode Automatique",
      description: "Nettoyage silencieux planifié.",
      icon: "🤖",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            JoYed'S Cleaner Pro
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Suite professionnelle de nettoyage et d’optimisation Windows.
            Compatible Windows 10, 11 et futures versions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-cyan-400 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              <div className="text-5xl mb-4">{tool.icon}</div>

              <h2 className="text-2xl font-semibold mb-3">{tool.title}</h2>

              <p className="text-gray-400 mb-6">{tool.description}</p>

              <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl transition-all duration-300">
                Exécuter
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">
            État du système
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black rounded-2xl p-6 border border-zinc-800">
              <p className="text-gray-400">CPU</p>
              <h3 className="text-4xl font-bold mt-2">18%</h3>
            </div>

            <div className="bg-black rounded-2xl p-6 border border-zinc-800">
              <p className="text-gray-400">RAM</p>
              <h3 className="text-4xl font-bold mt-2">42%</h3>
            </div>

            <div className="bg-black rounded-2xl p-6 border border-zinc-800">
              <p className="text-gray-400">Stockage</p>
              <h3 className="text-4xl font-bold mt-2">67%</h3>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          Powered by JoYed'S • Future Ready • Windows Optimization Suite
        </div>
      </div>
    </div>
  );
}
