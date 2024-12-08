import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DateRangeSelector } from './components/DateRangeSelector';
import { CashBookTable } from './components/CashBookTable';
import { EventStatusFilter } from './components/EventStatusFilter';
import { TerminologyInfo } from './components/TerminologyInfo';
import { parseCsvFile } from './utils/csvParser';
import { analyzeCashEntries } from './utils/cashBookAnalyzer';
import { CashEntry, DailySummary, FilterType } from './types';
import { subDays, startOfDay, endOfDay } from 'date-fns';

function App() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<FilterType>>(new Set());

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      const parsedEntries = await parseCsvFile(file);
      
      if (parsedEntries.length === 0) {
        throw new Error('Keine gültigen Einträge in der CSV-Datei gefunden');
      }

      // Sort entries by date
      const sortedEntries = [...parsedEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Set date range based on the entries
      const firstDate = startOfDay(sortedEntries[0].date);
      const lastDate = endOfDay(sortedEntries[sortedEntries.length - 1].date);
      
      setStartDate(firstDate);
      setEndDate(lastDate);
      setEntries(parsedEntries);
      
      const summaries = analyzeCashEntries(parsedEntries, firstDate, lastDate, selectedFilters);
      setDailySummaries(summaries);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Parsen der CSV-Datei';
      setError(errorMessage);
      console.error('Fehler beim Parsen der CSV-Datei:', error);
    }
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    if (entries.length > 0) {
      const summaries = analyzeCashEntries(entries, start, end, selectedFilters);
      setDailySummaries(summaries);
    }
  };

  const handleFilterToggle = (filter: FilterType) => {
    const newSelectedFilters = new Set(selectedFilters);
    if (newSelectedFilters.has(filter)) {
      newSelectedFilters.delete(filter);
    } else {
      newSelectedFilters.add(filter);
    }
    setSelectedFilters(newSelectedFilters);
    
    if (entries.length > 0) {
      const summaries = analyzeCashEntries(entries, startDate, endDate, newSelectedFilters);
      setDailySummaries(summaries);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            SumUp Kassenbuch Analyse
          </h1>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-gray-600">
              Mit diesem Tool können Sie Ihre SumUp-Kassenbucheinträge analysieren und überwachen. 
              Hier sind die wichtigsten Funktionen:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>
                <strong>CSV-Import:</strong> Laden Sie Ihren Kassenbericht aus dem SumUp-Portal hoch
              </li>
              <li>
                <strong>Datumsfiltierung:</strong> Analysieren Sie Einträge für bestimmte Zeiträume
              </li>
              <li>
                <strong>Detailansicht:</strong> Sehen Sie alle Transaktionen eines Tages im Detail
              </li>
              <li>
                <strong>Statusfilter:</strong> Filtern Sie nach speziellen Ereignissen wie fehlende Anfangssalden oder Schlussbilanz
              </li>
              <li>
                <strong>Differenzanalyse:</strong> Erkennen Sie Abweichungen zwischen erwarteten und tatsächlichen Beträgen
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <TerminologyInfo />
          </div>
          
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} />
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {entries.length > 0 && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <DateRangeSelector
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={(date) => handleDateRangeChange(date, endDate)}
                        onEndDateChange={(date) => handleDateRangeChange(startDate, date)}
                      />
                      <EventStatusFilter
                        selectedFilters={selectedFilters}
                        onFilterToggle={handleFilterToggle}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-4 text-sm text-gray-600">
                    {selectedFilters.size > 0 ? (
                      <span>Gefilterte Einträge: {dailySummaries.length}</span>
                    ) : (
                      <span>Anzahl Einträge: {dailySummaries.length}</span>
                    )}
                  </div>
                  <CashBookTable data={dailySummaries} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;