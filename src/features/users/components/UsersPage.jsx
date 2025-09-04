import React, { useEffect, useState, useCallback } from "react";
import { getAllUsersAPI } from "../../../services/api";
import { toast } from "react-toastify";
import { UsersIcon as PageIcon, UserPlusIcon, MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Importando los componentes modulares desde su nueva ubicación
import { UsersTable } from "./UsersTable";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { PermissionsModal } from "./PermissionsModal";
import { PasswordModal } from "./PasswordModal";
import Button from "../../../components/common/Button"; // <-- USANDO COMPONENTE REUTILIZABLE

// Componentes de UI específicos para esta página (pueden quedarse aquí o moverse a common si se reusan más)
const Card = ({ children, padding = true }) => (
    <div className={`bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg ${padding ? "p-6" : ""}`}>
        {children}
    </div>
);

const InputSearch = ({ value, onChange }) => (
    <div className="relative w-full sm:w-auto">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
      </div>
      <input 
        type="search" 
        placeholder="Buscar usuarios..." 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"
      />
    </div>
);

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, user: null });

  const cargarUsuarios = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const { data } = await getAllUsersAPI();
      setUsuarios(data);
      if (showToast) toast.info("Lista de usuarios actualizada.");
    } catch {
      toast.error("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleCloseModal = () => setModalState({ type: null, user: null });
  
  const handleUserUpdated = (updatedUser) => {
    setUsuarios(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  
  const handleUserCreated = (newUser) => {
    setUsuarios(prev => [...prev, newUser]);
  };

  const usuariosFiltrados = usuarios.filter(u => 
    [u.username, u.firstName, u.lastName, u.email, u.role]
      .some(field => field?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 dark:bg-dark-900 min-h-screen">
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-accent flex items-center">
              <PageIcon className="h-7 w-7 mr-3" /> Gestión de Usuarios
            </h1>
            <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
              <InputSearch value={busqueda} onChange={setBusqueda} />
              <Button onClick={() => setModalState({ type: 'create' })} Icon={UserPlusIcon}>Crear Usuario</Button>
            </div>
          </header>

          <Card padding={false}>
            {loading ? (
              <div className="text-center py-20">
                <ArrowPathIcon className="h-10 w-10 mx-auto animate-spin text-brand-primary"/>
                <p className="mt-2 text-slate-500">Cargando usuarios...</p>
              </div>
            ) : (
              <UsersTable 
                usuarios={usuariosFiltrados} 
                onEditPermissions={(user) => setModalState({type: 'permissions', user})}
                onEditPassword={(user) => setModalState({type: 'password', user})}
                onEdit={(user) => setModalState({type: 'edit', user})}
              />
            )}
          </Card>
        </div>
      </main>

      {/* --- Renderizado Centralizado de Modales --- */}
      <CreateUserModal 
          show={modalState.type === 'create'} 
          onClose={handleCloseModal}
          onUserCreated={handleUserCreated}
      />
      <EditUserModal 
          show={modalState.type === 'edit'} 
          user={modalState.user} 
          onClose={handleCloseModal} 
          onUserUpdated={handleUserUpdated} 
      />
      <PermissionsModal 
          show={modalState.type === 'permissions'} 
          user={modalState.user} 
          onClose={handleCloseModal} 
          onUserUpdated={handleUserUpdated} 
      />
      <PasswordModal 
          show={modalState.type === 'password'} 
          user={modalState.user} 
          onClose={handleCloseModal} 
      />
    </div>
  );
};

export default UsersPage;