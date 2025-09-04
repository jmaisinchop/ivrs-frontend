import React, { useState, useEffect, useCallback } from "react";
import {
  getAllUsersAPI,
  getAllLimitsAPI,
  getSystemChannelsAPI
} from "../../../services/api";
import { toast } from "react-toastify";
import { Cog8ToothIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import GlobalChannelSettings from './GlobalChannelSettings';
import ChannelAssignmentForms from './ChannelAssignmentForms';
import ChannelLimitsTable from './ChannelLimitsTable';

const ChannelsPage = () => {
  const [totalCanales, setTotalCanales] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [limites, setLimites] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatosCompletos = useCallback(async (showToast = true) => {
    setLoading(true);
    try {
      const [channelsRes, usersRes, limitsRes] = await Promise.all([
        getSystemChannelsAPI(),
        getAllUsersAPI(),
        getAllLimitsAPI(),
      ]);
      setTotalCanales(channelsRes.data.totalChannels || 0);
      setUsuarios(usersRes.data);
      setLimites(limitsRes.data);

      if (showToast) toast.info("Datos actualizados.", { autoClose: 1500 });
    } catch (error) {
        toast.error("Error al actualizar los datos.");
        console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    cargarDatosCompletos(false);
  }, [cargarDatosCompletos]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-900 min-h-screen p-4 md:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-accent flex items-center">
            <Cog8ToothIcon className="h-7 w-7 mr-3" /> Gestión de Canales
          </h1>
          <button onClick={() => cargarDatosCompletos(true)} disabled={loading} className="flex items-center text-sm px-4 py-2 rounded-lg bg-brand-secondary/10 dark:bg-brand-accent/10 text-brand-secondary dark:text-brand-accent hover:bg-brand-secondary/20 dark:hover:bg-brand-accent/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-0">
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${ loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </button>
        </header>

        {loading && !limites.length ? (
            <div className="text-center py-20">
                <ArrowPathIcon className="h-10 w-10 mx-auto animate-spin text-brand-primary"/>
                <p className="mt-2 text-slate-500">Cargando datos iniciales...</p>
            </div>
        ) : (
            <>
                <GlobalChannelSettings 
                    totalCanales={totalCanales}
                    onUpdate={() => cargarDatosCompletos(false)}
                    cardVariants={cardVariants}
                    customIndex={0}
                />
                
                <ChannelAssignmentForms 
                    usuarios={usuarios}
                    limites={limites}
                    onUpdate={() => cargarDatosCompletos(false)}
                    cardVariants={cardVariants}
                />
                
                <ChannelLimitsTable
                    limites={limites}
                    cardVariants={cardVariants}
                    customIndex={3}
                />
            </>
        )}
      </main>
    </div>
  );
};

export default ChannelsPage;