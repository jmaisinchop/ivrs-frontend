import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// --- Componente de Modal Genérico ---
export const Modal = ({ show, onClose, title, children }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-dark-700"
        >
          <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700 dark:hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Componente de Interruptor (ToggleSwitch) ---
export const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange} disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary 
                 focus:ring-offset-2 dark:focus:ring-offset-dark-800 disabled:cursor-not-allowed disabled:opacity-50
                 ${checked ? 'bg-brand-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                   transition duration-200 ease-in-out
                   ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
);

// --- Componente de Campo de Formulario ---
export const Campo = ({ label, name, value, onChange, required = false, type = "text", Icon, onIconClick, placeholder }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <input id={name} type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder || label.replace("*", "").trim()}
          className={`w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 
                     focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent 
                     transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500
                     ${Icon ? 'pr-10' : ''} `} />
        {Icon && (<button type="button" onClick={onIconClick} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-brand-secondary dark:hover:text-brand-accent focus:outline-none z-10"><Icon className="h-5 w-5" /></button>)}
      </div>
    </div>
  );

// --- Componente de Botón Principal ---
export const Btn = ({ children, Icon, loading, ...props}) => (
    <button {...props} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow-md hover:bg-brand-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin"/>
        ) : (
            Icon && <Icon className="h-5 w-5"/>
        )}
        {children}
    </button>
);