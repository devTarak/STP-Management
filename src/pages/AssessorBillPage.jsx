import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Select, MenuItem,
  Button, Table, TableContainer, TableHead, TableBody, TableRow, TableCell,
  Divider, Alert, CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RouteIcon from '@mui/icons-material/Route';
import CalculateIcon from '@mui/icons-material/Calculate';
import MapIcon from '@mui/icons-material/Map';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import UndoIcon from '@mui/icons-material/Undo';
import ApiIcon from '@mui/icons-material/Api';
import api from '@/config/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);

const FIELD_STYLE = { '& .MuiInputBase-root': { borderRadius: 2, bgcolor: '#fff' } };

function numberToWords(num) {
  if (num === 0) return 'Zero Taka Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }
  const taka = Math.floor(num);
  const paisa = Math.round((num - taka) * 100);
  let result = convert(taka) + ' Taka';
  if (paisa > 0) result += ' and ' + convert(paisa) + ' Paisa';
  return result + ' Only';
}

function SectionCard({ icon, title, children }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'grey.50' }}>
        {icon}
        <Typography fontWeight={600}>{title}</Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

export default function AssessorBillPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [instDistricts, setInstDistricts] = useState([]);
  const [instUpazilas, setInstUpazilas] = useState([]);
  const [assrDistricts, setAssrDistricts] = useState([]);
  const [assrUpazilas, setAssrUpazilas] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [calcDistance, setCalcDistance] = useState(0);
  const [applyTax, setApplyTax] = useState(true);

  const [form, setForm] = useState({
    inst_name: '', inst_name_bn: '', inst_stp_code: '', inst_address: '',
    inst_country: '', inst_division_id: '', inst_district_id: '', inst_upazila_id: '',
    inst_contact: '', inst_email: '',
    assessor_name: '', assessor_phone: '', assessor_email: '', assessor_country: '',
    assessor_division_id: '', assessor_district_id: '', assessor_upazila_id: '',
    assessor_address: '',
    trade_name: '', assessment_date: new Date().toISOString().slice(0, 10), total_participants: 10,
    bill_no: 'BIL-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001',
  });

  useEffect(() => {
    api.get('/assessor-bill/config')
      .then(res => {
        const d = res.data.data;
        setConfig(d);
        const s = d.settings || {};
        setForm(prev => ({
          ...prev,
          inst_name: s.stp_name || '', inst_name_bn: s.stp_name_bn || '',
          inst_stp_code: s.stp_code || '', inst_address: s.address || '',
          inst_country: s.country || '',
          inst_division_id: s.division ? String(s.division) : '',
          inst_district_id: s.district ? String(s.district) : '',
          inst_upazila_id: s.upazila ? String(s.upazila) : '',
          inst_contact: s.contact_no || '', inst_email: s.email || '',
        }));
        setInstDistricts(d.inst_districts || []);
        setInstUpazilas(d.inst_upazilas || []);
      })
      .catch(() => toast.error('Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // ── Address builders (resolve names from IDs) ──
  function instDivisionName() {
    const id = form.inst_division_id;
    if (!id) return '';
    return config?.divisions?.find(d => String(d.id) === String(id))?.name || '';
  }
  function instDistrictName() {
    const id = form.inst_district_id;
    if (!id) return '';
    return instDistricts.find(d => String(d.id) === String(id))?.name || '';
  }
  function instUpazilaName() {
    const id = form.inst_upazila_id;
    if (!id) return '';
    return instUpazilas.find(u => String(u.id) === String(id))?.name || '';
  }
  function buildOrigin() {
    return [form.inst_address, instUpazilaName(), instDistrictName(), instDivisionName(), form.inst_country].filter(Boolean).join(', ');
  }

  function assrDivisionName() {
    const id = form.assessor_division_id;
    if (!id) return '';
    return config?.divisions?.find(d => String(d.id) === String(id))?.name || '';
  }
  function assrDistrictName() {
    const id = form.assessor_district_id;
    if (!id) return '';
    return assrDistricts.find(d => String(d.id) === String(id))?.name || '';
  }
  function assrUpazilaName() {
    const id = form.assessor_upazila_id;
    if (!id) return '';
    return assrUpazilas.find(u => String(u.id) === String(id))?.name || '';
  }
  function buildDestination() {
    return [form.assessor_address, assrUpazilaName(), assrDistrictName(), assrDivisionName(), form.assessor_country].filter(Boolean).join(', ');
  }

  // ── Institute address cascading ──
  function handleInstDivision(divId) {
    set('inst_division_id', divId);
    set('inst_district_id', '');
    set('inst_upazila_id', '');
    setInstDistricts([]);
    setInstUpazilas([]);
    if (!divId) return;
    api.get(`/bd-address/districts/${divId}`)
      .then(res => setInstDistricts(res.data.data || []))
      .catch(() => toast.error('Failed to load districts'));
  }

  function handleInstDistrict(disId) {
    set('inst_district_id', disId);
    set('inst_upazila_id', '');
    setInstUpazilas([]);
    if (!disId) return;
    api.get(`/bd-address/upazilas/${disId}`)
      .then(res => setInstUpazilas(res.data.data || []))
      .catch(() => toast.error('Failed to load upazilas'));
  }

  // ── Assessor address cascading ──
  function handleAssrDivision(divId) {
    set('assessor_division_id', divId);
    set('assessor_district_id', '');
    set('assessor_upazila_id', '');
    setAssrDistricts([]);
    setAssrUpazilas([]);
    if (!divId) return;
    api.get(`/bd-address/districts/${divId}`)
      .then(res => setAssrDistricts(res.data.data || []))
      .catch(() => toast.error('Failed to load districts'));
  }

  function handleAssrDistrict(disId) {
    set('assessor_district_id', disId);
    set('assessor_upazila_id', '');
    setAssrUpazilas([]);
    if (!disId) return;
    api.get(`/bd-address/upazilas/${disId}`)
      .then(res => setAssrUpazilas(res.data.data || []))
      .catch(() => toast.error('Failed to load upazilas'));
  }

  // ── Route calculation ──
  async function calculateRoute() {
    const origin = buildOrigin();
    const dest = buildDestination();
    if (!origin || !dest) {
      toast.error('Please fill in both institute and assessor addresses.');
      return;
    }
    const geoKey = config?.geoapify_key;
    if (!geoKey) { toast.error('Geoapify key not configured.'); return; }
    try {
      const geo = (addr) => fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addr)}&apiKey=${geoKey}`).then(r => r.json());
      const [geoResO, geoResD] = await Promise.all([geo(origin), geo(dest)]);
      const oLoc = geoResO.features?.[0]?.geometry?.coordinates;
      const dLoc = geoResD.features?.[0]?.geometry?.coordinates;
      if (!oLoc || !dLoc) { toast.error('Could not geocode addresses.'); return; }
      const routeRes = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${oLoc[1]},${oLoc[0]}|${dLoc[1]},${dLoc[0]}&mode=drive&apiKey=${geoKey}`);
      const routeData = await routeRes.json();
      if (routeData.features?.length > 0) {
        const feat = routeData.features[0];
        const dist = feat.properties.distance / 1000;
        setRouteData(feat);
        setCalcDistance(parseFloat(dist.toFixed(2)));
        toast.success(`Distance: ${dist.toFixed(2)} km`);
      } else {
        toast.error('Could not calculate route. Check addresses.');
      }
    } catch {
      toast.error('Error calculating route.');
    }
  }

  function handleShowMap() {
    if (!routeData) { toast.error('Calculate route first.'); return; }
    const coords = routeData.geometry.coordinates;
    const originLat = coords[0][1], originLon = coords[0][0];
    const destLat = coords[coords.length - 1][1], destLon = coords[coords.length - 1][0];
    const midLat = (originLat + destLat) / 2, midLon = (originLon + destLon) / 2;
    const pathStr = coords.map(c => `${c[1]},${c[0]}`).join('|');
    const url = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=800&height=400&center=lonlat:${midLon},${midLat}&zoom=10&marker=lonlat:${originLon},${originLat};color:%2300ff00;size:medium|lonlat:${destLon},${destLat};color:%23ff0000;size:medium&path=color:%230000ff;weight:3;${pathStr}&apiKey=${config?.geoapify_key}`;
    setMapUrl(url);
    setShowMap(true);
  }

  const originAddr = buildOrigin();
  const destAddr = buildDestination();
  const totalDistance = calcDistance;
  const roundTrip = totalDistance * 2;
  const first200 = Math.min(200, roundTrip) * 6;
  const remaining = Math.max(0, roundTrip - 200) * 5;
  const travelAmount1 = first200 + remaining;
  const fixedDA = 1000;
  const assessmentFee = form.total_participants * 500;
  const tax = applyTax ? 500 : 0;
  const netFee = assessmentFee - tax;
  const combinedTotal = netFee + travelAmount1 + fixedDA;
  const amountWords = numberToWords(combinedTotal);

  function resetForm() {
    if (!confirm('Reset all fields?')) return;
    setForm(prev => ({
      ...prev,
      assessor_name: '', assessor_phone: '', assessor_email: '', assessor_country: '',
      assessor_division_id: '', assessor_district_id: '', assessor_upazila_id: '',
      assessor_address: '',
      trade_name: '', assessment_date: new Date().toISOString().slice(0, 10), total_participants: 10,
      bill_no: 'BIL-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-001',
    }));
    setAssrDistricts([]);
    setAssrUpazilas([]);
    setRouteData(null);
    setMapUrl('');
    setShowMap(false);
    setCalcDistance(0);
  }

  function generateFeeBill() {
    if (!form.assessor_name) { toast.error('Please enter assessor name.'); return; }
    if (!form.trade_name) { toast.error('Please enter trade/course.'); return; }
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const fmt = (n) => Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const destAddr = [form.assessor_address, assrUpazilaName(), assrDistrictName(), assrDivisionName(), form.assessor_country].filter(Boolean).join(', ');
    const ai = form.assessor_name + '\nMobile: ' + form.assessor_phone + (form.assessor_email ? '\nEmail: ' + form.assessor_email : '') + (destAddr ? '\nAddress: ' + destAddr : '');
    const fDate = form.assessment_date.split('-').reverse().join('.');
    const total = assessmentFee;
    const afterTax = applyTax ? netFee : total;
    const iw = numberToWords(afterTax);
    const addr = [form.inst_address, instUpazilaName(), instDistrictName(), instDivisionName(), form.inst_country].filter(Boolean).join(', ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(form.inst_name || '', pw / 2, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(addr || '', pw / 2, 33, { align: 'center' });
    doc.setFontSize(9);
    doc.text('NSDA Representative Bill for ' + form.trade_name + ' Assessment of ' + (form.inst_name || ''), pw / 2, 40, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Date: ' + fDate, pw - 20, 55, { align: 'right' });

    doc.autoTable({
      startY: 65,
      head: [['SI', 'Description', 'Per Students\nAmount', 'Total\nStudents/DA', 'Total amount\n(BDT)', 'Tax (10%)', 'Amount\nafter Tax', 'Assessor Name\n& Address', 'Received\nSignature', 'Remarks']],
      body: [
        ['1', '  Assessor Fee', '500', String(form.total_participants), fmt(total), applyTax ? '500' : '0', fmt(afterTax), { content: ai, rowSpan: 2, styles: { fontStyle: 'bold' } }, { content: '', rowSpan: 2 }, { content: '', rowSpan: 2 }],
        ['', { content: 'Grand Total:', styles: { fontStyle: 'bold' } }, '', '', '', '', { content: fmt(afterTax), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] },
      headStyles: { fontSize: 8, fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('In Word: ' + iw, 20, doc.lastAutoTable.finalY + 12);
    doc.save('Fee_Bill_' + form.bill_no + '.pdf');
    toast.success('Assessor fee bill generated.');
  }

  function generateTravelDaBill() {
    if (!form.assessor_name) { toast.error('Please enter assessor name.'); return; }
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const fmt = (n) => Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const destAddr = [form.assessor_address, assrUpazilaName(), assrDistrictName(), assrDivisionName(), form.assessor_country].filter(Boolean).join(', ');
    const ai = form.assessor_name + '\nMobile: ' + form.assessor_phone + (form.assessor_email ? '\nEmail: ' + form.assessor_email : '') + (destAddr ? '\nAddress: ' + destAddr : '');
    const fDate = form.assessment_date.split('-').reverse().join('.');
    const firstKm = Math.min(200, roundTrip);
    const restKm = Math.max(0, roundTrip - 200);
    const firstCost = firstKm * 6;
    const restCost = restKm * 5;
    const travelTotal = firstCost + restCost;
    const daTotal = fixedDA;
    const grandTotal = travelTotal + daTotal;
    const iw = numberToWords(grandTotal);
    const addr = [form.inst_address, instUpazilaName(), instDistrictName(), instDivisionName(), form.inst_country].filter(Boolean).join(', ');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(form.inst_name || '', pw / 2, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(addr || '', pw / 2, 33, { align: 'center' });
    doc.setFontSize(9);
    doc.text('NSDA Representative Bill for ' + form.trade_name + ' Assessment of ' + (form.inst_name || ''), pw / 2, 40, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Date: ' + fDate, pw - 20, 55, { align: 'right' });

    doc.autoTable({
      startY: 65,
      head: [['SI', 'Description', 'Distance\n(km)', '1st 200 km cost/km 6 Taka\n& Next Distance cost/km 5 Taka', 'Total amount\n(BDT)', 'Assessor Name\n& Address', 'Received\nSignature', 'Remarks']],
      body: [
        ['2', '  Travel Allowance', totalDistance + ' X 2=' + Math.round(roundTrip), firstKm + ' X 6=' + firstCost + '\n' + restKm + ' X 5=' + restCost, { content: fmt(travelTotal), styles: { fontStyle: 'bold' } }, { content: ai, rowSpan: 3, styles: { fontStyle: 'bold' } }, { content: '', rowSpan: 3 }, { content: '', rowSpan: 3 }],
        ['3', '  Daily Allowance', '-', '-', fmt(daTotal)],
        ['', { content: 'Grand Total:', colSpan: 3, styles: { fontStyle: 'bold' } }, { content: fmt(grandTotal), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.5, textColor: [0, 0, 0] },
      headStyles: { fontSize: 8, fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('In Word: ' + iw, 20, doc.lastAutoTable.finalY + 12);
    doc.save('Travel_DA_Bill_' + form.bill_no + '.pdf');
    toast.success('TA/DA bill generated.');
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Assessor Bill Generator
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="inherit" startIcon={<UndoIcon />} onClick={resetForm}>Reset</Button>
        </Box>
      </Box>

      <SectionCard icon={<BusinessIcon color="primary" />} title="Institute Information">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Institute Name (English)" value={form.inst_name} onChange={e => set('inst_name', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Institute Name (Bangla)" value={form.inst_name_bn} onChange={e => set('inst_name_bn', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="STP Code" value={form.inst_stp_code} onChange={e => set('inst_stp_code', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Country" value={form.inst_country} onChange={e => set('inst_country', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Select fullWidth displayEmpty value={form.inst_division_id} onChange={e => handleInstDivision(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select Division</em></MenuItem>
              {(config?.divisions || []).map(d => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
            <Select fullWidth displayEmpty value={form.inst_district_id} onChange={e => handleInstDistrict(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select District</em></MenuItem>
              {instDistricts.map(d => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={3}>
            <Select fullWidth displayEmpty value={form.inst_upazila_id} onChange={e => set('inst_upazila_id', e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select Upazila</em></MenuItem>
              {instUpazilas.map(u => <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Address" value={form.inst_address} onChange={e => set('inst_address', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Contact No" value={form.inst_contact} onChange={e => set('inst_contact', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Email" value={form.inst_email} onChange={e => set('inst_email', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard icon={<PersonIcon color="primary" />} title="Assessor Information">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth required label="Assessor Name" value={form.assessor_name} onChange={e => set('assessor_name', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth required label="Phone No" value={form.assessor_phone} onChange={e => set('assessor_phone', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Email" value={form.assessor_email} onChange={e => set('assessor_email', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Country" value={form.assessor_country} onChange={e => set('assessor_country', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Select fullWidth displayEmpty value={form.assessor_division_id} onChange={e => handleAssrDivision(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select Division</em></MenuItem>
              {(config?.divisions || []).map(d => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={4}>
            <Select fullWidth displayEmpty value={form.assessor_district_id} onChange={e => handleAssrDistrict(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select District</em></MenuItem>
              {assrDistricts.map(d => <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12} md={4}>
            <Select fullWidth displayEmpty value={form.assessor_upazila_id} onChange={e => set('assessor_upazila_id', e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value=""><em>Select Upazila</em></MenuItem>
              {assrUpazilas.map(u => <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>)}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address Details" multiline rows={2} value={form.assessor_address} onChange={e => set('assessor_address', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard icon={<AssignmentIcon color="primary" />} title="Assessment Information">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth required label="Trade / Course" value={form.trade_name} onChange={e => set('trade_name', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth required type="date" label="Assessment Date" value={form.assessment_date} onChange={e => set('assessment_date', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Total Participants" value={form.total_participants} onChange={e => set('total_participants', Math.min(12, Math.max(10, parseInt(e.target.value) || 10)))} inputProps={{ min: 10, max: 12 }} helperText={form.total_participants < 10 || form.total_participants > 12 ? 'Must be between 10 and 12' : 'Min 10, Max 12'} sx={FIELD_STYLE} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard icon={<RouteIcon color="primary" />} title="Route & Distance Calculation">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Starting Point (Institute)" value={originAddr} InputProps={{ readOnly: true }} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Destination (Assessor)" value={destAddr} InputProps={{ readOnly: true }} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<CalculateIcon />} onClick={calculateRoute}>Calculate Distance</Button>
              <Button variant="contained" color="success" startIcon={<MapIcon />} onClick={handleShowMap}>Show on Map</Button>
            </Box>
          </Grid>
          {routeData && (
            <Grid item xs={12}>
              <Alert icon={<ApiIcon />} severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2"><strong>Distance:</strong> {calcDistance} km &nbsp;|&nbsp; <strong>Duration:</strong> ~{Math.round(calcDistance / 40 * 60)} mins</Typography>
                <Typography variant="body2" color="text.secondary">{originAddr} &rarr; {destAddr}</Typography>
              </Alert>
            </Grid>
          )}
          {showMap && mapUrl && (
            <Grid item xs={12}>
              <Box sx={{ width: '100%', height: 350, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <img src={mapUrl} alt="Route Map" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            </Grid>
          )}
        </Grid>
      </SectionCard>

      <SectionCard icon={<ReceiptIcon color="primary" />} title="Generate Bill">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Bill No / Reference" value={form.bill_no} onChange={e => set('bill_no', e.target.value)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Travel Distance (km)" value={totalDistance} onChange={e => setCalcDistance(parseFloat(e.target.value) || 0)} sx={FIELD_STYLE} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel control={<Checkbox checked={applyTax} onChange={e => setApplyTax(e.target.checked)} />} label="Apply 10% Tax (500 TK)" />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography fontWeight={600} mb={2}>Bill Summary</Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Calculation</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount (BDT)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Assessment Fee</TableCell>
                <TableCell>{form.total_participants} &times; 500</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{assessmentFee.toFixed(2)}</TableCell>
              </TableRow>
              {applyTax && (
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Less: 10% Tax</TableCell>
                <TableCell>-</TableCell>
                <TableCell sx={{ textAlign: 'right', color: 'error.main' }}>{'-' + tax.toFixed(2)}</TableCell>
              </TableRow>
              )}
              <TableRow>
                <TableCell>{applyTax ? 3 : 2}</TableCell>
                <TableCell>Travel Allowance (Round Trip)</TableCell>
                <TableCell>First 200km &times; 6 + &nbsp;{Math.max(0, roundTrip - 200).toFixed(2)}km &times; 5 = {travelAmount1.toFixed(2)}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{travelAmount1.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{applyTax ? 4 : 3}</TableCell>
                <TableCell>Fixed DA</TableCell>
                <TableCell>-</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{fixedDA.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'primary.50' }}>
                <TableCell colSpan={3} sx={{ fontWeight: 700, textAlign: 'right' }}>Total Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: 'primary.main' }}>{combinedTotal.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TextField fullWidth label="Amount in Words" value={amountWords} InputProps={{ readOnly: true }} sx={{ ...FIELD_STYLE, mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" color="success" startIcon={<PictureAsPdfIcon />} onClick={generateFeeBill}>Assessor Fee Bill</Button>
          <Button variant="contained" color="warning" startIcon={<LocalShippingIcon />} onClick={generateTravelDaBill}>TA/DA Bill</Button>
        </Box>
      </SectionCard>
    </Box>
  );
}
