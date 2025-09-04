import React from 'react';

const ToggleSwitch = ({ checked, onChange, disabled }) => (
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

export default ToggleSwitch;