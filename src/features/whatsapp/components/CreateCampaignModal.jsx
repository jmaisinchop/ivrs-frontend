import React, { useState, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { DocumentIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/solid';

const WhatsappPreview = ({ message, attachment }) => (
    <div className="flex flex-col h-full bg-gray-200 dark:bg-gray-900 rounded-lg p-4 bg-cover" style={{ backgroundImage: "url('/whatsapp_bg.png')" }}>
        <div className="mt-auto max-w-sm ml-auto w-full">
            <div className="bg-green-100 dark:bg-green-800 rounded-lg p-2 shadow-md relative break-words" style={{ borderTopRightRadius: '0px' }}>
                {attachment && (
                    <div className="bg-gray-300 dark:bg-gray-700 h-32 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                        {attachment.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(attachment)} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <DocumentIcon className="h-16 w-16 text-gray-500" />
                        )}
                    </div>
                )}
                <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap">{message || "Tu mensaje aparecerá aquí..."}</p>
                <span className="text-xs text-gray-500 dark:text-gray-400 block text-right mt-1">10:30 AM</span>
            </div>
        </div>
    </div>
);


const CreateCampaignModal = ({ isOpen, onClose, onCampaignCreated }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [contactsFile, setContactsFile] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);

    const onDropContacts = useCallback(acceptedFiles => {
        setContactsFile(acceptedFiles[0]);
        toast.success(`Archivo seleccionado: ${acceptedFiles[0].name}`);
    }, []);

    const { getRootProps: getContactsRootProps, getInputProps: getContactsInputProps, isDragActive } = useDropzone({
        onDrop: onDropContacts,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1
    });

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
        }
    };

    const clearForm = () => {
        setName('');
        setMessage('');
        setAttachment(null);
        setContactsFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !message || !contactsFile) {
            toast.error("Nombre, mensaje y archivo de contactos son obligatorios.");
            return;
        }
        setSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('messageBody', message);
        formData.append('contactsFile', contactsFile);
        formData.append('sendDate', new Date().toISOString());
        
        try {
            await api.post('/whatsapp-campaigns/create-with-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Campaña creada con éxito. Iníciala desde el panel.");
            clearForm();
            onCampaignCreated();
            onClose();
        } catch (error) {
            console.error("Error al crear campaña:", error);
            toast.error(error.response?.data?.message || "Error al crear la campaña.");
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                </Transition.Child>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
                            <Dialog.Title as="h3" className="text-2xl font-bold text-gray-800 dark:text-white flex justify-between items-center">
                                Crear Nueva Campaña de WhatsApp
                                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700">
                                    <XMarkIcon className="h-5 w-5"/>
                                </button>
                            </Dialog.Title>
                            
                            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Campaña</label>
                                        <input id="campaign-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
                                    </div>
                                    <div>
                                        <label htmlFor="campaign-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensaje</label>
                                        <textarea id="campaign-message" value={message} onChange={e => setMessage(e.target.value)} rows="5" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adjuntar Archivo (Opcional)</label>
                                        <div className="mt-1 flex items-center">
                                            <label htmlFor="attachment-file" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <PaperClipIcon className="h-5 w-5 inline-block mr-2"/>
                                                <span>Seleccionar imagen/documento</span>
                                                <input id="attachment-file" type="file" onChange={handleAttachmentChange} className="sr-only" />
                                            </label>
                                            {attachment && <span className="ml-3 text-sm text-gray-500">{attachment.name}</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Archivo de Contactos (Excel)</label>
                                        <div {...getContactsRootProps()} className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer ${isDragActive ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                            <div className="space-y-1 text-center">
                                                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                    <p className="pl-1">{contactsFile ? contactsFile.name : 'Arrastra un archivo o haz clic'}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">XLSX, XLS. Col A: Teléfono, Col B: Nombre</p>
                                            </div>
                                            <input {...getContactsInputProps()} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Previsualización</label>
                                    <div className="mt-1 flex-grow">
                                        <WhatsappPreview message={message} attachment={attachment} />
                                    </div>
                                </div>
                                
                                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                        {isSubmitting ? 'Creando...' : 'Crear Campaña'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CreateCampaignModal;