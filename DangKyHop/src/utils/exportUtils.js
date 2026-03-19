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
          if (el.className && typeof el.className === 'string' && el.className.includes('break-words')) {
             el.style.whiteSpace = 'normal';
             el.style.wordBreak = 'break-word';
             el.style.overflow = 'visible';
             el.style.height = 'auto';
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
          if (el.className && typeof el.className === 'string' && el.className.includes('break-words')) {
             el.style.whiteSpace = 'normal';
             el.style.wordBreak = 'break-word';
             el.style.overflow = 'visible';
             el.style.height = 'auto';
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

    const imgData = canvas.toDataURL('image/png');
    
    // A4 Landscape Format
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 0) {
      position -= pdfHeight; 
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Export Error:', error);
    alert('Có lỗi xảy ra khi xuất PDF!');
  }
};
