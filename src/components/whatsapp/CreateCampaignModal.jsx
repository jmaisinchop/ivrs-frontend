import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DatePicker, { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import { createWhatsappCampaignAPI } from '../../services/api';
import { Modal, Campo, Btn } from './CommonUI';
import { CalendarIcon, CheckIcon } from '@heroicons/react/24/outline';

registerLocale('es', es);

export const CreateCampaignModal = ({ show, onClose, onCampaignCreated }) => {
    const [name, setName] = useState('');
    const [sendDate, setSendDate] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !sendDate) {
            return toast.warn("Por favor, complete el nombre y la fecha de envío.");
        }
        setLoading(true);
        try {
            const { data: newCampaign } = await createWhatsappCampaignAPI({ name, sendDate });
            toast.success(`Campaña "${name}" creada exitosamente.`);
            onCampaignCreated(newCampaign);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al crear la campaña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title="Crear Nueva Campaña de WhatsApp">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Campo label="Nombre de la Campaña*" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha y Hora de Envío*</label>
                    <DatePicker
                        selected={sendDate}
                        onChange={(date) => setSendDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-brand-primary"
                        placeholderText="Seleccione una fecha y hora"
                        minDate={new Date()}
                        locale="es"
                        popperClassName={document.documentElement.classList.contains('dark') ? "react-datepicker-dark" : ""}
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <Btn type="submit" loading={loading} Icon={CheckIcon}>Crear Campaña</Btn>
                </div>
            </form>
        </Modal>
    );
};