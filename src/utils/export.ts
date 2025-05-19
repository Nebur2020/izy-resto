import jsPDF from 'jspdf';
import { Transaction } from '../types';

export async function exportToPng(element: HTMLElement): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: 1920,
      onclone: clonedDoc => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.download = `etats-financiers-${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
}

export async function exportToPdf(element: HTMLElement): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');

  try {
    // Add a delay to ensure the DOM is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Apply specific CSS styles for PDF rendering
    const originalStyles = element.getAttribute('style') || '';
    element.setAttribute(
      'style',
      `${originalStyles}; width: 794px; min-height: 500px;` // Set to A4 width (8.27" × 11.69" = 794px × 1123px at 96 DPI)
    );

    // Create canvas with improved settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true, // Allow cross-origin images
      windowWidth: 1920,
      onclone: clonedDoc => {
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { size: A4; margin: 10mm; }
          @media print {
            body {
              width: 210mm;
              height: 297mm;
            }
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    // Restore original styles
    element.setAttribute('style', originalStyles);

    // Calculate dimensions for A4 paper (210mm x 297mm)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with A4 format in portrait orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add image and handle multi-page documents
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    // Add first page
    pdf.addImage(
      canvas.toDataURL('image/png', 1.0), // Better quality
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      '',
      'FAST'
    );
    heightLeft -= pageHeight;

    // Add subsequent pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage('a4', 'portrait'); // Explicitly set A4 portrait format for additional pages
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );
      heightLeft -= pageHeight;
      pageNumber++;
    }

    // Generate a meaningful filename with date
    const date = new Date().toISOString().split('T')[0];
    pdf.save(`etats-financiers-${date}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

export function convertToCsv(
  transactions: Transaction[],
  includeHeader = true,
  customHeaders?: string[]
) {
  if (transactions.length === 0) return '';

  // Define column order and readable headers
  const columnOrder = [
    'date',
    'source',
    'description',
    'reference',
    'debit',
    'credit',
    'gross',
    'id',
  ];

  // Format header row
  let headers = '';
  if (includeHeader) {
    if (customHeaders && customHeaders.length > 0) {
      headers = customHeaders.join(',');
    } else {
      // Use more meaningful column names
      const readableHeaders = {
        date: 'Date',
        source: 'Source',
        description: 'Description',
        reference: 'Reference',
        debit: 'Debit',
        credit: 'Credit',
        gross: 'Gross',
        id: 'ID',
      };

      headers = columnOrder
        .map(key => readableHeaders[key as keyof typeof readableHeaders])
        .join(',');
    }
  }

  // Format data rows
  const rows = transactions
    .map(transaction => {
      // Order fields according to columnOrder
      return columnOrder
        .map(key => {
          const value = transaction[key as keyof Transaction];

          // Format dates
          if (key === 'date') {
            return `"${new Date(value as string).toLocaleDateString()}"`;
          }

          // Format currency values
          if (['debit', 'credit', 'gross'].includes(key)) {
            // Ensure value is a number and format with 2 decimal places
            const numValue =
              typeof value === 'number'
                ? value
                : parseFloat(String(value) || '0');
            return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
          }

          // Format strings
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }

          return value || '';
        })
        .join(',');
    })
    .join('\n');

  return headers ? `${headers}\n${rows}` : rows;
}

export function downloadCsv(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
