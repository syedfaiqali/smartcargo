import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { chargeableRepo } from '../../data/masterDataService';

export function ChargeableCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Chargeable Codes (MOP)']} title="Chargeable Codes (MOP)">
      <EditableCodeTable
        title="Chargeable Codes (MOP)"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
        ]}
        repo={chargeableRepo}
        emptyItem={{ code: '', description: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
