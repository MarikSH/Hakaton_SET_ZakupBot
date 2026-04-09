import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light'; // 🔹 Явный дефолт: light
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ru');

  useEffect(() => {
    const root = document.documentElement; // 🔹 Вешаем класс на <html>, а не на body
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);