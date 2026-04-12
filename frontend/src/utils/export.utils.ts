export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>,
): void {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const keys = Object.keys(data[0]);
  const headerLabels = headers || {};
  const csvHeaders = keys.map((key) => headerLabels[key] || key);

  const csvRows = [
    csvHeaders.join(','),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(','),
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>,
): void {
  exportToCSV(data, filename, headers);
}

