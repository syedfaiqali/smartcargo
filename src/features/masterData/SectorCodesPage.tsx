import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { sectorRepo } from '../../data/masterDataService';

export function SectorCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Sector Codes']} title="Sector Codes">
      <EditableCodeTable
        title="Sector Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
        ]}
        repo={sectorRepo}
        emptyItem={{ code: '', name: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
