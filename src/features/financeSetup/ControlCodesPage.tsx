import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from '../masterData/EditableCodeTable';
import { controlCodeRepo, groupCodeRepo } from '../../data/financeSetupService';

export function ControlCodesPage() {
  const [version, setVersion] = useState(0);
  const groups = groupCodeRepo.list();
  const groupOptions = groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }));

  return (
    <PageShell breadcrumbs={['Finance', 'Initial Setup', 'Control Codes']} title="Control Codes">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Control accounts (e.g. Trade Debtors Control, Trade Creditors Control, Bank Control) that roll up under a Group
          Code — these are the accounts Vouchers and AR/AP postings ultimately hit.
        </Typography>
      </Box>

      {groups.length === 0 ? (
        <Alert severity="warning">
          No Group Codes exist yet — create at least one under Finance → Initial Setup → Group Codes before adding
          Control Codes.
        </Alert>
      ) : (
        <EditableCodeTable
          title="Control Codes"
          fields={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'groupCode', label: 'Group', type: 'select', options: groupOptions },
          ]}
          repo={controlCodeRepo}
          emptyItem={{ code: '', name: '', groupCode: groups[0]?.code ?? '' }}
          version={version}
          onChange={() => setVersion((v) => v + 1)}
        />
      )}
    </PageShell>
  );
}
