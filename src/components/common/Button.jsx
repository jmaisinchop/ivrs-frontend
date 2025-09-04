import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Button = ({ children, Icon, loading, ...props }) => (
    <button {...props} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg shadow-md hover:bg-brand-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin"/>
        ) : (
            Icon && <Icon className="h-5 w-5"/>
        )}
        {children}
    </button>
);

export default Button;