import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { termsRepo } from '../../data/masterDataService';

export function TermsAndConditionsPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Terms and Conditions']} title="Terms and Conditions">
      <EditableCodeTable
        title="Terms and Conditions"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
        ]}
        repo={termsRepo}
        emptyItem={{ code: '', description: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
