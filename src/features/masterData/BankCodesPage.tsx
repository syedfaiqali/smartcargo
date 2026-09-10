import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { bankRepo } from '../../data/masterDataService';

export function BankCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Bank Codes']} title="Bank Codes">
      <EditableCodeTable
        title="Bank Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'accountDetail', label: 'Account Detail' },
        ]}
        repo={bankRepo}
        emptyItem={{ code: '', name: '', accountDetail: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
