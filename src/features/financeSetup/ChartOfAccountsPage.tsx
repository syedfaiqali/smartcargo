import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { chartAccountRepo, controlCodeRepo, groupCodeRepo } from '../../data/financeSetupService';
import { EditableCodeTable } from '../masterData/EditableCodeTable';

export function ChartOfAccountsPage() {
  const [version, setVersion] = useState(0);
  const controls = controlCodeRepo.list();
  const groups = groupCodeRepo.list();
  const groupName = (code: string) => groups.find((group) => group.code === code)?.name ?? code;
  const controlOptions = controls.map((control) => ({
    value: control.code,
    label: `${control.code} — ${control.name} (${groupName(control.groupCode)})`,
  }));

  return (
    <PageShell breadcrumbs={['Finance', 'Initial Setup', 'Chart of Accounts']} title="Chart of Accounts">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Maintain ledger accounts and link each account to its control code. Saved accounts are available to finance account selectors.
        </Typography>
      </Box>
      {controls.length === 0 ? (
        <Alert severity="warning">Create a Group Code and Control Code before adding ledger accounts.</Alert>
      ) : (
        <EditableCodeTable
          title="Chart of Accounts"
          addLabel="New Account"
          fields={[
            { key: 'code', label: 'Account Code', placeholder: 'Enter account code' },
            { key: 'name', label: 'Account Name', placeholder: 'Enter account name' },
            { key: 'controlCode', label: 'Control Code', type: 'select', options: controlOptions },
          ]}
          repo={chartAccountRepo}
          emptyItem={{ code: '', name: '', controlCode: controls[0].code }}
          version={version}
          onChange={() => setVersion((current) => current + 1)}
        />
      )}
    </PageShell>
  );
}
