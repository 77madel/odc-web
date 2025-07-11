import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], fileName: string): void {
  // Créer une feuille à partir des données
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Générer le fichier Excel
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
