import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getHistory, deleteProcurement, getProcurementReport } from "../api";

export default function HistoryScreen({ onBack, onViewReport }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    getHistory().then(setHistory).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Чтобы не открылся отчёт при клике на корзину
    if (!window.confirm(t("history.confirmDelete") || "Удалить эту закупку?")) return;
    try {
      await deleteProcurement(id);
      loadHistory(); // Обновляем список после удаления
    } catch (err) { 
      console.error(err);
      alert("Ошибка удаления"); 
    }
  };

  const handleView = async (id) => {
    try {
      const report = await getProcurementReport(id);
      onViewReport(report); // Передаём полный отчёт в калькулятор
    } catch (err) { 
      console.error(err);
      alert("Ошибка загрузки отчёта"); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-16 transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300">←</button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t("history.title")}</h1>
        </div>
        
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t("history.loading")}</p>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t("history.empty")}</p>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleView(item.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition border border-gray-100 dark:border-gray-700 relative group"
              >
                {/* 🔹 Кнопка удаления (появляется при наведении) */}
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition opacity-60 group-hover:opacity-100"
                  title={t("history.delete") || "Удалить"}
                >
                  🗑️
                </button>

                <div className="flex justify-between items-start pr-8">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : "—"} • {t("report.budget")}: {item.budget?.toFixed(0) || 0} ₽
                    </p>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-medium">{item.total_spent?.toFixed(0) || 0} ₽</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}