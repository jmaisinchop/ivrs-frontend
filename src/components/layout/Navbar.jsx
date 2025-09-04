import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../features/authentication/contexts/AuthContext";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowRightCircleIcon,
  UserIcon,
  CogIcon as SettingsIcon,
  PowerIcon as LogoutIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

const Navbar = ({ sidebarCollapsed, toggleSidebar, autoCollapse, setAutoCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profileDropdownRef = useRef(null);

  useClickOutside(profileDropdownRef, () => {
    if (profileDropdownOpen) {
      setProfileDropdownOpen(false);
    }
  });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [profileDropdownOpen]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    const handleScroll = () => {
        if (mainContent) {
            setScrolled(mainContent.scrollTop > 10);
        }
    };
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-40 transition-all duration-300 backdrop-blur-md
                 bg-white/90 dark:bg-dark-900/90 border-b border-slate-200 dark:border-dark-800 
                 ${scrolled ? "shadow-sm dark:shadow-md" : ""}`}
      style={{
        left: sidebarCollapsed ? '80px' : '256px',
        width: sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)',
        transition: 'left 0.3s ease, width 0.3s ease'
      }}
    >
      <div className="max-w-full mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <div className="flex md:hidden">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--color-brand-accent)/0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-lg text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 mr-2
                         dark:text-brand-accent dark:focus:ring-offset-dark-900"
              aria-label={sidebarCollapsed ? "Abrir menú lateral" : "Cerrar menú lateral"}
            >
              {sidebarCollapsed ? (
                <ArrowRightCircleIcon className="h-6 w-6 rotate-90 md:rotate-0" />
              ) : (
                <ArrowRightCircleIcon className="h-6 w-6 -rotate-90 md:rotate-180" />
              )}
            </motion.button>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <motion.div
              animate={{ width: searchOpen ? "100%" : "240px" }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder={searchOpen ? "Buscar en el sistema..." : "Buscar..."}
                className="block w-full pl-10 pr-3 py-2 border rounded-xl shadow-xs text-sm transition-all
                           bg-slate-50 dark:bg-dark-800 border-slate-300 dark:border-dark-700
                           text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent focus:border-transparent"
                style={{
                  paddingRight: searchOpen ? '2.5rem' : '0.75rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
              />
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <kbd className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium
                                 border-slate-300 dark:border-dark-700 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-dark-700">
                    ESC
                  </kbd>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <div className="relative" ref={profileDropdownRef}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <button
                  id="user-menu-button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 lg:space-x-3 max-w-xs rounded-full focus:outline-none focus:ring-2 
                             focus:ring-brand-primary dark:focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-dark-900 p-0.5"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-controls="user-menu"
                >
                  <motion.div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold shadow-md
                               bg-gradient-to-br from-brand-primary to-brand-secondary border-2 border-white/80 dark:border-dark-700/80"
                    whileHover={{ scale: 1.05 }}
                  >
                    {user?.initials || 'U'}
                  </motion.div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium truncate max-w-[100px] xl:max-w-[120px] text-slate-800 dark:text-slate-100">
                      {user?.firstName || 'Usuario'}
                    </p>
                    <p className="text-xs truncate max-w-[100px] xl:max-w-[120px] text-slate-500 dark:text-slate-400">
                      {user?.role || 'Rol'}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-4 w-4 text-brand-primary dark:text-brand-accent" />
                  </motion.div>
                </button>
              </motion.div>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    id="user-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 }}}
                    transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                    className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-1 
                               bg-white dark:bg-dark-800 ring-1 ring-black/5 dark:ring-white/10 
                               border border-slate-200 dark:border-dark-700 
                               divide-y divide-slate-100 dark:divide-slate-700 z-50"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs truncate mt-0.5 text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <div className="py-1" role="none">
                      {[
                        { label: "Mi perfil", icon: UserIcon, href: "#" },
                        { label: "Configuración", icon: SettingsIcon, href: "#" },
                        { label: "Ayuda", icon: QuestionMarkCircleIcon, href: "#" },
                      ].map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          role="menuitem"
                          tabIndex={-1}
                          className="flex items-center px-4 py-2.5 text-sm rounded-lg mx-1 transition-colors
                                     text-slate-700 dark:text-slate-200 
                                     hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-brand-primary dark:hover:text-brand-accent"
                        >
                          <item.icon className="h-5 w-5 mr-3 text-brand-primary dark:text-brand-accent" />
                          {item.label}
                        </a>
                      ))}
                    </div>
                    <div className="py-1" role="none">
                      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Modo oscuro</span>
                        <button
                          onClick={toggleTheme}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 transition"
                          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                          aria-pressed={theme === "dark"}
                          role="menuitemcheckbox"
                          tabIndex={-1}
                        >
                          {theme === "dark"
                            ? <SunIcon className="h-5 w-5 text-yellow-400" />
                            : <MoonIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Auto-ocultar sidebar</span>
                        <button
                          onClick={() => setAutoCollapse(!autoCollapse)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 transition text-brand-primary dark:text-brand-accent"
                          aria-pressed={autoCollapse}
                          role="menuitemcheckbox"
                          tabIndex={-1}
                        >
                          {autoCollapse ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-3.75M15 15v4.5M15 15h4.5M15 15l5.25 5.25" /></svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => { logout(); setProfileDropdownOpen(false); }}
                        role="menuitem"
                        tabIndex={-1}
                        className="w-full text-left flex items-center px-4 py-2.5 text-sm rounded-lg mx-1 transition-colors
                                   text-slate-700 dark:text-slate-200 
                                   hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <LogoutIcon className="h-5 w-5 mr-3 text-red-500" />
                        Cerrar sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;