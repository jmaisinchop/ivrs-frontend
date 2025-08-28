import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateUserAPI } from '../../services/api';
import { Modal, Btn, ToggleSwitch } from './CommonUI';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const PermissionsModal = ({ show, onClose, user, onUserUpdated }) => {
    const [permissions, setPermissions] = useState({
        canAccessIvrs: false,
        canAccessWhatsapp: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setPermissions({
                canAccessIvrs: user.canAccessIvrs,
                canAccessWhatsapp: user.canAccessWhatsapp
            });
        }
    }, [user]);

    const handleToggle = (permission) => {
        setPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: updatedUser } = await updateUserAPI(user.id, permissions);
            toast.success("Permisos actualizados.");
            onUserUpdated(updatedUser);
            onClose();
        } catch (error) {
            toast.error("Error al actualizar permisos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={`Editar Permisos de ${user?.username}`}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <label className="font-medium text-slate-700 dark:text-slate-300">Acceso IVRS / Campañas</label>
                        <ToggleSwitch checked={permissions.canAccessIvrs} onChange={() => handleToggle('canAccessIvrs')} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <label className="font-medium text-slate-700 dark:text-slate-300">Acceso WhatsApp</label>
                        <ToggleSwitch checked={permissions.canAccessWhatsapp} onChange={() => handleToggle('canAccessWhatsapp')} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Btn type="submit" loading={loading} Icon={ShieldCheckIcon}>Guardar Permisos</Btn>
                </div>
            </form>
        </Modal>
    );
};