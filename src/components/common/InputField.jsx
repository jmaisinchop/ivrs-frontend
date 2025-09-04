import React from 'react';

const InputField = ({ label, name, value, onChange, required = false, type = "text", Icon, onIconClick, placeholder }) => (
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

export default InputField;