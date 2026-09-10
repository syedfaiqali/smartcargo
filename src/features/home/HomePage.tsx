import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaidIcon from '@mui/icons-material/Paid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import { TopBar } from '../../layout/TopBar';
import { KpiCard } from './KpiCard';
import { jobRepo } from '../../data/jobService';
import { Job } from '../../domain/job';
import { themeColors } from '../../theme/themeColors';

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusOf(job: Job): { label: string; color: 'success' | 'warning' | 'default' } {
  if (job.status.void) return { label: 'Void', color: 'warning' };
  if (job.status.final) return { label: 'Final', color: 'success' };
  return { label: 'Open', color: 'default' };
}

export function HomePage() {
  const jobs = useMemo(() => jobRepo.list(), []);
  const activeJobs = jobs.filter((j) => !j.status.void);
  const recentJobs = [...jobs]
    .sort((a, b) => (b.jobDate || '').localeCompare(a.jobDate || ''))
    .slice(0, 6);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Box>
      <TopBar title="Company Home" />
      <Box sx={{ px: 3, pb: 3 }}>
        <Paper
          sx={{
            background: `linear-gradient(135deg, ${themeColors.sidebarBg} 0%, ${themeColors.primary} 100%)`,
            color: '#fff',
            p: 3,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              SC
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                SmartCargo Demo Workspace
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {dateLabel}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label="2026-2027" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
            <Chip label="All branches" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }} />
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard
              icon={<LocalShippingIcon sx={{ color: '#1e3a5f' }} fontSize="small" />}
              iconBg="#dbeafe"
              label="Active Jobs"
              value={String(activeJobs.length)}
              hint={`${jobs.length} total in system`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard
              icon={<ReceiptLongIcon sx={{ color: '#92400e' }} fontSize="small" />}
              iconBg="#fef3c7"
              label="Outstanding Invoices"
              value="—"
              hint="Local Invoices screen not yet implemented"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard
              icon={<PaidIcon sx={{ color: '#065f46' }} fontSize="small" />}
              iconBg="#d1fae5"
              label="Income — this month"
              value="—"
              hint="Finance module not yet implemented"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard
              icon={<TrendingUpIcon sx={{ color: '#4c1d95' }} fontSize="small" />}
              iconBg="#ede9fe"
              label="Net this month"
              value="—"
              hint="Finance module not yet implemented"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard
              icon={<GroupIcon sx={{ color: '#1e40af' }} fontSize="small" />}
              iconBg="#dbeafe"
              label="Active Employees"
              value="—"
              hint="HR Management not yet implemented"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Recent Freight Jobs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The last {recentJobs.length} job(s) opened in this workspace
              </Typography>
              <Table size="small" sx={{ mt: 1.5 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Job</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          No jobs yet — create one from Freight Forwarding → Air Export → Job (MAWB) Entry.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentJobs.map((job) => {
                      const s = statusOf(job);
                      return (
                        <TableRow key={job.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{job.jobNo}</TableCell>
                          <TableCell>
                            <Chip size="small" label={job.kind === 'MAWB' ? 'Air Export (MAWB)' : 'Air Export (HAWB)'} variant="outlined" />
                          </TableCell>
                          <TableCell>{job.party.name || job.party.partyCode || '—'}</TableCell>
                          <TableCell>{formatDate(job.jobDate)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={s.label} color={s.color === 'default' ? undefined : s.color} variant={s.color === 'default' ? 'outlined' : 'filled'} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Recent Activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The latest actions taken across your workspace
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
                <Typography variant="body2" color="text.secondary">
                  No activity recorded yet — actions will show up here as your team works.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
