import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { jobStatusRepo } from '../../data/masterDataService';

export function JobStatusPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Job Status']} title="Job Status">
      <EditableCodeTable
        title="Job Status"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
        ]}
        repo={jobStatusRepo}
        emptyItem={{ code: '', description: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
