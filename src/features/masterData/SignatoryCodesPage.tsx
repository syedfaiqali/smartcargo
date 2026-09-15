import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { signatoryRepo } from '../../data/masterDataService';

export function SignatoryCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Signatory Codes']} title="Signatory Codes">
      <EditableCodeTable
        title="Signatory Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'designation', label: 'Designation' },
        ]}
        repo={signatoryRepo}
        emptyItem={{ code: '', name: '', designation: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
