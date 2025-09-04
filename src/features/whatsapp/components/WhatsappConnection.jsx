import React from 'react';
import QRCode from "react-qr-code";
import { LinkIcon, QrCodeIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const WhatsappConnection = ({ status, qrCode, onConnect, loading, isStuck, onForceSync }) => {
    const renderContent = () => {
        if (isStuck) {
            return (
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">La conexión está tardando.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Puedes esperar o forzar la sincronización.</p>
                    <button onClick={onForceSync} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Forzar Sincronización
                    </button>
                </div>
            );
        }

        switch (status) {
            case 'loading':
                return (
                    <div className="text-center">
                        <ArrowPathIcon className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Verificando sesión...</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Intentando reconectar automáticamente.</p>
                    </div>
                );
            case 'disconnected':
                return (
                    <>
                        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-center text-slate-500 dark:text-slate-400 mb-4">Tu cuenta de WhatsApp no está conectada.</p>
                        <button onClick={onConnect} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors">
                            <LinkIcon className="h-5 w-5 mr-2" />
                            Conectar WhatsApp
                        </button>
                    </>
                );
            case 'waiting-qr':
                return (
                    <div className="text-center">
                        <QrCodeIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                        <p className="mb-4 font-medium text-slate-700 dark:text-slate-200">Escanea este código desde tu teléfono</p>
                        <div className="p-4 bg-white inline-block rounded-lg shadow-md">
                            {qrCode ? <QRCode value={qrCode} size={220} /> : <p>Generando QR...</p>}
                        </div>
                    </div>
                );
            case 'connected':
                return (
                    <>
                        <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-center font-semibold text-green-700 dark:text-green-400">¡Conectado!</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ya puedes enviar mensajes y campañas.</p>
                    </>
                );
            default:
                return <p className="text-slate-500 dark:text-slate-400">Estado desconocido.</p>;
        }
    };

    return (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Estado de Conexión</h2>
            <div className="flex items-center justify-center min-h-[300px]">
                {renderContent()}
            </div>
        </div>
    );
};