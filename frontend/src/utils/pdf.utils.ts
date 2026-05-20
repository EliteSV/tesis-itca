import jsPDF from 'jspdf';
import { designConfig } from '@/config/design.config';
import type {
  ProfessionalProfile,
  Student,
} from '@/types/student.types';
import type {
  PracticeProfessional,
  PracticeActivity,
  PracticeEvaluation,
} from '@/types/practice-professional.types';
import { ActivityStatus } from '@/types/practice-professional.types';

export async function generateStudentPDF(
  student: Student,
  profile: ProfessionalProfile,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  const primaryColor = hexToRgb(designConfig.colors.primary.main);
  const secondaryColor = hexToRgb(designConfig.colors.secondary.main);

  const addSectionTitle = (title: string, y: number): number => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, y + 5.5);
    doc.setTextColor(0, 0, 0);
    return y + 12;
  };

  const checkPageBreak = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  try {
    const logoUrl = '/assets/LogoITCA_Web.png';
    let logoLoaded = false;

    const logoWidth = 40;
    let logoHeight = 0;
    let logoImageData: string | null = null;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            logoHeight = (img.height * logoWidth) / img.width;
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              logoImageData = canvas.toDataURL('image/png');
              logoLoaded = true;
            }
          } catch (error) {
            console.warn('Error al procesar logo:', error);
          }
          resolve();
        };
        img.onerror = () => {
          console.warn('No se pudo cargar el logo, continuando sin él');
          resolve();
        };
        img.src = logoUrl;
      });
    } catch (error) {
      console.warn('Error cargando logo:', error);
    }

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const fullName = `${student.firstName} ${student.lastName}`;
    const nameWidth = doc.getTextWidth(fullName);

    const nameYPosition = margin + 5;

    if (logoLoaded && logoImageData && logoHeight > 0) {
      const fontSizeInMM = doc.getFontSize() * 0.352778;
      const logoYPosition = nameYPosition + fontSizeInMM / 2 - logoHeight / 2;
      doc.addImage(logoImageData, 'PNG', margin, logoYPosition, logoWidth, logoHeight);
    }

    doc.text(fullName, pageWidth - margin - nameWidth, nameYPosition);
    yPosition = nameYPosition + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      student.email,
      pageWidth - margin - doc.getTextWidth(student.email),
      yPosition,
    );
    yPosition += 4;

    if (student.phone) {
      doc.text(
        student.phone,
        pageWidth - margin - doc.getTextWidth(student.phone),
        yPosition,
      );
      yPosition += 4;
    }

    if (student.address) {
      const addressLines = doc.splitTextToSize(student.address, contentWidth / 2);
      doc.text(
        addressLines,
        pageWidth - margin - doc.getTextWidth(addressLines[0] || ''),
        yPosition,
      );
      yPosition += addressLines.length * 4;
    }

    yPosition += 8;
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    if (profile.summary) {
      checkPageBreak(20);
      yPosition = addSectionTitle('RESUMEN PROFESIONAL', yPosition);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const summaryLines = doc.splitTextToSize(
        profile.summary,
        contentWidth,
      );
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5 + 8;
    }

    if (profile.workExperience && profile.workExperience.length > 0) {
      checkPageBreak(30);
      yPosition = addSectionTitle('EXPERIENCIA LABORAL', yPosition);
      profile.workExperience.forEach((exp) => {
        checkPageBreak(25);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(exp.position, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const dateRange = `${formatDate(exp.startDate)} - ${
          exp.isCurrent ? 'Presente' : exp.endDate ? formatDate(exp.endDate) : ''
        }`;
        doc.text(exp.company, margin, yPosition);
        doc.text(
          dateRange,
          pageWidth - margin - doc.getTextWidth(dateRange),
          yPosition,
        );
        yPosition += 5;

        if (exp.description) {
          doc.setTextColor(0, 0, 0);
          const descLines = doc.splitTextToSize(exp.description, contentWidth);
          doc.text(descLines, margin, yPosition);
          yPosition += descLines.length * 4;
        }
        yPosition += 6;
      });
    }

    if (profile.education && profile.education.length > 0) {
      checkPageBreak(30);
      yPosition = addSectionTitle('FORMACIÓN ACADÉMICA', yPosition);
      profile.education.forEach((edu) => {
        checkPageBreak(25);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(edu.degree, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const dateRange = `${formatDate(edu.startDate)} - ${
          edu.isCurrent ? 'Presente' : edu.endDate ? formatDate(edu.endDate) : ''
        }`;
        doc.text(edu.institution, margin, yPosition);
        doc.text(
          dateRange,
          pageWidth - margin - doc.getTextWidth(dateRange),
          yPosition,
        );
        yPosition += 5;

        if (edu.field) {
          doc.text(edu.field, margin, yPosition);
          yPosition += 5;
        }

        if (edu.description) {
          doc.setTextColor(0, 0, 0);
          const descLines = doc.splitTextToSize(edu.description, contentWidth);
          doc.text(descLines, margin, yPosition);
          yPosition += descLines.length * 4;
        }
        yPosition += 6;
      });
    }

    if (profile.skills && profile.skills.length > 0) {
      checkPageBreak(25);
      yPosition = addSectionTitle('HABILIDADES', yPosition);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const skillsText = profile.skills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
      doc.text(skillsLines, margin, yPosition);
      yPosition += skillsLines.length * 5 + 8;
    }

    if (profile.languages && profile.languages.length > 0) {
      checkPageBreak(25);
      yPosition = addSectionTitle('IDIOMAS', yPosition);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      profile.languages.forEach((lang) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${lang.name}:`, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(lang.level, margin + 30, yPosition);
        yPosition += 6;
      });
      yPosition += 4;
    }

    if (profile.certifications && profile.certifications.length > 0) {
      checkPageBreak(30);
      yPosition = addSectionTitle('CERTIFICACIONES', yPosition);
      profile.certifications.forEach((cert) => {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(cert.name, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const certDate = formatDate(cert.date);
        doc.text(cert.issuer, margin, yPosition);
        doc.text(
          certDate,
          pageWidth - margin - doc.getTextWidth(certDate),
          yPosition,
        );
        yPosition += 10;
      });
    }

    if (profile.projects && profile.projects.length > 0) {
      checkPageBreak(30);
      yPosition = addSectionTitle('PROYECTOS', yPosition);
      profile.projects.forEach((proj) => {
        checkPageBreak(25);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(proj.name, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;

        if (proj.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(proj.description, contentWidth);
          doc.text(descLines, margin, yPosition);
          yPosition += descLines.length * 4;
        }

        if (proj.technologies && proj.technologies.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Tecnologías: ${proj.technologies.join(', ')}`, margin, yPosition);
          yPosition += 5;
        }

        if (proj.url) {
          doc.setFontSize(9);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(proj.url, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 6;
      });
    }

    const fileName = `CV_${student.firstName}_${student.lastName}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

export async function generatePracticeProfessionalPDF(
  practiceData: PracticeProfessional,
  studentName: string,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const loadLogo = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const logoUrl = '/assets/LogoITCA_Web.png';
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (error) {
          console.warn('Error al procesar logo:', error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.warn('No se pudo cargar el logo');
        resolve(null);
      };

      img.src = logoUrl;
    });
  };

  const loadCDALogo = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const logoUrl = '/assets/Logo_CDA.png';
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(null);
          }
        } catch (error) {
          console.warn('Error al procesar logo CDA:', error);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.warn('No se pudo cargar el logo CDA');
        resolve(null);
      };

      img.src = logoUrl;
    });
  };

  const checkPageBreak = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);

  try {
    const logoData = await loadLogo();
    const cdaLogoData = await loadCDALogo();
    const logoWidth = 40;
    let logoHeight = 0;
    const cdaLogoWidth = 30;
    let cdaLogoHeight = 0;

    if (logoData) {
      const img = new Image();
      img.src = logoData;
      await new Promise((resolve) => {
        img.onload = () => {
          logoHeight = (img.height * logoWidth) / img.width;
          resolve(null);
        };
        img.onerror = resolve;
      });
    }

    if (cdaLogoData) {
      const img = new Image();
      img.src = cdaLogoData;
      await new Promise((resolve) => {
        img.onload = () => {
          cdaLogoHeight = (img.height * cdaLogoWidth) / img.width;
          resolve(null);
        };
        img.onerror = resolve;
      });
    }

    const approvedActivities = practiceData.activities.filter(
      (activity) => activity.status === ActivityStatus.APPROVED,
    );

    if (approvedActivities.length === 0) {
      throw new Error('No hay actividades aprobadas para exportar');
    }

    const activitiesByDate = approvedActivities.reduce(
      (acc, activity) => {
        const dateKey = activity.activityDate.split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(activity);
        return acc;
      },
      {} as Record<string, PracticeActivity[]>,
    );

    const sortedDates = Object.keys(activitiesByDate).sort();

    let currentPage = 1;
    const activitiesPerPage = 6;
    let activitiesOnCurrentPage = 0;
    const totalTableWidth = pageWidth - 2 * margin;
    const colWidths = [
      totalTableWidth * 0.12,
      totalTableWidth * 0.38,
      totalTableWidth * 0.12,
      totalTableWidth * 0.12,
      totalTableWidth * 0.26,
    ];
    const colHeaders = [
      'Fecha DD/MM/AA',
      'TRABAJO REALIZADO',
      'No. De horas por actividad',
      'Total de horas por día.',
      'Maquinaria, herramienta y equipo utilizado',
    ];
    const rowHeight = 10;

    const companyName = practiceData.opportunity.company?.name || '-';
    const careerName = practiceData.opportunity.career?.name || '-';

    const drawHeader = (): number => {
      const headerY = margin;
      
      if (logoData && logoHeight > 0) {
        doc.addImage(logoData, 'PNG', margin, headerY, logoWidth, logoHeight);
      }

      if (cdaLogoData && cdaLogoHeight > 0) {
        const cdaLogoX = pageWidth - margin - cdaLogoWidth;
        doc.addImage(cdaLogoData, 'PNG', cdaLogoX, headerY, cdaLogoWidth, cdaLogoHeight);
      }

      const maxLogoHeight = Math.max(logoHeight || 0, cdaLogoHeight || 0, 15);
      const logoCenterY = headerY + (logoHeight > 0 ? logoHeight / 2 : 7.5);
      const textStartY = Math.max(logoCenterY - 6, headerY + 5);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const titleText = 'REGISTRO DE TRABAJO DE LA PRACTICA PROFESIONAL';
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, (pageWidth - titleWidth) / 2, textStartY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const controlText = 'A) CONTROL DE CONTENIDO';
      const controlWidth = doc.getTextWidth(controlText);
      doc.text(controlText, (pageWidth - controlWidth) / 2, textStartY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const instructionText = '(Para ser completado por el alumno)';
      const instructionWidth = doc.getTextWidth(instructionText);
      doc.text(instructionText, (pageWidth - instructionWidth) / 2, textStartY + 11);

      let currentY = headerY + maxLogoHeight + 8;

      const centerX = pageWidth / 2;
      const fieldWidth = pageWidth - 2 * margin;
      const leftAlignX = centerX - fieldWidth / 2;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const labelWidth = doc.getTextWidth('Nombre del alumno:');
      doc.text('Nombre del alumno:', leftAlignX, currentY);
      doc.setFont('helvetica', 'normal');
      const studentNameLines = doc.splitTextToSize(studentName, fieldWidth - labelWidth - 5);
      doc.text(studentNameLines, leftAlignX + labelWidth + 3, currentY);
      currentY += Math.max(studentNameLines.length * 4, 6);

      doc.setFont('helvetica', 'bold');
      const companyLabelWidth = doc.getTextWidth('Nombre de la empresa:');
      doc.text('Nombre de la empresa:', leftAlignX, currentY);
      doc.setFont('helvetica', 'normal');
      const companyLines = doc.splitTextToSize(companyName, fieldWidth - companyLabelWidth - 5);
      doc.text(companyLines, leftAlignX + companyLabelWidth + 3, currentY);
      currentY += Math.max(companyLines.length * 4, 6);

      doc.setFont('helvetica', 'bold');
      const deptLabelWidth = doc.getTextWidth('Departamento academico:');
      doc.text('Departamento academico:', leftAlignX, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(careerName, leftAlignX + deptLabelWidth + 3, currentY);
      currentY += 6;

      doc.setFont('helvetica', 'bold');
      const specLabelWidth = doc.getTextWidth('Especialidad:');
      doc.text('Especialidad:', leftAlignX, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(careerName, leftAlignX + specLabelWidth + 3, currentY);
      currentY += 10;

      return currentY;
    };

    const drawTableHeader = (startY: number): number => {
      const tableStartX = margin;
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      let xPos = tableStartX;
      for (let i = 0; i < colHeaders.length; i++) {
        doc.rect(xPos, startY, colWidths[i], rowHeight, 'S');
        const lines = doc.splitTextToSize(colHeaders[i], colWidths[i] - 3);
        const lineHeight = 3.5;
        const totalTextHeight = lines.length * lineHeight;
        const textY = startY + (rowHeight - totalTextHeight) / 2 + lineHeight;
        
        for (let j = 0; j < lines.length; j++) {
          const lineWidth = doc.getTextWidth(lines[j]);
          const lineX = xPos + (colWidths[i] - lineWidth) / 2;
          doc.text(lines[j], lineX, textY + j * lineHeight);
        }
        xPos += colWidths[i];
      }
      return startY + rowHeight;
    };

    const drawSignatures = (): void => {
      const signatureY = pageHeight - margin - 15;
      const signatureLeftX = margin;
      const signatureRightX = pageWidth - margin - 60;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      doc.text('_________________________', signatureLeftX, signatureY);
      doc.text('_________________________', signatureRightX, signatureY);
      
      doc.text('FIRMA DEL TUTOR DE LA EMPRESA', signatureLeftX, signatureY + 5);
      doc.text('SELLO DE LA EMPRESA', signatureRightX, signatureY + 5);
    };

    for (const dateKey of sortedDates) {
      const dateActivities = activitiesByDate[dateKey];
      const totalHoursForDate = dateActivities.reduce(
        (sum, act) => sum + act.hours,
        0,
      );

      checkPageBreak(30);

      if (currentPage === 1 && activitiesOnCurrentPage === 0) {
        yPosition = drawHeader();
        yPosition = drawTableHeader(yPosition);
        drawSignatures();
      }

      for (const activity of dateActivities) {
        checkPageBreak(15);

        if (activitiesOnCurrentPage >= activitiesPerPage) {
          doc.addPage();
          currentPage++;
          activitiesOnCurrentPage = 0;
          
          yPosition = drawHeader();
          yPosition = drawTableHeader(yPosition);
          drawSignatures();
        }

        const activityRowHeight = Math.max(10, Math.ceil(activity.description.length / 50) * 4);
        let xPos = margin;

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        doc.rect(xPos, yPosition, colWidths[0], activityRowHeight, 'S');
        doc.text(formatDate(activity.activityDate), xPos + 2, yPosition + 5);
        xPos += colWidths[0];

        doc.rect(xPos, yPosition, colWidths[1], activityRowHeight, 'S');
        const descLines = doc.splitTextToSize(activity.description, colWidths[1] - 4);
        const descLineHeight = 3.5;
        const descTotalTextHeight = descLines.length * descLineHeight;
        const descY = yPosition + (activityRowHeight - descTotalTextHeight) / 2 + descLineHeight;
        doc.text(descLines, xPos + 2, descY);
        xPos += colWidths[1];

        doc.rect(xPos, yPosition, colWidths[2], activityRowHeight, 'S');
        doc.text(activity.hours.toString(), xPos + 2, yPosition + 5);
        xPos += colWidths[2];

        doc.rect(xPos, yPosition, colWidths[3], activityRowHeight, 'S');
        if (activity === dateActivities[dateActivities.length - 1]) {
          doc.text(totalHoursForDate.toString(), xPos + 2, yPosition + 5);
        }
        xPos += colWidths[3];

        doc.rect(xPos, yPosition, colWidths[4], activityRowHeight, 'S');
        const equipmentLines = doc.splitTextToSize(activity.equipmentOrTool, colWidths[4] - 4);
        const equipmentLineHeight = 3.5;
        const equipmentTotalTextHeight = equipmentLines.length * equipmentLineHeight;
        const equipmentY = yPosition + (activityRowHeight - equipmentTotalTextHeight) / 2 + equipmentLineHeight;
        doc.text(equipmentLines, xPos + 2, equipmentY);

        yPosition += activityRowHeight;
        activitiesOnCurrentPage++;
      }
    }

    checkPageBreak(30);
    yPosition += 10;

    const totalHours = approvedActivities.reduce((sum, act) => sum + act.hours, 0);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL DE HORAS : ${totalHours}`, margin, yPosition);

    drawSignatures();

    const fileName = `Registro_Practica_Profesional_${studentName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

export async function generatePracticeEvaluationPDF(
  practiceData: PracticeProfessional,
  studentName: string,
): Promise<void> {
  const evaluation = practiceData.practiceEvaluation as PracticeEvaluation;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 13;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const loadImage = (src: string): Promise<string | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) { ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png')); }
          else resolve(null);
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const logoData = await loadImage('/assets/LogoITCA_Web.png');
  const cdaLogoData = await loadImage('/assets/Logo_CDA.png');

  const logoW = 28;
  const cdaW = 20;
  let logoH = 0;
  let cdaH = 0;

  if (logoData) {
    const img = new Image();
    img.src = logoData;
    await new Promise((r) => { img.onload = () => { logoH = (img.height * logoW) / img.width; r(null); }; img.onerror = r; });
  }
  if (cdaLogoData) {
    const img = new Image();
    img.src = cdaLogoData;
    await new Promise((r) => { img.onload = () => { cdaH = (img.height * cdaW) / img.width; r(null); }; img.onerror = r; });
  }

  // ── Header ──────────────────────────────────────────────────────────────
  const headerH = Math.max(logoH, cdaH, 16) + 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, headerH);

  if (logoData && logoH > 0) {
    doc.addImage(logoData, 'PNG', margin + 2, y + (headerH - logoH) / 2, logoW, logoH);
  }
  if (cdaLogoData && cdaH > 0) {
    doc.addImage(cdaLogoData, 'PNG', pageWidth - margin - cdaW - 2, y + (headerH - cdaH) / 2, cdaW, cdaH);
  }

  const titleCX = pageWidth / 2;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('B) EVALUACIÓN DE PRÁCTICA PROFESIONAL', titleCX, y + headerH / 2 - 2, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('(Documento a ser completado por el tutor del alumno en la empresa)', titleCX, y + headerH / 2 + 4, { align: 'center' });

  y += headerH + 4;

  // ── Intro text ───────────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const introParas = [
    'ITCA-FEPADE agradece la valiosa colaboración de su empresa en la formación profesional y humana de sus alumnos y futuros profesionales.',
    'El siguiente cuestionario se le envía a usted con el objetivo de evaluar el desempeño de los alumnos durante el período establecido para la práctica profesional, esta evaluación sirve para certificar la calidad de aprendizaje del alumno.',
    'Por este motivo, le solicitamos responder las siguientes preguntas respecto al desempeño mostrado por el alumno en el trabajo asignado.',
  ];
  introParas.forEach((para) => {
    const lines = doc.splitTextToSize(para, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 3.8;
  });
  y += 3;

  // ── Rating scale box ─────────────────────────────────────────────────────
  const scaleItems = [
    '5: Sobresaliente: El alumno constantemente excede las expectativas para las tareas asignadas. (Es proactivo)',
    '4: Alta eficiencia: El alumno siempre logra alcanzar las metas encomendadas. (Es eficiente)',
    '3: Efectivo: El alumno frecuentemente alcanza las metas encomendadas. (Es normal, trabaja de buena manera)',
    '2: Regular: El alumno cumple las tareas en un grado mínimo. (Hace solo lo que se le pide sin evaluar su calidad)',
    '1: Necesita mejorar: El Alumno necesita supervisión constante y no cumple con las tareas asignadas.',
  ];
  const scaleBoxH = 5 + scaleItems.length * 4.2 + 3;
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, scaleBoxH);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabla de evaluación:', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  scaleItems.forEach((item, i) => {
    doc.text(item, margin + 3, y + 9 + i * 4.2);
  });
  y += scaleBoxH + 4;

  // ── Info fields ───────────────────────────────────────────────────────────
  const companyName = practiceData.opportunity.company?.name || '';
  const careerName = practiceData.opportunity.career?.name || '';
  const totalHours = practiceData.opportunity.totalHours?.toString() || '';

  // Left half and right half column x positions and widths
  const halfW = contentWidth / 2 - 2;
  const rightX = margin + contentWidth / 2 + 2;

  // Helper: draws "LABEL: ___value___" starting at x, spanning width w
  const field = (label: string, value: string, x: number, fieldY: number, w: number) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, fieldY);
    const lw = doc.getTextWidth(label);
    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.2);
    const lineStart = x + lw + 1.5;
    const lineEnd = x + w;
    doc.line(lineStart, fieldY, lineEnd, fieldY);
    if (value) {
      const clipped = doc.splitTextToSize(value, lineEnd - lineStart - 2)[0] || '';
      doc.text(clipped, lineStart + 1, fieldY - 0.8);
    }
  };

  const rowGap = 5.5;

  // Row 1: EMPRESA (full width)
  field('EMPRESA:', companyName, margin, y, contentWidth);
  y += rowGap;

  // Row 2: TUTOR DEL ALUMNO | CARGO
  field('TUTOR DEL ALUMNO EN LA EMPRESA:', '', margin, y, halfW);
  field('CARGO:', '', rightX, y, halfW);
  y += rowGap;

  // Row 3: NOMBRE DEL ALUMNO | DEPARTAMENTO ACADÉMICO
  field('NOMBRE DEL ALUMNO:', studentName, margin, y, halfW);
  field('DEPARTAMENTO ACADÉMICO:', careerName, rightX, y, halfW);
  y += rowGap;

  // Row 4: CORREO ELECTRÓNICO | CARRERA
  field('CORREO ELECTRÓNICO:', '', margin, y, halfW);
  field('CARRERA:', careerName, rightX, y, halfW);
  y += rowGap;

  // Row 5: PERÍODO DE LA PRÁCTICA: INICIO: ___ FINALIZO: ___
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PERÍODO DE LA PRÁCTICA:', margin, y);
  const perLW = doc.getTextWidth('PERÍODO DE LA PRÁCTICA:');
  doc.setFont('helvetica', 'normal');
  let px = margin + perLW + 2;
  doc.text('INICIO:', px, y);
  px += doc.getTextWidth('INICIO:') + 1;
  doc.setLineWidth(0.2);
  doc.line(px, y, px + 32, y);
  px += 35;
  doc.text('FINALIZO:', px, y);
  px += doc.getTextWidth('FINALIZO:') + 1;
  doc.line(px, y, px + 32, y);
  y += rowGap;

  // Row 6: HORAS | COORDINADOR
  field('No. DE HORAS PRÁCTICAS REALIZADAS:', totalHours, margin, y, halfW);
  field('COORDINADOR DE LA PRÁCTICA PROFESIONAL:', '', rightX, y, halfW);
  y += rowGap + 3;

  // ── Evaluation criteria table ─────────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EVALUACIÓN DEL TRABAJO REALIZADO:', margin, y);
  y += 5;

  const scoreColW = 10;
  const descColW = contentWidth - scoreColW * 5;
  // x positions of the 6 columns: [desc, 1, 2, 3, 4, 5]
  const colX = [
    margin,
    margin + descColW,
    margin + descColW + scoreColW,
    margin + descColW + scoreColW * 2,
    margin + descColW + scoreColW * 3,
    margin + descColW + scoreColW * 4,
  ];

  // Header row
  const thH = 7;
  doc.setLineWidth(0.3);
  doc.rect(colX[0], y, descColW, thH);
  for (let s = 1; s <= 5; s++) {
    doc.rect(colX[s], y, scoreColW, thH);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(s.toString(), colX[s] + scoreColW / 2, y + 4.8, { align: 'center' });
  }
  y += thH;

  const criteria: { label: string; description: string; key: keyof PracticeEvaluation }[] = [
    {
      label: 'CALIDAD Y ORGANIZACIÓN DEL TRABAJO REALIZADO',
      description: 'El Alumno realiza su trabajo con eficiencia y precisión en el desarrollo de sus labores.',
      key: 'qualityAndOrganization',
    },
    {
      label: 'CONOCIMIENTO Y APLICACIÓN',
      description:
        'Mida los conocimientos adquiridos y su consecuente aplicación al trabajo que desarrolla. El alumno domina ampliamente y aplica en forma correcta los conocimientos exigibles a su especialidad y nivel.',
      key: 'knowledgeAndApplication',
    },
    {
      label: 'CAPACIDAD DE APRENDIZAJE',
      description:
        'Califique la rapidez y efectividad con que retiene y aplica los nuevos conocimientos. El alumno aprende con gran facilidad y rapidez.',
      key: 'learningCapacity',
    },
    {
      label: 'ASISTENCIA Y PUNTUALIDAD',
      description: 'El Alumno asiste todos los días a su práctica puntualmente.',
      key: 'attendanceAndPunctuality',
    },
    {
      label: 'INICIATIVA Y CRITERIO',
      description:
        'Mida la capacidad para actuar acertadamente en forma autónoma sin instrucciones concretas. El alumno decide y actúa correctamente, investiga para realizar un trabajo óptimo.',
      key: 'initiativeAndJudgment',
    },
  ];

  criteria.forEach((criterion, idx) => {
    doc.setFontSize(7);
    const text = `${idx + 1}. ${criterion.label}: ${criterion.description}`;
    const descLines = doc.splitTextToSize(text, descColW - 3);
    const rowH = Math.max(descLines.length * 3.6 + 3, 10);

    doc.setLineWidth(0.3);
    doc.rect(colX[0], y, descColW, rowH);
    doc.setFont('helvetica', 'normal');
    doc.text(descLines, colX[0] + 2, y + 3.5);

    const score = evaluation[criterion.key];
    for (let s = 1; s <= 5; s++) {
      doc.rect(colX[s], y, scoreColW, rowH);
      if (s === score) {
        doc.setFillColor(30, 30, 30);
        doc.circle(colX[s] + scoreColW / 2, y + rowH / 2, 2.2, 'F');
        doc.setFillColor(255, 255, 255);
      }
    }
    y += rowH;
  });

  // Total score row
  const totalScore =
    evaluation.qualityAndOrganization +
    evaluation.knowledgeAndApplication +
    evaluation.learningCapacity +
    evaluation.attendanceAndPunctuality +
    evaluation.initiativeAndJudgment;

  const scoreRowH = 9;
  doc.setLineWidth(0.3);
  doc.rect(colX[0], y, descColW, scoreRowH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PUNTAJE OBTENIDO:', colX[0] + 2, y + 5.8);
  for (let s = 1; s <= 5; s++) {
    doc.rect(colX[s], y, scoreColW, scoreRowH);
  }
  doc.setFontSize(8.5);
  doc.text(totalScore.toString(), colX[5] + scoreColW / 2, y + 6, { align: 'center' });
  y += scoreRowH + 5;

  // ── Supervision question ──────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const supText =
    'La siguiente pregunta está enfocada a evaluar la supervisión académica hace de sus alumnos en el período que dura la práctica profesional.';
  const supLines = doc.splitTextToSize(supText, contentWidth);
  doc.text(supLines, margin, y);
  y += supLines.length * 3.8 + 2;

  doc.text('1-  El alumno fue supervisado al interior de la empresa durante el período que duró la práctica profesional por parte de un tutor del ITCA.', margin, y);
  y += 4.5;

  const visitOptions = [
    { label: 'Ninguna vez', x: margin + 2 },
    { label: 'Una visita', x: margin + 38 },
    { label: 'Dos visitas', x: margin + 72 },
    { label: 'Tres visitas', x: margin + 108 },
  ];
  visitOptions.forEach(({ label, x }) => {
    doc.setLineWidth(0.3);
    doc.rect(x, y - 3.2, 4.5, 4.5);
    doc.text(label, x + 6, y);
  });
  y += 5;

  doc.text('Observaciones:', margin, y);
  doc.setLineWidth(0.2);
  doc.line(margin + doc.getTextWidth('Observaciones:') + 2, y, pageWidth - margin, y);
  y += 10;

  // ── Signatures (always on same page) ─────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 58, y);
  doc.text('FIRMA DEL TUTOR DE LA EMPRESA', margin, y + 4.5);
  doc.line(pageWidth - margin - 58, y, pageWidth - margin, y);
  doc.text('SELLO DE LA EMPRESA', pageWidth - margin - 44, y + 4.5);

  const fileName = `Evaluacion_Practica_Profesional_${studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
