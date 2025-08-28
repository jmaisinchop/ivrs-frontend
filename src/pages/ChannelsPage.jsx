/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  getSystemChannelsAPI,
  setSystemChannelsAPI,
  getAllUsersAPI,
  getAllLimitsAPI,
  assignChannelLimitAPI,
  updateChannelLimitAPI,
} from "../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  UserCircleIcon as UserAvatarIcon, // Renombrado para evitar confusión
  Cog8ToothIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const PaginaCanales = () => {
  const [totalCanales, setTotalCanales] = useState(0);
  const [nuevoTotal, setNuevoTotal] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [limites, setLimites] = useState([]);
  const [cargando, setCargando] = useState({
    sistema: false,
    asignar: false,
    actualizar: false,
    lista: false, // Para el botón de actualizar general
  });
  const [formAsignar, setFormAsignar] = useState({ usuarioId: "", maxCanales: "" });
  const [formActualizar, setFormActualizar] = useState({ usuarioId: "", nuevoMaxCanales: "" });

  const cargarDatosCompletos = async () => {
    setCargando((s) => ({ ...s, lista: true }));
    try {
      await Promise.all([
        cargarCanalesSistema(false), // No activar spinner individual
        cargarUsuarios(false),
        cargarLimites(false)
      ]);
      toast.info("Datos actualizados.", { autoClose: 1500 });
    } catch (error) {
        // Los errores específicos ya se manejan en las funciones individuales
        // O se puede añadir un toast general aquí si alguna promesa falla
    } finally {
      setCargando((s) => ({ ...s, lista: false }));
    }
  };


  const cargarCanalesSistema = async (setIndividualLoading = true) => {
    if (setIndividualLoading) setCargando((s) => ({ ...s, sistema: true }));
    try {
      const { data } = await getSystemChannelsAPI();
      setTotalCanales(data.totalChannels || 0);
    } catch {
      toast.error("Error al cargar el total de canales del sistema.");
    } finally {
      if (setIndividualLoading) setCargando((s) => ({ ...s, sistema: false }));
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data } = await getAllUsersAPI();
      setUsuarios(data);
    } catch {
      toast.error("Error al cargar la lista de usuarios.");
    }
  };

  const cargarLimites = async () => {
    try {
      const { data } = await getAllLimitsAPI();
      setLimites(data);
    } catch {
      toast.error("Error al cargar los límites de canales asignados.");
    }
  };

  useEffect(() => {
    cargarCanalesSistema();
    cargarUsuarios();
    cargarLimites();
  }, []);

  const handleEstablecerTotal = async () => {
    if (!nuevoTotal || Number(nuevoTotal) < 0) return toast.warning("Por favor ingrese un valor total válido y positivo.");
    try {
      setCargando((s) => ({ ...s, sistema: true }));
      await setSystemChannelsAPI(Number(nuevoTotal));
      toast.success("Total de canales del sistema actualizado exitosamente.");
      setNuevoTotal("");
      cargarCanalesSistema(false);
    } catch {
      toast.error("Error al actualizar el total de canales del sistema.");
    } finally {
      setCargando((s) => ({ ...s, sistema: false }));
    }
  };

  const handleAsignar = async () => {
    if (!formAsignar.usuarioId || !formAsignar.maxCanales || Number(formAsignar.maxCanales) <= 0)
      return toast.warning("Complete todos los campos con valores válidos para asignar.");
    try {
      setCargando((s) => ({ ...s, asignar: true }));
      await assignChannelLimitAPI(
        formAsignar.usuarioId,
        Number(formAsignar.maxCanales)
      );
      toast.success("Límite de canales asignado correctamente.");
      setFormAsignar({ usuarioId: "", maxCanales: "" });
      cargarLimites(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al asignar el límite de canales.");
    } finally {
      setCargando((s) => ({ ...s, asignar: false }));
    }
  };

  const handleActualizar = async () => {
    if (!formActualizar.usuarioId || !formActualizar.nuevoMaxCanales || Number(formActualizar.nuevoMaxCanales) <= 0)
      return toast.warning("Complete todos los campos con valores válidos para actualizar.");
    try {
      setCargando((s) => ({ ...s, actualizar: true }));
      await updateChannelLimitAPI(
        formActualizar.usuarioId,
        Number(formActualizar.nuevoMaxCanales)
      );
      toast.success("Límite de canales actualizado correctamente.");
      setFormActualizar({ usuarioId: "", nuevoMaxCanales: "" });
      cargarLimites(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar el límite de canales.");
    } finally {
      setCargando((s) => ({ ...s, actualizar: false }));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors duration-300">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-accent mb-3 sm:mb-0">
                <Cog8ToothIcon className="inline-block h-7 w-7 mr-2 align-text-bottom" /> Gestión de Canales
              </h1>
              <button
                onClick={cargarDatosCompletos}
                disabled={cargando.lista}
                className="flex items-center text-sm px-4 py-2 rounded-lg bg-brand-secondary/10 dark:bg-brand-accent/10 text-brand-secondary dark:text-brand-accent 
                           hover:bg-brand-secondary/20 dark:hover:bg-brand-accent/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${ cargando.lista ? 'animate-spin' : ''}`} />
                Actualizar Datos
              </button>
            </div>

            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent mb-2 sm:mb-0">
                  Configuración Global de Canales
                </h2>
                <div className="px-3 py-1.5 rounded-full bg-brand-accent/10 dark:bg-brand-primary/20 text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Total Disponible:</span>{" "}
                  <span className="font-bold text-brand-secondary dark:text-brand-accent">
                    {totalCanales}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full md:w-auto">
                  <label htmlFor="nuevoTotalInput" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nuevo Total de Canales del Sistema</label>
                  <input
                    id="nuevoTotalInput"
                    type="number"
                    min="0"
                    placeholder="Ej: 100"
                    value={nuevoTotal}
                    onChange={(e) => setNuevoTotal(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                               bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                               focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent 
                               transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <motion.button
                  onClick={handleEstablecerTotal}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={cargando.sistema}
                  className="w-full md:w-auto px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md hover:shadow-lg 
                             transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cargando.sistema ? (
                    <> <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Actualizando... </>
                  ) : "Establecer Total"}
                </motion.button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg p-6 flex flex-col"
              >
                <div className="flex items-center mb-5">
                  <PlusCircleIcon className="h-6 w-6 text-brand-secondary dark:text-brand-accent mr-2.5 flex-shrink-0" />
                  <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">
                    Asignar Límite a Usuario
                  </h2>
                </div>

                <div className="space-y-5 flex-grow">
                  <div>
                    <label htmlFor="assignUserSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Usuario
                    </label>
                    <select
                      id="assignUserSelect"
                      value={formAsignar.usuarioId}
                      onChange={(e) => setFormAsignar({ ...formAsignar, usuarioId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                                 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent transition-all"
                    >
                      <option value="">-- Seleccione Usuario --</option>
                      {usuarios
                        .filter(u => !limites.find(l => l.userId === u.id))
                        .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.role})
                        </option>
                      ))}
                    </select>
                     {usuarios.filter(u => !limites.find(l => l.userId === u.id)).length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Todos los usuarios ya tienen un límite asignado.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="assignMaxChannels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Límite de Canales
                    </label>
                    <input
                      id="assignMaxChannels"
                      type="number"
                      min="1"
                      placeholder="Máximo de canales"
                      value={formAsignar.maxCanales}
                      onChange={(e) => setFormAsignar({ ...formAsignar, maxCanales: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                                 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent 
                                 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
                 <motion.button
                  onClick={handleAsignar}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={cargando.asignar || usuarios.filter(u => !limites.find(l => l.userId === u.id)).length === 0}
                  className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md hover:shadow-lg 
                             transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cargando.asignar ? (
                     <> <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Asignando... </>
                  ) : "Asignar Límite"}
                </motion.button>
              </motion.div>

              <motion.div
                custom={2}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg p-6 flex flex-col"
              >
                <div className="flex items-center mb-5">
                  <PencilSquareIcon className="h-6 w-6 text-brand-secondary dark:text-brand-accent mr-2.5 flex-shrink-0" />
                  <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">
                    Actualizar Límite de Usuario
                  </h2>
                </div>

                <div className="space-y-5 flex-grow">
                  <div>
                    <label htmlFor="updateUserSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Usuario con Límite
                    </label>
                    <select
                      id="updateUserSelect"
                      value={formActualizar.usuarioId}
                      onChange={(e) => setFormActualizar({ ...formActualizar, usuarioId: e.target.value, nuevoMaxCanales: limites.find(l => l.userId === e.target.value)?.maxChannels || '' })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                                 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent transition-all"
                    >
                      <option value="">-- Seleccione Usuario --</option>
                      {limites.map((l) => (
                        <option key={l.userId} value={l.userId}>
                          {l.user.firstName} {l.user.lastName} ({l.user.role}) - Actual: {l.maxChannels}
                        </option>
                      ))}
                    </select>
                     {limites.length === 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">No hay límites asignados para actualizar.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="updateMaxChannels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Nuevo Límite de Canales
                    </label>
                    <input
                      id="updateMaxChannels"
                      type="number"
                      min="1"
                      placeholder="Nuevo máximo"
                      value={formActualizar.nuevoMaxCanales}
                      onChange={(e) => setFormActualizar({ ...formActualizar, nuevoMaxCanales: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                                 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                                 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent 
                                 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <motion.button
                  onClick={handleActualizar}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={cargando.actualizar || !formActualizar.usuarioId}
                  className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md hover:shadow-lg 
                             transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {cargando.actualizar ? (
                    <> <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Actualizando... </>
                  ) : "Actualizar Límite"}
                </motion.button>
              </motion.div>
            </div>

            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-slate-200 dark:border-dark-700 flex items-center">
                <UsersIcon className="h-6 w-6 text-brand-primary dark:text-brand-accent mr-3 flex-shrink-0" />
                <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">
                  Límites de Canales Asignados a Usuarios ({limites.length})
                </h2>
              </div>

              {limites.length === 0 ? (
                <div className="text-center py-10 px-6">
                    <ChartBarIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-3"/>
                    <p className="text-slate-500 dark:text-slate-400">Aún no se han asignado límites de canales a los usuarios.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Utilice el formulario de arriba para comenzar.</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-700">
                  <thead className="bg-slate-100 dark:bg-dark-700/60"> {/* Ligeramente más oscuro para thead */}
                    <tr>
                      {["Usuario", "Límite", "En Uso", "Disponibles", "Uso (%)"].map(
                        (th) => (
                          <th
                            key={th}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                          >
                            {th}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-800 divide-y divide-slate-200 dark:divide-dark-700">
                    {limites.map((l) => {
                      const pct = l.maxChannels > 0 ? (l.usedChannels / l.maxChannels) * 100 : 0;
                      const disp = l.maxChannels - l.usedChannels;
                      let progressBarColor = "bg-green-500 dark:bg-green-500"; 
                      if (pct > 85) progressBarColor = "bg-red-500 dark:bg-red-500";
                      else if (pct > 60) progressBarColor = "bg-yellow-500 dark:bg-yellow-500";
                      
                      let disponiblesColor = "text-green-600 dark:text-green-400";
                      if (disp <= 0) disponiblesColor = "text-red-600 dark:text-red-400 font-bold";
                      else if (disp <= Math.max(2, l.maxChannels * 0.1)) disponiblesColor = "text-yellow-600 dark:text-yellow-400 font-semibold";

                      return (
                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/70 transition-colors duration-100">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold
                                              ${l.user.role === 'ADMIN' ? 'bg-brand-primary' : 
                                               l.user.role === 'SUPERVISOR' ? 'bg-brand-secondary' : 
                                               'bg-brand-accent'}`}>
                                {l.user.firstName?.charAt(0).toUpperCase()}{l.user.lastName?.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {l.user.firstName} {l.user.lastName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {l.user.role} - @{l.user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{l.maxChannels}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{l.usedChannels}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${disponiblesColor}`}>
                            {disp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="w-20 sm:w-28 bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 mr-2">
                                <div
                                    className={`h-2.5 rounded-full ${progressBarColor} transition-all duration-500`}
                                    style={{ width: `${pct > 100 ? 100 : pct}%` }}
                                />
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">
                                    {Math.round(pct)}%
                                </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaginaCanales;