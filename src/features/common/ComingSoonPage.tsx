import Alert from '@mui/material/Alert';
import { PageShell } from '../../layout/PageShell';

export function ComingSoonPage({ breadcrumbs, title }: { breadcrumbs: string[]; title: string }) {
  return (
    <PageShell breadcrumbs={breadcrumbs} title={title}>
      <Alert severity="info">
        This screen is documented in <code>docs/screens-phase.md</code> and scheduled for a follow-up implementation
        milestone. See the project plan's build sequencing for order.
      </Alert>
    </PageShell>
  );
}
