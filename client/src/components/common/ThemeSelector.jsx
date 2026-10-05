import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Custom Chocolate Bar Icon designed with theme colors (#4E342E & #CC5500)
const ChocolateIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Dark Chocolate Bar Base */}
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" fill="#4E342E" />

    {/* Scored Chocolate Chunks */}
    <rect x="5.5" y="4" width="5.5" height="4.5" rx="1" fill="#795548" />
    <rect x="13" y="4" width="5.5" height="4.5" rx="1" fill="#795548" />

    <rect x="5.5" y="9.5" width="5.5" height="4.5" rx="1" fill="#795548" />
    <rect x="13" y="9.5" width="5.5" height="4.5" rx="1" fill="#795548" />

    {/* Burnt Orange Peeled Foil Wrapper */}
    <path
      d="M4 14.5 L7.5 13 L12 14.5 L16.5 13 L20 14.5 V19 C20 20.38 18.88 21.5 17.5 21.5 H6.5 C5.12 21.5 4 20.38 4 19 Z"
      fill="#CC5500"
    />
    {/* Foil Accent Band */}
    <rect x="6.5" y="16.5" width="11" height="1.8" rx="0.5" fill="#FFFDF7" opacity="0.9" />
  </svg>
);

const ThemeSelector = ({ className = '', align = 'right' }) => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (id, size = 'w-4 h-4') => {
    switch (id) {
      case 'light':
        return <Sun className={size} />;
      case 'dark':
        return <Moon className={size} />;
      case 'chocolate':
      default:
        return <ChocolateIcon className={size} />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 focus:outline-none"
        title="Change Theme"
        aria-label="Change Theme"
        aria-expanded={isOpen}
      >
        {getThemeIcon(theme)}
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
            Theme Preference
          </div>

          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center justify-between transition ${
                  isSelected
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {t.id === 'chocolate' ? (
                    <ChocolateIcon className="w-4 h-4 shrink-0" />
                  ) : (
                    <span
                      className="w-3.5 h-3.5 rounded-full border shadow-xs shrink-0"
                      style={{ backgroundColor: t.dot, borderColor: t.border }}
                    />
                  )}
                  <span>{t.name}</span>
                  {t.id === 'chocolate' && <span className="text-xs leading-none">🍫</span>}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
