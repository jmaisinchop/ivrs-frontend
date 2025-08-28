import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateUserAPI } from '../../services/api';
import { Modal, Campo, Btn } from './CommonUI'; // Asumiendo que creas un archivo para componentes comunes
import { UserPlusIcon } from '@heroicons/react/24/outline';

export const EditUserModal = ({ show, onClose, user, onUserUpdated }) => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'CALLCENTER' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || 'CALLCENTER',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: updatedUser } = await updateUserAPI(user.id, formData);
            toast.success("Usuario actualizado correctamente.");
            onUserUpdated(updatedUser);
            onClose();
        } catch (error) {
            toast.error("Error al actualizar el usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={`Editar Usuario: ${user?.username}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Campo label="Nombre(s)" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Campo label="Apellido(s)" name="lastName" value={formData.lastName} onChange={handleChange} required />
                <Campo label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol</label>
                  <select name="role" value={formData.role} onChange={handleChange} required className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary">
                    <option value="CALLCENTER">Callcenter</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                    <Btn type="submit" loading={loading} Icon={UserPlusIcon}>Guardar Cambios</Btn>
                </div>
            </form>
        </Modal>
    );
};