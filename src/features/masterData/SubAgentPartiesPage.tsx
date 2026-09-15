import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { subAgentPartyRepo } from '../../data/masterDataService';

export function SubAgentPartiesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Sub-Agent Parties']} title="Sub-Agent Parties">
      <EditableCodeTable
        title="Sub-Agent Parties"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'address', label: 'Address' },
        ]}
        repo={subAgentPartyRepo}
        emptyItem={{ code: '', name: '', address: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
