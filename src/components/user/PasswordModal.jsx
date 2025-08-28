import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { updatePasswordAPI } from '../../services/api';
import { Modal, Campo, Btn } from './CommonUI';
import { KeyIcon } from '@heroicons/react/24/outline';

export const PasswordModal = ({ show, onClose, user }) => {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            return toast.warn("La contraseña debe tener al menos 6 caracteres.");
        }
        setLoading(true);
        try {
            await updatePasswordAPI(user.id, newPassword);
            toast.success(`Contraseña de ${user.username} actualizada.`);
            onClose();
        } catch (error) {
            toast.error("Error al cambiar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={`Cambiar Contraseña de ${user?.username}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Campo label="Nueva Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <div className="flex justify-end pt-4">
                    <Btn type="submit" loading={loading} Icon={KeyIcon}>Actualizar Contraseña</Btn>
                </div>
            </form>
        </Modal>
    );
};