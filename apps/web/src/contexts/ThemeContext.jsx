import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

const prefersDarkSchemeQuery = '(prefers-color-scheme: dark)';

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
      return savedTheme;
    }

    if (window.matchMedia(prefersDarkSchemeQuery).matches) {
      return 'dark';
    }
  } catch (error) {
    console.error('Failed to retrieve stored theme:', error);
  }

  return 'light';
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(prefersDarkSchemeQuery).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(prefersDarkSchemeQuery);
    const handleChange = (event) => {
      setSystemPrefersDark(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const resolvedTheme = useMemo(() => {
    if (theme === 'auto') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemPrefersDark]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    if (resolvedTheme === 'dark') {
      document.body.setAttribute('theme-mode', 'dark');
    } else {
      document.body.removeAttribute('theme-mode');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'auto') {
        return systemPrefersDark ? 'light' : 'dark';
      }
      return prevTheme === 'light' ? 'dark' : 'light';
    });
  };

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'auto') {
      setTheme(mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
