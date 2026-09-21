import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { Job, JobKind } from '../../domain/job';
import { createEmptyJob } from '../../domain/jobFactory';
import { jobRepo, nextJobNo, nextHawbNo, voidJob, syncHouseAwbsOnMaster } from '../../data/jobService';
import { consumeAwb, isAwbAvailable, releaseAwb } from '../../data/awbStockService';
import { airlineRepo } from '../../data/masterDataService';
import { EntryTab } from './tabs/EntryTab';
import { ChargesTab } from './tabs/ChargesTab';
import { KbTab } from './tabs/KbTab';
import { RemarksTab } from './tabs/RemarksTab';
import { DetailSearchTab } from './tabs/DetailSearchTab';
import { PrintingTab } from './tabs/PrintingTab';
import { navyTrustColors, navyTrustFontFamily, navyTrustHeadingFontFamily, navyTrustScreenSx, loadNavyTrustFonts } from '../../theme/navyTrustTheme';

const TAB_LABELS = ['1.0 Entry Details', '2.0 Charges Grid', '3.0 K.B. Data', '4.0 Remarks'] as const;

function useJobScreenFonts() {
  useEffect(() => {
    loadNavyTrustFonts();
  }, []);
}

function guessAirlineFromMawb(mawbNo: string): string | undefined {
  const prefix = mawbNo.split('-')[0];
  return airlineRepo.list().find((a) => a.code === prefix)?.code ?? airlineRepo.list()[0]?.code;
}

interface JobPageProps {
  kind: JobKind;
  breadcrumbs: string[];
  title: string;
}

export function JobPage({ kind, breadcrumbs, title }: JobPageProps) {
  useJobScreenFonts();
  const [tab, setTab] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const [editable, setEditable] = useState(false);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [originalMawb, setOriginalMawb] = useState<string>('');
  const [originalParentJobNo, setOriginalParentJobNo] = useState<string>('');
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const loadJob = (j: Job) => {
    setJob(j);
    setOriginalMawb(j.mawbNo);
    setOriginalParentJobNo(j.parentJobNo ?? '');
    setEditable(false);
    setIsPrintingView(false);
    setTab(0);
  };

  const editJobFromList = (j: Job) => {
    if (j.status.final) {
      setMessage({ severity: 'warning', text: 'This job is FINAL and cannot be edited.' });
      return;
    }
    loadJob(j);
    setEditable(true);
  };

  const printJobFromList = (j: Job) => {
    loadJob(j);
    setEditable(true);
    setIsPrintingView(true);
  };

  const deleteJobFromList = (j: Job) => {
    jobRepo.remove(j.id);
    if (kind === 'MAWB' && j.mawbNo) releaseAwb(j.mawbNo, guessAirlineFromMawb(j.mawbNo) ?? '');
    if (kind === 'HAWB' && j.parentJobNo) syncHouseAwbsOnMaster(j.parentJobNo);
    setMessage({ severity: 'success', text: `Job ${j.jobNo} deleted.` });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyJob(kind);
        draft.jobNo = nextJobNo(kind, draft.branch);
        if (kind === 'HAWB') draft.hawbNo = nextHawbNo(draft.branch);
        setJob(draft);
        setOriginalMawb('');
        setOriginalParentJobNo('');
        setEditable(true);
        setIsPrintingView(false);
        setTab(0);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!job) {
          setMessage({ severity: 'warning', text: 'Load a job first (SEARCH or Detail/Search tab).' });
          return;
        }
        if (job.status.final) {
          setMessage({ severity: 'warning', text: 'This job is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        setIsPrintingView(false);
        break;
      }
      case 'delete': {
        if (!job) return;
        jobRepo.remove(job.id);
        if (kind === 'MAWB' && job.mawbNo) releaseAwb(job.mawbNo, guessAirlineFromMawb(job.mawbNo) ?? '');
        if (kind === 'HAWB' && job.parentJobNo) syncHouseAwbsOnMaster(job.parentJobNo);
        setJob(null);
        setMessage({ severity: 'success', text: 'Job deleted.' });
        break;
      }
      case 'final': {
        if (!job) return;
        if (kind === 'MAWB' && !job.mawbNo) {
          setMessage({ severity: 'error', text: 'MAWB No. is required before finalizing.' });
          return;
        }
        if (kind === 'HAWB' && !job.parentJobNo) {
          setMessage({ severity: 'error', text: 'Master Job No. (MAWB) is required before finalizing.' });
          return;
        }
        const saved = persistJob(job, true);
        if (saved) {
          setJob(saved);
          setEditable(false);
          setMessage({ severity: 'success', text: `Job ${saved.jobNo} finalized.` });
        }
        break;
      }
      case 'void': {
        if (!job) return;
        const updated = voidJob(job.id);
        if (updated) {
          setJob(updated);
          setMessage({ severity: 'success', text: `Job ${updated.jobNo} voided.` });
        }
        break;
      }
      case 'copy': {
        if (!job) return;
        const draft: Job = {
          ...job,
          id: crypto.randomUUID(),
          jobNo: nextJobNo(kind, job.branch),
          hawbNo: kind === 'HAWB' ? nextHawbNo(job.branch) : job.hawbNo,
          mawbNo: kind === 'MAWB' ? '' : job.mawbNo,
          parentJobNo: kind === 'HAWB' ? job.parentJobNo : undefined,
          status: { final: false, void: false, posted: false },
        };
        setJob(draft);
        setOriginalMawb('');
        setOriginalParentJobNo('');
        setEditable(true);
        setIsPrintingView(false);
        setMessage({ severity: 'success', text: `Copied into new draft job ${draft.jobNo}.` });
        break;
      }
      default:
        break;
    }
  };

  const persistJob = (current: Job, finalize = false): Job | null => {
    if (kind === 'MAWB') {
      if (!current.mawbNo) {
        setMessage({ severity: 'error', text: 'MAWB No. is required to save.' });
        return null;
      }
      const airline = guessAirlineFromMawb(current.mawbNo) ?? '';

      // Consume the newly-assigned MAWB No. against AWB Stock if it changed.
      if (current.mawbNo !== originalMawb) {
        if (originalMawb) releaseAwb(originalMawb, airline);
        if (!isAwbAvailable(current.mawbNo, airline)) {
          setMessage({
            severity: 'error',
            text: `MAWB No. ${current.mawbNo} is not an Un-Used AWB in stock for airline ${airline}. Register it first on the Air Waybill Stock screen.`,
          });
          return null;
        }
        consumeAwb(current.mawbNo, airline, current.jobNo, current.awbDate || current.jobDate);
        setOriginalMawb(current.mawbNo);
      }
    } else {
      if (!current.parentJobNo) {
        setMessage({ severity: 'error', text: 'Master Job No. (MAWB) is required to save.' });
        return null;
      }
    }

    const toSave: Job = finalize ? { ...current, status: { ...current.status, final: true } } : current;
    const saved = jobRepo.save(toSave);

    if (kind === 'HAWB') {
      // Keep the Master's "House Air Waybills" grid (docs 2.8) in sync with this House job.
      if (originalParentJobNo && originalParentJobNo !== saved.parentJobNo) {
        syncHouseAwbsOnMaster(originalParentJobNo);
      }
      if (saved.parentJobNo) {
        syncHouseAwbsOnMaster(saved.parentJobNo);
        setOriginalParentJobNo(saved.parentJobNo);
      }
    }

    return saved;
  };

  const handleSave = () => {
    if (!job) return;
    const saved = persistJob(job);
    if (saved) {
      setJob(saved);
      setMessage({ severity: 'success', text: `Job ${saved.jobNo} saved.` });
    }
  };

  const handleTabChange = (nextTab: number) => {
    // Detail tabs are stored against a saved job. Keep a newly-created draft on
    // Entry until its required details have been completed and saved.
    if (nextTab > 0 && job && !jobRepo.get(job.id)) {
      setMessage({
        severity: 'warning',
        text: `Entry is in process. Complete and save the Entry tab before opening ${TAB_LABELS[nextTab]}.`,
      });
      return;
    }

    setTab(nextTab);
    setIsPrintingView(false);
  };

  const disabledActions: ToolbarAction[] = [];
  if (!job) disabledActions.push('edit', 'delete', 'final', 'void', 'copy');
  if (job?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (job?.status.void) disabledActions.push('final', 'edit');
  if (!editable) disabledActions.push('save');

  const jobTypeLabel = kind === 'MAWB' ? 'MAWB' : 'HAWB';

  return (
    <Box sx={navyTrustScreenSx}>
      <PageShell
        breadcrumbs={breadcrumbs}
        title={title}
        actions={job ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => { setJob(null); setEditable(false); setIsPrintingView(false); setTab(0); setMessage(null); }}
              sx={{ fontFamily: navyTrustFontFamily, borderColor: navyTrustColors.border, color: navyTrustColors.textSecondary }}
            >
              Back to List
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon fontSize="small" />}
              disabled={disabledActions.includes('copy')}
              onClick={() => handleAction('copy')}
              sx={{ fontFamily: navyTrustFontFamily, borderColor: navyTrustColors.border, color: navyTrustColors.textPrimary }}
            >
              Copy Job
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              disabled={disabledActions.includes('void')}
              onClick={() => handleAction('void')}
              sx={{ fontFamily: navyTrustFontFamily, borderColor: navyTrustColors.dangerBorder, bgcolor: navyTrustColors.dangerBg }}
            >
              Void
            </Button>
            <Button
              variant="contained"
              startIcon={<DescriptionOutlinedIcon fontSize="small" />}
              disabled={disabledActions.includes('final')}
              onClick={() => handleAction('final')}
              sx={{ fontFamily: navyTrustFontFamily, bgcolor: navyTrustColors.navy, '&:hover': { bgcolor: navyTrustColors.navyDark } }}
            >
              Finalize {jobTypeLabel}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveOutlinedIcon fontSize="small" />}
              disabled={disabledActions.includes('save')}
              onClick={() => handleAction('save')}
              sx={{ fontFamily: navyTrustFontFamily }}
            >
              Save
            </Button>
          </Stack>
        ) : undefined}
      >
        <Snackbar
          open={Boolean(message)}
          autoHideDuration={4000}
          onClose={(_, reason) => { if (reason !== 'clickaway') setMessage(null); }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {message ? (
            <Alert severity={message.severity} onClose={() => setMessage(null)} variant="filled">
              {message.text}
            </Alert>
          ) : undefined}
        </Snackbar>

        {!job && (
          <TransactionToolbar actions={['new']} disabledActions={disabledActions} onAction={handleAction} />
        )}

        {job && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Job: ${job.jobNo}`}
              sx={{ bgcolor: navyTrustColors.navy, color: '#fff', fontWeight: 700, fontFamily: navyTrustHeadingFontFamily, fontSize: 12.5 }}
            />
            {kind === 'HAWB' && <Chip label={`HAWB No: ${job.hawbNo || '—'}`} variant="outlined" sx={{ borderColor: navyTrustColors.border }} />}
            {editable && (
              <Chip
                label="EDITING"
                sx={{ bgcolor: '#fff4e0', color: navyTrustColors.warning, fontWeight: 700, border: `1px solid #f5d599` }}
              />
            )}
            {job.status.final && (
              <Chip label="FINAL" sx={{ bgcolor: navyTrustColors.successBg, color: navyTrustColors.success, fontWeight: 700, border: `1px solid ${navyTrustColors.successBorder}` }} />
            )}
            {job.status.void && (
              <Chip label="VOID" sx={{ bgcolor: navyTrustColors.dangerBg, color: navyTrustColors.danger, fontWeight: 700, border: `1px solid ${navyTrustColors.dangerBorder}` }} />
            )}
          </Stack>
        )}

        {job && isPrintingView && (
          <Tabs
            value={0}
            sx={{
              mb: 2,
              borderBottom: `2px solid ${navyTrustColors.border}`,
              '& .MuiTab-root': { fontFamily: navyTrustHeadingFontFamily, fontWeight: 700, fontSize: 12.5 },
              '& .Mui-selected': { color: navyTrustColors.navy },
              '& .MuiTabs-indicator': { backgroundColor: navyTrustColors.navy, height: 2.5 },
            }}
          >
            <Tab label="Printing" />
          </Tabs>
        )}

        {job && !isPrintingView && (
          <Tabs
            value={tab}
            onChange={(_, v) => handleTabChange(v)}
            sx={{
              mb: 2,
              borderBottom: `2px solid ${navyTrustColors.border}`,
              '& .MuiTab-root': { fontFamily: navyTrustHeadingFontFamily, fontWeight: 700, fontSize: 12.5, color: navyTrustColors.textSecondary },
              '& .Mui-selected': { color: navyTrustColors.navy },
              '& .MuiTabs-indicator': { backgroundColor: navyTrustColors.navy, height: 2.5 },
            }}
          >
            {TAB_LABELS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        )}

        {!job ? (
          <DetailSearchTab kind={kind} onOpenJob={loadJob} onEditJob={editJobFromList} onDeleteJob={deleteJobFromList} onPrintJob={printJobFromList} />
        ) : (
          <Box>
            {isPrintingView ? <PrintingTab job={job} editable={editable} onChange={setJob} /> : <>
              {tab === 0 && <EntryTab job={job} editable={editable} onChange={setJob} />}
              {tab === 1 && <ChargesTab job={job} editable={editable} onChange={setJob} />}
              {tab === 2 && <KbTab job={job} editable={editable} onChange={setJob} />}
              {tab === 3 && <RemarksTab job={job} editable={editable} onChange={setJob} />}
            </>}
          </Box>
        )}
      </PageShell>
    </Box>
  );
}
