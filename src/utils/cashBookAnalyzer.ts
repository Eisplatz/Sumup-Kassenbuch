import { CashEntry, DailySummary, EventType, EventTypeInfo, FilterType } from '../types';
import { startOfDay, endOfDay, isWithinInterval, subDays, addDays } from 'date-fns';

const EVENT_TYPES: EventType[] = [
  'Bargeldeingang',
  'Bargeldverkauf',
  'Bargeldauszahlung',
  'Anfangssaldo',
  'Schlussbilanz',
  'Wechselgeld in bar',
  'Bargeldrückerstattung',
];

const createEventTypeInfo = (entry: CashEntry): EventTypeInfo => {
  const baseInfo: EventTypeInfo = {
    eventName: entry.eventName,
    reason: entry.reason,
    note: entry.note,
    date: entry.date,
  };

  switch (entry.eventName) {
    case 'Bargeldeingang':
      return {
        ...baseInfo,
        income: entry.income,
      };
    case 'Bargeldauszahlung':
    case 'Bargeldrückerstattung':
      return {
        ...baseInfo,
        expense: entry.expense,
      };
    case 'Anfangssaldo':
      return {
        ...baseInfo,
        balance: entry.balance,
      };
    case 'Schlussbilanz':
      return {
        ...baseInfo,
        balance: entry.balance,
        expectedAmount: entry.expectedAmount,
      };
    default:
      return baseInfo;
  }
};

const findPreviousDayLastBalance = (
  entries: CashEntry[],
  currentDate: Date
): number => {
  const previousDay = startOfDay(subDays(currentDate, 1));
  const previousDayEntries = entries
    .filter(entry => startOfDay(entry.date).getTime() === previousDay.getTime())
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return previousDayEntries.length > 0 ? previousDayEntries[0].balance : 0;
};

const shouldIncludeSummary = (
  summary: DailySummary,
  selectedFilters: Set<FilterType>
): boolean => {
  if (selectedFilters.size === 0) return true;

  const hasEventType = (eventName: string) => 
    summary.eventTypes.some(et => et.eventName === eventName);

  for (const filter of selectedFilters) {
    switch (filter) {
      case 'kein Anfangssaldo':
        if (hasEventType('Anfangssaldo')) return false;
        break;
      case 'keine Schlussbilanz':
        if (hasEventType('Schlussbilanz')) return false;
        break;
      case 'Kasse nicht aktiv':
        if (summary.transactions.length > 0) return false;
        break;
      case 'keine Bargeldauszahlung':
        if (hasEventType('Bargeldauszahlung')) return false;
        break;
      case 'Anfangssaldo vorhanden':
        if (!hasEventType('Anfangssaldo')) return false;
        break;
      case 'Schlussbilanz vorhanden':
        if (!hasEventType('Schlussbilanz')) return false;
        break;
      case 'Bargeldauszahlung vorhanden':
        if (!hasEventType('Bargeldauszahlung')) return false;
        break;
      case 'Bargeldeingang vermerkt':
        if (!hasEventType('Bargeldeingang')) return false;
        break;
      case 'Bargeldrückerstattung vermerkt':
        if (!hasEventType('Bargeldrückerstattung')) return false;
        break;
    }
  }
  return true;
};

export const analyzeCashEntries = (
  entries: CashEntry[],
  startDate: Date,
  endDate: Date,
  selectedFilters: Set<FilterType> = new Set()
): DailySummary[] => {
  const interval = {
    start: startOfDay(startDate),
    end: endOfDay(endDate)
  };

  // Get all entries including one day before the start date for opening balance
  const extendedStartDate = startOfDay(subDays(startDate, 1));
  const relevantEntries = entries.filter(entry => 
    isWithinInterval(entry.date, {
      start: extendedStartDate,
      end: interval.end
    })
  );

  // Group entries by date
  const dailyEntries = new Map<string, CashEntry[]>();
  relevantEntries.forEach((entry) => {
    const dateKey = startOfDay(entry.date).toISOString();
    if (!dailyEntries.has(dateKey)) {
      dailyEntries.set(dateKey, []);
    }
    dailyEntries.get(dateKey)!.push(entry);
  });

  // Process each day within the date range
  const summaries: DailySummary[] = [];
  let currentDate = startOfDay(startDate);
  
  while (currentDate <= endOfDay(endDate)) {
    const dateKey = currentDate.toISOString();
    const dayEntries = dailyEntries.get(dateKey) || [];
    const openingBalance = findPreviousDayLastBalance(entries, currentDate);
    
    // Create summary for the day
    const summary: DailySummary = {
      date: currentDate,
      openingBalance,
      totalIncome: 0,
      totalExpense: 0,
      closingBalance: openingBalance,
      discrepancies: 0,
      transactions: dayEntries,
      eventTypes: [],
    };

    if (dayEntries.length > 0) {
      dayEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

      summary.totalIncome = dayEntries.reduce((sum, entry) => {
        if (entry.eventName === 'Bargeldverkauf' || entry.eventName === 'Bargeldeingang') {
          return sum + entry.income;
        }
        return sum;
      }, 0);

      summary.totalExpense = dayEntries.reduce((sum, entry) => {
        if (entry.eventName === 'Bargeldauszahlung' || 
            entry.eventName === 'Bargeldrückerstattung' || 
            entry.eventName === 'Wechselgeld in bar') {
          return sum + Math.abs(entry.expense);
        }
        return sum;
      }, 0);

      // Use the last balance entry of the day for closing balance
      const sortedEntries = [...dayEntries].sort((a, b) => b.date.getTime() - a.date.getTime());
      summary.closingBalance = sortedEntries[0]?.balance ?? (openingBalance + summary.totalIncome - summary.totalExpense);

      summary.discrepancies = dayEntries.reduce((sum, entry) => {
        if (entry.difference) {
          return sum + entry.difference;
        }
        return sum;
      }, 0);

      // Collect all events of each type
      summary.eventTypes = dayEntries
        .filter(entry => EVENT_TYPES.includes(entry.eventName as EventType))
        .map(entry => createEventTypeInfo(entry))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Only add the summary if it passes the filter conditions
    if (shouldIncludeSummary(summary, selectedFilters)) {
      summaries.push(summary);
    }

    currentDate = startOfDay(addDays(currentDate, 1));
  }

  return summaries.sort((a, b) => b.date.getTime() - a.date.getTime());
};