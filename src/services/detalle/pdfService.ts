// PDF Service following SOLID principles
// Responsible for generating medical reports as PDF documents

import jsPDF from 'jspdf';

/**
 * Patient information for PDF report
 */
export interface PatientInfo {
  patientId: string;
  periodo: string;
}

/**
 * All calculated metrics for the PDF report
 */
export interface ReportMetrics {
  // Respiratory metrics
  avgSaturacion: number;
  avgPicoFlujo: number;
  mejorPicoFlujo: number;
  avgSpo2Sueno: number;

  // Activity and sleep
  avgPasos: number;
  avgDuracionSueno: number;
  avgEficienciaSueno: number;
  avgFrecuenciaCardiaca: number;

  // Air quality
  avgPM25: number;
  avgCO2: number;
  avgVOC: number;
  avgTemperatura: number;

  // Symptoms
  avgFatiga: number;
  avgDisnea: number;
  avgTos: number;
  avgAnimo: number;
  avgOpresion: number;

  // Correlations
  correlacionEficienciaSueno?: number;
  correlacionSpo2?: number;
  correlacionPicoFlujo?: number;
  correlacionPM25?: number;
  correlacionMinutosActivos?: number;
  correlacionHRV?: number;
}

/**
 * Callbacks for PDF generation state
 */
export interface PdfGenerationCallbacks {
  onProgress?: (progress: number, message: string) => void;
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * PDF Service interface (Dependency Inversion Principle)
 */
export interface IPdfService {
  /**
   * Generate a complete medical report PDF
   */
  generateReport(
    patientInfo: PatientInfo,
    metrics: ReportMetrics,
    callbacks?: PdfGenerationCallbacks
  ): Promise<void>;
}

/**
 * PDF Service implementation
 *
 * Follows SRP: Only responsible for PDF generation
 *
 * @example
 * ```typescript
 * const pdfService = new PdfService();
 * await pdfService.generateReport(patientInfo, metrics, {
 *   onProgress: (progress, message) => console.log(progress, message),
 *   onStart: () => setGenerating(true),
 *   onComplete: () => setGenerating(false),
 * });
 * ```
 */
export class PdfService implements IPdfService {
  /**
   * Update PDF progress UI
   */
  private updatePDFProgress(progress: number, message: string = '') {
    const progressBar = document.getElementById('pdf-progress-bar');
    const progressText = document.getElementById('pdf-progress-text');
    const progressPercent = document.getElementById('pdf-progress-percent');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText && message) {
      progressText.textContent = message;
    }
    if (progressPercent) {
      progressPercent.textContent = `${Math.round(progress)}%`;
    }
  }

  /**
   * Show loading indicator
   */
  private showLoadingIndicator(): HTMLDivElement {
    const loadingMsg = document.createElement('div');
    loadingMsg.id = 'pdf-loading';
    loadingMsg.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px 50px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);z-index:9999;text-align:center;min-width:400px';
    loadingMsg.innerHTML = `
      <div style="font-size:18px;font-weight:bold;margin-bottom:10px;color:#1f2937">Generando PDF...</div>
      <div style="color:#666;margin-bottom:5px" id="pdf-progress-text">Iniciando proceso...</div>
      <div style="color:#3b82f6;font-weight:600;margin-bottom:15px;font-size:24px" id="pdf-progress-percent">0%</div>
      <div style="width:100%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
        <div style="width:0%;height:100%;background:linear-gradient(90deg,#3b82f6,#2563eb);border-radius:3px;transition:width 0.3s ease-out" id="pdf-progress-bar"></div>
      </div>
    `;
    document.body.appendChild(loadingMsg);
    return loadingMsg;
  }

  /**
   * Disable CSS animations for PDF capture
   */
  private disableAnimations(): HTMLStyleElement {
    const disableAnimationsStyleId = 'pdf-disable-animations';
    let disableAnimationsStyle = document.getElementById(disableAnimationsStyleId) as HTMLStyleElement;

    if (!disableAnimationsStyle) {
      disableAnimationsStyle = document.createElement('style');
      disableAnimationsStyle.id = disableAnimationsStyleId;
      document.head.appendChild(disableAnimationsStyle);
    }

    disableAnimationsStyle.textContent = `
      * {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;

    return disableAnimationsStyle;
  }

  /**
   * Create cover page with patient info and metrics summary
   */
  private createCoverPage(
    pdf: jsPDF,
    patientInfo: PatientInfo,
    metrics: ReportMetrics
  ): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 30;

    // ============ PORTADA ============
    // Encabezado con color de fondo
    pdf.setFillColor(59, 130, 246); // Azul
    pdf.rect(0, 0, pageWidth, 45, 'F');

    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORME MÉDICO', pageWidth / 2, 22, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Monitoreo de Salud Respiratoria y Bienestar', pageWidth / 2, 35, { align: 'center' });

    yPosition = 60;

    // Información del paciente en cuadro
    pdf.setFillColor(248, 250, 252); // Gris muy claro
    pdf.setDrawColor(200, 200, 200);
    pdf.roundedRect(20, yPosition, pageWidth - 40, 38, 3, 3, 'FD');

    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL PACIENTE', 30, yPosition);

    yPosition += 7;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);
    pdf.text(`ID Paciente:`, 30, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(patientInfo.patientId, 60, yPosition);

    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Fecha generación:`, 30, yPosition);
    pdf.setFont('helvetica', 'bold');
    const fechaActual = new Date();
    pdf.text(
      fechaActual.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      67,
      yPosition
    );

    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Período análisis:`, 30, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.text(patientInfo.periodo, 64, yPosition);

    yPosition += 12;

    // RESUMEN EJECUTIVO
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 2.5;
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 75, yPosition);
    yPosition += 8;

    // Función para crear cuadro de métricas
    const createMetricBox = (
      x: number,
      y: number,
      width: number,
      height: number,
      title: string,
      metricsText: string[]
    ) => {
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, y, width, height, 2, 2, 'FD');

      pdf.setFontSize(10);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, x + 4, y + 6);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      let metricY = y + 12;
      metricsText.forEach((metric) => {
        pdf.text(metric, x + 4, metricY);
        metricY += 4.5;
      });
    };

    // Cuadro 1: Función Respiratoria
    const boxWidth = 90;
    const boxHeight = 30;
    const boxGap = 5;
    createMetricBox(20, yPosition, boxWidth, boxHeight, 'FUNCIÓN RESPIRATORIA', [
      `Saturación O₂: ${metrics.avgSaturacion}% ${metrics.avgSaturacion >= 95 ? '✓' : '⚠'}`,
      `Pico Flujo: ${metrics.avgPicoFlujo} L/min`,
      `Mejor PF: ${metrics.mejorPicoFlujo} L/min`,
      `SpO₂ Nocturna: ${metrics.avgSpo2Sueno}%`,
    ]);

    // Cuadro 2: Actividad y Sueño
    createMetricBox(20 + boxWidth + boxGap, yPosition, boxWidth, boxHeight, 'ACTIVIDAD Y SUEÑO', [
      `Pasos diarios: ${metrics.avgPasos.toLocaleString()}`,
      `Duración sueño: ${metrics.avgDuracionSueno.toFixed(2)}h`,
      `Eficiencia: ${metrics.avgEficienciaSueno}%`,
      `FC promedio: ${metrics.avgFrecuenciaCardiaca} bpm`,
    ]);

    yPosition += boxHeight + 6;

    // Cuadro 3: Calidad del Aire
    createMetricBox(20, yPosition, boxWidth, boxHeight, 'CALIDAD DEL AIRE', [
      `PM2.5: ${metrics.avgPM25.toFixed(2)} µg/m³ ${metrics.avgPM25 < 25 ? '✓' : '⚠'}`,
      `CO₂: ${metrics.avgCO2.toFixed(0)} ppm`,
      `VOC: ${metrics.avgVOC.toFixed(0)} ppb`,
      `Temperatura: ${metrics.avgTemperatura.toFixed(2)}°C`,
    ]);

    // Cuadro 4: Síntomas (Cuestionario)
    createMetricBox(20 + boxWidth + boxGap, yPosition, boxWidth, boxHeight, 'SÍNTOMAS REPORTADOS', [
      `Fatiga: ${metrics.avgFatiga}/5`,
      `Disnea: ${metrics.avgDisnea}/5`,
      `Tos: ${metrics.avgTos}/5`,
      `Ánimo: ${metrics.avgAnimo}/5`,
    ]);

    //yPosition += boxHeight + 6;

    // Cuadro 5: Correlaciones Clínicas
    createMetricBox(20, yPosition, boxWidth, boxHeight, 'CORRELACIONES CLÍNICAS', [
      `Eficiencia Sueño: ${metrics.correlacionEficienciaSueno || 0}%`,
      `SpO₂: ${metrics.correlacionSpo2 || 0}%`,
      `Pico Flujo: ${metrics.correlacionPicoFlujo || 0} L/min`,
      `PM2.5: ${metrics.correlacionPM25 || 0} µg/m³`,
    ]);

    // Cuadro 6: Actividad y HRV
    createMetricBox(20 + boxWidth + boxGap, yPosition, boxWidth, boxHeight, 'ACTIVIDAD Y HRV', [
      `Minutos Activos: ${metrics.correlacionMinutosActivos || 0} min`,
      `HRV: ${metrics.correlacionHRV || 0} ms`,
      `Pasos: ${metrics.avgPasos.toLocaleString()}`,
      `FC: ${metrics.avgFrecuenciaCardiaca} bpm`,
    ]);

    yPosition += boxHeight + 10;

    // Observaciones Clínicas
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVACIONES CLÍNICAS', 20, yPosition);
    yPosition += 2.5;
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 90, yPosition);
    yPosition += 7;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(55, 65, 81);

    return yPosition;
  }

  /**
   * Generate clinical observations based on metrics
   */
  private generateClinicalObservations(
    pdf: jsPDF,
    metrics: ReportMetrics,
    yPosition: number
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const alertas: string[] = [];
    const positivas: string[] = [];

    // ===== ALERTAS CRÍTICAS Y MODERADAS =====
    // Función respiratoria
    if (metrics.avgSaturacion < 95) {
      alertas.push(`⚠ CRÍTICO: SpO₂ baja (${metrics.avgSaturacion}%). Requiere evaluación médica urgente.`);
    } else if (metrics.avgSaturacion >= 95 && metrics.avgSaturacion < 97) {
      alertas.push(`⚠ SpO₂ en límite bajo (${metrics.avgSaturacion}%). Monitorear de cerca.`);
    }

    if (metrics.avgPicoFlujo < 350) {
      alertas.push(
        `⚠ IMPORTANTE: Pico de flujo muy bajo (${metrics.avgPicoFlujo} L/min). Ajustar tratamiento inmediatamente.`
      );
    } else if (metrics.avgPicoFlujo >= 350 && metrics.avgPicoFlujo < 370) {
      alertas.push(`⚠ Pico de flujo bajo (${metrics.avgPicoFlujo} L/min). Considerar ajuste de medicación.`);
    }

    if (metrics.avgSpo2Sueno < 90) {
      alertas.push(`⚠ CRÍTICO: SpO₂ nocturna muy baja (${metrics.avgSpo2Sueno}%). Evaluar apnea del sueño.`);
    } else if (metrics.avgSpo2Sueno >= 90 && metrics.avgSpo2Sueno < 93) {
      alertas.push(`⚠ SpO₂ nocturna baja (${metrics.avgSpo2Sueno}%). Posible apnea del sueño.`);
    }

    // Sueño
    if (metrics.avgDuracionSueno < 6) {
      alertas.push(
        `⚠ Sueño muy insuficiente (${metrics.avgDuracionSueno.toFixed(2)}h). Riesgo para salud. Objetivo: 7-9h.`
      );
    } else if (metrics.avgDuracionSueno >= 6 && metrics.avgDuracionSueno < 7) {
      alertas.push(
        `⚠ Sueño insuficiente (${metrics.avgDuracionSueno.toFixed(2)}h). Mejorar higiene del sueño. Objetivo: 7-9h.`
      );
    }

    if (metrics.avgEficienciaSueno < 35) {
      alertas.push(
        `⚠ Eficiencia de sueño muy baja (${metrics.avgEficienciaSueno}%). Poco sueño profundo y REM.`
      );
    } else if (metrics.avgEficienciaSueno >= 35 && metrics.avgEficienciaSueno < 40) {
      alertas.push(
        `⚠ Eficiencia de sueño baja (${metrics.avgEficienciaSueno}%). Mejorar calidad del descanso.`
      );
    }

    // Actividad física
    if (metrics.avgPasos < 5000) {
      alertas.push(
        `⚠ Actividad física muy baja (${metrics.avgPasos} pasos/día). Sedentarismo. Meta: 10,000 pasos.`
      );
    } else if (metrics.avgPasos >= 5000 && metrics.avgPasos < 8000) {
      alertas.push(
        `⚠ Actividad física insuficiente (${metrics.avgPasos} pasos/día). Incrementar gradualmente.`
      );
    }

    if (metrics.avgFrecuenciaCardiaca > 100) {
      alertas.push(
        `⚠ Frecuencia cardíaca elevada (${metrics.avgFrecuenciaCardiaca} bpm). Evaluar causa.`
      );
    } else if (metrics.avgFrecuenciaCardiaca < 50) {
      alertas.push(
        `⚠ Frecuencia cardíaca baja (${metrics.avgFrecuenciaCardiaca} bpm). Valoración cardíaca.`
      );
    }

    // Calidad del aire
    if (metrics.avgPM25 > 35) {
      alertas.push(
        `⚠ PM2.5 muy elevado (${metrics.avgPM25.toFixed(2)} µg/m³). Usar purificador de aire. Límite: 25 µg/m³.`
      );
    } else if (metrics.avgPM25 > 25) {
      alertas.push(
        `⚠ PM2.5 elevado (${metrics.avgPM25.toFixed(2)} µg/m³). Mejorar ventilación. Límite: 25 µg/m³.`
      );
    }

    if (metrics.avgCO2 > 1000) {
      alertas.push(
        `⚠ CO₂ muy alto (${metrics.avgCO2.toFixed(0)} ppm). Ventilar espacios inmediatamente.`
      );
    } else if (metrics.avgCO2 > 800) {
      alertas.push(
        `⚠ CO₂ elevado (${metrics.avgCO2.toFixed(0)} ppm). Aumentar ventilación natural.`
      );
    }

    if (metrics.avgVOC > 500) {
      alertas.push(
        `⚠ VOC elevados (${metrics.avgVOC.toFixed(0)} ppb). Reducir productos químicos en el ambiente.`
      );
    }

    // Síntomas del cuestionario
    if (metrics.avgFatiga >= 4) {
      alertas.push(
        `⚠ Fatiga alta (${metrics.avgFatiga}/5). Afecta calidad de vida. Revisar tratamiento.`
      );
    }
    if (metrics.avgDisnea >= 4) {
      alertas.push(
        `⚠ Disnea severa (${metrics.avgDisnea}/5). Dificultad respiratoria significativa.`
      );
    }
    if (metrics.avgTos >= 4) {
      alertas.push(
        `⚠ Tos persistente (${metrics.avgTos}/5). Evaluar control del asma.`
      );
    }
    if (metrics.avgAnimo <= 2) {
      alertas.push(
        `⚠ Estado de ánimo bajo (${metrics.avgAnimo}/5). Considerar apoyo psicológico.`
      );
    }
    if (metrics.avgOpresion >= 4) {
      alertas.push(
        `⚠ Opresión torácica alta (${metrics.avgOpresion}/5). Requiere evaluación médica.`
      );
    }

    // ===== OBSERVACIONES POSITIVAS =====
    if (metrics.avgSaturacion >= 97) {
      positivas.push(
        `✓ Excelente saturación de oxígeno (${metrics.avgSaturacion}%). Función respiratoria óptima.`
      );
    }

    if (metrics.avgPicoFlujo >= 400) {
      positivas.push(
        `✓ Pico de flujo excelente (${metrics.avgPicoFlujo} L/min). Control pulmonar adecuado.`
      );
    } else if (metrics.avgPicoFlujo >= 370) {
      positivas.push(
        `✓ Pico de flujo en rango normal (${metrics.avgPicoFlujo} L/min). Continuar tratamiento.`
      );
    }

    if (metrics.avgDuracionSueno >= 7 && metrics.avgDuracionSueno <= 9) {
      positivas.push(
        `✓ Duración de sueño ideal (${metrics.avgDuracionSueno.toFixed(2)}h). Favorece recuperación y salud.`
      );
    }

    if (metrics.avgEficienciaSueno >= 50) {
      positivas.push(
        `✓ Excelente eficiencia de sueño (${metrics.avgEficienciaSueno}%). Buen sueño profundo y REM.`
      );
    } else if (metrics.avgEficienciaSueno >= 40) {
      positivas.push(
        `✓ Buena eficiencia de sueño (${metrics.avgEficienciaSueno}%). Descanso reparador.`
      );
    }

    if (metrics.avgPasos >= 10000) {
      positivas.push(
        `✓ Meta de pasos alcanzada (${metrics.avgPasos.toLocaleString()} pasos/día). Excelente nivel de actividad.`
      );
    } else if (metrics.avgPasos >= 8000) {
      positivas.push(
        `✓ Buena actividad física (${metrics.avgPasos.toLocaleString()} pasos/día). Cerca de la meta.`
      );
    }

    if (metrics.avgPM25 < 12) {
      positivas.push(
        `✓ Aire muy limpio (PM2.5: ${metrics.avgPM25.toFixed(2)} µg/m³). Ambiente saludable.`
      );
    } else if (metrics.avgPM25 <= 25) {
      positivas.push(
        `✓ Calidad del aire aceptable (PM2.5: ${metrics.avgPM25.toFixed(2)} µg/m³).`
      );
    }

    if (metrics.avgCO2 <= 800) {
      positivas.push(
        `✓ Buena ventilación (CO₂: ${metrics.avgCO2.toFixed(0)} ppm). Espacios bien aireados.`
      );
    }

    if (metrics.avgFatiga <= 2) {
      positivas.push(
        `✓ Niveles bajos de fatiga (${metrics.avgFatiga}/5). Buena energía.`
      );
    }
    if (metrics.avgDisnea <= 2) {
      positivas.push(
        `✓ Respiración sin dificultad (${metrics.avgDisnea}/5). Control respiratorio adecuado.`
      );
    }
    if (metrics.avgTos <= 2) {
      positivas.push(
        `✓ Tos controlada (${metrics.avgTos}/5). Síntoma bien manejado.`
      );
    }
    if (metrics.avgAnimo >= 4) {
      positivas.push(
        `✓ Excelente estado de ánimo (${metrics.avgAnimo}/5). Bienestar psicológico positivo.`
      );
    }

    // Combinar alertas y positivas
    const todasObservaciones = [...alertas, ...positivas];

    if (todasObservaciones.length === 0) {
      // Sin observaciones - todo en rangos aceptables
      pdf.setFillColor(220, 252, 231); // Verde claro
      pdf.setDrawColor(134, 239, 172);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 8, 2, 2, 'FD');
      pdf.setTextColor(22, 163, 74);
      pdf.setFont('helvetica', 'bold');
      pdf.text('✓ Todas las métricas dentro de rangos aceptables', 25, yPosition + 5.5);
    } else {
      // Hay observaciones - mostrar con códigos de color
      let obsYPosition = yPosition;

      // Primero mostrar alertas si existen
      if (alertas.length > 0) {
        pdf.setFillColor(254, 243, 199); // Amarillo claro
        pdf.setDrawColor(253, 224, 71);
        const boxAlertHeight = 8 + alertas.length * 5;
        pdf.roundedRect(20, obsYPosition, pageWidth - 40, boxAlertHeight, 2, 2, 'FD');
        obsYPosition += 5;

        pdf.setTextColor(146, 64, 14); // Marrón oscuro
        pdf.setFont('helvetica', 'normal');
        alertas.forEach((obs) => {
          const lines = pdf.splitTextToSize(obs, pageWidth - 50);
          pdf.text(lines, 25, obsYPosition);
          obsYPosition += lines.length * 5;
        });

        obsYPosition += 5;
      }

      // Luego mostrar observaciones positivas si existen
      if (positivas.length > 0) {
        pdf.setFillColor(220, 252, 231); // Verde claro
        pdf.setDrawColor(134, 239, 172);
        const boxPosHeight = 8 + positivas.length * 5;
        pdf.roundedRect(20, obsYPosition, pageWidth - 40, boxPosHeight, 2, 2, 'FD');
        obsYPosition += 5;

        pdf.setTextColor(22, 101, 52); // Verde oscuro
        pdf.setFont('helvetica', 'normal');
        positivas.forEach((obs) => {
          const lines = pdf.splitTextToSize(obs, pageWidth - 50);
          pdf.text(lines, 25, obsYPosition);
          obsYPosition += lines.length * 5;
        });
      }
    }
  }

  /**
   * Capture and add chart images from tabs
   */
  private async captureCharts(
    pdf: jsPDF,
    domtoimage: typeof import('dom-to-image-more'),
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Variables para layout de 2 columnas
    let currentColumn = 0;
    let leftColumnY = 0;
    let rightColumnY = 0;
    const columnWidth = (pageWidth - 50) / 2;
    const leftColumnX = 20;
    const rightColumnX = leftColumnX + columnWidth + 10;

    const addChartImage = async (card: Element, _title: string, useColumns = true) => {
      try {
        const fullCard =
          card.closest('.rounded-xl.border, .rounded-lg.border, .shadow') || card.parentElement || card;
        const element = fullCard as HTMLElement;

        if (!element || element.offsetHeight === 0) {
          return false;
        }

        const cardTitle = element.querySelector('.text-lg, .font-semibold, h3, h2');
        const cardTitleText = cardTitle ? cardTitle.textContent?.trim() : '';

        const tempClass = 'pdf-capture-no-borders';
        element.classList.add(tempClass);

        const styleId = 'pdf-capture-styles';
        let styleElement = document.getElementById(styleId) as HTMLStyleElement;

        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
          .${tempClass},
          .${tempClass} * {
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }
        `;

        const imgData = await domtoimage.toPng(element, {
          quality: 0.8,
          bgcolor: '#ffffff',
          width: element.offsetWidth * 1.2,
          height: element.offsetHeight * 1.2,
          style: {
            transform: 'scale(1.2)',
            transformOrigin: 'top left',
          },
        });

        element.classList.remove(tempClass);

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imgData;
        });

        const imgWidth = useColumns ? columnWidth : pageWidth - 40;
        const imgHeight = (img.height * imgWidth) / img.width;
        const maxImgHeight = useColumns ? 60 : 55;
        const finalHeight = Math.min(imgHeight, maxImgHeight);

        let xPosition = 20;
        let currentY = yPosition;

        if (useColumns) {
          if (leftColumnY <= rightColumnY) {
            currentColumn = 0;
            xPosition = leftColumnX;
            currentY = leftColumnY;
          } else {
            currentColumn = 1;
            xPosition = rightColumnX;
            currentY = rightColumnY;
          }

          if (currentY + finalHeight + 25 > pageHeight - 20) {
            pdf.addPage();
            leftColumnY = 20;
            rightColumnY = 20;
            currentY = 20;
            xPosition = leftColumnX;
            currentColumn = 0;
          }
        } else {
          if (yPosition + finalHeight + 25 > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          currentY = yPosition;
        }

        if (cardTitleText) {
          pdf.setFontSize(8);
          pdf.setTextColor(55, 65, 81);
          pdf.setFont('helvetica', 'bold');
          pdf.text(cardTitleText, xPosition, currentY, { maxWidth: imgWidth });
          currentY += 4;
        }

        pdf.addImage(imgData, 'PNG', xPosition, currentY, imgWidth, finalHeight);
        currentY += finalHeight + 6;

        if (useColumns) {
          if (currentColumn === 0) {
            leftColumnY = currentY;
          } else {
            rightColumnY = currentY;
          }
          yPosition = Math.max(leftColumnY, rightColumnY);
        } else {
          yPosition = currentY;
        }

        return true;
      } catch {
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text('[Gráfica - error de captura]', 20, yPosition);
        yPosition += 8;
        return false;
      }
    };

    const captureTabCharts = async (tabName: string, title: string, maxCharts?: number) => {
      pdf.addPage();
      yPosition = 20;

      // Encabezado de sección
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(20, yPosition, pageWidth - 40, 12, 2, 2, 'FD');

      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title.toUpperCase(), 25, yPosition + 8);

      yPosition += 17;
      leftColumnY = yPosition;
      rightColumnY = yPosition;

      const labels: Record<string, string> = {
        resumen: 'Resumen',
        aire1: 'Aire Interior',
        cuestionario: 'Cuestionario',
        pico: 'Pico Flujo',
        actividad: 'Actividad',
        sueno: 'Sueño',
      };

      const labelText = labels[tabName];
      if (!labelText) return;

      let tabButton: HTMLElement | null = null;
      const allTabButtons = document.querySelectorAll('button[data-state]');
      for (const btn of Array.from(allTabButtons)) {
        if (btn.textContent?.trim() === labelText) {
          tabButton = btn as HTMLElement;
          break;
        }
      }

      if (!tabButton) return;

      tabButton.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const allCharts = document.querySelectorAll('.recharts-wrapper');
      const visibleCharts: Element[] = [];

      for (const chart of Array.from(allCharts)) {
        const element = chart as HTMLElement;
        const rect = element.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          window.getComputedStyle(element).display !== 'none' &&
          window.getComputedStyle(element).visibility !== 'hidden';
        if (isVisible) {
          visibleCharts.push(chart);
        }
      }

      if (visibleCharts.length === 0) return;

      const capturedCards = new Set<Element>();
      let capturedCount = 0;

      for (const chart of visibleCharts) {
        const card = chart.closest('.border, .shadow, .rounded-xl, .rounded-lg') || chart.parentElement;

        if (card && !capturedCards.has(card)) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          await addChartImage(card, '');
          capturedCards.add(card);
          capturedCount++;

          if (maxCharts && capturedCount >= maxCharts) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    };

    // Capturar tabs (orden según interfaz)
    await captureTabCharts('resumen', 'Resumen General');
    onProgress?.(20, 'Resumen capturado...');

    await captureTabCharts('aire1', 'Calidad del Aire Interior - Monitoreo Completo');
    onProgress?.(35, 'Calidad del aire capturada...');

    await captureTabCharts('cuestionario', 'Cuestionario de Síntomas');
    onProgress?.(50, 'Cuestionario capturado...');

    await captureTabCharts('pico', 'Función Pulmonar - Pico de Flujo');
    onProgress?.(65, 'Función pulmonar capturada...');

    await captureTabCharts('actividad', 'Actividad Física');
    onProgress?.(75, 'Actividad física capturada...');

    await captureTabCharts('sueno', 'Análisis del Sueño');
    onProgress?.(90, 'Análisis de sueño capturado...');

    // Volver al tab resumen
    const resumenTab = document.querySelector('[value="resumen"]') as HTMLElement;
    if (resumenTab) resumenTab.click();
  }

  /**
   * Add footer to all pages
   */
  private addFooters(pdf: jsPDF): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = (pdf.internal as { pages: unknown[] }).pages.length - 1;

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.setFont('helvetica', 'normal');

      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, pageHeight - 8);

      pdf.text(
        'Aither Health - Sistema de Monitoreo Respiratorio',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );

      pdf.setFont('helvetica', 'bold');
      pdf.text(`Pág. ${i}/${totalPages}`, pageWidth - 20, pageHeight - 8, {
        align: 'right',
      });
    }
  }

  /**
   * Cleanup temporary styles
   */
  private cleanup(): void {
    const styleElement = document.getElementById('pdf-capture-styles');
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    const animStyleToRemove = document.getElementById('pdf-disable-animations');
    if (animStyleToRemove && animStyleToRemove.parentNode) {
      animStyleToRemove.parentNode.removeChild(animStyleToRemove);
    }
  }

  /**
   * Generate a complete medical report PDF
   */
  async generateReport(
    patientInfo: PatientInfo,
    metrics: ReportMetrics,
    callbacks?: PdfGenerationCallbacks
  ): Promise<void> {
    const loadingMsg = this.showLoadingIndicator();

    try {
      callbacks?.onStart?.();

      this.updatePDFProgress(5, 'Preparando documento...');
      callbacks?.onProgress?.(5, 'Preparando documento...');

      this.disableAnimations();

      // Importar dom-to-image-more
      const domtoimage = (await import('dom-to-image-more')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Create cover page
      const yPosition = this.createCoverPage(pdf, patientInfo, metrics);

      // Add clinical observations
      this.generateClinicalObservations(pdf, metrics, yPosition);

      this.updatePDFProgress(10, 'Portada creada, capturando gráficas...');
      callbacks?.onProgress?.(10, 'Portada creada, capturando gráficas...');

      // Capture charts
      await this.captureCharts(pdf, domtoimage, (progress, message) => {
        this.updatePDFProgress(progress, message);
        callbacks?.onProgress?.(progress, message);
      });

      this.updatePDFProgress(93, 'Agregando pies de página...');
      callbacks?.onProgress?.(93, 'Agregando pies de página...');

      // Add footers
      this.addFooters(pdf);

      this.updatePDFProgress(97, 'Guardando PDF...');
      callbacks?.onProgress?.(97, 'Guardando PDF...');

      // Save PDF
      const fechaStr = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      const fileName = `Informe_Medico_${patientInfo.patientId}_${patientInfo.periodo.replace(/ /g, '_')}_${fechaStr}.pdf`;
      pdf.save(fileName);

      this.updatePDFProgress(100, '¡Completado!');
      callbacks?.onProgress?.(100, '¡Completado!');

      await new Promise((resolve) => setTimeout(resolve, 200));

      this.cleanup();
      document.body.removeChild(loadingMsg);

      callbacks?.onComplete?.();
    } catch (error) {
      console.error('Error al generar PDF:', error);

      this.cleanup();

      const loadingElement = document.getElementById('pdf-loading');
      if (loadingElement) document.body.removeChild(loadingElement);

      callbacks?.onError?.(error as Error);
      alert('Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
  }
}

/**
 * Default export for convenience
 */
export const pdfService = new PdfService();
