import Papa from 'papaparse';
import { CashEntry } from '../types';
import { parseISO } from 'date-fns';

export const parseCsvFile = (file: File): Promise<CashEntry[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!Array.isArray(results.data) || results.data.length <= 1) {
            throw new Error('Die CSV-Datei enthält keine gültigen Daten');
          }

          const entries: CashEntry[] = results.data
            .slice(1) // Skip header row
            .filter((row: any[]) => Array.isArray(row) && row.length >= 15)
            .map((row: any[], index: number) => {
              try {
                // Safely extract date string and parse it
                const dateStr = row[1]?.toString() || '';
                const dateParts = dateStr.split(' ');
                
                if (!dateParts[0]) {
                  throw new Error(`Ungültiges Datumsformat in Zeile ${index + 2}`);
                }

                const [day, month, year] = dateParts[0].split('.');
                if (!day || !month || !year) {
                  throw new Error(`Ungültiges Datumsformat in Zeile ${index + 2}`);
                }

                const date = parseISO(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                if (isNaN(date.getTime())) {
                  throw new Error(`Ungültiges Datum in Zeile ${index + 2}`);
                }

                // Add time if available
                if (dateParts[1]) {
                  const [hours, minutes] = dateParts[1].split(':');
                  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                }

                // Safely parse numeric values
                const parseAmount = (value: string) => {
                  if (!value) return 0;
                  const cleanValue = value.toString().replace(',', '.');
                  const parsed = parseFloat(cleanValue);
                  return isNaN(parsed) ? 0 : parsed;
                };

                const income = parseAmount(row[8]);
                const expense = parseAmount(row[9]);
                const balance = parseAmount(row[12]);
                const expectedAmount = row[13] ? parseAmount(row[13]) : undefined;
                const difference = row[14] ? parseAmount(row[14]) : undefined;

                return {
                  date,
                  eventName: row[5]?.toString() || '',
                  reason: row[6]?.toString() || '',
                  note: row[7]?.toString() || '',
                  income,
                  expense,
                  balance,
                  expectedAmount,
                  difference,
                };
              } catch (error) {
                console.warn(`Fehler beim Parsen der Zeile ${index + 2}:`, error);
                return null;
              }
            })
            .filter((entry): entry is CashEntry => 
              entry !== null && 
              entry.date instanceof Date && 
              !isNaN(entry.date.getTime())
            );

          if (entries.length === 0) {
            throw new Error('Keine gültigen Einträge in der CSV-Datei gefunden');
          }

          resolve(entries);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Fehler beim Parsen der CSV-Datei'));
        }
      },
      error: (error) => reject(new Error(`Fehler beim Lesen der CSV-Datei: ${error.message}`)),
    });
  });
};