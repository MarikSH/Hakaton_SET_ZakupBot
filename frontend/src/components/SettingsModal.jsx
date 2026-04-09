import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

export default function SettingsModal({ onClose }) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useTheme();

  const handleLangChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // 🔹 Мгновенно применяет язык во всем приложении
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{t("settings.title")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.language")}</label>
            <select value={language} onChange={e => handleLangChange(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="ru">🇷🇺 Русский</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("settings.theme")}</label>
            <div className="flex gap-2">
              <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded border ${theme === 'light' ? 'bg-blue-100 border-blue-500 dark:bg-blue-900' : 'dark:bg-gray-700 dark:border-gray-600'}`}>{t("settings.light")}</button>
              <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded border ${theme === 'dark' ? 'bg-blue-900 border-blue-500 dark:bg-blue-800' : 'dark:bg-gray-700 dark:border-gray-600'}`}>{t("settings.dark")}</button>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded font-medium transition">{t("settings.close")}</button>
      </div>
    </div>
  );
}