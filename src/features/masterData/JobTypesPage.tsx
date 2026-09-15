import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { jobTypeRepo } from '../../data/masterDataService';

export function JobTypesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Job Types']} title="Job Types">
      <EditableCodeTable
        title="Job Types"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
        ]}
        repo={jobTypeRepo}
        emptyItem={{ code: '', description: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
