import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Convierte un arreglo de objetos en un archivo Excel real (.xlsx)
 * @param {Array<Object>} data - Datos a exportar (cada objeto es una fila)
 * @param {string} fileName - Nombre del archivo (sin extensión)
 * @param {string} sheetName - Nombre de la hoja de cálculo
 */
export const exportToExcel = (data, fileName = 'Reporte', sheetName = 'Datos') => {
    if (!data || data.length === 0) {
        alert('No hay datos para exportar a Excel.');
        return;
    }

    // Crear un nuevo libro de cálculo y una hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Configurar columnas auto-size (opcional, ajustamos el ancho basado en la primera fila)
    const keys = Object.keys(data[0]);
    const wscols = keys.map(k => ({ wch: Math.max(k.length, 15) }));
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Escribir archivo
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Genera un documento PDF usando autoTable
 * @param {Array<string>} headers - Títulos de las columnas
 * @param {Array<Array<any>>} rows - Datos (arreglo de arreglos)
 * @param {string} fileName - Nombre del archivo (sin extensión)
 * @param {string} title - Título que aparecerá dentro del documento
 */
export const exportToPDF = (headers, rows, fileName = 'Reporte', title = 'Reporte del Sistema') => {
    if (!rows || rows.length === 0) {
        alert('No hay datos para exportar a PDF.');
        return;
    }

    const doc = new jsPDF('l', 'pt', 'a4'); // 'l' = landscape (horizontal para tablas anchas)

    // Agregamos un título y la fecha actual
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 40, 40);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}`, 40, 55);

    // Usamos autoTable para dibujar la tabla
    doc.autoTable({
        startY: 70,
        head: [headers],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, halign: 'center' },
        styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 70 },
        didParseCell: function(data) {
            // Formatear números si parecen moneda
            if (data.section === 'body') {
                const text = data.cell.raw;
                if (typeof text === 'number' || (!isNaN(Number(text)) && text !== '')) {
                    // Try to format it as number but without currency symbol if it's numeric
                    // If it already has symbols (like DOP), leave it as is.
                     const num = Number(text);
                     if (!isNaN(num)) {
                          data.cell.text = [new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)];
                          data.cell.styles.halign = 'right';
                     }
                }
                if(typeof text === 'string' && text.includes('DOP')) {
                    data.cell.styles.halign = 'right';
                }
            }
        }
    });

    doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
