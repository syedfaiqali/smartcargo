import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { airlineRepo } from '../../data/masterDataService';

export function AirlineCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Airline Codes']} title="Airline Codes">
      <EditableCodeTable
        title="Airline Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
        ]}
        repo={airlineRepo}
        emptyItem={{ code: '', name: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
