import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface FarmData {
  farmName: string;
  location: string;
  totalAcreage: number;
  soilMoisture: number;
  temperature: number;
  crops: Array<{ name: string; acreage: number; harvestDate: string }>;
  weather: { condition: string; temperature: number; humidity: number };
  irrigationData: Array<{ date: string; volume: number }>;
}

/**
 * Export farm data as PDF report with charts and summary
 */
export const exportFarmReportPDF = async (farmData: FarmData, elementId?: string) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text('Farm Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Farm Summary Section
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Farm Summary', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(11);
    doc.setTextColor(60);
    
    const summaryData = [
      [`Farm Name:`, farmData.farmName],
      [`Location:`, farmData.location],
      [`Total Acreage:`, `${farmData.totalAcreage} acres`],
      [`Current Temperature:`, `${farmData.temperature}°C`],
      [`Soil Moisture:`, `${farmData.soilMoisture}%`],
      [`Weather Condition:`, farmData.weather.condition]
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.text(value, 100, yPosition);
      yPosition += 8;
    });

    // Crops Section
    yPosition += 5;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Crops & Acreage', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);

    farmData.crops.forEach((crop) => {
      doc.text(`• ${crop.name} - ${crop.acreage} acres (Harvest: ${crop.harvestDate})`, 25, yPosition);
      yPosition += 8;
    });

    // Irrigation Data
    yPosition += 5;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Recent Irrigation Data', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(80);

    farmData.irrigationData.slice(-5).forEach((record) => {
      doc.text(`${record.date}: ${record.volume} liters`, 25, yPosition);
      yPosition += 7;
    });

    // Add chart if element exists
    if (elementId) {
      try {
        const element = document.getElementById(elementId);
        if (element) {
          yPosition += 15;
          if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 20;
          }

          const canvas = await html2canvas(element, { backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          doc.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
        }
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }

    // Footer
    const finalPageCount = doc.internal.pages.length - 1;
    doc.setFontSize(9);
    doc.setTextColor(150);
    for (let i = 1; i <= finalPageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${finalPageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    const fileName = `farm-report-${farmData.farmName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

/**
 * Export farm data as Excel spreadsheet
 */
export const exportFarmDataExcel = (farmData: FarmData) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Farm Summary Sheet
    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['FARM SUMMARY'],
      [],
      ['Farm Name', farmData.farmName],
      ['Location', farmData.location],
      ['Total Acreage', farmData.totalAcreage],
      ['Current Temperature', `${farmData.temperature}°C`],
      ['Soil Moisture', `${farmData.soilMoisture}%`],
      ['Weather Condition', farmData.weather.condition],
      ['Report Generated', new Date().toLocaleString()]
    ]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Crops Sheet
    const cropsData = farmData.crops.map(crop => [
      crop.name,
      crop.acreage,
      crop.harvestDate
    ]);
    const cropsSheet = XLSX.utils.aoa_to_sheet(
      [['Crop Name', 'Acreage', 'Harvest Date'], ...cropsData]
    );
    XLSX.utils.book_append_sheet(workbook, cropsSheet, 'Crops');

    // Irrigation Data Sheet
    const irrigationData = farmData.irrigationData.map(record => [
      record.date,
      record.volume
    ]);
    const irrigationSheet = XLSX.utils.aoa_to_sheet(
      [['Date', 'Volume (Liters)'], ...irrigationData]
    );
    XLSX.utils.book_append_sheet(workbook, irrigationSheet, 'Irrigation');

    // Save file
    const fileName = `farm-data-${farmData.farmName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};

/**
 * Export soil data report
 */
export const exportSoilDataReport = (soilData: any[]) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    const sheet = XLSX.utils.aoa_to_sheet([
      ['Date', 'Soil Moisture (%)', 'Temperature (°C)', 'pH Level', 'Nitrogen (mg/kg)', 'Phosphorus (mg/kg)', 'Potassium (mg/kg)'],
      ...soilData.map(record => [
        record.date,
        record.moisture,
        record.temperature,
        record.ph,
        record.nitrogen,
        record.phosphorus,
        record.potassium
      ])
    ]);

    XLSX.utils.book_append_sheet(workbook, sheet, 'Soil Data');
    
    const fileName = `soil-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting soil data:', error);
    throw error;
  }
};

/**
 * Export crop yield predictions and analysis
 */
export const exportYieldAnalysis = (yieldData: any) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Predictions Sheet
    const predictionsSheet = XLSX.utils.aoa_to_sheet([
      ['Crop', 'Current Yield (tons/acre)', 'Predicted Yield (tons/acre)', 'Growth %', 'Confidence'],
      ...(yieldData.predictions || []).map((pred: any) => [
        pred.crop,
        pred.current,
        pred.predicted,
        `${pred.growth}%`,
        `${pred.confidence}%`
      ])
    ]);

    // Recommendations Sheet
    const recommendationsSheet = XLSX.utils.aoa_to_sheet([
      ['Category', 'Recommendation', 'Priority', 'Impact'],
      ...(yieldData.recommendations || []).map((rec: any) => [
        rec.category,
        rec.text,
        rec.priority,
        rec.impact
      ])
    ]);

    XLSX.utils.book_append_sheet(workbook, predictionsSheet, 'Predictions');
    XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');

    const fileName = `yield-analysis-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting yield analysis:', error);
    throw error;
  }
};
