import React, { useState, useContext, useRef, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AuthContext } from '../../features/authentication/contexts/AuthContext';

export const LayoutContext = createContext(null);

const MainLayout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(true);

  const mainContentRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900">
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        autoCollapse={autoCollapse}
        setAutoCollapse={setAutoCollapse}
      />

      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out md:ml-[256px]"
        style={{
          marginLeft: sidebarCollapsed ? '80px' : '256px',
        }}
      >
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          autoCollapse={autoCollapse}
          setAutoCollapse={setAutoCollapse}
        />

        <main ref={mainContentRef} className="flex-1 overflow-y-auto pt-16 px-4 sm:px-6 lg:px-8 pb-4">
          <LayoutContext.Provider value={mainContentRef}>
            <Outlet /> {/* Aquí se renderizarán tus páginas (Dashboard, Campañas, etc.) */}
          </LayoutContext.Provider>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;