import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { ownerRepo } from '../../data/masterDataService';

export function OwnerCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Owner Codes']} title="Owner Codes">
      <EditableCodeTable
        title="Owner Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
        ]}
        repo={ownerRepo}
        emptyItem={{ code: '', name: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
