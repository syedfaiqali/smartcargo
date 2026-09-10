import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { seaPortRepo } from '../../data/masterDataService';

export function SeaPortCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Sea Port Codes']} title="Sea Port Codes">
      <EditableCodeTable
        title="Sea Port Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'country', label: 'Country' },
        ]}
        repo={seaPortRepo}
        emptyItem={{ code: '', name: '', country: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
