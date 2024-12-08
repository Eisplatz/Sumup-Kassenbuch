import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { EventType, EventTypeInfo } from '../types';

const EVENT_TYPES: EventType[] = [
  'Bargeldeingang',
  'Bargeldverkauf',
  'Bargeldauszahlung',
  'Anfangssaldo',
  'Schlussbilanz',
  'Wechselgeld in bar',
  'Bargeldrückerstattung',
];

interface EventStatusCellProps {
  eventTypes: EventTypeInfo[];
}

export const EventStatusCell: React.FC<EventStatusCellProps> = ({ eventTypes }) => {
  const occurredEvents = new Set(eventTypes.map(et => et.eventName));
  const eventTypeMap = new Map(eventTypes.map(et => [et.eventName, et]));

  return (
    <div className="space-y-2">
      {EVENT_TYPES.map((eventType) => {
        const occurred = occurredEvents.has(eventType);
        const eventInfo = eventTypeMap.get(eventType);
        
        return (
          <div key={eventType} className="flex items-center gap-2">
            {occurred ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm">
              {eventType}
              {occurred && eventType === 'Anfangssaldo' && eventInfo?.balance !== undefined && (
                <span className="ml-2 text-gray-600">
                  ({eventInfo.balance.toFixed(2)} €)
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};