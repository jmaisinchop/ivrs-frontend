import React, { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import RoleGuard from "./RoleGuard";
import {
  HomeIcon,
  UsersIcon,
  PhoneIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ArrowRightCircleIcon,
  ArrowRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../features/authentication/contexts/AuthContext";

const SIDEBAR_EXPAND_DELAY = 50;
const SIDEBAR_COLLAPSE_DELAY = 300;
const INACTIVITY_COLLAPSE_TIMEOUT = 5000;

const Sidebar = ({ user: userProp, collapsed, toggleSidebar, autoCollapse, setAutoCollapse }) => {
  const { user: contextUser } = useContext(AuthContext);
  const user = userProp || contextUser;

  const [activeHover, setActiveHover] = useState(null);
  const [isMouseOverSidebar, setIsMouseOverSidebar] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);
  const collapseTimerRef = useRef(null);
  const expandTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (!sidebarElement || !autoCollapse) {
      clearTimeout(expandTimerRef.current);
      clearTimeout(collapseTimerRef.current);
      return;
    }

    const handleMouseEnter = () => {
      setIsMouseOverSidebar(true);
      clearTimeout(collapseTimerRef.current);
      if (collapsed) {
        expandTimerRef.current = setTimeout(() => {
          toggleSidebar();
        }, SIDEBAR_EXPAND_DELAY);
      }
    };

    const handleMouseLeave = () => {
      setIsMouseOverSidebar(false);
      clearTimeout(expandTimerRef.current);
      if (!collapsed) {
        collapseTimerRef.current = setTimeout(() => {
          toggleSidebar();
        }, SIDEBAR_COLLAPSE_DELAY);
      }
    };

    sidebarElement.addEventListener('mouseenter', handleMouseEnter);
    sidebarElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
      sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(expandTimerRef.current);
      clearTimeout(collapseTimerRef.current);
    };
  }, [autoCollapse, collapsed, toggleSidebar]);

  useEffect(() => {
    if (!autoCollapse || collapsed || isMouseOverSidebar) {
      clearTimeout(inactivityTimerRef.current);
      return;
    }
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimerRef.current);
      if (!autoCollapse || collapsed || isMouseOverSidebar) return;
      inactivityTimerRef.current = setTimeout(() => {
        if (!collapsed && autoCollapse && !isMouseOverSidebar) {
          toggleSidebar();
        }
      }, INACTIVITY_COLLAPSE_TIMEOUT);
    };
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      clearTimeout(inactivityTimerRef.current);
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [autoCollapse, collapsed, toggleSidebar, isMouseOverSidebar]);

  const navItems = [
    { to: "/", label: "Inicio", icon: <HomeIcon className="h-5 w-5" />, permission: 'ivrs' },
    { to: "/campaigns", label: "Campañas", icon: <ComputerDesktopIcon className="h-5 w-5" />, highlight: true, permission: 'ivrs' },
    { to: "/reports", label: "Reportes", icon: <ChartBarIcon className="h-5 w-5" />, permission: 'ivrs' },
    { to: "/whatsapp", label: "WhatsApp", icon: <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />, permission: 'whatsapp' },
  ];

  const adminItems = [
    { to: "/users", label: "Usuarios", icon: <UsersIcon className="h-5 w-5" /> },
    { to: "/channels", label: "Canales", icon: <PhoneIcon className="h-5 w-5" /> },
    { to: "/audit", label: "Auditoría", icon: <ShieldCheckIcon className="h-5 w-5" /> },
  ];

  return (
    <motion.div
      ref={sidebarRef}
      className={`hidden md:flex flex-col transition-all duration-300 ease-in-out fixed h-full z-50
                 bg-slate-50 dark:bg-dark-900 border-r border-slate-200 dark:border-dark-700 shadow-lg`}
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      <div className={`flex items-center justify-between h-20 px-4 border-b border-slate-200 dark:border-dark-700 shrink-0`}>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-dark-800 shadow-sm">
              <img src="/fin.png" alt="Logo Finsolred" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-brand-primary dark:text-brand-accent">FINSOLRED</span>
              <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">IVRS Platform</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center w-full"
          >
            <div className="p-2 rounded-xl bg-white dark:bg-dark-800 shadow-sm">
              <img src="/fin.png" alt="Logo Finsolred" className="h-8 w-8 object-contain" />
            </div>
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "var(--color-brand-secondary)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setAutoCollapse(false);
          toggleSidebar();
        }}
        className="absolute -right-3 top-24 p-1 rounded-full shadow-lg focus:outline-none transition-colors z-10
                   bg-brand-primary text-white border-2 border-white dark:border-dark-900"
        style={{ '--color-brand-secondary': '#4B89C8' }}
      >
        {collapsed ? (
          <ArrowRightCircleIcon className="h-5 w-5" />
        ) : (
          <ArrowRightCircleIcon className="h-5 w-5 transform rotate-180" />
        )}
      </motion.button>

      <div className="flex-1 flex flex-col overflow-y-auto py-4 px-2 space-y-1">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.permission === 'ivrs' && !user?.canAccessIvrs) return null;
            if (item.permission === 'whatsapp' && !user?.canAccessWhatsapp) return null;

            return (
              <PremiumNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                active={location.pathname === item.to}
                onHover={setActiveHover}
                isBeingHovered={activeHover === item.to}
                highlight={item.highlight}
              />
            );
          })}

          <RoleGuard roles={["ADMIN", "SUPERVISOR"]}>
            <div className="pt-4 mt-4">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="flex items-center px-3 mb-2"
                >
                  <div className="flex-1 border-t border-slate-200 dark:border-dark-700"></div>
                  <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Administración
                  </span>
                  <div className="flex-1 border-t border-slate-200 dark:border-dark-700"></div>
                </motion.div>
              )}
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <PremiumNavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    collapsed={collapsed}
                    active={location.pathname === item.to}
                    onHover={setActiveHover}
                    isBeingHovered={activeHover === item.to}
                    highlight={item.highlight}
                  />
                ))}
              </div>
            </div>
          </RoleGuard>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-dark-700 shrink-0">
        <motion.div
          className="flex items-center p-2 rounded-xl transition-all border border-slate-200 dark:border-dark-600 
                     hover:bg-slate-100 dark:hover:bg-dark-700 shadow-sm"
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-md flex-shrink-0
                       bg-gradient-to-br from-brand-primary to-brand-secondary"
          >
            {user?.initials}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.2 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-sm font-medium truncate text-slate-800 dark:text-slate-100">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-1">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs
                             bg-brand-accent/20 text-brand-primary dark:bg-brand-accent/30 dark:text-brand-accent"
                >
                  {user?.role}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const PremiumNavItem = ({ to, label, icon, collapsed, active, onHover, isBeingHovered, highlight }) => {
    // ... El código de este sub-componente no necesita cambios, puedes pegarlo aquí directamente
    const navLinkBaseClass = `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl mx-1 transition-all relative`;
    const activeClass = `bg-brand-primary text-white shadow-lg shadow-brand-primary/30 dark:shadow-brand-accent/30`;
    const inactiveClass = `text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 hover:text-brand-primary dark:hover:text-brand-accent hover:shadow-sm`;
  
    return (
      <NavLink
        to={to}
        onMouseEnter={() => onHover(to)}
        onMouseLeave={() => onHover(null)}
        className={`${navLinkBaseClass} ${active ? activeClass : inactiveClass}`}
      >
        <motion.span
          className={`flex-shrink-0 relative ${highlight && !active ? 'text-red-500 dark:text-red-400' : ''}`}
          whileHover={{ scale: active ? 1 : 1.1 }}
        >
          <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : ''} group-hover:bg-brand-primary/10 dark:group-hover:bg-brand-accent/10 transition-colors`}>
            {React.cloneElement(icon, { className: `${icon.props.className} ${active ? 'text-white' : 'group-hover:text-brand-primary dark:group-hover:text-brand-accent'}` })}
          </div>
          {highlight && !active && (
            <span
              className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 dark:bg-red-400
                         ring-2 ring-slate-50 dark:ring-dark-900"
            />
          )}
        </motion.span>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.1, delay: collapsed ? 0 : 0.1 }}
            className="ml-3 truncate flex-1"
          >
            {label}
          </motion.span>
        )}
        {active && !collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-auto text-white/80"
          >
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </motion.span>
        )}
        <AnimatePresence>
          {collapsed && isBeingHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25, duration: 0.2 }}
              className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-white dark:bg-dark-700 shadow-xl rounded-lg text-sm font-medium whitespace-nowrap z-50
                         border border-slate-200 dark:border-dark-600 text-slate-700 dark:text-slate-200"
              style={{ minWidth: '160px' }}
            >
              <span
                className={`w-1.5 h-5 rounded-full mr-2 inline-block ${active ? 'bg-brand-primary' : 'bg-slate-400 dark:bg-slate-500'}`}
              />
              {label}
              {highlight && (
                <span className="ml-2 h-2 w-2 rounded-full inline-block bg-red-500 dark:bg-red-400" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </NavLink>
    );
};

export default Sidebar;