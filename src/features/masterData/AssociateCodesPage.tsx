import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { associateRepo } from '../../data/masterDataService';

export function AssociateCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Associate Codes']} title="Associate Codes">
      <EditableCodeTable
        title="Associate Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
        ]}
        repo={associateRepo}
        emptyItem={{ code: '', name: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
