import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import { motion } from 'framer-motion';
import { addWhatsappContactsAPI } from '../../services/api';
import { Modal, Btn } from './CommonUI';
import { ArrowUpTrayIcon, CheckIcon, VariableIcon, EyeIcon } from '@heroicons/react/24/outline';

const DraggableVariable = ({ variable, onDragStart }) => (
    <div
      draggable
      onDragStart={onDragStart}
      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 mr-2 mb-2 cursor-move hover:shadow-md hover:-translate-y-px transition-all"
    >
      <VariableIcon className="h-4 w-4 mr-1.5" />
      {`{{${variable}}}`}
    </div>
);

export const ManageContactsModal = ({ show, onClose, campaign, onCampaignUpdated }) => {
    const [contacts, setContacts] = useState([]);
    const [columns, setColumns] = useState([]);
    const [mapping, setMapping] = useState({ phone: '', name: '', identification: '' });
    const [message, setMessage] = useState('Hola {{nombre}}, ');
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef();
    const textareaRef = useRef();

    useEffect(() => {
        if (!show) {
            setTimeout(() => {
                setContacts([]);
                setColumns([]);
                setMapping({ phone: '', name: '', identification: '' });
                setMessage('Hola {{nombre}}, ');
                setFileName("");
            }, 200);
        }
    }, [show]);

    const processFile = (file) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
                
                if (json.length === 0) return toast.warn("El archivo no contiene filas de datos.");
                if (json.length > 600) return toast.error(`El archivo tiene ${json.length} filas. El máximo permitido es 600.`);
                
                setContacts(json);
                const cols = Object.keys(json[0]);
                setColumns(cols);
                
                setMapping({
                    phone: cols.find(c => /telefono|phone|celular/i.test(c)) || "",
                    name: cols.find(c => /nombre|name|cliente/i.test(c)) || "",
                    identification: cols.find(c => /cedula|cédula|identificaci/i.test(c)) || ""
                });
                toast.success(`${json.length} contactos cargados.`);
            } catch {
                toast.error("Error al procesar el archivo Excel.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileSelect = (e) => e.target.files[0] && processFile(e.target.files[0]);
    const handleDragStart = (e, variable) => e.dataTransfer.setData("text/plain", `{{${variable}}}`);
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const variable = e.dataTransfer.getData("text/plain");
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = `${textarea.value.substring(0, start)}${variable}${textarea.value.substring(end)}`;
        setMessage(newText);
        textarea.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mapping.phone) return toast.warn("Debes seleccionar la columna de Teléfono.");
        setLoading(true);
        const mappedContacts = contacts.map(row => {
            let personalizedMessage = message;
            columns.forEach(col => {
                personalizedMessage = personalizedMessage.replace(new RegExp(`{{${col}}}`, 'gi'), String(row[col] || ''));
            });
            return {
                phone: String(row[mapping.phone] || ''),
                name: mapping.name ? String(row[mapping.name] || '') : '',
                identification: mapping.identification ? String(row[mapping.identification] || '') : '',
                message: personalizedMessage,
            };
        }).filter(c => c.phone);

        try {
            await addWhatsappContactsAPI(campaign.id, mappedContacts);
            toast.success(`${mappedContacts.length} contactos guardados.`);
            onCampaignUpdated();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al guardar contactos.");
        } finally {
            setLoading(false);
        }
    };
    
    const previewContacts = useMemo(() => {
        if (contacts.length === 0) return [];
        return contacts.slice(0, 3).map(row => {
            let personalizedMessage = message;
            columns.forEach(col => {
                personalizedMessage = personalizedMessage.replace(new RegExp(`{{${col}}}`, 'gi'), String(row[col] || ''));
            });
            return {
                phone: String(row[mapping.phone] || ''),
                name: mapping.name ? String(row[mapping.name] || '') : 'N/A',
                message: personalizedMessage,
            };
        });
    }, [contacts, columns, mapping, message]);

    return (
        <Modal show={show} onClose={onClose} title={`Gestionar Contactos de: ${campaign?.name}`}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div 
                    onClick={() => fileInputRef.current.click()} 
                    className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-brand-primary dark:hover:border-brand-accent transition-all bg-slate-50 dark:bg-dark-700/50"
                >
                    <ArrowUpTrayIcon className="h-8 w-8 mx-auto text-slate-400" />
                    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{fileName || "Seleccionar archivo Excel"}</p>
                    <p className="text-xs text-slate-500">O arrastra y suelta aquí (máx. 600 filas)</p>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                </div>

                {contacts.length > 0 && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-3">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">1. Asigna tus Columnas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-dark-700/50">
                                <div>
                                    <label className="block text-xs font-medium">Teléfono*</label>
                                    <select value={mapping.phone} onChange={e => setMapping(m => ({ ...m, phone: e.target.value }))} className="w-full mt-1 p-2 text-sm border rounded-md dark:bg-dark-700 dark:border-dark-600">
                                        <option value="">Seleccionar</option>
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium">Nombre</label>
                                    <select value={mapping.name} onChange={e => setMapping(m => ({ ...m, name: e.target.value }))} className="w-full mt-1 p-2 text-sm border rounded-md dark:bg-dark-700 dark:border-dark-600">
                                        <option value="">Seleccionar</option>
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium">Cédula</label>
                                    <select value={mapping.identification} onChange={e => setMapping(m => ({ ...m, identification: e.target.value }))} className="w-full mt-1 p-2 text-sm border rounded-md dark:bg-dark-700 dark:border-dark-600">
                                        <option value="">Seleccionar</option>
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">2. Redacta tu Mensaje</h3>
                            <div className="p-2 bg-slate-50 dark:bg-dark-700/50 rounded-lg border dark:border-dark-600">
                                {columns.map(col => (
                                    <DraggableVariable key={col} variable={col} onDragStart={(e) => handleDragStart(e, col)} />
                                ))}
                            </div>
                            <textarea 
                                ref={textareaRef}
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => setIsDraggingOver(true)}
                                onDragLeave={() => setIsDraggingOver(false)}
                                rows="2"
                                className={`w-full mt-2 p-2 text-sm border rounded-lg transition-all dark:bg-dark-700 dark:border-dark-600 focus:ring-2 focus:ring-brand-primary ${isDraggingOver ? 'ring-2 ring-brand-primary' : ''}`} 
                            />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center"><EyeIcon className="h-4 w-4 mr-2"/>3. Previsualiza</h3>
                            <div className="max-h-32 overflow-y-auto rounded-lg border dark:border-dark-600">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50 dark:bg-dark-700/50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Nombre</th>
                                            <th className="p-2 text-left font-medium">Teléfono</th>
                                            <th className="p-2 text-left font-medium">Mensaje Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-dark-600">
                                        {previewContacts.map((contact, index) => (
                                            <tr key={index}>
                                                <td className="p-2 align-top">{contact.name}</td>
                                                <td className="p-2 align-top font-mono">{contact.phone}</td>
                                                <td className="p-2 align-top text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{contact.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                <div className="flex justify-end pt-3 border-t dark:border-dark-600">
                    <Btn type="submit" loading={loading} Icon={CheckIcon} disabled={contacts.length === 0}>
                        Añadir {contacts.length > 0 ? contacts.length : ''} Contactos
                    </Btn>
                </div>
            </form>
        </Modal>
    );
};