import React, { useState, useContext, useRef, createContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { AuthContext } from '../contexts/AuthContext';


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
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900"> {/* Cambio aquí */}
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        autoCollapse={autoCollapse}
        setAutoCollapse={setAutoCollapse}
      />

      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          // Estos márgenes dinámicos están bien como estilos en línea
          marginLeft: sidebarCollapsed ? '80px' : '256px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          autoCollapse={autoCollapse}
          setAutoCollapse={setAutoCollapse}
        />

        <main ref={mainContentRef} className="flex-1 overflow-y-auto pt-16 px-4 pb-4"> {/* Añadido pb-4 para espaciado inferior */}
          <LayoutContext.Provider value={mainContentRef}>
            <Outlet />
          </LayoutContext.Provider>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;