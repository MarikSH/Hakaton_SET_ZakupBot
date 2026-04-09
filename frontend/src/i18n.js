import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем ваши JSON файлы
import ru from "./i18n/locales/ru.json";
import en from "./i18n/locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: "ru", // Язык по умолчанию
    fallbackLng: "ru",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;