import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createProcurement, getProcurementReport, completeProcurement } from "../api";

const CATEGORY_COLORS = {
  "Закупка товаров": "#3b82f6", "Product Purchase": "#3b82f6",
  "🚚 Доставка": "#10b981", "delivery": "#10b981",
  "📦 Упаковка": "#f59e0b", "packaging": "#f59e0b",
  "👷 Рабочие": "#8b5cf6", "workers": "#8b5cf6",
  "🎨 Дизайн/Инфографика": "#ec4899", "design": "#ec4899",
  "🏢 Хранение/Склад": "#6366f1", "warehouse": "#6366f1",
  "⚙️ Прочее": "#6b7280", "other": "#6b7280"
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 1000));
  }
  return window.btoa(binary);
};

export default function Calculator({ procurementName, onBack, onComplete, initialReport, sourceScreen }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([{ name: "", quantity: "", price: "" }]);
  const [expensesText, setExpensesText] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  
  const [report, setReport] = useState(initialReport || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { setReport(initialReport || null); }, [initialReport]);

  const addProduct = () => setProducts([...products, { name: "", quantity: "", price: "" }]);
  const updateProduct = (idx, field, value) => {
    const updated = [...products]; updated[idx][field] = value; setProducts(updated);
  };
  const removeProduct = (idx) => setProducts(products.filter((_, i) => i !== idx));

  const handleExportPDF = async () => {
    if (!report) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      // 🔹 Надёжные ссылки на шрифты с кириллицей (jsdelivr)
      const regularUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf';
      const boldUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf';

      let regularBuffer, boldBuffer;
      let fontsLoaded = false;

      try {
        const [regularRes, boldRes] = await Promise.all([
          fetch(regularUrl),
          fetch(boldUrl)
        ]);

        if (regularRes.ok && boldRes.ok) {
          regularBuffer = await regularRes.arrayBuffer();
          boldBuffer = await boldRes.arrayBuffer();
          
          doc.addFileToVFS('Roboto-Regular.ttf', arrayBufferToBase64(regularBuffer));
          doc.addFileToVFS('Roboto-Bold.ttf', arrayBufferToBase64(boldBuffer));
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
          doc.setFont('Roboto', 'normal');
          fontsLoaded = true;
        }
      } catch (e) {
        console.warn('Шрифты не загрузились, используем fallback', e);
      }

      // Если шрифты не загрузились — используем стандартный (будет работать только латиница)
      if (!fontsLoaded) {
        doc.setFont('helvetica', 'normal');
      }

      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      let y = 15;

      // --- ШАПКА ---
      doc.setFontSize(18);
      if (fontsLoaded) doc.setFont('Roboto', 'bold'); else doc.setFont('helvetica', 'bold');
      doc.text(report.name || 'Untitled', margin, y);
      
      if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // ✅ ИСПРАВЛЕНО: Правильный перевод для Даты
      const dateLabel = isRussian ? 'Дата:' : 'Date:';
      doc.text(`${dateLabel} ${new Date().toLocaleDateString()}`, pageWidth - margin, y, { align: 'right' });
      y += 8;
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // --- ТАБЛИЦА ---
      // Если нет кириллицы в шрифте — используем английские заголовки
      const headers = fontsLoaded ? [
        isRussian ? 'Товар' : 'Product',
        isRussian ? 'Кол-во' : 'Qty',
        isRussian ? 'Закупка за 1 шт' : 'Unit Price',
        isRussian ? 'Сумма закупки' : 'Total Purchase',
        isRussian ? 'Накладные на 1 шт' : 'Overhead/Unit',
        isRussian ? 'Себестоимость за 1 шт' : 'Cost/Unit'
      ] : [
        'Product', 'Qty', 'Unit Price', 'Total Purchase', 'Overhead/Unit', 'Cost/Unit'
      ];

      const rows = report.products.map(p => [
        p.name || '-', 
        String(p.quantity ?? '-'),
        `${(p.purchase_price_per_unit || 0).toFixed(2)} RUB`,
        `${(p.total_purchase_cost || 0).toFixed(2)} RUB`,
        `${(p.overhead_per_unit || 0).toFixed(2)} RUB`,
        `${(p.total_cost_per_unit || 0).toFixed(2)} RUB`
      ]);

      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { 
          font: fontsLoaded ? 'Roboto' : 'helvetica',
          fontSize: 9, 
          textColor: [0, 0, 0] 
        },
        headStyles: { 
          fillColor: [245, 245, 245], 
          fontStyle: fontsLoaded ? 'bold' : 'normal',
          halign: 'center', 
          lineWidth: 0.3, 
          lineColor: [0, 0, 0] 
        },
        bodyStyles: { lineWidth: 0.2, lineColor: [0, 0, 0] },
        columnStyles: {
          0: { halign: 'left', cellWidth: 45 },
          1: { halign: 'center', cellWidth: 15 },
          2: { halign: 'right', cellWidth: 25 },
          3: { halign: 'right', cellWidth: 30 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'right', cellWidth: 35, fontStyle: fontsLoaded ? 'bold' : 'normal' }
        },
        margin: { left: margin, right: margin }
      });

      y = doc.lastAutoTable.finalY + 12;

      // --- БЛОК БЮДЖЕТА ---
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, y, contentWidth, 28, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, 28);

      doc.setFontSize(10);
      if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
      
      // ✅ ИСПРАВЛЕНО: Правильные переводы для Бюджета
      const bLabel = isRussian ? 'Бюджет:' : 'Budget:';
      const sLabel = isRussian ? 'Потрачено:' : 'Spent:';
      const rLabel = isRussian ? 'Остаток:' : 'Remaining:';

      doc.text(`${bLabel} ${(report.budget || 0).toFixed(2)} RUB`, margin + 5, y + 8);
      doc.text(`${sLabel} ${(report.total_spent || 0).toFixed(2)} RUB`, margin + 5, y + 16);
      
      if (fontsLoaded) doc.setFont('Roboto', 'bold'); else doc.setFont('helvetica', 'bold');
      doc.text(`${rLabel} ${(report.budget_remaining || 0).toFixed(2)} RUB`, margin + 5, y + 24);
      if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
      y += 38;

      // --- СТРУКТУРА РАСХОДОВ ---
      if (chartData.length > 0) {
        doc.setFontSize(12);
        if (fontsLoaded) doc.setFont('Roboto', 'bold'); else doc.setFont('helvetica', 'bold');
        
        // ✅ ИСПРАВЛЕНО: Правильный перевод заголовка структуры
        const structureLabel = isRussian ? 'Структура расходов' : 'Expense Structure';
        doc.text(structureLabel, margin, y);
        y += 2;
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        doc.setFontSize(9);
        if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
        
        chartData.forEach(item => {
          const cleanName = item.name.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
          const percent = totalExpenses > 0 ? (item.value / totalExpenses * 100) : 0;
          
          doc.text(cleanName, margin, y);
          doc.text(`${item.value.toFixed(2)} RUB (${percent.toFixed(1)}%)`, pageWidth - margin, y, { align: 'right' });
          y += 3.5;
          
          doc.setFillColor(235, 235, 235);
          doc.rect(margin, y, contentWidth, 2.5, 'F');
          doc.setFillColor(0, 0, 0);
          doc.rect(margin, y, contentWidth * (percent / 100), 2.5, 'F');
          y += 7;
        });
        y += 5;
      }

      // --- ПРИМЕЧАНИЯ ---
      if (report.notes) {
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
        doc.setFontSize(11);
        if (fontsLoaded) doc.setFont('Roboto', 'bold'); else doc.setFont('helvetica', 'bold');
        
        // ✅ ИСПРАВЛЕНО: Правильный перевод заголовка примечаний
        const notesLabel = isRussian ? 'Примечания:' : 'Notes:';
        doc.text(notesLabel, margin, y);
        y += 5;
        doc.setFontSize(9);
        if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(report.notes, contentWidth);
        doc.text(splitNotes, margin, y);
        y += splitNotes.length * 4 + 5;
      }

      // --- ФУТЕР ---
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      if (fontsLoaded) doc.setFont('Roboto', 'normal'); else doc.setFont('helvetica', 'normal');
      doc.text('Procurement Tracker Report', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Безопасное имя файла
      const rawName = report.name || 'Report';
      const safeName = rawName
        .replace(/[\/\\:*?"<>|]/g, '_')  // убираем только / \ : * ? " < > |
        .replace(/\s+/g, ' ')            // заменяем множественные пробелы на один
        .trim()
        .substring(0, 50);               // ограничиваем длину

      const dateStrFile = new Date().toISOString().slice(0, 10);
      doc.save(`${safeName}_${dateStrFile}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      // 🔹 АВАРИЙНЫЙ РЕЖИМ: создаём простой текстовый файл
      try {
        const doc = new jsPDF();
        doc.text('Report: ' + report.name, 10, 10);
        doc.text('Date: ' + new Date().toLocaleDateString(), 10, 20);
        doc.text('Error with fonts, showing raw data:', 10, 30);
        let y = 40;
        report.products?.forEach(p => {
          doc.text(`${p.name}: ${p.quantity} x ${p.purchase_price_per_unit} = ${p.total_purchase_cost}`, 10, y);
          y += 10;
        });
        doc.save(`Report_${report.name || 'Untitled'}_${new Date().toISOString().slice(0,10)}_simple.pdf`);
        alert('PDF создан в упрощённом режиме (проблемы со шрифтами)');
      } catch (e) {
        alert('Критическая ошибка PDF: ' + err.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const validProducts = products
        .filter(p => p.name?.trim() && p.quantity && p.price)
        .map(p => ({ name: p.name.trim(), quantity: Number(p.quantity) || 1, purchase_price_per_unit: Number(p.price) || 0 }));

      if (validProducts.length === 0 || !budget || Number(budget) <= 0) throw new Error("⚠️ " + (t("calculator.addProductError") || "Добавьте товар и укажите бюджет"));

      const payload = {
        name: procurementName?.trim() || t("calculator.untitled"),
        budget: Number(budget),
        products: validProducts,
        expenses_text: expensesText?.trim() || "",
        notes: notes?.trim() || ""
      };

      const res = await createProcurement(payload);
      setReport(await getProcurementReport(res.id));
    } catch (err) { setError(err.message || "Ошибка"); } finally { setLoading(false); }
  };

  const handleComplete = async () => {
    if (!report?.id) return;
    try {
      await completeProcurement(report.id);
      alert(t("calculator.completeSuccess") || "✅ Закупка завершена");
      onComplete?.();
    } catch (err) { alert("Ошибка: " + (err.message || err)); }
  };

  const purchaseTotal = report?.products?.reduce((s, p) => s + (p.total_purchase_cost || 0), 0) || 0;
  const chartData = report ? [
    { name: t("report.purchaseTotal") || "Product Purchase", value: purchaseTotal },
    ...(report.expenses_breakdown ? Object.entries(report.expenses_breakdown).map(([k, v]) => ({
      name: t(`categories.${k}`) || k, value: v
    })) : [])
  ].filter(d => d.value > 0).map(d => ({
    ...d,
    color: CATEGORY_COLORS[d.name] || CATEGORY_COLORS[d.name.split(' ')[0]] || "#8884d8"
  })) : [];

  const totalExpenses = chartData.reduce((sum, d) => sum + d.value, 0);
  const isRussian = t("language") === "ru";
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-16 transition-colors">
      <div className="max-w-3xl mx-auto">
        
        <button
          onClick={() => {
            if (initialReport) { onBack(); return; }
            if (report) { setReport(null); return; }
            onBack();
          }}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
        >
          ← {initialReport ? t("calculator.backBtn") : report ? t("calculator.backToForm") : t("calculator.backBtn")}
        </button>

        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">{error}</div>}

        {!report ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">📦 {procurementName || t("calculator.untitled")}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("calculator.budgetLabel")}</label>
              <input type="number" className="w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={budget} onChange={e => setBudget(e.target.value)} placeholder="100000" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("calculator.productsLabel")}</label>
                <button type="button" onClick={addProduct} className="text-blue-600 text-sm hover:underline">{t("calculator.addProductBtn")}</button>
              </div>
              <div className="space-y-3">
                {products.map((prod, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg items-center">
                    <input placeholder={t("report.product")} className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={prod.name} onChange={e => updateProduct(idx, 'name', e.target.value)} required />
                    <input type="number" placeholder={t("report.quantity")} className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={prod.quantity} onChange={e => updateProduct(idx, 'quantity', e.target.value)} required />
                    <input type="number" placeholder={t("report.purchasePerUnit")} className="border p-2 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={prod.price} onChange={e => updateProduct(idx, 'price', e.target.value)} required />
                    <button type="button" onClick={() => removeProduct(idx)} className="text-red-500 hover:text-red-700 text-xl">✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("calculator.expensesHint")}</label>
              <textarea className="w-full border p-3 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3" placeholder={t("calculator.expensesPlaceholder")} value={expensesText} onChange={e => setExpensesText(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📝 {t("calculator.notesLabel") || "Заметки / Примечания"}</label>
              <textarea className="w-full border p-3 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2" placeholder={t("calculator.notesPlaceholder") || "Поставщик, условия..."} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition disabled:opacity-50">{loading ? t("calculator.calcBtnLoading") : t("calculator.calcBtn")}</button>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t("report.title")}: {report.name}</h3>
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition text-sm shadow-sm disabled:opacity-50"
              >
                📄 {isRussian ? "Скачать PDF" : "Download PDF"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-gray-700 dark:text-gray-300">{t("report.product")}</th>
                    <th className="p-3 text-right">{t("report.quantity")}</th>
                    <th className="p-3 text-right">{t("report.purchasePerUnit")}</th>
                    <th className="p-3 text-right">{t("report.totalPurchaseCost")}</th>
                    <th className="p-3 text-right">{t("report.overheadPerUnit")}</th>
                    <th className="p-3 text-right font-bold">{t("report.totalCostPerUnit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.products?.map?.((p, i) => (
                    <tr key={i} className="border-t dark:border-gray-700">
                      <td className="p-3 font-medium text-gray-800 dark:text-white">{p?.name || "-"}</td>
                      <td className="p-3 text-right">{p?.quantity ?? "-"}</td>
                      <td className="p-3 text-right">{p?.purchase_price_per_unit?.toFixed(2) || "-"} ₽</td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-400">{p?.total_purchase_cost?.toFixed(2) || "-"} ₽</td>
                      <td className="p-3 text-right text-gray-500">{p?.overhead_per_unit?.toFixed(2) || "-"} ₽</td>
                      <td className="p-3 text-right font-bold text-blue-600">{p?.total_cost_per_unit?.toFixed(2) || "-"} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div>{t("report.budget")}: <b>{report.budget?.toFixed(2) || "0"} ₽</b></div>
              <div>{t("report.totalSpent")}: <b>{report.total_spent?.toFixed(2) || "0"} ₽</b></div>
              <div className={`col-span-2 ${report.is_over_budget ? "text-red-600 font-bold" : "text-green-600 font-bold"}`}>
                {report.is_over_budget ? t("report.overBudget") : t("report.remaining")}: <b>{report.budget_remaining?.toFixed(2) || "0"} ₽</b>
              </div>
            </div>

            {report.notes && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm dark:text-yellow-200">
                📝 <b>{t("report.notesLabel") || "Примечания:"}</b> {report.notes}
              </div>
            )}

            {chartData.length > 0 && (
              <div className="space-y-5 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">📊 {t("report.expenseStructure") || "Структура расходов"}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value.toFixed(2)} ₽</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {chartData.map((item, idx) => {
                    const percent = totalExpenses > 0 ? (item.value / totalExpenses * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <span>{item.name}</span>
                          <span>{percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percent}%`, backgroundColor: item.color }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition">
              {t("calculator.completeBtn")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}