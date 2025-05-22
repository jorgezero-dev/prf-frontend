import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const THEME_KEY = 'portfolio-theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) {
            return storedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light'; // Default to light theme
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-text-lightMode dark:text-text-darkMode hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none transition-colors duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <FaMoon className="w-5 h-5 text-neutral-700" /> : <FaSun className="w-5 h-5 text-yellow-400" />}
        </button>
    );
}
