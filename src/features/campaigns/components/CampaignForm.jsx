import React from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from '../../../contexts/ThemeContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

registerLocale('es', es);

const CampaignForm = ({ formData, errors, loading, onInputChange, onDateChange, onSubmit, onCancel, formMode }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const baseInputClasses = "w-full p-3 rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 dark:focus:ring-offset-dark-800 focus:ring-offset-2";
  const getInputDynamicClasses = (hasError) => {
    const errorStateClasses = "border-red-500 dark:border-red-400 ring-1 ring-red-500 dark:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/50 dark:focus:ring-red-400/50";
    const normalStateClasses = isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:border-brand-accent focus:ring-brand-accent/50" : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:ring-brand-primary/50";
    return hasError ? errorStateClasses : normalStateClasses;
  };

  return (
    <form onSubmit={onSubmit} className={`p-6 border-t ${isDarkMode ? 'border-dark-700' : 'border-slate-200'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="campaignName" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Nombre de la Campaña <span className={`text-red-500 ${isDarkMode ? 'dark:text-red-400' : ''} ml-0.5`}>*</span>
          </label>
          <input id="campaignName" name="name" value={formData.name} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.name)}`} placeholder="Ej: Promoción Verano 2024" />
          {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="campaignMessage" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mensaje (opcional)</label>
          <input id="campaignMessage" name="message" value={formData.message} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.message)}`} placeholder="Mensaje que se reproducirá en la llamada" />
          {errors.message && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="startDate" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5" />Fecha de Inicio<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <DatePicker id="startDate" selected={formData.startDate} onChange={(date) => onDateChange(date, "startDate")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" className={`${baseInputClasses} ${getInputDynamicClasses(errors.startDate)}`} placeholderText="DD/MM/AAAA HH:mm" popperClassName={isDarkMode ? "react-datepicker-dark" : ""} minDate={new Date()} locale="es" wrapperClassName="w-full" />
          {errors.startDate && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5" />Fecha de Fin<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <DatePicker id="endDate" selected={formData.endDate} onChange={(date) => onDateChange(date, "endDate")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" className={`${baseInputClasses} ${getInputDynamicClasses(errors.endDate)}`} placeholderText="DD/MM/AAAA HH:mm" popperClassName={isDarkMode ? "react-datepicker-dark" : ""} minDate={formData.startDate || new Date()} locale="es" wrapperClassName="w-full" />
          {errors.endDate && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="concurrentCalls" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5" />Llamadas Concurrentes<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <input id="concurrentCalls" type="number" name="concurrentCalls" min="1" max="50" value={formData.concurrentCalls} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.concurrentCalls)}`} placeholder="Ej: 10" />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Máx. 50.</p>
          {errors.concurrentCalls && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.concurrentCalls}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="maxRetries" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><InformationCircleIcon className="h-4 w-4 mr-1.5" />Intentos Máximos<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <input id="maxRetries" type="number" name="maxRetries" min="0" max="10" value={formData.maxRetries} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.maxRetries)}`} placeholder="Ej: 3" />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reintentos por contacto (0-10).</p>
          {errors.maxRetries && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.maxRetries}</p>}
        </div>

        <div className="md:col-span-2 flex items-center justify-start pt-5 md:pt-0">
          <label htmlFor="retryOnAnswer" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="retryOnAnswer" 
                type="checkbox" 
                name="retryOnAnswer"
                checked={formData.retryOnAnswer} 
                onChange={onInputChange} 
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${formData.retryOnAnswer ? 'bg-brand-primary' : (isDarkMode ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.retryOnAnswer ? 'translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm">
              <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Reintento Inmediato
              </span>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Vuelve a llamar al instante si no contestan.
              </p>
            </div>
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 focus:ring-slate-500 focus:ring-offset-dark-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-brand-primary focus:ring-offset-white'}`}>Cancelar</button>
        <button type="submit" disabled={loading} className={`bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-brand-accent focus:ring-offset-dark-800' : 'focus:ring-brand-primary focus:ring-offset-white'}`}>
          {loading ? ( <><ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />Procesando...</> ) : (
            <>
              {formMode === 'edit' && <PencilSquareIcon className="h-5 w-5 mr-2" />}
              {formMode === 'duplicate' && <DocumentDuplicateIcon className="h-5 w-5 mr-2" />}
              {formMode === 'create' && <PlusCircleIcon className="h-5 w-5 mr-2" />}
              {formMode === 'edit' ? "Guardar Cambios" : formMode === 'duplicate' ? 'Crear Duplicado' : "Programar Campaña"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;