import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { invoiceChargeRepo } from '../../data/masterDataService';

export function InvoiceChargeCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Invoice Charges Codes']} title="Invoice Charges Codes">
      <EditableCodeTable
        title="Invoice Charges Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'description', label: 'Description' },
        ]}
        repo={invoiceChargeRepo}
        emptyItem={{ code: '', description: '' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
