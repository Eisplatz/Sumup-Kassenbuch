import React, { useState } from 'react';
import { FilterType } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EventStatusFilterProps {
  selectedFilters: Set<FilterType>;
  onFilterToggle: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { type: FilterType; description: string }[] = [
  { type: 'kein Anfangssaldo', description: 'Tage ohne Anfangssaldo' },
  { type: 'keine Schlussbilanz', description: 'Tage ohne Schlussbilanz' },
  { type: 'Kasse nicht aktiv', description: 'Tage ohne Kassenbewegungen' },
  { type: 'keine Bargeldauszahlung', description: 'Tage ohne Bargeldauszahlung' },
  { type: 'Anfangssaldo vorhanden', description: 'Tage mit Anfangssaldo' },
  { type: 'Schlussbilanz vorhanden', description: 'Tage mit Schlussbilanz' },
  { type: 'Bargeldauszahlung vorhanden', description: 'Tage mit Bargeldauszahlung' },
  { type: 'Bargeldeingang vermerkt', description: 'Tage mit Bargeldeingang' },
  { type: 'Bargeldrückerstattung vermerkt', description: 'Tage mit Bargeldrückerstattung' },
];

export const EventStatusFilter: React.FC<EventStatusFilterProps> = ({
  selectedFilters,
  onFilterToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Set<FilterType>>(new Set(selectedFilters));

  const handleFilterToggle = (filter: FilterType) => {
    const newTempFilters = new Set(tempFilters);
    if (newTempFilters.has(filter)) {
      newTempFilters.delete(filter);
    } else {
      newTempFilters.add(filter);
    }
    setTempFilters(newTempFilters);
  };

  const handleApplyFilters = () => {
    tempFilters.forEach(filter => {
      if (!selectedFilters.has(filter)) {
        onFilterToggle(filter);
      }
    });
    selectedFilters.forEach(filter => {
      if (!tempFilters.has(filter)) {
        onFilterToggle(filter);
      }
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-48">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTempFilters(new Set(selectedFilters));
        }}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>Filter ({selectedFilters.size})</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 w-80 mt-2 origin-top-left bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-4">
            <div className="space-y-2">
              {FILTER_OPTIONS.map(({ type, description }) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tempFilters.has(type)}
                    onChange={() => handleFilterToggle(type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{description}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Filter anwenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};