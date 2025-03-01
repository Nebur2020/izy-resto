import jsPDF from 'jspdf';

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

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'landscape',
      unit: 'mm',
    });

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      '',
      'FAST'
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
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

    const date = new Date().toISOString().split('T')[0];
    pdf.save(`etats-financiers-${date}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

export function convertToCsv(transactions: any[]) {
  if (transactions.length === 0) return '';

  const headers = Object.keys(transactions[0]).join(',');

  const rows = transactions
    .map(transaction =>
      Object.values(transaction)
        .map(value => {
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
    .join('\n');

  return `${headers}\n${rows}`;
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
