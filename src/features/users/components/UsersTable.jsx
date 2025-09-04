import React from 'react';
import { KeyIcon, PencilSquareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftEllipsisIcon, ComputerDesktopIcon } from '@heroicons/react/20/solid';

const getRoleStyles = (role) => {
    switch (role) {
        case "ADMIN": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
        case "SUPERVISOR": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300";
        case "CALLCENTER": return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300";
    }
};

const ActionButton = (props) => (
    <button {...props} className="p-2 text-slate-500 hover:text-brand-primary dark:hover:text-brand-accent rounded-full hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"/>
);

export const UsersTable = ({ usuarios, onEdit, onEditPassword, onEditPermissions }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-700">
                <thead className="bg-slate-100 dark:bg-dark-700/60">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Rol</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Permisos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-slate-200 dark:divide-dark-700">
                    {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/70 transition-colors duration-100">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base font-semibold ${u.role === 'ADMIN' ? 'bg-brand-primary' : u.role === 'SUPERVISOR' ? 'bg-brand-secondary' : 'bg-brand-accent'}`}>
                                        {u.firstName?.charAt(0).toUpperCase()}{u.lastName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.firstName} {u.lastName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">@{u.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getRoleStyles(u.role)}`}>
                                    <ShieldCheckIcon className="h-4 w-4 mr-1.5 opacity-90" />
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-3">
                                    <span title="Acceso IVRS" className={u.canAccessIvrs ? 'text-green-500' : 'text-slate-400'}><ComputerDesktopIcon className="h-5 w-5"/></span>
                                    <span title="Acceso WhatsApp" className={u.canAccessWhatsapp ? 'text-blue-500' : 'text-slate-400'}><ChatBubbleLeftEllipsisIcon className="h-5 w-5"/></span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-1">
                                    <ActionButton onClick={() => onEdit(u)} title="Editar Usuario"><PencilSquareIcon className="h-5 w-5"/></ActionButton>
                                    <ActionButton onClick={() => onEditPermissions(u)} title="Editar Permisos"><ShieldCheckIcon className="h-5 w-5"/></ActionButton>
                                    <ActionButton onClick={() => onEditPassword(u)} title="Cambiar Contraseña"><KeyIcon className="h-5 w-5"/></ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};