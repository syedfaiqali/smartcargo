import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { PageShell } from '../../layout/PageShell';
import { TransactionToolbar, ToolbarAction } from '../../components/TransactionToolbar';
import { LocalInvoice } from '../../domain/localInvoice';
import { createEmptyLocalInvoice } from '../../domain/localInvoiceFactory';
import { localInvoiceRepo, nextInvoiceNo, syncLocalInvoiceLinks, voidLocalInvoice } from '../../data/localInvoiceService';
import { recomputeInvoiceTotals } from './invoiceCalculations';
import { EntryTab } from './tabs/EntryTab';
import { PrintingTab } from './tabs/PrintingTab';
import { LocalInvoiceGrid } from './LocalInvoiceGrid';
import { navyTrustColors, navyTrustFontFamily, navyTrustHeadingFontFamily, navyTrustScreenSx, navyTrustPillTabsSx, loadNavyTrustFonts } from '../../theme/navyTrustTheme';

const pillTabsSx = navyTrustPillTabsSx;

function useNavyTrustFonts() {
  useEffect(() => {
    loadNavyTrustFonts();
  }, []);
}

export function LocalInvoicePage() {
  useNavyTrustFonts();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [showList, setShowList] = useState(true);
  const [isPrintingView, setIsPrintingView] = useState(false);
  const [invoice, setInvoice] = useState<LocalInvoice | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    const invoiceId = (location.state as { invoiceId?: string } | null)?.invoiceId;
    if (!invoiceId) return;
    const linkedInvoice = localInvoiceRepo.get(invoiceId);
    if (!linkedInvoice) return;
    setInvoice(linkedInvoice);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  }, [location.key, location.state]);

  const loadInvoice = (inv: LocalInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  };

  const editInvoiceFromList = (inv: LocalInvoice) => {
    if (inv.status.final) {
      setMessage({ severity: 'warning', text: 'This invoice is FINAL and cannot be edited.' });
      return;
    }
    setInvoice(inv);
    setEditable(true);
    setTab(0);
    setShowList(false);
    setIsPrintingView(false);
  };

  const printInvoiceFromList = (inv: LocalInvoice) => {
    setInvoice(inv);
    setEditable(false);
    setTab(0);
    setShowList(false);
    setIsPrintingView(true);
  };

  const deleteInvoiceFromList = (inv: LocalInvoice) => {
    localInvoiceRepo.remove(inv.id);
    syncLocalInvoiceLinks(inv);
    setMessage({ severity: 'success', text: `Invoice ${inv.invoiceNo} deleted.` });
  };

  const handleAction = (action: ToolbarAction) => {
    switch (action) {
      case 'new': {
        const draft = createEmptyLocalInvoice();
        draft.invoiceNo = nextInvoiceNo(draft.branch);
        setInvoice(draft);
        setEditable(true);
        setTab(0);
        setShowList(false);
        setIsPrintingView(false);
        setMessage(null);
        break;
      }
      case 'save':
        handleSave();
        break;
      case 'edit': {
        if (!invoice) {
          setMessage({ severity: 'warning', text: 'Load an invoice first (SEARCH or Detail/Search tab).' });
          return;
        }
        if (invoice.status.final) {
          setMessage({ severity: 'warning', text: 'This invoice is FINAL and cannot be edited.' });
          return;
        }
        setEditable(true);
        break;
      }
      case 'delete': {
        if (!invoice) return;
        localInvoiceRepo.remove(invoice.id);
        syncLocalInvoiceLinks(invoice);
        setInvoice(null);
        setMessage({ severity: 'success', text: 'Invoice deleted.' });
        break;
      }
      case 'final': {
        if (!invoice) return;
        if (!invoice.partyCode) {
          setMessage({ severity: 'error', text: 'Party Code is required before finalizing.' });
          return;
        }
        const previous = localInvoiceRepo.get(invoice.id);
        const saved = localInvoiceRepo.save({ ...invoice, status: { ...invoice.status, final: true } });
        syncLocalInvoiceLinks(saved, previous);
        setInvoice(saved);
        setEditable(false);
        setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} finalized.` });
        break;
      }
      case 'void': {
        if (!invoice) return;
        const updated = voidLocalInvoice(invoice.id);
        if (updated) {
          syncLocalInvoiceLinks(updated, invoice);
          setInvoice(updated);
          setMessage({ severity: 'success', text: `Invoice ${updated.invoiceNo} voided.` });
        }
        break;
      }
      case 'search':
        setShowList(true);
        setInvoice(null);
        setEditable(false);
        setTab(0);
        setIsPrintingView(false);
        break;
      default:
        break;
    }
  };

  const handleSave = () => {
    if (!invoice) return;
    if (!invoice.partyCode) {
      setMessage({ severity: 'error', text: 'Party Code is required to save.' });
      return;
    }
    const previous = localInvoiceRepo.get(invoice.id);
    const saved = localInvoiceRepo.save(recomputeInvoiceTotals(invoice));
    syncLocalInvoiceLinks(saved, previous);
    setInvoice(saved);
    setMessage({ severity: 'success', text: `Invoice ${saved.invoiceNo} saved.` });
  };

  const disabledActions: ToolbarAction[] = [];
  if (!invoice) disabledActions.push('edit', 'delete', 'final', 'void');
  if (invoice?.status.final) disabledActions.push('edit', 'delete', 'final');
  if (invoice?.status.void) disabledActions.push('final', 'edit');
  if (!editable || isPrintingView) disabledActions.push('save');

  return (
    <Box sx={navyTrustScreenSx}>
      <PageShell
        breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Local Invoices Entry and Printing']}
        title="Local invoice entry & printing"
        eyebrow="Air Export · Local Invoice"
        subtitle="Complete the invoice details, charges, and print options."
        actions={!showList ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => { setShowList(true); setInvoice(null); setEditable(false); setTab(0); setIsPrintingView(false); setMessage(null); }}
              sx={{ fontFamily: navyTrustFontFamily, borderColor: navyTrustColors.border, color: navyTrustColors.textSecondary }}
            >
              Back to List
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockOutlinedIcon fontSize="small" />}
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
              Final
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
        {message && (
          <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {showList ? (
          <>
            <TransactionToolbar actions={['new']} onAction={handleAction} />
            <LocalInvoiceGrid
              invoices={localInvoiceRepo.list()}
              onOpenInvoice={loadInvoice}
              onEditInvoice={editInvoiceFromList}
              onPrintInvoice={printInvoiceFromList}
              onDeleteInvoice={deleteInvoiceFromList}
            />
          </>
        ) : (
          <>
            {invoice && (
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                <Chip
                  label={invoice.invoiceNo}
                  sx={{ bgcolor: '#1a2233', color: '#fff', fontWeight: 700, fontFamily: navyTrustHeadingFontFamily, fontSize: 12.5, borderRadius: '8px' }}
                />
                {editable && (
                  <Chip
                    label="Editing"
                    sx={{ bgcolor: '#fff4e0', color: navyTrustColors.warning, fontWeight: 700, border: '1px solid #f5d599' }}
                  />
                )}
                {invoice.status.final && (
                  <Chip label="Final" sx={{ bgcolor: navyTrustColors.successBg, color: navyTrustColors.success, fontWeight: 700, border: `1px solid ${navyTrustColors.successBorder}` }} />
                )}
                {invoice.status.void && (
                  <Chip label="Void" sx={{ bgcolor: navyTrustColors.dangerBg, color: navyTrustColors.danger, fontWeight: 700, border: `1px solid ${navyTrustColors.dangerBorder}` }} />
                )}
              </Stack>
            )}

            <Box sx={pillTabsSx}>
              {(isPrintingView ? ['Printing'] : ['Entry']).map((label, i) => (
                <Box key={label} className={`pill-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>
                  {label}
                </Box>
              ))}
            </Box>

            {!invoice ? (
              <Alert severity="info">Click NEW to create an invoice, or use Search to return to the invoice list.</Alert>
            ) : (
              <>
                {isPrintingView ? <PrintingTab invoice={invoice} editable={editable} onChange={setInvoice} /> : <EntryTab invoice={invoice} editable={editable} onChange={setInvoice} />}
              </>
            )}
          </>
        )}
      </PageShell>
    </Box>
  );
}
