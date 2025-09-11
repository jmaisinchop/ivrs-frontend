import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createUserAPI } from '../../../services/api';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import ToggleSwitch from '../../../components/common/ToggleSwitch';
import { UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export const CreateUserModal = ({ show, onClose, onUserCreated }) => {
    const [formulario, setFormulario] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "CALLCENTER",
        canAccessIvrs: true,
        canAccessWhatsapp: true,
        extension: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (permission) => {
        setFormulario(prev => ({ ...prev, [permission]: !prev[permission] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (lógica de validación sin cambios)
        if (formulario.password.length < 6) {
            return toast.warn("La contraseña debe tener al menos 6 caracteres.");
        }

        setLoading(true);
        try {
            const { data: newUser } = await createUserAPI(formulario);
            toast.success(`Usuario "${newUser.username}" creado exitosamente.`);
            onUserCreated(newUser);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al crear el usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title="Crear Nuevo Usuario">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Nombre(s)*" name="firstName" value={formulario.firstName} onChange={handleChange} required />
                    <InputField label="Apellido(s)*" name="lastName" value={formulario.lastName} onChange={handleChange} required />
                </div>
                <InputField label="Nombre de Usuario*" name="username" value={formulario.username} onChange={handleChange} required />
                <InputField label="Correo Electrónico*" name="email" type="email" value={formulario.email} onChange={handleChange} required />
                <InputField label="Extensión / Teléfono" name="extension" value={formulario.extension} onChange={handleChange} placeholder="Ej: 101 o 0991234567" />
                <InputField
                    label="Contraseña*"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formulario.password}
                    onChange={handleChange}
                    required
                    Icon={showPassword ? EyeSlashIcon : EyeIcon}
                    onIconClick={() => setShowPassword(!showPassword)}
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rol*</label>
                    <select name="role" value={formulario.role} onChange={handleChange} required className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary">
                        <option value="CALLCENTER">Callcenter</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <label className="font-medium text-slate-700 dark:text-slate-300">Acceso IVRS / Campañas</label>
                        <ToggleSwitch checked={formulario.canAccessIvrs} onChange={() => handleToggle('canAccessIvrs')} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <label className="font-medium text-slate-700 dark:text-slate-300">Acceso WhatsApp</label>
                        <ToggleSwitch checked={formulario.canAccessWhatsapp} onChange={() => handleToggle('canAccessWhatsapp')} />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" loading={loading} Icon={UserPlusIcon}>Crear Usuario</Button>
                </div>
            </form>
        </Modal>
    );
};