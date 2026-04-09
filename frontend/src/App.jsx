import { useState, useEffect } from "react";
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider, useTheme } from "./ThemeContext";
import Home from "./components/Home";
import Calculator from "./components/Calculator";
import HistoryScreen from "./components/HistoryScreen";
import SettingsModal from "./components/SettingsModal";

function AppContent() {
  const [screen, setScreen] = useState("home");
  const [procName, setProcName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [viewReportData, setViewReportData] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 

  const { language } = useTheme();
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    if (i18nInstance.language !== language) {
      i18nInstance.changeLanguage(language).catch(console.error);
    }
  }, [language, i18nInstance]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
      
      {!showSettings && !isHistoryOpen && (
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition text-xl dark:text-white" title="Settings">⚙️</button>
          <button onClick={() => setIsHistoryOpen(true)} className="p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition text-xl dark:text-white" title="History">🕐</button>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <HistoryScreen 
            onBack={() => {
              // 🔹 ЗАКРЫТИЕ ИСТОРИИ ВСЕГДА ВЕДЕТ НА ГЛАВНУЮ
              setIsHistoryOpen(false);
              setViewReportData(null);
              setScreen("home");
              setProcName("");
            }} 
            onViewReport={(report) => {
              setViewReportData(report);
              setIsHistoryOpen(false);
              setScreen("calculator");
            }} 
          />
        </div>
      )}

      {screen === "home" && <Home onStart={(n) => { setProcName(n); setViewReportData(null); setScreen("calculator"); }} />}
      
      {screen === "calculator" && (
        <Calculator 
          procurementName={procName} 
          initialReport={viewReportData} 
          onBack={() => { 
            if (viewReportData) {
              // Просмотр отчета из истории -> Назад в Историю
              setViewReportData(null);
              setIsHistoryOpen(true);
            } else {
              // Форма или завершение -> На Главную
              setScreen("home");
              setProcName("");
              setViewReportData(null);
            }
          }} 
          onComplete={() => { 
            setScreen("home"); 
            setProcName(""); 
            setViewReportData(null); 
          }} 
        />
      )}
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}