import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export const WhatsappSender = ({ message, setMessage, numbers, setNumbers, onSend, loading, isConnected }) => {
    return (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-700 dark:text-slate-200">
                <PaperAirplaneIcon className="h-6 w-6 mr-2 text-brand-primary dark:text-brand-accent" />
                Envío Rápido
            </h2>
            <form onSubmit={onSend}>
                <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-slate-600 dark:text-slate-300">Mensaje:</label>
                    <textarea
                        id="message" value={message} onChange={(e) => setMessage(e.target.value)}
                        rows="5"
                        className="w-full p-3 border rounded-lg text-sm bg-slate-50 dark:bg-dark-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none transition"
                        placeholder="Escribe tu mensaje aquí..."
                        disabled={!isConnected || loading}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="numbers" className="block text-sm font-medium mb-1.5 text-slate-600 dark:text-slate-300">Números (uno por línea):</label>
                    <textarea
                        id="numbers" value={numbers} onChange={(e) => setNumbers(e.target.value)}
                        rows="5"
                        className="w-full p-3 border rounded-lg text-sm bg-slate-50 dark:bg-dark-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none transition"
                        placeholder="593991234567&#10;593987654321"
                        disabled={!isConnected || loading}
                    />
                </div>
                <button type="submit" disabled={loading || !isConnected} className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors">
                    {loading ? 'Enviando...' : 'Enviar Mensajes'}
                </button>
            </form>
        </div>
    );
};