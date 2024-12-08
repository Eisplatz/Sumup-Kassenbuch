import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export const TerminologyInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const terms = [
    {
      term: 'Anfangssaldo',
      description: 'Der Betrag an Bargeld, der zu Beginn eines Geschäftstages in die Kasse eingelegt wird. Beim Öffnen der Kasse geben Sie diesen Betrag ein, um den Startbestand festzulegen.'
    },
    {
      term: 'Schlussbilanz',
      description: 'Der Kassenstand am Ende des Geschäftstages nach Abschluss aller Transaktionen. Dieser Wert ergibt sich aus dem Anfangssaldo zuzüglich aller Einnahmen und abzüglich aller Ausgaben.'
    },
    {
      term: 'Bargeldeingang',
      description: 'Einzahlungen von Bargeld in die Kasse, die nicht aus regulären Verkäufen stammen, wie z.B. private Einlagen oder Bareinzahlungen von der Bank. Solche Transaktionen werden im Kassenbuch erfasst.'
    },
    {
      term: 'Bargeldauszahlung',
      description: 'Auszahlungen von Bargeld aus der Kasse für betriebliche Zwecke, wie z.B. Gehaltszahlungen oder betriebliche Ausgaben. Auch diese Transaktionen werden im Kassenbuch erfasst.'
    },
    {
      term: 'Bargeldverkauf',
      description: 'Einnahmen aus Verkäufen, die in bar getätigt wurden. Diese werden automatisch vom Kassensystem erfasst und erhöhen den Kassenbestand.'
    },
    {
      term: 'Wechselgeld in bar',
      description: 'Bargeld, das in die Kasse gelegt wird, um ausreichend Wechselgeld für Transaktionen bereitzuhalten. Dies kann beim Öffnen der Kasse als Teil des Anfangssaldos eingegeben werden.'
    },
    {
      term: 'Bargeldrückerstattung',
      description: 'Rückzahlungen von Bargeld an Kunden, beispielsweise bei Warenrückgaben. Diese Ausgaben werden im Kassenbuch erfasst und verringern den Kassenbestand.'
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Begriffserklärungen</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Begriffserklärungen</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {terms.map((item) => (
                <div key={item.term} className="space-y-2">
                  <h4 className="font-medium text-gray-900">{item.term}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};