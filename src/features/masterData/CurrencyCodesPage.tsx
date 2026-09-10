import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { currencyRepo } from '../../data/masterDataService';

export function CurrencyCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Currency Codes']} title="Currency Codes">
      <EditableCodeTable
        title="Currency Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'defaultExchangeRate', label: 'Default Ex. Rate', type: 'number' },
        ]}
        repo={currencyRepo}
        emptyItem={{ code: '', name: '', defaultExchangeRate: 0 }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
