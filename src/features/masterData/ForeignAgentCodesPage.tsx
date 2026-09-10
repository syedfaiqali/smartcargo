import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { foreignAgentRepo } from '../../data/masterDataService';

export function ForeignAgentCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Foreign Agent Codes']} title="Foreign Agent Codes">
      <EditableCodeTable
        title="Foreign Agent Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'address', label: 'Address' },
        ]}
        repo={foreignAgentRepo}
        emptyItem={{ code: '', name: '', address: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
