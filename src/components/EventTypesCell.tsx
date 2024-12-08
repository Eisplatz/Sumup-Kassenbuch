import React from 'react';
import { AlertTriangle, Vault, CircleDollarSign, ArrowRightLeft, ClipboardCheck, Scale } from 'lucide-react';
import { EventTypeInfo } from '../types';
import { format } from 'date-fns';

interface EventTypesCellProps {
  eventTypes: EventTypeInfo[];
  openingBalance: number;
}

const formatAmount = (amount: number | undefined) => {
  if (amount === undefined) return '';
  return `${amount.toFixed(2)} €`;
};

export const EventTypesCell: React.FC<EventTypesCellProps> = ({ eventTypes, openingBalance }) => {
  const renderEventInfo = (event: EventTypeInfo) => {
    if (event.eventName === 'Bargeldverkauf' || event.eventName === 'Wechselgeld in bar') {
      return null;
    }

    const isHighlightedOrange = event.eventName === 'Bargeldrückerstattung' || event.eventName === 'Bargeldeingang';
    const isHighlightedGreen = event.eventName === 'Bargeldauszahlung';
    const isHighlightedBlue = event.eventName === 'Anfangssaldo';
    const isHighlightedPurple = event.eventName === 'Schlussbilanz';

    const getHighlightClass = () => {
      if (isHighlightedOrange) return 'bg-orange-50';
      if (isHighlightedGreen) return 'bg-green-50';
      if (isHighlightedBlue) return 'bg-blue-50';
      if (isHighlightedPurple) return 'bg-purple-50';
      return '';
    };

    const getIcon = () => {
      if (isHighlightedOrange) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      if (isHighlightedGreen) return <Vault className="w-5 h-5 text-green-500" />;
      if (isHighlightedBlue) return <CircleDollarSign className="w-5 h-5 text-blue-500" />;
      if (isHighlightedPurple) return <Scale className="w-5 h-5 text-purple-500" />;
      return null;
    };

    const baseContent = (
      <>
        <div className="font-medium flex items-center gap-2">
          {getIcon()}
          <span>{format(event.date, 'HH:mm')} - {event.eventName}</span>
        </div>
        {event.reason && <div className="text-gray-600">Grund: {event.reason}</div>}
        {event.note && <div className="text-gray-600">Anmerkung: {event.note}</div>}
      </>
    );

    const wrapperClass = `p-2 rounded ${getHighlightClass()}`;

    switch (event.eventName) {
      case 'Bargeldeingang':
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.income !== undefined && (
              <div className="text-gray-600">Einnahme: {formatAmount(event.income)}</div>
            )}
          </div>
        );

      case 'Bargeldauszahlung':
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.expense !== undefined && (
              <div className="text-gray-600">Ausgabe: {formatAmount(Math.abs(event.expense))}</div>
            )}
          </div>
        );

      case 'Anfangssaldo':
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.balance !== undefined && (
              <div className="text-gray-600">Guthaben: {formatAmount(event.balance)}</div>
            )}
          </div>
        );

      case 'Schlussbilanz':
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.balance !== undefined && (
              <div className="text-gray-600">Guthaben: {formatAmount(event.balance)}</div>
            )}
            {event.expectedAmount !== undefined && (
              <div className="text-gray-600">Erwarteter Betrag: {formatAmount(event.expectedAmount)}</div>
            )}
          </div>
        );

      case 'Bargeldrückerstattung':
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.expense !== undefined && (
              <div className="text-gray-600">Ausgabe: {formatAmount(Math.abs(event.expense))}</div>
            )}
          </div>
        );

      default:
        return (
          <div className={wrapperClass}>
            {baseContent}
            {event.reason && <div className="text-gray-600">({event.reason})</div>}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm pb-2 border-b">
        <div className="p-2 rounded bg-gray-50">
          <div className="font-medium">Anfangsbestand laut Ende Vortag:</div>
          <div className="text-gray-600">{formatAmount(openingBalance)}</div>
        </div>
      </div>
      {eventTypes
        .filter(event => event.eventName !== 'Bargeldverkauf' && event.eventName !== 'Wechselgeld in bar')
        .map((event, index) => (
          <div key={index} className="text-sm border-b last:border-b-0 pb-2">
            {renderEventInfo(event)}
          </div>
        ))}
    </div>
  );
};