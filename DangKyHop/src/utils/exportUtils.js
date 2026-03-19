import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToImage = async (elementId, filename = 'ThoiKhoaBieu') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Không tìm thấy vùng dữ liệu để xuất!');
    return;
  }

  try {
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
           clonedElement.style.height = 'max-content';
           clonedElement.style.overflow = 'visible';
           const scrollables = clonedElement.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .custom-scrollbar');
           scrollables.forEach(sc => {
               sc.style.overflow = 'visible';
               sc.style.height = 'max-content';
               sc.style.maxHeight = 'none';
           });
        }

        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          if (el.className && typeof el.className === 'string' && (el.className.includes('break-words') || el.className.includes('truncate'))) {
             el.style.whiteSpace = 'normal';
             el.style.wordBreak = 'break-word';
             el.style.overflow = 'visible';
             el.style.height = 'auto';
             el.style.maxWidth = 'none';
          }

          const style = window.getComputedStyle(el);
          if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('oklab'))) {
             el.style.backgroundColor = 'transparent';
          }
          if (style.color && (style.color.includes('oklch') || style.color.includes('oklab'))) {
             el.style.color = '#000000';
          }
          if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('oklab'))) {
             el.style.borderColor = '#cccccc';
          }
        });
      }
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}.png`;
    link.click();
  } catch (error) {
    console.error('Export Error:', error);
    alert('Có lỗi xảy ra khi xuất ảnh!');
  }
};

export const exportToPDF = async (elementId, filename = 'ThoiKhoaBieu') => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Không tìm thấy vùng dữ liệu để xuất!');
    return;
  }

  try {
    const header = element.querySelector('.header-row');
    const rows = element.querySelectorAll('.period-row');

    const html2canvasOptions = {
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          if (el.className && typeof el.className === 'string' && (el.className.includes('break-words') || el.className.includes('truncate'))) {
             el.style.whiteSpace = 'normal';
             el.style.wordBreak = 'break-word';
             el.style.overflow = 'visible';
             el.style.height = 'auto';
             el.style.maxWidth = 'none';
          }
          const style = window.getComputedStyle(el);
          if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('oklab'))) {
             el.style.backgroundColor = 'transparent';
          }
          if (style.color && (style.color.includes('oklch') || style.color.includes('oklab'))) {
             el.style.color = '#000000';
          }
          if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('oklab'))) {
             el.style.borderColor = '#cccccc';
          }
        });
      }
    };

    // A4 Landscape Format
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    let currentY = 10; // offset top 10mm margin
    let headerImg = null;
    let hHeight = 0;

    if (header) {
      const headerCanvas = await html2canvas(header, html2canvasOptions);
      headerImg = headerCanvas.toDataURL('image/png');
      hHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
      
      pdf.addImage(headerImg, 'PNG', 0, currentY, pdfWidth, hHeight);
      currentY += hHeight;
    }

    const rowItems = Array.from(rows);
    for (const row of rowItems) {
      const rowCanvas = await html2canvas(row, html2canvasOptions);
      const rowImg = rowCanvas.toDataURL('image/png');
      const rHeight = (rowCanvas.height * pdfWidth) / rowCanvas.width;

      if (currentY + rHeight > pdfHeight - 10) { 
         pdf.addPage();
         currentY = 10;
         if (headerImg) {
            pdf.addImage(headerImg, 'PNG', 0, currentY, pdfWidth, hHeight);
            currentY += hHeight;
         }
      }

      pdf.addImage(rowImg, 'PNG', 0, currentY, pdfWidth, rHeight);
      currentY += rHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Export Error:', error);
    alert('Có lỗi xảy ra khi xuất PDF!');
  }
};
