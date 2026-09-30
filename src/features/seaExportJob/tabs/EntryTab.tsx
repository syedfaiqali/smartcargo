import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  FormRow,
  FormField,
  SectionHeader,
} from "../../../components/FormGrid";
import { NumberField } from "../../../components/NumberField";
import { DateField } from "../../../components/DateField";
import { TimeField } from "../../../components/TimeField";
import { WorkflowSection } from "../../../components/WorkflowSection";
import { SeaExportJob } from "../../../domain/seaExportJob";
import {
  agentRepo,
  chargeableRepo,
  currencyRepo,
  foreignAgentRepo,
  jobTypeRepo,
  partyRepo,
  seaPortRepo,
  shippingLineRepo,
  spoRepo,
} from "../../../data/masterDataService";
import { Checkbox } from "@mui/material";

interface EntryTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const yn = (v: string) => (
  <>
    <MenuItem value="N">N</MenuItem>
    <MenuItem value="Y">Y</MenuItem>
  </>
);

export function EntryTab({ job, editable, onChange }: EntryTabProps) {
  const [openSection, setOpenSection] = useState(1);
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();
  const spoCodes = spoRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === "CLEARING");
  const deliveryAgents = agentRepo.find((a) => a.kind === "DELIVERY");
  const currencies = currencyRepo.list();
  const chargeableCodes = chargeableRepo.list();
  const jobTypes = jobTypeRepo.list();

  const set = <K extends keyof SeaExportJob>(key: K, value: SeaExportJob[K]) =>
    onChange({ ...job, [key]: value });

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    onChange({ ...job, partyCode, partyName: p?.name ?? "" });
  };

  const selectFromE = [
    { code: '001', name: 'Form E No.' },
    { code: '002', name: 'Fin. Inst. No.' },
    { code: '003', name: 'EPZ NOC No.' },
    { code: '004', name: 'GD No.' },
  ];

  const hblType = [
    { code: 'GEN - 01', name: 'General Format' },
      { code: 'MSL - 01', name: 'Masum Logistics' },
  ];

  return (
    <Box>
      <Box>
        {/* LEFT COLUMN — Job identity, parties, routing */}
        <WorkflowSection
          title="Job, Parties & Routing"
          subtitle="Complete the core job and party details first"
          open={openSection === 1}
          onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
        >
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Branch"
                fullWidth
                required
                value={job.branch}
                disabled={!editable}
                onChange={(e) => set("branch", e.target.value)}
              >
                <MenuItem value="">Select Branch</MenuItem>
                <MenuItem value="KHI">KHI</MenuItem>
              </TextField>
            </FormField>
            <FormField md={2}>
              <TextField label="Job No." fullWidth value={job.jobNo} disabled />
            </FormField>
            <FormField md={2}>
              <NumberField
                label=""
                fullWidth
                value={job.jobNo2}
                disabled={!editable}
                onChange={(event) => set("jobNo2", event.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="Date"
                value={job.date}
                disabled={!editable}
                onChange={(value) => set("date", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Job Type"
                fullWidth
                required
                value={job.jobType}
                disabled={!editable}
                onChange={(e) => set("jobType", e.target.value)}
              >
                <MenuItem value="">Select Job Type</MenuItem>
                {jobTypes.map((type) => (
                  <MenuItem key={type.code} value={type.code}>
                    {type.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <NumberField
                label="Load Program No"
                fullWidth
                value={job.loadProgramNo}
                disabled={!editable}
                onChange={(e) => set("loadProgramNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <NumberField
                label="Consol No"
                fullWidth
                value={job.consolNo}
                disabled={!editable}
                onChange={(e) => set("consolNo", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Consol [Y/N]"
                fullWidth
                value={job.consolYN}
                disabled={!editable}
                onChange={(e) => set("consolYN", e.target.value as "Y" | "N")}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Nomination"
                fullWidth
                value={job.nomination}
                disabled={!editable}
                onChange={(e) => set("nomination", e.target.value as "Y" | "N")}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Quot. Ref No."
                fullWidth
                value={job.quotRefNo}
                disabled={!editable}
                onChange={(e) => set("quotRefNo", e.target.value)}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <SectionHeader>Parties</SectionHeader>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormRow>
                <FormField md={6}>
                  <NumberField
                    label="Credit Limit"
                    fullWidth
                    value={job.creditLimit}
                    disabled={!editable}
                    onChange={(e) => set("creditLimit", Number(e.target.value))}
                  />
                </FormField>
                <FormField md={6}>
                  <TextField
                    select
                    label="Party Code"
                    required
                    fullWidth
                    value={job.partyCode}
                    disabled={!editable}
                    onChange={(e) => setPartyCode(e.target.value)}
                  >
                    {parties.map((p) => (
                      <MenuItem key={p.code} value={p.code}>
                        {p.code} — {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField
                    select
                    label="Sub Agent's Party"
                    required
                    fullWidth
                    value={job.subAgentParty}
                    disabled={!editable}
                    onChange={(e) => set("subAgentParty", e.target.value)}
                  >
                    {parties.map((p) => (
                      <MenuItem key={p.code} value={p.code}>
                        {p.code} — {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    label="Commodity"
                    fullWidth
                    value={job.commodity}
                    disabled={!editable}
                    onChange={(e) => set("commodity", e.target.value)}
                  />
                </FormField>
                <FormField md={6}>
                  <TextField
                    select
                    label="Foreign Agent"
                    fullWidth
                    value={job.foreignAgent}
                    disabled={!editable}
                    onChange={(e) => set("foreignAgent", e.target.value)}
                  >
                    {foreignAgents.map((a) => (
                      <MenuItem key={a.code} value={a.code}>
                        {a.code} — {a.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    select
                    label="Shipping Line"
                    fullWidth
                    value={job.shippingLine}
                    disabled={!editable}
                    onChange={(e) => set("shippingLine", e.target.value)}
                  >
                    {shippingLines.map((s) => (
                      <MenuItem key={s.code} value={s.code}>
                        {s.code} — {s.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    select
                    label="S/Line Agent"
                    required
                    fullWidth
                    value={job.sLineAgent}
                    disabled={!editable}
                    onChange={(e) => set("sLineAgent", e.target.value)}
                  >
                    {parties.map((p) => (
                      <MenuItem key={p.code} value={p.code}>
                        {p.code} — {p.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    select
                    label="Delivery Agent"
                    fullWidth
                    value={job.deliveryAgent}
                    disabled={!editable}
                    onChange={(e) => set("deliveryAgent", e.target.value)}
                  >
                    {deliveryAgents.map((a) => (
                      <MenuItem key={a.code} value={a.code}>
                        {a.code} — {a.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
              </FormRow>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  height: "100%",
                  minHeight: 200,
                  p: 2,
                  borderStyle: "dashed",
                  borderColor: "primary.light",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <AttachFileOutlinedIcon
                  color="primary"
                  sx={{ fontSize: 36, mb: 1 }}
                />
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                  Attachment
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  Attach quotation, party documents, or supporting files.
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={!editable}
                  startIcon={<AttachFileOutlinedIcon />}
                >
                  Choose File
                  <input
                    hidden
                    type="file"
                    onChange={(event) =>
                      set("attachmentName", event.target.files?.[0]?.name ?? "")
                    }
                  />
                </Button>
                {job.attachmentName && (
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      maxWidth: "100%",
                    }}
                  >
                    <Typography variant="caption" noWrap>
                      {job.attachmentName}
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      disabled={!editable}
                      onClick={() => set("attachmentName", "")}
                      startIcon={<DeleteOutlineIcon />}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <SectionHeader>Routing</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="SPO Code"
                fullWidth
                value={job.spoCode}
                disabled={!editable}
                onChange={(e) => set("spoCode", e.target.value)}
              >
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Port of Load *"
                required
                fullWidth
                value={job.portOfLoad}
                disabled={!editable}
                onChange={(e) => set("portOfLoad", e.target.value)}
              >
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Destination *"
                required
                fullWidth
                value={job.destination}
                disabled={!editable}
                onChange={(e) => set("destination", e.target.value)}
              >
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Wharf"
                required
                fullWidth
                value={job.wharf}
                disabled={!editable}
                onChange={(e) => set("wharf", e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Terminal"
                required
                fullWidth
                value={job.terminal}
                disabled={!editable}
                onChange={(e) => set("terminal", e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Clearing Agent"
                fullWidth
                value={job.clearingAgent}
                disabled={!editable}
                onChange={(e) => set("clearingAgent", e.target.value)}
              >
                {clearingAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Shipment Status"
                required
                fullWidth
                value={job.jobStatus}
                disabled
                onChange={(e) => set("jobStatus", e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <DateField
                label="Shipment Date"
                value={job.shipmentdate}
                disabled
                onChange={(value) => set("shipmentdate", value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Booking No."
                fullWidth
                value={job.bookingNo}
                disabled={!editable}
                onChange={(e) => set("bookingNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="GD No."
                fullWidth
                value={job.gdNo}
                disabled={!editable}
                onChange={(e) => set("gdNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="GD Date"
                fullWidth
                value={job.gdDate}
                disabled={!editable}
                onChange={(value) => set("gdDate", value)}
              />
            </FormField>
          </FormRow>

        </WorkflowSection>

        {/* MIDDLE COLUMN — measurements, docs, milestones */}
        <WorkflowSection
          title="Cargo, Documents & Bill of Lading"
          subtitle="Add shipment quantities, invoices and document references"
          open={openSection === 2}
          onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
        >

          <SectionHeader>Document Milestones</SectionHeader>
          <FormRow>
            <FormField md={3}>
              <TextField
                select
                label="CC Place"
                required
                fullWidth
                value={job.ccPlace}
                disabled={!editable}
                onChange={(e) => set("ccPlace", e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <DateField
                label="CC Date"
                value={job.ccDate}
                disabled={!editable}
                onChange={(value) => set("ccDate", value)}
              />
            </FormField>
            <FormField md={3}>
              <TimeField
                label="CC Time"
                value={job.ccDateTime}
                disabled={!editable}
                onChange={(value) => set("ccDateTime", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Doc. Received"
                value={job.docReceived}
                disabled={!editable}
                onChange={(value) => set("docReceived", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                select
                label="Select From E"
                required
                fullWidth
                value={job.selectFromE}
                disabled={!editable}
                onChange={(e) => set("selectFromE", e.target.value)}
              >
                {selectFromE.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                label=""
                fullWidth
                value={job.selectFromE}
                disabled={!editable}
                onChange={(e) => set("selectFromE", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Form 'E' Date"
                value={job.formEDate}
                disabled={!editable}
                onChange={(value) => set("formEDate", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Cutt Off Date"
                value={job.cuttOffDate}
                disabled={!editable}
                onChange={(value) => set("cuttOffDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="FormE/F.Ins. No.(2)"
                fullWidth
                value={job.formEInsNo2}
                disabled={!editable}
                onChange={(e) => set("formEInsNo2", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Date"
                value={job.formEInsNo2Date}
                disabled={!editable}
                onChange={(value) => set("formEInsNo2Date", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="SI File Cutt Off"
                value={job.siFileCuttOff}
                disabled={!editable}
                onChange={(value) => set("siFileCuttOff", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="FormE/F.Ins. No.(3)"
                fullWidth
                value={job.formEInsNo3}
                disabled={!editable}
                onChange={(e) => set("formEInsNo3", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Date"
                value={job.formEInsNo3Date}
                disabled={!editable}
                onChange={(value) => set("formEInsNo3Date", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="SI Filed"
                value={job.siFiled}
                disabled={!editable}
                onChange={(value) => set("siFiled", value)}
              />
            </FormField>
          </FormRow>
          {/* <FormRow>
            
          </FormRow> */}
          <FormRow>
            <FormField md={3}>
              <DateField
                label="Ship Received Date"
                value={job.shipReceivedDate}
                disabled={!editable}
                onChange={(value) => set("shipReceivedDate", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Hand Over to S/L"
                value={job.handOverToSl}
                disabled={!editable}
                onChange={(value) => set("handOverToSl", value)}
              />
            </FormField>
            <FormField md={3}>
              <TimeField
                label="Time"
                value={job.handOverToSlTime}
                disabled={!editable}
                onChange={(value) => set("handOverToSlTime", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Doc. Despatch Date"
                value={job.docDespatchDate}
                disabled={!editable}
                onChange={(value) => set("docDespatchDate", value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Shipping Bill / Mate's Receipt</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="S/B No."
                fullWidth
                value={job.sbNo}
                disabled={!editable}
                onChange={(e) => set("sbNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="S/B Place"
                required
                fullWidth
                value={job.sbPlace}
                disabled={!editable}
                onChange={(e) => set("sbPlace", e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <DateField
                label="S/B Date"
                value={job.sbDate}
                disabled={!editable}
                onChange={(value) => set("sbDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="M.R. No."
                fullWidth
                value={job.mrNo}
                disabled={!editable}
                onChange={(e) => set("mrNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="M.R Date"
                value={job.mrDate}
                disabled={!editable}
                onChange={(value) => set("mrDate", value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="EGM"
                fullWidth
                value={job.egm}
                disabled={!editable}
                onChange={(e) => set("egm", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Bill of Lading</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="MBL No."
                fullWidth
                value={job.mblNo}
                disabled={!editable}
                onChange={(e) => set("mblNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="MBL Date"
                value={job.mblDate}
                disabled={!editable}
                onChange={(value) => set("mblDate", value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="MBL Received"
                fullWidth
                value={job.mblReceived}
                disabled={!editable}
                onChange={(e) =>
                  set("mblReceived", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="HBL Type"
                required
                fullWidth
                value={job.hblType}
                disabled={!editable}
                onChange={(e) => set("hblType", e.target.value)}
              >
                {hblType.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <DateField
                label="Sailing Date"
                value={job.sailingDate}
                disabled={!editable}
                onChange={(value) => set("sailingDate", value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="PickUp/Stuffing"
                value={job.pickupStuffing}
                disabled={!editable}
                onChange={(value) => set("pickupStuffing", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="HBL No."
                fullWidth
                value={job.hblNo}
                disabled={!editable}
                onChange={(e) => set("hblNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="HBL Date"
                value={job.hblDate}
                disabled={!editable}
                onChange={(value) => set("hblDate", value)}
              />
            </FormField>
          </FormRow>
          <SectionHeader>Cargo Quantity &amp; Currency</SectionHeader>
          <FormRow>
            <FormField md={12}><Typography variant="caption" sx={{ fontWeight: 700 }}>Consol Total</Typography></FormField>
            <FormField md={3}>
              <NumberField
                label="CBM"
                fullWidth
                value={job.consolTotal.cbm}
                disabled={!editable}
                onChange={(e) => set("consolTotal", { ...job.consolTotal, cbm: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="No. of Packages"
                type="number"
                fullWidth
                value={job.noOfPackages}
                disabled={!editable}
                onChange={(e) => set("noOfPackages", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <NumberField
                label="Gross Weight"
                fullWidth value={job.consolTotal.grossWeight} disabled={!editable}
                onChange={(e) => set("consolTotal", { ...job.consolTotal, grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField label="UOM" fullWidth value={job.consolTotal.uom} disabled={!editable} onChange={(e) => set("consolTotal", { ...job.consolTotal, uom: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}><NumberField label="Net Weight" fullWidth value={job.consolTotal.netWeight} disabled={!editable} onChange={(e) => set("consolTotal", { ...job.consolTotal, netWeight: Number(e.target.value) })} /></FormField>
            <FormField md={3}><NumberField label="No. of Shipments" fullWidth value={job.consolTotal.noOfShipments} disabled={!editable} onChange={(e) => set("consolTotal", { ...job.consolTotal, noOfShipments: Number(e.target.value) })} /></FormField>
            <FormField md={3}>
              <TextField
                fullWidth
                label="Destination"
                value={job.destination}
                disabled={!editable}
              // onChange={(e) =>
              //   update({ destinationCode: e.target.value })
              // }
              />
            </FormField>
            <FormField md={3}>
              <TextField label="Last Consol No." fullWidth value={job.lastConsolNo} disabled={!editable} onChange={(e) => set("lastConsolNo", e.target.value)} /></FormField></FormRow>
          <SectionHeader>Shipment Mode</SectionHeader>
          <FormRow>
            <FormField md={3}>
              <TextField
                select
                label="LCL/FCL"
                required
                fullWidth
                value={job.lclFcl}
                disabled={!editable}
                onChange={(e) => set("lclFcl", e.target.value as "LL" | "LF" | "FL" | "FF" | "PF")}
              >
                <MenuItem value="LL">LCL/LCL</MenuItem>
                <MenuItem value="LF">LCL/FCL</MenuItem>
                <MenuItem value="FL">FCL/LCL</MenuItem>
                <MenuItem value="FF">FCL/FCL</MenuItem>
                <MenuItem value="PF">P/FCL</MenuItem>
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="M.PP/CC"
                fullWidth
                value={job.mPpCc}
                disabled={!editable}
                onChange={(e) => set("mPpCc", e.target.value)}
              >
                <MenuItem value="">Select Chargeable Code</MenuItem>
                {chargeableCodes.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>)}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="CY/CFS"
                fullWidth
                value={job.cyCfs}
                disabled={!editable}
                onChange={(e) => set("cyCfs", e.target.value as "CY" | "CFS")}
              >
                <MenuItem value="CYCFS">CY/CFS</MenuItem>
                <MenuItem value="CFSCY">CFS/CY</MenuItem>
                <MenuItem value="CYCY">CY/CY</MenuItem>
                <MenuItem value="CFCFS">CFS/CFS</MenuItem>
                <MenuItem value="CYSD">CY/SD</MenuItem>
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="H.PP/CC"
                fullWidth
                value={job.hPpCc}
                disabled={!editable}
                onChange={(e) => set("hPpCc", e.target.value)}
              >
                <MenuItem value="">Select Chargeable Code</MenuItem>
                {chargeableCodes.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>)}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <DateField
                label="CY/CFS Cutt Off"
                value={job.cyCfsCutOff}
                disabled={!editable}
                onChange={(value) => set("cyCfsCutOff", value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="RO No."
                fullWidth
                value={job.roNo}
                disabled={!editable}
                onChange={(e) => set("roNo", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <NumberField label="No. of Packages" fullWidth value={job.consolTotal.noOfPackages} disabled={!editable} onChange={(e) => set("consolTotal", { ...job.consolTotal, noOfPackages: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Unit"
                fullWidth
                value={job.unit}
                disabled={!editable}
                onChange={(e) => set("unit", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="No. of Pcs (QTY)"
                type="number"
                fullWidth
                value={job.noOfPcsQty}
                disabled={!editable}
                onChange={(e) => set("noOfPcsQty", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Unit (QTY)"
                fullWidth
                value={job.unitQty}
                disabled={!editable}
                onChange={(e) => set("unitQty", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="Currency Code"
                fullWidth
                value={job.currencyCode}
                disabled={!editable}
                onChange={(e) => set("currencyCode", e.target.value)}
              >
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                label="Exchange Rate"
                type="number"
                fullWidth
                value={job.exchangeRate}
                disabled={!editable}
                onChange={(e) => set("exchangeRate", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="Grs Weight"
                type="number"
                fullWidth
                value={job.grossWeight}
                disabled={!editable}
                onChange={(e) => set("grossWeight", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Net Weight"
                type="number"
                fullWidth
                value={job.netWeight}
                disabled={!editable}
                onChange={(e) => set("netWeight", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Vol.Weight"
                type="number"
                fullWidth
                value={job.volWeight}
                disabled={!editable}
                onChange={(e) => set("volWeight", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="CBM"
                type="number"
                fullWidth
                value={job.cbm}
                disabled={!editable}
                onChange={(e) => set("cbm", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="CBM Rate"
                type="number"
                fullWidth
                value={job.cbmRate}
                disabled={!editable}
                onChange={(e) => set("cbmRate", Number(e.target.value))}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="IncoTerm"
                fullWidth
                value={job.incoTerm}
                disabled={!editable}
                onChange={(e) => set("incoTerm", e.target.value)}
              >
                <MenuItem value="">Select Chargeable Code</MenuItem>
                {chargeableCodes.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>)}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                label="HS Code"
                fullWidth
                value={job.hsCode}
                disabled={!editable}
                onChange={(e) => set("hsCode", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Stack Code"
                fullWidth
                value={job.stackCode}
                disabled={!editable}
                onChange={(e) => set("stackCode", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="Vehicle No."
                fullWidth
                value={job.vehicleNo}
                disabled={!editable}
                onChange={(e) => set("vehicleNo", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Vehicle Type"
                fullWidth
                value={job.vehicleType}
                disabled={!editable}
                onChange={(e) => set("vehicleType", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Run No."
                fullWidth
                value={job.runNo}
                disabled={!editable}
                onChange={(e) => set("runNo", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Shipper Invoice</SectionHeader>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="Inv. No."
                fullWidth
                value={job.shipperInvoice.invNo}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    invNo: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Date"
                value={job.shipperInvoice.date}
                disabled={!editable}
                onChange={(value) =>
                  set("shipperInvoice", { ...job.shipperInvoice, date: value })
                }
              />
            </FormField>
            <FormField md={3}>
              <TextField
                select
                label="Currency Code"
                fullWidth
                value={job.shipperInvoice.currencyCode}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    currencyCode: e.target.value,
                  })
                }
              >
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={job.shipperInvoice.amount}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    amount: Number(e.target.value),
                  })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="P.O. No."
                fullWidth
                value={job.shipperInvoice.poNo}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    poNo: e.target.value,
                  })
                }
              />
            </FormField>
          </FormRow>
        </WorkflowSection>

        {/* RIGHT COLUMN — flags, remarks, linked grids, voyage schedule */}
        <WorkflowSection
          title="Shipment Status, Voyage & History"
          subtitle="Finish shipment flags, milestones and voyage details"
          open={openSection === 3}
          onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
        >
          <SectionHeader>Finance &amp; Shipment Flags</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Invoice Req."
                fullWidth
                value={job.invoiceRequired}
                disabled={!editable}
                onChange={(e) =>
                  set("invoiceRequired", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Local Invoice"
                fullWidth
                value={job.localInvoice}
                disabled={!editable}
                onChange={(e) =>
                  set("localInvoice", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Int'l Invoice"
                fullWidth
                value={job.intlInvoice}
                disabled={!editable}
                onChange={(e) =>
                  set("intlInvoice", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Payable To S/L"
                fullWidth
                value={job.payableToSl}
                disabled={!editable}
                onChange={(e) =>
                  set("payableToSl", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Refund From S/L"
                fullWidth
                value={job.refundFromSl}
                disabled={!editable}
                onChange={(e) =>
                  set("refundFromSl", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="DD Ship"
                fullWidth
                value={job.ddShip}
                disabled={!editable}
                onChange={(e) => set("ddShip", e.target.value as "Y" | "N")}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Shipment Milestones</SectionHeader>
          <FormRow>
            <FormField md={3}>
              <TextField
                select
                label="Shipment Delivered"
                fullWidth
                value={job.shipmentDelivered}
                disabled={!editable}
                onChange={(e) =>
                  set("shipmentDelivered", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={3}>
              <DateField
                label="Delivered Date"
                value={job.deliveredDate}
                disabled={!editable}
                onChange={(value) => set("deliveredDate", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Release Message Date"
                value={job.releaseMessageDate}
                disabled={!editable}
                onChange={(value) => set("releaseMessageDate", value)}
              />
            </FormField>
            <FormField md={3}>
              <DateField
                label="Pre-Alert Date"
                value={job.preAlertDate}
                disabled={!editable}
                onChange={(value) => set("preAlertDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                select
                label="Shipment Containerized"
                fullWidth
                value={job.shipmentContainerized}
                disabled={!editable}
                onChange={(e) =>
                  set("shipmentContainerized", e.target.value as "Y" | "N")
                }
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={9}>
              <TextField
                label="Non-Printable Remarks"
                fullWidth
                multiline
                minRows={2}
                value={job.nonPrintableRemarks}
                disabled={!editable}
                onChange={(e) => set("nonPrintableRemarks", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Voyage Schedule</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <DateField
                label="POL ETA"
                value={job.polEta}
                disabled={!editable}
                onChange={(value) => set("polEta", value)}
              />
            </FormField>
            <FormField md={4}>
              <TimeField
                label="Pol ETA Time"
                value={job.polEtaTime}
                disabled={!editable}
                onChange={(value) => set("polEtaTime", value)}
              />
            </FormField>
            <FormField md={4}>
              <Checkbox
                // label="CC Time"
                checked={job.polEtaChecked}
                disabled={!editable}
                onChange={(event) => set("polEtaChecked", event.target.checked)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="POL ETD"
                value={job.polEtd}
                disabled={!editable}
                onChange={(value) => set("polEtd", value)}
              />
            </FormField>
            <FormField md={4}>
              <TimeField
                label="Pol ETD Time"
                value={job.polEtdTime}
                disabled={!editable}
                onChange={(value) => set("polEtdTime", value)}
              />
            </FormField>
            <FormField md={4}><Box /></FormField>
            <FormField md={4}>
              <DateField
                label="ETA At Dest"
                value={job.etaAtDest}
                disabled={!editable}
                onChange={(value) => set("etaAtDest", value)}
              />
            </FormField>
            <FormField md={4}>
              <TimeField
                label="ETA At Dest Time"
                value={job.etaAtDestTime}
                disabled={!editable}
                onChange={(value) => set("etaAtDestTime", value)}
              />
            </FormField>
            <FormField md={4}>
              <Checkbox
                // label="CC Time"
                checked={job.etaAtDestChecked}
                disabled={!editable}
                onChange={(event) => set("etaAtDestChecked", event.target.checked)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Vessel"
                fullWidth
                value={job.vessel}
                disabled={!editable}
                onChange={(e) => set("vessel", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Voyage"
                fullWidth
                value={job.voyage}
                disabled={!editable}
                onChange={(e) => set("voyage", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Rotation No."
                fullWidth
                value={job.rotationNo}
                disabled={!editable}
                onChange={(e) => set("rotationNo", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Transshipment Points</SectionHeader>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "primary.light",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
            }}
          >
            {job.transshipmentPoints.map((tp, i) => {
              const update = (patch: Partial<typeof tp>) => {
                const points = [...job.transshipmentPoints];
                points[i] = { ...tp, ...patch };
                set("transshipmentPoints", points);
              };
              return (
                <Box
                  key={tp.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "72px 2fr 1.35fr 38px 1.35fr 38px 1.5fr 1fr",
                    },
                    gap: 1,
                    alignItems: "center",
                    p: 1,
                    borderBottom:
                      i === job.transshipmentPoints.length - 1
                        ? 0
                        : "1px solid",
                    borderColor: "divider",
                    bgcolor: i % 2 ? "#f8fafc" : "#eef5fb",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    T/Ship {i + 1}
                  </Typography>
                  <TextField
                    size="small"
                    label="Destination"
                    value={tp.destinationCode}
                    disabled={!editable}
                    onChange={(e) =>
                      update({ destinationCode: e.target.value })
                    }
                  />
                  <DateField
                    label="ETA"
                    value={tp.eta}
                    disabled={!editable}
                    onChange={(value) => update({ eta: value })}
                  />
                  <Checkbox size="small" checked={tp.etaChecked ?? false} disabled={!editable} onChange={(event) => update({ etaChecked: event.target.checked })} />
                  <DateField
                    label="ETD"
                    value={tp.etd}
                    disabled={!editable}
                    onChange={(value) => update({ etd: value })}
                  />
                  <Checkbox size="small" checked={tp.etdChecked ?? false} disabled={!editable} onChange={(event) => update({ etdChecked: event.target.checked })} />
                  <TextField
                    size="small"
                    label="Vessel"
                    value={tp.vessel}
                    disabled={!editable}
                    onChange={(e) => update({ vessel: e.target.value })}
                  />
                  <TextField
                    size="small"
                    label="Voyage"
                    value={tp.voyage}
                    disabled={!editable}
                    onChange={(e) => update({ voyage: e.target.value })}
                  />
                </Box>
              );
            })}
          </Box>
          <Paper variant="outlined" sx={{ display: "none" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Point</TableCell>
                  <TableCell>Dest. Code</TableCell>
                  <TableCell>ETA</TableCell>
                  <TableCell>ETD</TableCell>
                  <TableCell>Vessel</TableCell>
                  <TableCell>Voyage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.transshipmentPoints.map((tp, i) => (
                  <TableRow key={tp.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.destinationCode}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, destinationCode: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <DateField
                        label="ETA"
                        variant="standard"
                        value={tp.eta}
                        disabled={!editable}
                        onChange={(value) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, eta: value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <DateField
                        label="ETD"
                        variant="standard"
                        value={tp.etd}
                        disabled={!editable}
                        onChange={(value) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, etd: value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.vessel}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, vessel: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.voyage}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, voyage: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
            <SectionHeader>Container Summary</SectionHeader>
            <Box sx={{ display: "flex", gap: 1 }}><Button size="small" color="error" variant="outlined" disabled={!editable || selectedContainerIds.length === 0} onClick={() => setDeleteDialogOpen(true)}>Delete Selected</Button><Button size="small" variant="contained" disabled={!editable} onClick={() => set("containers", [...job.containers, { id: crypto.randomUUID(), containerNo: "", sizeType: "", sealNo: "", isoCode: "", vehicleNo: "", vehicleDate: "", vehicleEta: "", vehicleAta: "", serialNo: job.containers.length + 1, containerTypes: "", vehicleType: "", polEta: "", polAta: "", pcd: "", transporterName: "", driverName: "", mobileNo: "", charges: 0, fromPol: "", toPod: "", noOfPkgs: 0, unit: "", cbm: 0, grossWeight: 0, netWeight: 0 }])}>+ Add Container</Button></Box>
          </Box>
          <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><Checkbox size="small" checked={job.containers.length > 0 && selectedContainerIds.length === job.containers.length} onChange={(event) => setSelectedContainerIds(event.target.checked ? job.containers.map((item) => item.id) : [])} /></TableCell><TableCell>Action</TableCell><TableCell>Container No.</TableCell>
                  <TableCell>Size/Type</TableCell>
                  <TableCell>Seal No.</TableCell>
                  <TableCell>ISO Code</TableCell>
                  <TableCell>Vehicle No.</TableCell><TableCell>Vehicle Date</TableCell><TableCell>Vehicle ETA</TableCell><TableCell>Vehicle ATA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.containers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Typography variant="caption" color="text.secondary">
                        No containers — add on the Container tab.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.containers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><Checkbox size="small" checked={selectedContainerIds.includes(c.id)} onChange={(event) => setSelectedContainerIds(event.target.checked ? [...selectedContainerIds, c.id] : selectedContainerIds.filter((id) => id !== c.id))} /></TableCell><TableCell><Button size="small" color="error" disabled={!editable} onClick={() => set("containers", job.containers.filter((item) => item.id !== c.id))}>×</Button></TableCell>
                      <TableCell><TextField size="small" value={c.containerNo} disabled={!editable} onChange={(e) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, containerNo: e.target.value } : item))} /></TableCell>
                      <TableCell><TextField size="small" value={c.sizeType} disabled={!editable} onChange={(e) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, sizeType: e.target.value } : item))} /></TableCell>
                      <TableCell><TextField size="small" value={c.sealNo} disabled={!editable} onChange={(e) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, sealNo: e.target.value } : item))} /></TableCell>
                      <TableCell><TextField size="small" value={c.isoCode} disabled={!editable} onChange={(e) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, isoCode: e.target.value } : item))} /></TableCell>
                      <TableCell><TextField size="small" value={c.vehicleNo} disabled={!editable} onChange={(e) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, vehicleNo: e.target.value } : item))} /></TableCell>
                      <TableCell><DateField label="" value={c.vehicleDate} disabled={!editable} onChange={(value) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, vehicleDate: value } : item))} /></TableCell>
                      <TableCell><DateField label="" value={c.vehicleEta} disabled={!editable} onChange={(value) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, vehicleEta: value } : item))} /></TableCell>
                      <TableCell><DateField label="" value={c.vehicleAta} disabled={!editable} onChange={(value) => set("containers", job.containers.map((item) => item.id === c.id ? { ...item, vehicleAta: value } : item))} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Delete selected containers?</DialogTitle>
            <DialogContent>Are you sure you want to delete {selectedContainerIds.length} selected container row(s)?</DialogContent>
            <DialogActions><Button onClick={() => setDeleteDialogOpen(false)}>No</Button><Button color="error" variant="contained" onClick={() => { set("containers", job.containers.filter((item) => !selectedContainerIds.includes(item.id))); setSelectedContainerIds([]); setDeleteDialogOpen(false); }}>Yes, Delete</Button></DialogActions>
          </Dialog>

          <SectionHeader>Consol</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>Container No.</TableCell>
                  <TableCell>Vessel</TableCell>
                  <TableCell>Voyage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.consolGrid.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="caption" color="text.secondary">
                        No Consol Job found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.consolGrid.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.jobNo}</TableCell>
                      <TableCell>{c.containerNo}</TableCell>
                      <TableCell>{c.vessel}</TableCell>
                      <TableCell>{c.voyage}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <SectionHeader>Job History</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>PKR Amount</TableCell>
                  <TableCell>Final</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.jobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="caption" color="text.secondary">
                        No Record found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.jobHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.no}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>{h.type}</TableCell>
                      <TableCell>{h.pkrAmount.toFixed(2)}</TableCell>
                      <TableCell>{h.final ? "Y" : "N"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </WorkflowSection>
      </Box>
    </Box>
  );
}
