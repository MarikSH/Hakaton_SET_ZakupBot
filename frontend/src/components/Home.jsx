import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Home({ onStart }) {
  const { t } = useTranslation();
  const [procName, setProcName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleStart = () => {
    if (!procName.trim()) return alert(t("home.procNameRequired") || "Введите название закупки");
    onStart(procName.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="text-center space-y-8 max-w-md">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t("home.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("home.subtitle")}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition transform hover:scale-[1.02] active:scale-95"
        >
          {t("home.startBtn")}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">📝 {t("home.procurementTitle")}</h3>
            <input
              type="text"
              placeholder={t("home.procNamePlaceholder")}
              className="w-full border p-3 rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={procName}
              onChange={e => setProcName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleStart()}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">{t("home.cancelBtn")}</button>
              <button onClick={handleStart} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">{t("home.continueBtn")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}