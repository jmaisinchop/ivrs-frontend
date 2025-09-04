import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext"; // <-- RUTA ACTUALIZADA
import { motion } from "framer-motion";

// Iconos SVG (puedes moverlos a un archivo common/Icons.jsx si los reutilizas mucho)
const UserIcon = ({ className }) => ( <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> </svg> );
const LockIcon = ({ className }) => ( <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> </svg> );
const EyeOpenIcon = ({ className }) => ( <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg> );
const EyeClosedIcon = ({ className }) => ( <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> </svg> );
const CheckCircleIcon = ({ className }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> </svg> );
const LoginIcon = ({ className }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /> </svg> );


const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;

    setIsLoading(true);
    try {
      await login(form.username, form.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-inter antialiased bg-slate-100 dark:bg-dark-900 text-slate-900 dark:text-slate-200">
      
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-primary to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="subtle-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.5" className="fill-white/50" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#subtle-dots)" />
          </svg>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="text-center z-10 max-w-md xl:max-w-lg"
        >
          <div className="flex justify-center mb-8">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 100 }}
              src="/fin.png"
              alt="Finsolred Logo"
              className="h-24 xl:h-28 object-contain"
            />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            Bienvenido al <span className="font-normal text-brand-accent">SISTEMA DE IVRS</span>
          </h1>
          <p className="text-lg xl:text-xl text-white/80 mb-10 leading-relaxed">
            Sistema de llamadas automatizadas para una comunicación eficiente y moderna.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
            className="bg-white/10 dark:bg-black/15 rounded-xl p-6 backdrop-blur-md shadow-xl border border-white/10"
          >
            <h2 className="text-white font-semibold text-lg mb-4">Novedades del sistema</h2>
            <ul className="text-white/75 text-sm space-y-2.5">
              {[
                "Plataforma de marcación predictiva optimizada.",
                "Dashboard analítico con nuevas métricas.",
                "Seguridad reforzada con encriptación de datos."
              ].map((item, index) => (
                <li className="flex items-start" key={index}>
                  <CheckCircleIcon className="w-5 h-5 mt-0.5 mr-2.5 flex-shrink-0 text-green-400 dark:text-green-300" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-dark-800 rounded-xl shadow-xl 
                     border border-slate-200 dark:border-dark-700"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5 lg:hidden">
              <img
                src="/fin.png"
                alt="Finsolred IVRS Logo"
                className="h-12 object-contain"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Accede a tu cuenta para continuar.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username" name="username" type="text" required
                  value={form.username} onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border text-sm transition-all duration-200 ease-in-out
                              bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 
                              text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                              focus:ring-2 focus:ring-offset-1 focus:outline-none 
                              focus:ring-brand-primary dark:focus:ring-brand-accent 
                              focus:border-brand-primary dark:focus:border-brand-accent`}
                  placeholder="tu.usuario@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium mb-1.5 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <LockIcon className="h-5 w-5" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} required
                  value={form.password} onChange={handleChange}
                  className={`w-full pl-11 pr-10 py-3 rounded-lg border text-sm transition-all duration-200 ease-in-out
                              bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 
                              text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                              focus:ring-2 focus:ring-offset-1 focus:outline-none
                              focus:ring-brand-primary dark:focus:ring-brand-accent
                              focus:border-brand-primary dark:focus:border-brand-accent`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sm leading-5 text-slate-400 dark:text-slate-500 
                             hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? ( <EyeOpenIcon className="h-5 w-5" /> ) : ( <EyeClosedIcon className="h-5 w-5" /> )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me" name="remember-me" type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-500 text-brand-primary focus:ring-brand-primary 
                             dark:bg-slate-700 dark:checked:bg-brand-accent dark:focus:ring-brand-accent dark:focus:ring-offset-dark-800 focus:ring-offset-1 transition duration-150"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-600 dark:text-slate-400">
                  Recordar sesión
                </label>
              </div>

              <div>
                <a href="#" className="font-medium transition duration-150 hover:underline
                                     text-brand-primary hover:text-brand-secondary 
                                     dark:text-brand-accent dark:hover:text-brand-primary">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1, boxShadow: isLoading ? 'none' : `0 8px 15px -3px var(--color-brand-primary-shadow)` }}
                whileTap={{ scale: isLoading ? 1 : 0.98, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md 
                            text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                            dark:focus:ring-offset-dark-800
                            ${isLoading ? 'bg-opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'}
                            bg-gradient-to-r from-brand-primary to-brand-secondary focus:ring-brand-secondary dark:focus:ring-brand-accent`}
                style={{ '--color-brand-primary-shadow': 'rgba(var(--color-brand-primary-rgb, 5, 79, 120), 0.25)' }}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LoginIcon className="w-5 h-5 mr-2"/>
                    Acceder al sistema
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 pt-6 text-center border-t border-slate-200 dark:border-dark-600">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿Necesitas una cuenta?{' '}
              <a href="#" className="font-medium transition duration-150 hover:underline
                                   text-brand-primary hover:text-brand-secondary 
                                   dark:text-brand-accent dark:hover:text-brand-primary">
                Contacta al administrador
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;