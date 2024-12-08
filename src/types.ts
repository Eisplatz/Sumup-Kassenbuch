export interface CashEntry {
  date: Date;
  eventName: string;
  reason: string;
  note: string;
  income: number;
  expense: number;
  balance: number;
  expectedAmount?: number;
  difference?: number;
}

export interface EventTypeInfo {
  eventName: string;
  reason: string;
  note: string;
  date: Date;
  income?: number;
  expense?: number;
  balance?: number;
  expectedAmount?: number;
}

export interface DailySummary {
  date: Date;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  discrepancies: number;
  transactions: CashEntry[];
  eventTypes: EventTypeInfo[];
}

export type FilterType =
  | 'kein Anfangssaldo'
  | 'keine Schlussbilanz'
  | 'Kasse nicht aktiv'
  | 'keine Bargeldauszahlung'
  | 'Anfangssaldo vorhanden'
  | 'Schlussbilanz vorhanden'
  | 'Bargeldauszahlung vorhanden'
  | 'Bargeldeingang vermerkt'
  | 'Bargeldrückerstattung vermerkt';

export type EventType = 
  | 'Bargeldeingang'
  | 'Bargeldverkauf'
  | 'Bargeldauszahlung'
  | 'Anfangssaldo'
  | 'Schlussbilanz'
  | 'Wechselgeld in bar'
  | 'Bargeldrückerstattung';