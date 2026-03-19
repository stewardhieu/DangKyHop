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
      onclone: (clonedDoc) => {
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
             el.style.backgroundColor = 'transparent';
          }
          if (style.color && style.color.includes('oklch')) {
             el.style.color = '#000000';
          }
          if (style.borderColor && style.borderColor.includes('oklch')) {
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
      onclone: (clonedDoc) => {
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
             el.style.backgroundColor = 'transparent';
          }
          if (style.color && style.color.includes('oklch')) {
             el.style.color = '#000000';
          }
          if (style.borderColor && style.borderColor.includes('oklch')) {
             el.style.borderColor = '#cccccc';
          }
        });
      }
    });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4'); 
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Export Error:', error);
    alert('Có lỗi xảy ra khi xuất PDF!');
  }
};
