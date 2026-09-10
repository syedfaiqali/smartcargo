import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { agentRepo } from '../../data/masterDataService';

const KIND_OPTIONS = [
  { value: 'CLEARING', label: 'Clearing' },
  { value: 'DELIVERY', label: 'Delivery' },
];

export function AgentCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Clearing / Delivery Agent Codes']} title="Clearing / Delivery Agent Codes">
      <EditableCodeTable
        title="Clearing / Delivery Agent Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'kind', label: 'Kind', type: 'select', options: KIND_OPTIONS },
        ]}
        repo={agentRepo}
        emptyItem={{ code: '', name: '', kind: 'CLEARING' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
