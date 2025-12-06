import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'purple' | 'green';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setThemeState(savedTheme);
    setIsDarkMode(savedDarkMode);
    
    // Apply dark mode class
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Apply theme class to both html and body
    document.documentElement.classList.remove('theme-blue', 'theme-purple', 'theme-green');
    document.body.classList.remove('theme-blue', 'theme-purple', 'theme-green');
    
    if (savedTheme !== 'light' && savedTheme !== 'dark') {
      document.documentElement.classList.add(`theme-${savedTheme}`);
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Remove old theme classes from html
    document.documentElement.classList.remove('theme-blue', 'theme-purple', 'theme-green');
    
    // Remove old theme classes from body
    document.body.classList.remove('theme-blue', 'theme-purple', 'theme-green');
    
    // Handle light/dark theme selection
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      localStorage.setItem('darkMode', 'false');
      console.log('Light mode activated');
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      localStorage.setItem('darkMode', 'true');
      console.log('Dark mode activated');
    } else {
      // Color themes (blue, purple, green)
      document.documentElement.classList.add(`theme-${newTheme}`);
      document.body.classList.add(`theme-${newTheme}`);
      console.log('Added class:', `theme-${newTheme}`);
      console.log('HTML classes:', document.documentElement.className);
      console.log('Body classes:', document.body.className);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
