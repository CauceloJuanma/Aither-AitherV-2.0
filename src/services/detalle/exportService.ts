// Export service following Single Responsibility Principle
// This service only handles CSV exports

/**
 * Generic function to export data to CSV format
 * @param data Array of objects to export
 * @param filename Name of the file to download
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(','), // headers
    ...data.map((row) =>
      headers
        .map((field) => {
          const value = row[field] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Generic function to download a file
 * @param content File content
 * @param filename Name of the file
 * @param mimeType MIME type of the file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export service interface for dependency injection
 */
export interface IExportService {
  exportToCSV(data: Record<string, unknown>[], filename: string): void;
}

/**
 * Default export service implementation
 */
export const ExportService: IExportService = {
  exportToCSV,
};
