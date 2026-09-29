import { useState } from 'react';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { countryRepo } from '../../data/masterDataService';

export function CountryCodesPage() {
  const [version, setVersion] = useState(0);
  return (
    <PageShell breadcrumbs={['Freight', 'Initial Setup', 'Country Codes']} title="Country Codes">
      <EditableCodeTable
        title="Country Codes"
        fields={[
          { key: 'code', label: 'Country Code' },
          { key: 'name', label: 'Country Name' },
        ]}
        repo={countryRepo}
        emptyItem={{ code: '', name: '' }}
        showFilters={false}
        globalSearch
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
