import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { assignChannelLimitAPI, updateChannelLimitAPI } from '../../../services/api';
import { ArrowPathIcon, PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const Card = ({ children, custom, variants }) => (
    <motion.div
        custom={custom}
        variants={variants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg p-6 flex flex-col"
    >
        {children}
    </motion.div>
);

const ChannelAssignmentForms = ({ usuarios, limites, onUpdate, cardVariants }) => {
    const [loading, setLoading] = useState({ assign: false, update: false });
    const [assignForm, setAssignForm] = useState({ userId: "", maxChannels: "" });
    const [updateForm, setUpdateForm] = useState({ userId: "", newMaxChannels: "" });

    const usuariosSinLimite = usuarios.filter(u => !limites.find(l => l.userId === u.id));

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!assignForm.userId || !assignForm.maxChannels || Number(assignForm.maxChannels) <= 0)
            return toast.warning("Complete todos los campos para asignar.");
        setLoading(s => ({ ...s, assign: true }));
        try {
            await assignChannelLimitAPI(assignForm.userId, Number(assignForm.maxChannels));
            toast.success("Límite asignado correctamente.");
            setAssignForm({ userId: "", maxChannels: "" });
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al asignar el límite.");
        } finally {
            setLoading(s => ({ ...s, assign: false }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!updateForm.userId || !updateForm.newMaxChannels || Number(updateForm.newMaxChannels) <= 0)
            return toast.warning("Complete todos los campos para actualizar.");
        setLoading(s => ({ ...s, update: true }));
        try {
            await updateChannelLimitAPI(updateForm.userId, Number(updateForm.newMaxChannels));
            toast.success("Límite actualizado correctamente.");
            setUpdateForm({ userId: "", newMaxChannels: "" });
            onUpdate();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al actualizar el límite.");
        } finally {
            setLoading(s => ({ ...s, update: false }));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
            <Card custom={1} variants={cardVariants}>
                <form onSubmit={handleAssign} className="flex flex-col h-full">
                    <div className="flex items-center mb-5">
                        <PlusCircleIcon className="h-6 w-6 text-brand-secondary dark:text-brand-accent mr-2.5" />
                        <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">Asignar Límite</h2>
                    </div>
                    <div className="space-y-5 flex-grow">
                        <div>
                            <label htmlFor="assignUserSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Usuario</label>
                            <select id="assignUserSelect" value={assignForm.userId} onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary">
                                <option value="">-- Seleccione Usuario --</option>
                                {usuariosSinLimite.map((u) => (<option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>))}
                            </select>
                            {usuariosSinLimite.length === 0 && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Todos los usuarios ya tienen un límite asignado.</p>)}
                        </div>
                        <div>
                            <label htmlFor="assignMaxChannels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Límite de Canales</label>
                            <input id="assignMaxChannels" type="number" min="1" placeholder="Máximo de canales" value={assignForm.maxChannels} onChange={(e) => setAssignForm({ ...assignForm, maxChannels: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"/>
                        </div>
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} disabled={loading.assign || usuariosSinLimite.length === 0} className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md transition-all disabled:opacity-60 flex items-center justify-center">
                        {loading.assign ? (<><ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Asignando...</>) : "Asignar Límite"}
                    </motion.button>
                </form>
            </Card>
            <Card custom={2} variants={cardVariants}>
                <form onSubmit={handleUpdate} className="flex flex-col h-full">
                    <div className="flex items-center mb-5">
                        <PencilSquareIcon className="h-6 w-6 text-brand-secondary dark:text-brand-accent mr-2.5" />
                        <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">Actualizar Límite</h2>
                    </div>
                    <div className="space-y-5 flex-grow">
                        <div>
                            <label htmlFor="updateUserSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Usuario con Límite</label>
                            <select id="updateUserSelect" value={updateForm.userId} onChange={(e) => setUpdateForm({ ...updateForm, userId: e.target.value, newMaxChannels: limites.find(l => l.userId === e.target.value)?.maxChannels || '' })} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary">
                                <option value="">-- Seleccione Usuario --</option>
                                {limites.map((l) => (<option key={l.userId} value={l.userId}>{l.user.firstName} {l.user.lastName} ({l.user.role}) - Actual: {l.maxChannels}</option>))}
                            </select>
                            {limites.length === 0 && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">No hay límites asignados para actualizar.</p>)}
                        </div>
                        <div>
                            <label htmlFor="updateMaxChannels" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nuevo Límite de Canales</label>
                            <input id="updateMaxChannels" type="number" min="1" placeholder="Nuevo máximo" value={updateForm.newMaxChannels} onChange={(e) => setUpdateForm({ ...updateForm, newMaxChannels: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"/>
                        </div>
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} disabled={loading.update || !updateForm.userId} className="w-full mt-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md transition-all disabled:opacity-60 flex items-center justify-center">
                        {loading.update ? (<><ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Actualizando...</>) : "Actualizar Límite"}
                    </motion.button>
                </form>
            </Card>
        </div>
    );
};

export default ChannelAssignmentForms;