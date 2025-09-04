import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getCampaignSummaryAPI, downloadCampaignReportAPI } from '../../../services/api';

const isoFormat = (date) => (date ? date.toISOString().slice(0, 10) : "");

export const useReportData = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchData = useCallback(async () => {
        if (!startDate || !endDate) {
            return toast.error("Por favor, seleccione un rango de fechas completo.");
        }
        if (startDate > endDate) {
            return toast.warn("La fecha de inicio no puede ser posterior a la fecha de fin.");
        }
        
        setLoading(true);
        try {
            const { data } = await getCampaignSummaryAPI(isoFormat(startDate), isoFormat(endDate));
            setAllRows(data);
            if (data.length === 0) {
                toast.info("No se encontraron campañas para el rango de fechas seleccionado.");
            }
        } catch (e) {
            toast.error("Error al obtener los datos del reporte.");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    const downloadReport = useCallback(async () => {
        if (!startDate || !endDate) {
            return toast.error("Seleccione un rango de fechas para descargar el reporte.");
        }
        if (allRows.length === 0) {
            return toast.warn("No hay datos para exportar con los filtros actuales.");
        }

        const toastId = toast.loading("Preparando descarga...");
        try {
            const { data, headers } = await downloadCampaignReportAPI(isoFormat(startDate), isoFormat(endDate));
            const blob = new Blob([data], { type: headers['content-type'] });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (headers['content-disposition'] || '').split('filename=')[1]?.replace(/"/g, '') || `reporte_campanas_${isoFormat(startDate)}_a_${isoFormat(endDate)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.update(toastId, { render: "Reporte descargado exitosamente.", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            toast.update(toastId, { render: `No se pudo descargar el reporte.`, type: "error", isLoading: false, autoClose: 3000 });
            console.error(err);
        }
    }, [startDate, endDate, allRows]);

    const filteredRows = useMemo(() => 
        filterStatus === "all" ? allRows : allRows.filter(r => r.status === filterStatus),
        [allRows, filterStatus]
    );

    return {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        filterStatus,
        setFilterStatus,
        loading,
        fetchData,
        downloadReport,
        allRows,
        filteredRows,
    };
};