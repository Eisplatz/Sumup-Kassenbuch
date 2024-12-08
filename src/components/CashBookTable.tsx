import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DailySummary } from '../types';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { EventTypesCell } from './EventTypesCell';
import { EventStatusCell } from './EventStatusCell';
import { DayDetailsView } from './DayDetailsView';

interface CashBookTableProps {
  data: DailySummary[];
}

const columnHelper = createColumnHelper<DailySummary>();

export const CashBookTable: React.FC<CashBookTableProps> = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const topScroll = topScrollRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (!topScroll || !bottomScroll) return;

    const handleTopScroll = () => {
      if (bottomScroll) {
        bottomScroll.scrollLeft = topScroll.scrollLeft;
      }
    };

    const handleBottomScroll = () => {
      if (topScroll) {
        topScroll.scrollLeft = bottomScroll.scrollLeft;
      }
    };

    topScroll.addEventListener('scroll', handleTopScroll);
    bottomScroll.addEventListener('scroll', handleBottomScroll);

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll);
      bottomScroll.removeEventListener('scroll', handleBottomScroll);
    };
  }, []);

  const columns = [
    columnHelper.accessor('date', {
      header: 'Datum',
      size: 120,
      cell: (info) => (
        <div className="space-y-2">
          <div>{format(info.getValue(), 'dd.MM.yyyy')}</div>
          <button
            onClick={() => setSelectedDay(info.row.original)}
            className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Details
          </button>
        </div>
      ),
    }),
    columnHelper.accessor('openingBalance', {
      header: 'Anfangsbestand',
      size: 120,
      cell: (info) => info.getValue().toFixed(2) + ' €',
    }),
    columnHelper.accessor('totalIncome', {
      header: 'Einnahmen',
      size: 120,
      cell: (info) => info.getValue().toFixed(2) + ' €',
    }),
    columnHelper.accessor('totalExpense', {
      header: 'Ausgaben',
      size: 120,
      cell: (info) => info.getValue().toFixed(2) + ' €',
    }),
    columnHelper.accessor('closingBalance', {
      header: 'Endbestand',
      size: 120,
      cell: (info) => info.getValue().toFixed(2) + ' €',
    }),
    columnHelper.accessor('discrepancies', {
      header: 'Differenzen',
      size: 120,
      cell: (info) => {
        const value = info.getValue();
        return (
          <span className={value !== 0 ? 'text-red-600 font-semibold' : ''}>
            {value.toFixed(2)} €
          </span>
        );
      },
    }),
    columnHelper.accessor((row) => row, {
      id: 'eventTypes',
      header: 'Ereignisse',
      size: 300,
      cell: (info) => (
        <EventTypesCell 
          eventTypes={info.getValue().eventTypes} 
          openingBalance={info.getValue().openingBalance}
        />
      ),
    }),
    columnHelper.accessor('eventTypes', {
      id: 'eventStatus',
      header: 'Ereignisstatus',
      size: 200,
      cell: (info) => <EventStatusCell eventTypes={info.getValue()} />,
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="border rounded-lg shadow bg-white">
        {/* Top scrollbar */}
        <div 
          ref={topScrollRef}
          className="overflow-x-auto border-b"
          style={{ height: '16px' }}
        >
          <div style={{ width: '1220px', height: '1px' }} />
        </div>

        {/* Main table with bottom scrollbar */}
        <div 
          ref={bottomScrollRef}
          className="overflow-x-auto"
        >
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1220px' }}>
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.column.getSize() }}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="px-3 py-2 text-xs text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDay && (
        <DayDetailsView
          entries={selectedDay.transactions}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};