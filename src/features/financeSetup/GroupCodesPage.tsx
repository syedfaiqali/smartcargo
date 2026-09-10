import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from '../masterData/EditableCodeTable';
import { groupCodeRepo } from '../../data/financeSetupService';

const TYPE_OPTIONS = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'EQUITY', label: 'Equity' },
];

export function GroupCodesPage() {
  const [version, setVersion] = useState(0);

  return (
    <PageShell breadcrumbs={['Finance', 'Initial Setup', 'Group Codes']} title="Group Codes">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Top-level Chart of Accounts groups (Asset / Liability / Income / Expense / Equity). Control Codes are created
          under a Group Code.
        </Typography>
      </Box>
      <EditableCodeTable
        title="Group Codes"
        fields={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS },
        ]}
        repo={groupCodeRepo}
        emptyItem={{ code: '', name: '', type: 'ASSET' }}
        version={version}
        onChange={() => setVersion((v) => v + 1)}
      />
    </PageShell>
  );
}
