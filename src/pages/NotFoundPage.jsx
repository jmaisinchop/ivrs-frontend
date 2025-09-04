import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-dark-900 p-6 text-center">
      <ExclamationTriangleIcon className="h-20 w-20 text-yellow-500 dark:text-yellow-400" />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-5xl">
        Error 404
      </h1>
      <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>
      <div className="mt-10">
        <Link
          to="/"
          className="rounded-md bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;