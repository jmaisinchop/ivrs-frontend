import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  addContactsAPI,
  getPadresNivelesAPI,
  getContactosPorNivelAPI,
} from "../../../services/api";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

const DraggableVariable = ({ variable, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, variable)}
    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium 
               bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 
               dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-300
               border border-indigo-200/50 dark:border-indigo-500/30 
               shadow-xs mr-2 mb-2 cursor-move 
               hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 
               transition-all hover:shadow-sm hover:-translate-y-0.5"
  >
    <ArrowsPointingOutIcon className="h-3.5 w-3.5 mr-1.5 opacity-70" />
    {variable}
  </div>
);

const ContactsModal = ({ campaignId, onClose }) => {
  const [contacts, setContacts] = useState([
    { name: "", phone: "", message: "", identification: "" },
  ]);
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({
    phone: "",
    name: "",
    identification: "",
    message: "Hola {{nombre}}, tu mensaje es: {{mensaje}}",
  });
  const [fileName, setFileName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedVariable, setDraggedVariable] = useState(null);
  const fileInputRef = useRef();
  const [rawPadres, setRawPadres] = useState([]);
  const uniquePadres = [...new Set(rawPadres.map((p) => p.padre))].sort();
  const [selectedPadre, setSelectedPadre] = useState("");
  const [nivelesDisponibles, setNivelesDisponibles] = useState([]);
  const [nivelesSeleccionados, setNivelesSeleccionados] = useState(new Set());
  const [apiContacts, setApiContacts] = useState([]);
  const [apiCols, setApiCols] = useState([]);
  const [apiMapping, setApiMapping] = useState({
    phone: "",
    name: "",
    identification: "",
    message: "Hola {{nombre}}",
  });
  const [apiShowPreview, setApiShowPreview] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);

  useEffect(() => {
    if (activeTab === "finsolred" && rawPadres.length === 0) {
      getPadresNivelesAPI()
        .then((r) => setRawPadres(r.data))
        .catch(() => toast.error("No se pudo cargar datos de Finsolred"));
    }
  }, [activeTab, rawPadres.length]);

  const handleChange = (idx, e) => {
    const { name, value } = e.target;
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [name]: value } : c))
    );
  };
  const addRow = () =>
    setContacts((prev) => [...prev, { name: "", phone: "", message: "", identification: "" }]);
  const removeRow = (idx) =>
    setContacts((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );

  const processExcelFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
        const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          defval: "",
        });
        if (!json.length) {
          toast.warning("El archivo no contiene datos");
          return;
        }
        setExcelData(json);
        const cols = Object.keys(json[0]);
        setColumns(cols);
        setMapping((m) => ({
          ...m,
          phone:
            cols.find((c) =>
              /telefono|phone|celular|contacto|tel[eé]fono/i.test(c)
            ) || "",
          name: cols.find((c) => /nombre|name|cliente|persona/i.test(c)) || "",
          identification: cols.find((c) => /identificaci[oó]n|c[eé]dula|ruc|id/i.test(c)) || "",
        }));
        toast.success(`${json.length} registros encontrados`);
      } catch {
        toast.error("Error al procesar el archivo");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    e.dataTransfer.files[0] && processExcelFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) =>
    e.target.files[0] && processExcelFile(e.target.files[0]);
  const handleDragStart = (e, v) => {
    setDraggedVariable(v);
    e.dataTransfer.setData("text/plain", v);
  };
  const handleDragOverInput = (e) => e.preventDefault();
  const handleDropExcel = (e) => {
    e.preventDefault();
    if (!draggedVariable) return;
    const { selectionStart: s, selectionEnd: ePos, value } = e.target;
    const nuevo = `${value.slice(0, s)}{{${draggedVariable}}}${value.slice(
      ePos
    )}`;
    setMapping((m) => ({ ...m, message: nuevo }));
    setDraggedVariable(null);
  };
  const generateContactsFromExcel = () =>
    !mapping.phone
      ? []
      : excelData
        .map((row) => {
          let msg = mapping.message;
          Object.keys(row).forEach((k) => {
            msg = msg.replace(new RegExp(`{{${k}}}`, "gi"), String(row[k]));
          });
          return {
            name: mapping.name ? String(row[mapping.name]) : "Sin nombre",
            phone: String(row[mapping.phone]),
            identification: mapping.identification
              ? String(row[mapping.identification])
              : "",
            message: msg,
          };
        })
        .filter((c) => c.phone && c.phone.trim());

  const handlePadreChange = (padre) => {
    setSelectedPadre(padre);
    const niveles = rawPadres
      .filter((r) => r.padre === padre)
      .flatMap((r) =>
        r.niveles_concatenados
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
      );
    setNivelesDisponibles([...new Set(niveles)].sort());
    setNivelesSeleccionados(new Set());
    setApiContacts([]);
    setApiCols([]);
    setApiShowPreview(false);
  };
  const toggleNivel = (nivel) => {
    setNivelesSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(nivel) ? next.delete(nivel) : next.add(nivel);
      return next;
    });
  };
  const fetchContacts = async () => {
    if (!nivelesSeleccionados.size) {
      toast.warning("Selecciona al menos una cartera");
      return;
    }
    const nivelesCsv = [...nivelesSeleccionados].join(", ");
    const ref = rawPadres.find(
      (r) =>
        r.padre === selectedPadre &&
        nivelesSeleccionados.has(
          r.niveles_concatenados.split(",")[0].trim()
        )
    );
    const esPropia = ref ? ref.es_propia : false;
    try {
      setLoadingApi(true);
      const { data } = await getContactosPorNivelAPI(nivelesCsv, esPropia);
      if (!data.length) {
        toast.info("Sin contactos para las carteras seleccionadas.");
        setApiContacts([]);
        setApiCols([]);
        return;
      }
      setApiContacts(data);
      const cols = Object.keys(data[0]);
      setApiCols(cols);
      setApiMapping((m) => ({
        ...m,
        phone:
          cols.find((c) =>
            /telefono|phone|celular|contacto|tel[eé]fono/i.test(c)
          ) || cols[0] || "",
        name: cols.find((c) => /nombre|name|cliente|persona/i.test(c)) || "",
        identification: cols.find((c) => /identificaci[oó]n|c[eé]dula|ruc|id/i.test(c)) || "",
      }));
      toast.success(`${data.length} contacto(s) encontrados`);
    } catch {
      toast.error("Error al consultar los contactos desde Finsolred");
      setApiContacts([]);
      setApiCols([]);
    } finally {
      setLoadingApi(false);
    }
  };
  const handleDropFinsolred = (e) => {
    e.preventDefault();
    if (!draggedVariable) return;
    const { selectionStart: s, selectionEnd: ePos, value } = e.target;
    const nuevo = `${value.slice(0, s)}{{${draggedVariable}}}${value.slice(
      ePos
    )}`;
    setApiMapping((m) => ({ ...m, message: nuevo }));
    setDraggedVariable(null);
  };
  const saveContactsFromApi = async () => {
    if (!apiContacts.length) {
      toast.warning("Obtén los contactos primero");
      return;
    }
    if (!apiMapping.phone) {
      toast.warning("Selecciona el campo teléfono de la lista de Finsolred");
      return;
    }
    const list = apiContacts
      .map((r) => {
        let msg = apiMapping.message;
        apiCols.forEach((k) => {
          msg = msg.replace(new RegExp(`{{${k}}}`, "gi"), String(r[k]));
        });
        return {
          name: apiMapping.name ? String(r[apiMapping.name]) : "Sin nombre",
          phone: String(r[apiMapping.phone]),
          identification: apiMapping.identification
            ? String(r[apiMapping.identification])
            : "",
          message: msg,
        };
      })
      .filter((c) => c.phone && c.phone.trim());
    
    if (!list.length) {
        toast.warning("No hay contactos válidos para guardar (verifica el mapeo de teléfono).");
        return;
    }

    try {
      setIsSubmitting(true);
      await addContactsAPI(campaignId, list);
      toast.success(`${list.length} contacto(s) agregado(s) desde Finsolred`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar contactos de Finsolred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    
    const list =
      activeTab === "manual"
        ? contacts.filter((c) => c.phone && c.phone.trim())
        : generateContactsFromExcel();

    if (!list.length) {
      toast.warning("Debes agregar al menos un contacto con teléfono válido.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addContactsAPI(campaignId, list);
      toast.success(`${list.length} contacto(s) agregado(s)`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al guardar contactos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContacts([{ name: "", phone: "", message: "", identification: "" }]);
    setExcelData([]);
    setColumns([]);
    setMapping({
      phone: "",
      name: "",
      identification: "",
      message: "Hola {{nombre}}, tu mensaje es: {{mensaje}}",
    });
    setFileName("");
    setShowPreview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] 
                      overflow-hidden flex flex-col border border-gray-100/80 dark:border-slate-700/80
                      bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800 dark:to-slate-700/50">
        
        <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent">
                Gestión de Contactos
              </h2>
              <p className="text-sm text-gray-500/90 dark:text-slate-400/90 mt-1">
                {activeTab === "manual" ? "Agregue contactos manualmente" : activeTab === "import" ? "Importe contactos desde un archivo" : "Importe contactos desde Finsolred"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 
                         p-1.5 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-700/50 transition-all"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6">
            <nav className="flex space-x-1 p-1 bg-gray-100/50 dark:bg-slate-700/50 rounded-xl border border-gray-200/30 dark:border-slate-600/30">
              {[
                { id: "manual", label: "Ingreso Manual", icon: UserIcon },
                { id: "import", label: "Importar Excel", icon: ArrowUpTrayIcon },
                { id: "finsolred", label: "Finsolred", icon: BanknotesIcon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`${activeTab === id
                      ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                    } py-2.5 px-4 rounded-lg font-medium text-sm flex items-center transition-all w-1/3 justify-center`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6 overflow-auto flex-1">
          {activeTab === "manual" && (
            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
              <div className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2">
                <div className="sticky top-0 z-10 grid grid-cols-12 gap-4 font-medium text-sm text-gray-600 dark:text-slate-300 
                                bg-white dark:bg-slate-700/80 p-3 rounded-xl border border-gray-200/60 dark:border-slate-600/60 shadow-xs">
                  <div className="col-span-3 flex items-center">
                    <UserIcon className="mr-2 h-4 w-4 text-indigo-500/80 dark:text-indigo-400/80" />
                    Nombre
                  </div>
                  <div className="col-span-3 flex items-center">
                    <PhoneIcon className="mr-2 h-4 w-4 text-indigo-500/80 dark:text-indigo-400/80" />
                    Teléfono
                  </div>
                  <div className="col-span-2 flex items-center">
                    <DocumentTextIcon className="mr-2 h-4 w-4 text-indigo-500/80 dark:text-indigo-400/80" />
                    Identificación
                  </div>
                  <div className="col-span-3 flex items-center">
                    <ChatBubbleBottomCenterTextIcon className="mr-2 h-4 w-4 text-indigo-500/80 dark:text-indigo-400/80" />
                    Mensaje
                  </div>
                  <div className="col-span-1" />
                </div>

                {contacts.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-indigo-50/20 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                  >
                    <div className="col-span-3">
                      <input name="name" value={c.name} onChange={(e) => handleChange(i, e)} placeholder="Nombre completo" className="w-full px-3 py-2 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                    </div>
                    <div className="col-span-3">
                      <input name="phone" value={c.phone} onChange={(e) => handleChange(i, e)} placeholder="Número telefónico" required className="w-full px-3 py-2 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                    </div>
                    <div className="col-span-2">
                      <input name="identification" value={c.identification} onChange={(e) => handleChange(i, e)} placeholder="Cédula / RUC" className="w-full px-3 py-2 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                    </div>
                    <div className="col-span-3">
                      <input name="message" value={c.message} onChange={(e) => handleChange(i, e)} placeholder="Mensaje personalizado" className="w-full px-3 py-2 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button type="button" onClick={() => removeRow(i)} disabled={contacts.length <= 1} className="text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40" >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-gray-200/50 dark:border-slate-700/50 pt-6">
                <button type="button" onClick={addRow} className="flex items-center px-4 py-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-700/50 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 shadow-xs transition-all" >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Añadir contacto
                </button>
                <div className="space-x-3">
                  <button type="button" onClick={handleClose} className="px-4 py-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 shadow-xs transition-all" >
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl hover:shadow-md disabled:opacity-70 flex items-center shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-700/50 dark:hover:shadow-indigo-600/50 transition-all" >
                    {isSubmitting ? ( <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> ) : ( <CheckIcon className="h-4 w-4 mr-2" /> )}
                    Guardar Contactos
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "import" && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop} onClick={() => fileInputRef.current.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10" : "border-gray-300/70 dark:border-slate-600/70 hover:border-indigo-300/80 dark:hover:border-indigo-500/80 " + "bg-white/50 dark:bg-slate-700/30 hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5"} shadow-sm hover:shadow-md`}>
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/30 dark:to-purple-800/30 rounded-xl shadow-xs">
                      <ArrowUpTrayIcon className="h-8 w-8 text-indigo-600/80 dark:text-indigo-300/80" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                      Importar desde Excel
                    </h3>
                    <p className="text-sm text-gray-500/90 dark:text-slate-400/90">
                      Arrastra o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-400/80 dark:text-slate-500/80">.xlsx .xls .csv</p>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
                  </div>
                </div>

                {fileName && (
                  <div className="flex items-center p-3 bg-white dark:bg-slate-700 rounded-xl border border-green-200/80 dark:border-green-700/50 shadow-xs">
                    <div className="p-1.5 bg-green-100/50 dark:bg-green-700/30 rounded-lg">
                      <CheckIcon className="h-4 w-4 text-green-600/90 dark:text-green-400/90" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-slate-200 truncate">
                      {fileName}
                    </span>
                    <span className="ml-auto px-2 py-1 text-xs font-medium bg-green-100/50 dark:bg-green-700/30 text-green-700 dark:text-green-300 rounded-full">
                      {excelData.length} registros
                    </span>
                  </div>
                )}

                {columns.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Columna teléfono <span className="text-red-500 ml-1">*</span></label>
                        <select value={mapping.phone} onChange={(e) => setMapping((m) => ({ ...m, phone: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          <option value="">Seleccione</option>
                          {columns.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Columna nombre (opcional) </label>
                        <select value={mapping.name} onChange={(e) => setMapping((m) => ({ ...m, name: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          <option value="">No usar</option>
                          {columns.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Columna identificación (opcional) </label>
                        <select value={mapping.identification} onChange={(e) => setMapping((m) => ({ ...m, identification: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          <option value="">No usar</option>
                          {columns.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700/90 dark:text-slate-300/90"> Variables disponibles (arrastra a la plantilla) </label>
                      <div className="flex flex-wrap p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-gray-200/60 dark:border-slate-600/60 min-h-12 shadow-xs">
                        {columns.map((col) => ( <DraggableVariable key={col} variable={col} onDragStart={handleDragStart}/> ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Plantilla mensaje <span className="text-red-500 ml-1">*</span> </label>
                      <textarea rows={3} value={mapping.message} onChange={(e) => setMapping((m) => ({ ...m, message: e.target.value }))} onDragOver={handleDragOverInput} onDrop={handleDropExcel} className="w-full p-3 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                      <div className="mt-2 text-xs text-gray-500/80 dark:text-slate-400/80 flex items-start">
                        <InformationCircleIcon className="mr-1 mt-0.5 h-4 w-4 text-indigo-500/70 dark:text-indigo-400/70 flex-shrink-0" />
                        <span>Las variables se insertarán donde tengas el cursor. Arrastra las etiquetas de arriba.</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700/90 dark:text-slate-300/90"> Preview ({excelData.length} registros) </h4>
                        <button onClick={() => setShowPreview((v) => !v)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-all">
                          {showPreview ? ( <> Ocultar <ChevronUpIcon className="ml-1 h-4 w-4" /> </> ) : ( <> Mostrar <ChevronDownIcon className="ml-1 h-4 w-4" /> </> )}
                        </button>
                      </div>
                      {showPreview && (
                        <div className="overflow-auto max-h-64 border border-gray-200/60 dark:border-slate-600/60 rounded-xl shadow-xs">
                          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-slate-700/50">
                            <thead className="bg-gray-50/50 dark:bg-slate-700/50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Nombre </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Teléfono </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Identificación </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Mensaje </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200/30 dark:divide-slate-700/30">
                              {generateContactsFromExcel().slice(0, 5).map((r, i) => (
                                  <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap"> {String(r.name)} </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 font-medium whitespace-nowrap"> {String(r.phone)} </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap"> {String(r.identification)} </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 line-clamp-2"> {String(r.message)} </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {excelData.length > 5 && ( <div className="px-4 py-2.5 text-center text-xs text-gray-500/80 dark:text-slate-400/80 bg-gray-50/50 dark:bg-slate-700/50"> Mostrando 5 de {excelData.length} registros </div> )}
                           {excelData.length === 0 && ( <div className="px-4 py-8 text-center text-sm text-gray-500/80 dark:text-slate-400/80 bg-white dark:bg-slate-800"> No hay datos para previsualizar. </div> )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 border-t border-gray-200/50 dark:border-slate-700/50 pt-6">
                <button type="button" onClick={handleClose} className="px-4 py-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 shadow-xs transition-all"> Cancelar </button>
                <button type="button" onClick={handleSubmit} disabled={!mapping.phone || !excelData.length || isSubmitting} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl hover:shadow-md disabled:opacity-70 flex items-center shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-700/50 dark:hover:shadow-indigo-600/50 transition-all">
                  {isSubmitting ? ( <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> ) : ( <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> )}
                  Importar {excelData.length > 0 ? `${excelData.length} ` : ""}contactos
                </button>
              </div>
            </div>
          )}

          {activeTab === "finsolred" && (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Selecciona un “padre” <span className="text-red-500">*</span> </label>
                  <select value={selectedPadre} onChange={(e) => handlePadreChange(e.target.value)} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                    <option value="">-- Escoge un Padre --</option>
                    {uniquePadres.map((p) => ( <option key={p} value={p}> {p} </option> ))}
                  </select>
                </div>

                {selectedPadre && nivelesDisponibles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700/90 dark:text-slate-300/90"> Carteras disponibles ({nivelesDisponibles.length}) </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto border border-gray-200/60 dark:border-slate-600/60 rounded-xl p-3 bg-white dark:bg-slate-700/50 shadow-xs">
                      {nivelesDisponibles.map((n) => {
                        const ch = nivelesSeleccionados.has(n);
                        return (
                          <label key={n} className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${ch ? "bg-indigo-100 dark:bg-indigo-500/30" : "hover:bg-gray-100/70 dark:hover:bg-slate-600/50"}`}>
                            <input type="checkbox" checked={ch} onChange={() => toggleNivel(n)} className="text-indigo-600 dark:text-indigo-400 rounded focus:ring-indigo-500 dark:focus:ring-indigo-500 dark:bg-slate-600 dark:border-slate-500" />
                            <span className="text-sm text-gray-700 dark:text-slate-200">{n}</span>
                          </label>
                        );
                      })}
                    </div>
                    <button onClick={fetchContacts} disabled={!nivelesSeleccionados.size || loadingApi} className="mt-4 flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-700/50 dark:hover:shadow-indigo-600/50 disabled:opacity-60 transition-all">
                      {loadingApi ? ( <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> ) : ( <ArrowPathIcon className="h-4 w-4 mr-2" /> )}
                      Obtener contactos ({[...nivelesSeleccionados].length})
                    </button>
                  </div>
                )}
                 {selectedPadre && nivelesDisponibles.length === 0 && (
                    <div className="mt-4 p-4 text-center text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200/60 dark:border-slate-600/60">
                        No hay carteras disponibles para este padre o ya fueron cargadas.
                    </div>
                )}


                {apiContacts.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Campo teléfono<span className="text-red-500 ml-1">*</span> </label>
                        <select value={apiMapping.phone} onChange={(e) => setApiMapping((m) => ({ ...m, phone: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          {apiCols.map((c) => ( <option key={c} value={c}> {c} </option> ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Campo nombre (opcional) </label>
                        <select value={apiMapping.name} onChange={(e) => setApiMapping((m) => ({ ...m, name: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          <option value="">No usar</option>
                          {apiCols.map((c) => ( <option key={c} value={c}> {c} </option> ))}
                        </select>
                      </div>
                       <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Campo identificación (opcional) </label>
                        <select value={apiMapping.identification} onChange={(e) => setApiMapping((m) => ({ ...m, identification: e.target.value }))} className="mt-1 block w-full p-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100">
                          <option value="">No usar</option>
                          {apiCols.map((c) => ( <option key={c} value={c}>{c}</option> ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700/90 dark:text-slate-300/90"> Variables disponibles (arrastra a la plantilla) </label>
                       <div className="flex flex-wrap p-3 bg-white dark:bg-slate-700/50 rounded-xl border border-gray-200/60 dark:border-slate-600/60 min-h-12 shadow-xs">
                        {apiCols.map((col) => ( <DraggableVariable key={col} variable={col} onDragStart={handleDragStart} /> ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1.5 text-gray-700/90 dark:text-slate-300/90"> Plantilla mensaje <span className="text-red-500 ml-1">*</span> </label>
                      <textarea rows={3} value={apiMapping.message} onChange={(e) => setApiMapping((m) => ({ ...m, message: e.target.value }))} onDragOver={handleDragOverInput} onDrop={handleDropFinsolred} className="w-full p-3 border border-gray-200/70 dark:border-slate-600/70 rounded-xl focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/50 shadow-xs transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400" />
                        <div className="mt-2 text-xs text-gray-500/80 dark:text-slate-400/80 flex items-start">
                            <InformationCircleIcon className="mr-1 mt-0.5 h-4 w-4 text-indigo-500/70 dark:text-indigo-400/70 flex-shrink-0" />
                            <span>Las variables se insertarán donde tengas el cursor. Arrastra las etiquetas de arriba.</span>
                        </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700/90 dark:text-slate-300/90"> Preview (5 de {apiContacts.length}) </h4>
                        <button onClick={() => setApiShowPreview((v) => !v)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-all">
                          {apiShowPreview ? "Ocultar" : "Mostrar"}
                          {apiShowPreview ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />}
                        </button>
                      </div>
                      {apiShowPreview && (
                        <div className="overflow-auto max-h-64 border border-gray-200/60 dark:border-slate-600/60 rounded-xl shadow-xs">
                          <table className="min-w-full divide-y divide-gray-200/50 dark:divide-slate-700/50">
                            <thead className="bg-gray-50/50 dark:bg-slate-700/50 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Nombre </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Teléfono </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Identificación </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wider"> Mensaje </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200/30 dark:divide-slate-700/30">
                              {apiContacts.slice(0, 5).map((r, i) => {
                                let msg = apiMapping.message;
                                apiCols.forEach((k) => {
                                  msg = msg.replace(
                                    new RegExp(`{{${k}}}`, "gi"),
                                    String(r[k] === null || r[k] === undefined ? '' : r[k])
                                  );
                                });
                                return (
                                  <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap">
                                      {apiMapping.name ? String(r[apiMapping.name] === null || r[apiMapping.name] === undefined ? 'Sin nombre' : r[apiMapping.name]) : "Sin nombre"}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 font-medium whitespace-nowrap">
                                      {String(r[apiMapping.phone] === null || r[apiMapping.phone] === undefined ? '' : r[apiMapping.phone])}
                                    </td>
                                     <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap">
                                      {apiMapping.identification ? String(r[apiMapping.identification] === null || r[apiMapping.identification] === undefined ? '' : r[apiMapping.identification]) : ""}
                                    </td>
                                    <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 line-clamp-2">
                                      {msg}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                           {apiContacts.length === 0 && ( <div className="px-4 py-8 text-center text-sm text-gray-500/80 dark:text-slate-400/80 bg-white dark:bg-slate-800"> No hay contactos para previsualizar. </div> )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 border-t border-gray-200/50 dark:border-slate-700/50 pt-6">
                <button type="button" onClick={handleClose} className="px-4 py-2.5 border border-gray-200/70 dark:border-slate-600/70 rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 shadow-xs transition-all"> Cancelar </button>
                <button type="button" onClick={saveContactsFromApi} disabled={isSubmitting || !apiContacts.length || !apiMapping.phone} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl hover:shadow-md flex items-center shadow-indigo-200 hover:shadow-indigo-300 dark:shadow-indigo-700/50 dark:hover:shadow-indigo-600/50 transition-all disabled:opacity-70">
                  {isSubmitting ? ( <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> </svg> ) : ( <CloudArrowUpIcon className="h-4 w-4 mr-2" /> )}
                  Guardar {apiContacts.length > 0 ? `${apiContacts.length} ` : ""}contactos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;