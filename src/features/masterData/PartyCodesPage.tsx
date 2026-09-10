import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { partyRepo } from '../../data/masterDataService';

export function PartyCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Party Codes']} title="Party Codes">
      <EditableCodeTable
        title="Party Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'address', label: 'Address' },
          { key: 'creditLimit', label: 'Credit Limit', type: 'number' },
        ]}
        repo={partyRepo}
        emptyItem={{ code: '', name: '', address: '', creditLimit: 0 }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
