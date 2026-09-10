import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { airportRepo } from '../../data/masterDataService';

export function AirportCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Airport / Destination Codes']} title="Airport / Destination Codes">
      <EditableCodeTable
        title="Airport / Destination Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'country', label: 'Country' },
        ]}
        repo={airportRepo}
        emptyItem={{ code: '', name: '', country: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
