import { Download, FileJson, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import type { EnforcementEvent } from '../../services/enforcementService';

interface ExportButtonsProps {
  events: EnforcementEvent[];
}

const ExportButtons = ({ events }: ExportButtonsProps) => {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enforcement-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    // CSV headers
    const headers = [
      'ID',
      'Timestamp',
      'Agent',
      'Policy ID',
      'Policy Name',
      'Severity',
      'Type',
      'Event Details',
      'Actions',
    ];

    // CSV rows
    const rows = events.map(event => [
      event.id,
      format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      event.agentName,
      event.policyId,
      event.policyName,
      event.severity,
      event.type,
      JSON.stringify(event.event).replace(/"/g, '""'), // Escape quotes
      JSON.stringify(event.actions).replace(/"/g, '""'),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enforcement-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToJSON}
        variant="secondary"
        size="sm"
        disabled={events.length === 0}
      >
        <FileJson className="w-4 h-4 mr-2" />
        Export JSON
      </Button>
      <Button
        onClick={exportToCSV}
        variant="secondary"
        size="sm"
        disabled={events.length === 0}
      >
        <FileText className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
};

export default ExportButtons;
