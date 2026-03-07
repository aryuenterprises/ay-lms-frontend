import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';

// import * as XLSX from "xlsx";

// import { Menu} from "@mui/material";

// import { Checkbox } from "@mui/material";
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Stack,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
  ButtonBase,
  Paper,
  MenuItem,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { APP_PATH_BASE_URL } from 'config';
import { BoxAdd, CloseSquare, Edit, Eye, SearchNormal1, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LinkIcon from '@mui/icons-material/Link';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import AddLinkIcon from '@mui/icons-material/AddLink';
import YouTubeIcon from '@mui/icons-material/YouTube';
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { usePermission } from 'hooks/usePermission';
import { useNavigate } from 'react-router';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { DateTimePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';
// import {useState} from 'react';
// import { useState } from 'react';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

// =============================================================================
// MODULE-LEVEL HELPER COMPONENTS
//
// WHY these must be here, at the top of the file, OUTSIDE WebinarList:
//
// React identifies components by their reference. If you define a component
// inside another component's function body, JavaScript creates a brand-new
// function object on every single render. React sees a "new" component each
// time and unmounts/remounts it — destroying any internal state and causing
// input focus to be lost. The fix is simple: define them once, at module
// level, so the reference is stable across renders.
// =============================================================================

/**
 * SectionCard — a white card with a grey labelled header bar.
 * Wrapping related fields in named sections turns a wall of 20+ flat
 * fields into scannable groups the user can skip through quickly.
 */


const SectionCard = ({ label, children, sx = {} }) => (
  <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, overflow: 'hidden', ...sx }}>
    <Box sx={{ px: 2.5, py: 1.2, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ p: 2.5 }}>{children}</Box>
  </Box>
);

/**
 * FieldRow — a single label + value pair with consistent styling.
 * The `mono` prop switches the value font to monospace, which is
 * useful for technical strings like slugs, UUIDs, and URLs.
 */
const FieldRow = ({ label, value, mono = false }) => (
  <Box>
    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{
      mt: 0.5, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1.5,
      minHeight: 42, bgcolor: '#f9f9f9', fontSize: 14, color: '#111827',
      fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-word', lineHeight: 1.6
    }}>
      {value || '—'}
    </Typography>
  </Box>
);

/**
 * EmptyValue — soft italic placeholder for optional fields that have no data.
 * Prevents confusing blank spaces in the UI.
 */
const EmptyValue = ({ label = 'Not provided' }) => (
  <Typography sx={{ color: '#9ca3af', fontSize: 13, fontStyle: 'italic', mt: 0.5 }}>
    {label}
  </Typography>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const WebinarList = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canView   = checkPermission('Webinar', 'view');
  const canCreate = checkPermission('Webinar', 'create');
  const canUpdate = checkPermission('Webinar', 'update');
  const canDelete = checkPermission('Webinar', 'delete');

  /**
   * Extracts the bare YouTube video ID from any URL format.
   * Handles both youtube.com/watch?v=ID and youtu.be/ID.
   * Returns null on no-match so callers can show a safe fallback.
   */
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  // const [feedbackData, setFeedbackData] = useState(null);
// const [feedbackLoading, setFeedbackLoading] = useState(false);


  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl]               = useState('');
  const [title, setTitle]                     = useState('');
  const [subtitle, setSubtitle]               = useState('');
  const [description, setDescription]         = useState('');
  const [slug, setSlug]                       = useState('');
  const [open, setOpen]                       = useState(false);
  const [viewOpen, setViewOpen]               = useState(false);
  const [viewDetails, setViewDetails]         = useState(null);
  const [currentWebinar, setCurrentWebinar]   = useState(null);
  const [metatitle, setMetatitle]             = useState('');
  const [metadesc, setMetadesc]               = useState('');
  const [metaimg, setMetaimg]                 = useState('');
  const [status, setStatus]                   = useState('');
  const [wabalink, setWabalink]               = useState('');
  const [editTools, setEditTools]             = useState([]);
  const [editToolsOpen, setEditToolsOpen]     = useState(false);
  const [webinarimage, setWebinarimage]       = useState('');
  const [Webinar, setWebinar]                 = useState([]);
  const [language, setLanguage]               = useState('');
  const [mode, setMode]                       = useState('');
  const [imagePreview, setImagePreview]       = useState(null);
  const [imagePreviewweb, setImagePreviewweb] = useState(null);
  const [error, setError]                     = useState('');
  const [filterText, setFilterText]           = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [items, setItems]                     = useState([{ title: '', file: null, preview: null }]);
  const [faqs, setFaqs]                       = useState([{ question: '', answer: '', preview: null }]);

  // const [feedbackOpen,setFeedbackOpen]=useState('');

  // const [columnAnchorEl, setColumnAnchorEl] = useState(null);

// const openColumnMenu = (event) => {
//   setColumnAnchorEl(event.currentTarget);
// };

// const closeColumnMenu = () => {
//   setColumnAnchorEl(null);
// };
  // const [selectedRow,setSelectedRow]=useState('')

  // CopyFBLink is kept inside WebinarList (not at module level) because it
  // closes over the row prop and its own local copied-state is trivial.
  const CopyFBLink = ({ row }) => {
    const [copied, setCopied] = React.useState(false);
    const webinarUuid  = row.webinar_uuid || row.webinar?.uuid || row.uuid;
    const feedbackLink = webinarUuid ? `${window.location.origin}/feedback/${webinarUuid}` : '';
    const handleCopy   = (e) => {
      e.stopPropagation();
      if (!feedbackLink) return;
      navigator.clipboard.writeText(feedbackLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    };
    return (
      <Tooltip title={copied ? 'Copied!' : 'Click to copy'}>
        <IconButton color="primary" onClick={handleCopy}><AddLinkIcon /></IconButton>
      </Tooltip>
    );
  };

  // Lowercases, strips non-alpha chars, then hyphenates spaces to form a URL slug.
  const generateSlug = (t = '') =>
    t.toLowerCase().replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, '-');

  // ── Tools list handlers ────────────────────────────────────────────────────
  const handleAdd      = () => setItems([...items, { title: '', file: null, preview: null }]);
  const handleEditAdd  = () => setEditTools((prev) => [...prev, { id: uuidv4(), title: '', file: null, preview: null, isFileModify: true, istextModify: true, isDelete: false }]);
  const handleFaqadd   = () => setFaqs([...faqs, { question: '', answer: '', preview: null }]);
  const handleFaqremove  = (i) => { const u = [...faqs];  u.splice(i, 1); setFaqs(u); };
  const handleRemove     = (i) => { const u = [...items]; u.splice(i, 1); setItems(u); };
  const handleTitleChange    = (i, v) => { const u = [...items]; u[i].title = v; setItems(u); };
  const handleFileChange     = (i, f) => { const u = [...items]; u[i].file = f; u[i].preview = URL.createObjectURL(f); setItems(u); };
  const handleQuestionChange = (i, v) => { const u = [...faqs]; u[i].question = v; setFaqs(u); };
  const handleAnswerChange   = (i, v) => { const u = [...faqs]; u[i].answer   = v; setFaqs(u); };
  const handleEditTitleChange = (i, v) => setEditTools((prev) => { const u = [...prev]; u[i] = { ...u[i], title: v, istextModify: true }; return u; });
  const handleEditFileChange  = (i, f) => setEditTools((prev) => { const u = [...prev]; u[i] = { ...u[i], file: f, preview: URL.createObjectURL(f), isFileModify: true }; return u; });
  const handleEditRemove      = (i)    => setEditTools((prev) => { const u = [...prev]; u[i] = { ...u[i], isDelete: true }; return u; });

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('api/webinar/web');
      setWebinar(response?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  // ── Dialog open/close helpers ──────────────────────────────────────────────
  const handleOpen = () => {
    setCurrentWebinar(null); setEditToolsOpen(false); setEditTools([]);
    setItems([{ title: '', file: null, preview: null }]);
    setTitle(''); setSubtitle(''); setDescription(''); setSlug('');
    setWabalink(''); setVideoUrl(''); setMode(''); setLanguage('');
    setStatus(''); setMetatitle(''); setMetadesc(''); setMetaimg(null);
    setImagePreview(null); setImagePreviewweb(null);
    setFaqs([{ question: '', answer: '' }]);
    formik.resetForm();
    setOpen(true);
  };
  const handleViewOpen  = (value) => { setViewDetails(value); setViewOpen(true); };
  const handleViewClose = () => setViewOpen(false);
  const handleClose     = () => { setOpen(false); setItems([]); setEditTools([]); formik.resetForm(); };

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!Webinar || !Array.isArray(Webinar)) return [];
    if (!filterText) return Webinar;
    return Webinar.filter(
      (item) =>
        item.title?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.description?.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [Webinar, filterText]);

  // ── Search + Add toolbar ───────────────────────────────────────────────────
  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) { setResetPaginationToggle(!resetPaginationToggle); setFilterText(''); }
    };
    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3}>
        <Grid item xs={12} md={6}>
          <TextField
            placeholder="Search by webinar name or description..."
            variant="outlined" size="small" value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><SearchNormal1 size={20} /></InputAdornment>),
              endAdornment: (<InputAdornment position="end">{filterText && (<IconButton onClick={handleClear} edge="end" size="small"><CloseSquare size={20} /></IconButton>)}</InputAdornment>)
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} textAlign="right">
          <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>Add Webinar</Button>
        </Grid>
      </Grid>
    );
  }, [filterText, resetPaginationToggle, canCreate]);

  // ── Edit — populate all form state from the selected row ──────────────────
  const handleEdit = (webinar) => {
    setEditToolsOpen(true);
    setCurrentWebinar({
      link: webinar.zoom_link, webinarName: webinar.title,
      webinarSubtitle: webinar.Subtitle, webinarDescription: webinar.description,
      webinarDateTime: webinar.scheduled_start, id: webinar.uuid, seats_available: webinar.seats_available,
      webinarType: webinar.is_paid ? 'Paid' : 'Free',
      regular_price: webinar.regular_price, price: webinar.price,
      state: webinar.state, city: webinar.city, profession: webinar.profession,
      logs: webinar.logs, mentor: webinar?.mentor,
      waba_link: webinar?.waba_link, video_url: webinar?.video_url
    });
    setEditTools(webinar?.tools.map((v) => ({
      title: v?.tools_title, file: v?.tools_image, preview: v?.image_url,
      id: v?.id, istextModify: false, isFileModify: false, isDelete: v?.is_deleted, oldData: true
    })));
    setTitle(webinar.title); setSlug(webinar?.slug); setDescription(webinar?.description);
    setSubtitle(webinar?.sub_title || '-'); setVideoUrl(webinar?.video_url);
    setWebinarimage(webinar?.webinar_image); setMode(webinar?.mode); setWabalink(webinar?.waba_link);
    setImagePreviewweb(webinar?.webinar_image_url); setMetatitle(webinar?.metadata[0]?.meta_title);
    setMetadesc(webinar?.metadata[0]?.meta_description); setMetaimg(webinar?.metadata[0]?.image_url);
    setImagePreview(webinar?.metadata[0]?.image_url); setFaqs(webinar?.faqs);
    setStatus(webinar?.webinar_status); setLanguage(webinar?.language);
    setOpen(true);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Yes, delete it!' });
    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`api/webinar/web/${id}/`);
        if (response.data.status === true) {
          Swal.fire({ title: 'Success!', text: 'Webinar has been deleted.', icon: 'success', confirmButtonText: 'OK' });
          fetchData();
        } else {
          Swal.fire({ title: 'Error!', text: response?.data?.message || 'Error deleting webinar.', icon: 'error', confirmButtonText: 'OK' });
        }
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message || 'Failed to delete webinar.', icon: 'error', confirmButtonText: 'OK' });
      }
    }
  };

  // ── Status / session handlers ──────────────────────────────────────────────
  const handleStatusChange = async (row, newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`${APP_PATH_BASE_URL}api/live-webinar/${row.webinar_link}`, { webinar_status: newStatus });
      setWebinar((prev) => prev.map((w) => (w.webinar_link === row.webinar_link ? { ...w, webinar_status: newStatus } : w)));
    } catch (error) {
      console.error('Failed to change webinar status', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = useCallback((webinar) => {
    if (webinar) navigate(`/webinar/${webinar.uuid}/`, { state: { webinarData: { ...webinar } } });
  }, [navigate]);

  const handleWebinarstart = useCallback(async (webinar) => {
    try { await axiosInstance.post(`/api/webinar/${webinar.uuid}/session/start/`); fetchData(); }
    catch (error) { console.error('Failed to start webinar', error); }
  }, [fetchData]);

  const handleWebinarend = useCallback(async (webinar) => {
    try {
      await axiosInstance.post(`/api/webinar/${webinar.uuid}/session/end/`);
      await axiosInstance.post(`/api/webinar/${webinar.uuid}/attendance/sync/`);
      fetchData();
    } catch (error) { console.error('Failed to end webinar', error); }
  }, [fetchData]);

  const handleWebinarChange = async (action, currentWebinar) => {
    try {
      const confirmation = await Swal.fire({ title: 'Confirm', text: `Are you sure you want to ${action} this webinar?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: `Yes, ${action} it!`, cancelButtonText: 'Cancel' });
      if (!confirmation.isConfirmed) return;
      const response = await axiosInstance.patch(`api/webinar/web/${currentWebinar.uuid}/`, { status: action });
      const result = response.data;
      if (result.status === true) {
        await Swal.fire({ title: 'Success!', text: `Webinar ${action}ed successfully!`, icon: 'success', confirmButtonText: 'OK' });
        fetchData();
      } else {
        await Swal.fire({ title: 'Error!', text: result.message, icon: 'error', confirmButtonText: 'OK' });
      }
    } catch (error) {
      await Swal.fire({ title: 'Error!', text: error.response?.data?.message || error.message, icon: 'error', confirmButtonText: 'OK' });
    }
  };



// const feedbackColumns = [
// {
//   name:"Webinar ID",
//   selector:row=>row.webinarId,
//   key:"webinarId"
// },
// {
//   name:"Name",
//   selector:row=>row.name,
//   key:"name"
// },
// {
//   name:"Phone",
//   selector:row=>row.phone,
//   key:"phone"
// },
// {
//   name:"Content Quality",
//   selector:row=>row.content_quality,
//   key:"content_quality"
// },
// {
//   name:"Interaction",
//   selector:row=>row.interaction,
//   key:"interaction"
// },
// {
//   name:"Pace",
//   selector:row=>row.pace,
//   key:"pace"
// },
// {
//   name:"Speaker",
//   selector:row=>row.speaker,
//   key:"speaker"
// },
// {
//   name:"Overall",
//   selector:row=>row.overall,
//   key:"overall"
// },
// {
//   name:"Future Webinar",
//   selector:row=>row.Future_Webinars,
//   key:"Future_Webinars"
// },
// {
//   name:"Paid Course",
//   selector:row=>row.paid_course,
//   key:"paid_course"
// },
// {
//   name:"Learned",
//   selector:row=>row.learned,
//   key:"learned"
// },
// {
//   name:"Recommend",
//   selector:row=>row.recommend,
//   key:"recommend"
// },
// {
//   name:"Suggestion",
//   selector:row=>row.imporove,
//   key:"imporove"
// }
// ];

// const visibleColumns = feedbackColumns.filter(col =>
//  selectedColumns.includes(col.key)
// );
// const exportToExcel = () => {
// 
// const exportData =  feedbackRows.map(row=>{

//  let obj={}

//  selectedColumns.forEach(col=>{
//    obj[col] = row[col]
//  })

//  return obj

// })

// const worksheet = XLSX.utils.json_to_sheet(exportData)
// const workbook = XLSX.utils.book_new()

// XLSX.utils.book_append_sheet(workbook,worksheet,"Feedback")

// XLSX.writeFile(workbook,"feedback.xlsx")

// }


// const columnOptions = feedbackColumns.map(col => ({
//   label: col.name,
//   value: col.key
// }));
  // ── Formik submit ──────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      webinarDateTime: currentWebinar?.webinarDateTime ? new Date(currentWebinar.webinarDateTime) : null,
      video_url: currentWebinar?.video_url, regular_price: currentWebinar?.regular_price,
      price: currentWebinar?.price, webinarType: currentWebinar?.webinarType || 'Free',
      metadata: [{ metaTitle: currentWebinar?.metatitle || '', metaDescription: currentWebinar?.metadescription || '', metaImage: currentWebinar?.metaImage || null }],
      waba_link: currentWebinar?.waba_link, mentor: currentWebinar?.mentor,
      seats_available: currentWebinar?.seats_available ?? 10
    },
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = new FormData();
        const date = values.webinarDateTime;
        const pad  = (n) => String(n).padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}+05:30`;
        const appendIfExists = (key, value) => {
          if (value !== undefined && value !== null && value !== '' && !(value instanceof File && value.size === 0)) payload.append(key, value);
        };
        appendIfExists('title',          title?.trim());
        appendIfExists('sub_title',      subtitle?.trim());
        appendIfExists('description',    description?.trim());
        appendIfExists('scheduled_start', formatted);
        appendIfExists('language',       language);
        appendIfExists('slug',           slug);
        appendIfExists('webinar_status', status);
        appendIfExists('seats_available', Number(values.seats_available));
        appendIfExists('waba_link',      wabalink?.trim());
        payload.append('video_url', videoUrl);
        if (!currentWebinar) payload.append('is_registration_open', true);
        if (values?.webinarType === 'Paid') { payload.append('regular_price', Number(values.regular_price)); payload.append('price', Number(values.price)); }
        payload.append('is_paid', values?.webinarType === 'Paid');
        payload.append('mentor', values?.mentor?.trim());
        payload.append('mode',   mode);
        const isFile = (val) => val instanceof File || val instanceof Blob;
        if (isFile(webinarimage)) payload.append('webinar_image', webinarimage);
        if (isFile(metaimg))      payload.append('metadata[0][meta_image]', metaimg);
        payload.append('metadata[0][meta_title]',       metatitle);
        payload.append('metadata[0][meta_description]', metadesc);
        let di = 0;
        if (!editToolsOpen) {
          items.forEach((tool, index) => { payload.append(`tools[${index}][tools_title]`, tool.title); payload.append(`tools[${index}][tools_image]`, tool.file); });
        } else {
          editTools.forEach((value) => {
            if (value.isDelete && value.oldData) { payload.append(`tools[${di}][id]`, value.id); payload.append(`tools[${di}][is_deleted]`, true); di++; }
            else if (value?.oldData) {
              if (value.istextModify) { payload.append(`tools[${di}][id]`, value.id); payload.append(`tools[${di}][tools_title]`, value.title); di++; }
              if (value.isFileModify) { payload.append(`tools[${di}][id]`, value.id); payload.append(`tools[${di}][tools_image]`, value.file);  di++; }
            } else { payload.append(`tools[${di}][tools_title]`, value.title); payload.append(`tools[${di}][tools_image]`, value.file); di++; }
          });
        }
        payload.append('faqs', JSON.stringify(faqs));
        const method   = currentWebinar ? 'PATCH' : 'POST';
        const url      = currentWebinar ? `api/webinar/web/${currentWebinar.id}/` : 'api/webinar/web';
        const response = await axiosInstance({ method, url, data: payload });
        const result   = response.data;
        if (result.status === true) {
          Swal.fire({ title: 'Success!', text: currentWebinar ? 'Webinar updated successfully!' : 'Webinar added successfully!', icon: 'success', confirmButtonText: 'OK' });
          setTitle(''); setSlug(''); setDescription(''); setSubtitle(''); setMetatitle(''); setMetaimg(null);
          setMetadesc(''); setVideoUrl(null); setWebinarimage(''); setImagePreviewweb(null); setImagePreview(null);
          setWabalink(''); setFaqs([]); setItems([]); setLanguage(''); setStatus(''); setMode(null);
          resetForm(); fetchData(); handleClose();
        } else {
          Swal.fire({ title: 'Error!', text: result.message, icon: 'error', confirmButtonText: 'OK' });
        }
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message || error.message, icon: 'error', confirmButtonText: 'OK' });
      } finally {
        setSubmitting(false);
      }
    }
  });

  // ── DataTable column definitions ───────────────────────────────────────────
  const columns = [
    { name: 'S.No', cell: (_row, index) => index + 1, sortable: true, width: '80px' },
    { name: 'Webinar Name', selector: (row) => row.title, sortable: true, wrap: true },
    { name: 'Date & Time', cell: (row) => <div style={{ whiteSpace: 'normal', lineHeight: '1.4' }}>{formatDateTime(row.scheduled_start)}</div>, sortable: true, wrap: true },
    {
      name: 'Reg Count', sortable: true, center: true, wrap: true,
      cell: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="View Participants">
            <Button variant="text" onClick={(e) => { e.stopPropagation(); handleViewChange(row); }}
              sx={{ minWidth: 0, padding: 0, color: row.participants_count >= row.seats_available ? '#d32f2f' : '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>
              {row.participants_count} / {row.seats_available}
            </Button>
          </Tooltip>
        </Box>
      )
    },
    {
      name: 'Reg Link', center: true,
      cell: () => (<Tooltip title="Open registration link"><a href="https://workshop.aryuacademy.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}><LinkIcon color="primary" /></a></Tooltip>)
    },
    {
      name: 'Scheduled', sortable: true,
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.is_completed === true
            ? <Button variant="contained" color="success" size="small">Completed</Button>
            : row.status === 'DRAFT'
              ? <Button variant="contained" color="error"   size="small" onClick={() => handleWebinarChange('SHEDULED', row)}>No</Button>
              : <Button variant="contained" color="success" size="small" onClick={() => handleWebinarChange('DRAFT',    row)}>Yes</Button>
          }
        </Box>
      )
    },
    {
      name: 'Status', sortable: true,
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.webinar_status === true
            ? <Button variant="outlined" color="success" size="small">Active</Button>
            : row.webinar_status === 'DRAFT'
              ? <Button variant="outlined" color="error" size="small" onClick={() => handleStatusChange('SHEDULED', row)}>No</Button>
              : <Button variant="outlined" color="error" size="small" onClick={() => handleStatusChange('DRAFT',    row)}>Inactivate</Button>
          }
        </Box>
      )
    },
    {
      name:"feedback",sortable:true,
      cell:(row)=>(
        <Tooltip title="view Feedback">
          <IconButton  onClick={() => {

            navigate(`/webinar/feedback/${row.slug}`,{
              state:{
                feedbackId:row.slug

              }
            })
          
         
          // console.log(e.target.value,row.slug,"welcome")// 👈 send row id
        }}>
             <QuestionAnswerIcon/>

          </IconButton>
         

        </Tooltip>
      )


    },
    {
      name: 'Start', sortable: true,
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {row.status === 'COMPLETED'
            ? <Button variant="contained" size="small" sx={{ px: 1.2, py: 0.4, minWidth: 'auto' }} onClick={() => handleWebinarstart(row)}>Finished</Button>
            : row.status === 'LIVE'
              ? <Button variant="contained" color="error" size="small" onClick={() => handleWebinarend(row)}>Live</Button>
              : <Button variant="contained" color="error" size="small" onClick={() => handleWebinarstart(row)}>Go Live</Button>
          }
        </Box>
      )
    },
    { name: 'FB Link',   width: '80px', center: true, cell: (row) => <CopyFBLink row={row} /> },
    { name: 'Zoom Link', width: '90px', center: true, cell: (row) => (<IconButton size="small" onClick={() => window.open(row?.zoom_link, '_blank')}><InsertLinkOutlinedIcon fontSize="small" /></IconButton>) },
    ...(canUpdate || canDelete || canView ? [{
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details"><IconButton onClick={(e) => { e.stopPropagation(); handleViewOpen(row); }}><Eye /></IconButton></Tooltip>
          {canUpdate && (<Tooltip title="Edit"><IconButton   color="info"  onClick={() => handleEdit(row)}><Edit  /></IconButton></Tooltip>)}
          {canDelete && (<Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(row.uuid)}><Trash /></IconButton></Tooltip>)}
        </Box>
      )
    }] : [])
  ];

  if (error) {
    return (<MainCard sx={{ borderRadius: 2 }}><Box p={3} color="error.main">Error: {error}</Box></MainCard>);
  }



  
  // ===========================================================================
  // RENDER
  // ===========================================================================
  return (
    <MainCard>
      {subHeaderComponentMemo}

      <Box sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { height: '24px' }, maxWidth: 1500 }}>
        <DataTable
          columns={columns} data={filteredItems} pagination paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]} highlightOnHover
          progressPending={loading} responsive fixedHeader persistTableHead
        />

        {/* ==============================================================
            ADD / EDIT WEBINAR DIALOG  (unchanged from original)
            ============================================================== */}
        <Dialog
          maxWidth="xl" TransitionComponent={PopupTransition} keepMounted fullWidth open={open}
          onClose={(_, reason) => { if (reason !== 'backdropClick') handleClose(); }}
          BackdropProps={{ onClick: (e) => e.stopPropagation() }}
          sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        >
          <DialogTitle className="dialogTitle">
            <Grid container>
              <Grid item sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
                <Box />
                <Typography fontWeight={600} textAlign="center">{currentWebinar ? 'Edit Webinar' : 'Add Webinar'}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={handleClose}><CloseSquare style={{ pointerEvents: 'none' }} /></IconButton>
                </Box>
              </Grid>
              <Grid item>
                <DialogContent>
                  <form onSubmit={formik.handleSubmit}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Title *</Typography>
                            <TextField fullWidth name="webinarName" placeholder="e.g., Annual Conference, Webinar on AI" value={title}
                              onChange={(e) => { const v = e.target.value; setTitle(v); setSlug(generateSlug(v)); }} />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Typography fontWeight={400}>Slug</Typography>
                          <TextField fullWidth name="slug" placeholder="eg: Enter slug" value={slug} />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Sub Title *</Typography>
                            <TextField fullWidth name="webinarSubtitle" placeholder="e.g., Learn AI Basics" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Key *</Typography>
                            <TextField fullWidth rows={4} name="webinarDescription" placeholder="Describe the webinar details..." value={description} onChange={(e) => setDescription(e.target.value)} />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 2 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Webinar Image</Typography>
                            <Button component="label" variant="contained">
                              Upload Image
                              <input hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; setWebinarimage(file); const reader = new FileReader(); reader.onloadend = () => setImagePreviewweb(reader.result); reader.readAsDataURL(file); }} />
                            </Button>
                            {imagePreviewweb && (<Grid item xs={12} md={6} sx={{ p: 1 }}><Typography fontWeight={600}>Webinar Image Preview</Typography><img src={imagePreviewweb} alt="webinar Preview" width={120} style={{ borderRadius: 8, marginTop: 8 }} /></Grid>)}
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 1 }}>
                          <Stack spacing={1}>
                            <Grid item xs={12} md={6} sx={{ p: 2 }}>
                              <Button startIcon={<YouTubeIcon />} variant="outlined" onClick={() => setOpenVideoDialog(true)}>Add YouTube Video</Button>
                            </Grid>
                            {videoUrl && (
                              <Grid item xs={12} md={6} sx={{ p: 1 }}>
                                <Typography fontWeight={600}>YouTube Preview</Typography>
                                {/* Fixed: use 16:9 responsive wrapper instead of fixed width */}
                                <Box mt={1} sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
                                  <Box component="iframe"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}`}
                                    frameBorder="0" allowFullScreen title="YouTube Video"
                                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                  />
                                </Box>
                              </Grid>
                            )}
                            <Grid item xs={5}>
                              <Dialog open={openVideoDialog} onClose={() => setOpenVideoDialog(false)} maxWidth="sm" fullWidth>
                                <Grid item xs={12} sx={{ p: 2 }}><Typography fontWeight={400}>Add YouTube Video</Typography></Grid>
                                <DialogContent>
                                  <TextField fullWidth label="YouTube Video URL" placeholder="https://www.youtube.com/watch?v=xxxxx" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} margin="dense" />
                                </DialogContent>
                                <DialogActions>
                                  <Button onClick={() => setOpenVideoDialog(false)}>Cancel</Button>
                                  <Button variant="contained" onClick={() => setOpenVideoDialog(false)}>Add</Button>
                                </DialogActions>
                              </Dialog>
                            </Grid>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sx={{ pt: 1 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Date & Time *</Typography>
                            <DateTimePicker value={formik.values.webinarDateTime} disablePast onChange={(date) => formik.setFieldValue('webinarDateTime', date)}
                              slotProps={{ textField: { fullWidth: true, error: formik.touched.webinarDateTime && Boolean(formik.errors.webinarDateTime), helperText: formik.touched.webinarDateTime && formik.errors.webinarDateTime } }} />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 1 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Mode Type</Typography>
                            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value === 'true')}>
                              <FormControlLabel value="false" control={<Radio />} label="Offline" />
                              <FormControlLabel value="true"  control={<Radio />} label="Online"  />
                            </RadioGroup>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 2 }}>
                          <Stack spacing={1}>
                            <Typography fontWeight={400}>Webinar Type *</Typography>
                            <Grid display="flex" gap={2}>
                              <ButtonBase onClick={() => formik.setFieldValue('webinarType', 'Free')} sx={{ border: '2px solid', borderColor: formik.values.webinarType === 'Free' ? 'primary.main' : 'grey.400', bgcolor: formik.values.webinarType === 'Free' ? 'primary.light' : 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                <Typography fontWeight={600}>FREE WEBINAR</Typography>
                              </ButtonBase>
                              <ButtonBase onClick={() => formik.setFieldValue('webinarType', 'Paid')} sx={{ border: '2px solid', borderColor: formik.values.webinarType === 'Paid' ? 'success.main' : 'grey.400', bgcolor: formik.values.webinarType === 'Paid' ? 'success.light' : 'grey.100', px: 3, py: 1.5, borderRadius: 2 }}>
                                <Typography fontWeight={600}>PAID WEBINAR</Typography>
                              </ButtonBase>
                            </Grid>
                          </Stack>
                        </Grid>
                        {formik.values.webinarType === 'Paid' && (
                          <>
                            <Grid item xs={12} md={6} sx={{ pt: 3 }}><Stack spacing={1}><Typography fontWeight={400}>Regular Price *</Typography><TextField fullWidth type="number" name="regular_price" value={formik.values.regular_price} onChange={formik.handleChange} /></Stack></Grid>
                            <Grid item xs={12} md={6} sx={{ pt: 3 }}><Stack spacing={1}><Typography fontWeight={400}>Sale Price (Optional)</Typography><TextField fullWidth type="number" name="price" value={formik.values.price} onChange={formik.handleChange} /></Stack></Grid>
                          </>
                        )}
                        <Grid xs={12} md={6} sx={{ pt: 3, pl: 3 }}>
                          <Typography fontWeight={600}>SEO</Typography>
                          <Paper sx={{ p: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Grid item xs={12} md={6} sx={{ pt: 3, pl: 3 }}><Stack spacing={2}><Typography fontWeight={400}>Meta Title</Typography><TextField fullWidth name="metatitle" value={metatitle} placeholder="eg:Python" onChange={(e) => setMetatitle(e.target.value)} /></Stack></Grid>
                            <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                              <Stack spacing={2}>
                                <Typography fontWeight={400}>Meta Image</Typography>
                                <Button component="label" variant="contained">Upload Image<input hidden type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; setMetaimg(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result); reader.readAsDataURL(file); }} /></Button>
                                {imagePreview && (<img src={imagePreview} alt="Meta Preview" width={120} style={{ borderRadius: 8, marginTop: 8 }} />)}
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{ pt: 3 }}><Stack spacing={2}><Typography fontWeight={400}>Meta Description</Typography><TextField fullWidth multiline rows={3} name="metadescription" placeholder="eg:Python description" value={metadesc} onChange={(e) => setMetadesc(e.target.value)} /></Stack></Grid>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Stack spacing={2}>
                            <Stack spacing={1.5}>
                              <Typography fontWeight={500}>WhatsApp Redirection Link *</Typography>
                              <TextField fullWidth name="waba_link" placeholder="https://wa.me/91XXXXXXXXXX" value={wabalink} onChange={(e) => setWabalink(e.target.value)} helperText="Enter your WhatsApp business link (wa.me format recommended)" />
                            </Stack>
                            <Stack spacing={1}>
                              <Typography fontWeight={400}>Seats Available *</Typography>
                              <TextField fullWidth type="number" name="seats_available" inputProps={{ min: 1 }} value={formik.values.seats_available} onChange={formik.handleChange}
                                helperText={currentWebinar?.participants_count > 0 ? `Already ${currentWebinar.participants_count} registered` : 'Maximum number of participants'}
                                disabled={currentWebinar && currentWebinar.participants_count > 0} />
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={12} md={4} sx={{ pt: 4 }}><Stack spacing={2}><Typography fontWeight={400}>Mentor</Typography><TextField fullWidth name="mentor" value={formik.values.mentor} placeholder="eg: John" onChange={formik.handleChange} /></Stack></Grid>
                        <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                          <Stack spacing={2}>
                            <Typography fontWeight={400}>Language</Typography>
                            <Select displayEmpty value={language} onChange={(e) => setLanguage(e.target.value)}>
                              <MenuItem value="" disabled><em>Select a Language</em></MenuItem>
                              <MenuItem value="english">English</MenuItem>
                              <MenuItem value="tamil">Tamil</MenuItem>
                            </Select>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ pt: 4 }}>
                          <Stack spacing={2}>
                            <Typography fontWeight={400}>Status</Typography>
                            <Select displayEmpty value={status} onChange={(e) => setStatus(e.target.value)}>
                              <MenuItem value="" disabled><em>Select Webinar Status</em></MenuItem>
                              <MenuItem value={true}>Active</MenuItem>
                              <MenuItem value={false}>Inactive</MenuItem>
                            </Select>
                          </Stack>
                        </Grid>
                      </Grid>
                      {!editToolsOpen ? (
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Typography fontWeight={600}>Add Tools</Typography>
                          <Stack spacing={2} mt={1}>
                            {items.map((item, index) => (
                              <Paper key={index} elevation={2} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField size="small" label="Title" value={item.title} onChange={(e) => handleTitleChange(index, e.target.value)} />
                                <Button component="label" variant="outlined">Upload Image<input hidden type="file" accept="image/*" onChange={(e) => handleFileChange(index, e.target.files[0])} /></Button>
                                {item.preview && (<img src={item.preview} width={48} height={48} style={{ borderRadius: 6 }} alt="preview" />)}
                                <Button variant="contained" size="small" onClick={() => handleRemove(index)}>Remove</Button>
                              </Paper>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={handleAdd}>Add More</Button>
                          </Stack>
                        </Grid>
                      ) : (
                        <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                          <Typography fontWeight={600}>Add Tools</Typography>
                          <Stack spacing={2} mt={1}>
                            {editTools.map((item, index) => !item.isDelete && (
                              <Paper key={item.id} elevation={2} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField size="small" label="Title" value={item.title} onChange={(e) => handleEditTitleChange(index, e.target.value)} />
                                <Button component="label" variant="outlined">Upload Image<input hidden type="file" accept="image/*" onChange={(e) => handleEditFileChange(index, e.target.files[0])} /></Button>
                                {item.preview && (<img src={item.preview} width={48} height={48} style={{ borderRadius: 6 }} alt="preview" />)}
                                <Button variant="contained" size="small" onClick={() => handleEditRemove(index)}>Remove</Button>
                              </Paper>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={handleEditAdd}>Add More</Button>
                          </Stack>
                        </Grid>
                      )}
                      <Grid item xs={12} md={6} sx={{ pt: 3 }}>
                        <Typography fontWeight={600}>Add FAQ</Typography>
                        <Stack spacing={2} mt={1}>
                          {faqs.map((faq, index) => (
                            <Paper key={index} elevation={2} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                              <TextField fullWidth multiline label="Question" value={faq.question} onChange={(e) => handleQuestionChange(index, e.target.value)} />
                              <TextField fullWidth multiline rows={3} label="Answer" value={faq.answer} onChange={(e) => handleAnswerChange(index, e.target.value)} />
                              <Button variant="contained" size="small" onClick={() => handleFaqremove(index)}>Remove</Button>
                            </Paper>
                          ))}
                          <Button startIcon={<AddIcon />} onClick={handleFaqadd}>Add More</Button>
                        </Stack>
                      </Grid>
                    </LocalizationProvider>
                    {!currentWebinar?.viewOnly && (
                      <DialogActions sx={{ mt: 3 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">{currentWebinar ? 'Update' : 'Submit'}</Button>
                      </DialogActions>
                    )}
                    {currentWebinar?.viewOnly && (
                      <DialogActions sx={{ mt: 3 }}><Button variant="contained" onClick={handleClose}>Close</Button></DialogActions>
                    )}
                  </form>
                </DialogContent>
              </Grid>
            </Grid>
          </DialogTitle>
        </Dialog>





 


        {/* ==============================================================
            VIEW WEBINAR DIALOG  — redesigned with section-card layout
            ==============================================================

            Design decisions explained:
            1. Dark gradient hero header: communicates the most important
               info (title, status, type) before the user scrolls at all.
            2. Section cards (SectionCard): groups the 20+ fields into
               7 logical sections so the dialog is scannable, not a wall.
            3. maxHeight + overflowY on DialogContent: keeps the dialog
               fixed on-screen while only the content area scrolls.
            4. 16:9 paddingTop trick on the YouTube iframe: forces a
               widescreen container that scales to any width correctly.
        ============================================================== */}

{/* 
        <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Participant Feedback</DialogTitle>

  <DialogContent>
    {selectedRow && (
      <Box>
        <Typography><b>Name:</b> {selectedRow.name}</Typography>
        <Typography><b>Email:</b> {selectedRow.email}</Typography>
        <Typography><b>Feedback:</b> {selectedRow.feedback}</Typography>
      </Box>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setFeedbackOpen(false)}>Close</Button>
  </DialogActions>
</Dialog> */}
        <Dialog
          maxWidth="md"
          fullWidth
          open={viewOpen}
          TransitionComponent={PopupTransition}
          onClose={handleViewClose}
          BackdropProps={{ onClick: (e) => e.stopPropagation() }}
          sx={{ '& .MuiDialog-paper': { p: 0, borderRadius: 3, overflow: 'hidden' } }}
        >
          {/* ── HERO HEADER ──────────────────────────────────────────── */}
          <Box sx={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #3b0764 50%, #1a0a2e 100%)',
            px: 4, py: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
          }}>
            <Box sx={{ flex: 1, pr: 2 }}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 2, fontSize: 11 }}>
                Webinar Details
              </Typography>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mt: 0.2, lineHeight: 1.3 }}>
                {viewDetails?.title || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                {viewDetails?.sub_title || '—'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
              {/* Active / Inactive status badge */}
              <Box sx={{
                px: 2, py: 0.6, borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                bgcolor: viewDetails?.webinar_status ? 'rgba(34,197,94,0.2)'  : 'rgba(239,68,68,0.2)',
                color:  viewDetails?.webinar_status ? '#4ade80'               : '#f87171',
                border: `1px solid ${viewDetails?.webinar_status ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`
              }}>
                {viewDetails?.webinar_status ? 'Active' : 'Inactive'}
              </Box>
              {/* Paid / Free badge */}
              <Box sx={{
                px: 2, py: 0.6, borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                bgcolor: viewDetails?.is_paid ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)',
                color:  viewDetails?.is_paid ? '#fbbf24'               : '#a5b4fc',
                border: `1px solid ${viewDetails?.is_paid ? 'rgba(251,191,36,0.4)' : 'rgba(99,102,241,0.4)'}`
              }}>
                {viewDetails?.is_paid ? 'Paid' : 'Free'}
              </Box>
              <IconButton onClick={handleViewClose}
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <CloseSquare style={{ pointerEvents: 'none' }} />
              </IconButton>
            </Stack>
          </Box>

          {/* ── SCROLLABLE CONTENT BODY ───────────────────────────────── */}
          <DialogContent sx={{ p: 0, bgcolor: '#f8f9fb', maxHeight: '72vh', overflowY: 'auto' }}>
            <Box sx={{ p: 3 }}>

              {/* SECTION 1: MEDIA — image (5 cols) + video (7 cols) */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={5}>
                  <SectionCard label="Webinar Image">
                    {viewDetails?.webinar_image_url
                      ? <Box component="img" src={viewDetails.webinar_image_url} alt="Webinar" sx={{ width: '100%', borderRadius: 1.5, display: 'block', maxHeight: 210, objectFit: 'cover' }} />
                      : <EmptyValue />
                    }
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={7}>
                  <SectionCard label="YouTube Video">
                    {viewDetails?.video_url && getYoutubeId(viewDetails.video_url) ? (
                      // paddingTop: 56.25% = 9/16 — forces a 16:9 container that
                      // scales correctly at any dialog width on any screen.
                      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 1.5, overflow: 'hidden' }}>
                        <Box component="iframe"
                          src={`https://www.youtube.com/embed/${getYoutubeId(viewDetails.video_url)}`}
                          title="Webinar Video" frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                      </Box>
                    ) : <EmptyValue label="No video added" />}
                  </SectionCard>
                </Grid>
              </Grid>

              {/* SECTION 2: BASIC INFORMATION */}
              <SectionCard label="Basic Information" sx={{ mb: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}><FieldRow label="Title"             value={viewDetails?.title}       /></Grid>
                  <Grid item xs={12} md={6}><FieldRow label="Slug"              value={viewDetails?.slug}  mono  /></Grid>
                  <Grid item xs={12} md={6}><FieldRow label="Sub Title"         value={viewDetails?.sub_title}   /></Grid>
                  <Grid item xs={12} md={6}><FieldRow label="Description / Key" value={viewDetails?.description} /></Grid>
                </Grid>
              </SectionCard>

              {/* SECTION 3: SCHEDULE & LOGISTICS */}
              <SectionCard label="Schedule & Logistics" sx={{ mb: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><FieldRow label="Date & Time" value={viewDetails?.scheduled_start} /></Grid>
                  <Grid item xs={12} md={4}><FieldRow label="Mode"        value={viewDetails?.mode === true ? 'Online' : 'Offline'} /></Grid>
                  <Grid item xs={12} md={4}><FieldRow label="Language"    value={viewDetails?.language} /></Grid>
                  <Grid item xs={12} md={4}><FieldRow label="Mentor"      value={viewDetails?.mentor}   /></Grid>

                  {/* Seats: turns red and shows "Registration Full" when capacity is reached */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Seats Availability</Typography>
                      <Box sx={{ mt: 0.5, p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: viewDetails?.participants_count >= viewDetails?.seats_available ? '#fca5a5' : '#e0e0e0', bgcolor: viewDetails?.participants_count >= viewDetails?.seats_available ? '#fef2f2' : '#f9f9f9' }}>
                        <Typography sx={{ fontWeight: 700, color: viewDetails?.participants_count >= viewDetails?.seats_available ? '#dc2626' : '#111827' }}>
                          {viewDetails?.participants_count ?? 0} / {viewDetails?.seats_available ?? '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {viewDetails?.participants_count >= viewDetails?.seats_available
                            ? '🔴 Registration Full'
                            : `${(viewDetails?.seats_available ?? 0) - (viewDetails?.participants_count ?? 0)} seats remaining`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* WhatsApp: clickable green link box */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>WhatsApp Link</Typography>
                      {viewDetails?.waba_link
                        ? <Box component="a" href={viewDetails.waba_link} target="_blank" rel="noopener noreferrer"
                            sx={{ mt: 0.5, p: 1.5, borderRadius: 1.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#15803d', fontWeight: 500, fontSize: 13, wordBreak: 'break-all', '&:hover': { bgcolor: '#dcfce7' } }}>
                            {viewDetails.waba_link}
                          </Box>
                        : <EmptyValue />
                      }
                    </Box>
                  </Grid>
                </Grid>
              </SectionCard>

              {/* SECTION 4: PRICING */}
              <SectionCard label="Pricing" sx={{ mb: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}><FieldRow label="Webinar Type" value={viewDetails?.is_paid ? 'Paid' : 'Free'} /></Grid>
                  {viewDetails?.is_paid && (
                    <>
                      <Grid item xs={12} md={4}><FieldRow label="Regular Price" value={viewDetails?.regular_price ? `₹${Number(viewDetails.regular_price).toLocaleString('en-IN')}` : '—'} /></Grid>
                      <Grid item xs={12} md={4}><FieldRow label="Sale Price"    value={viewDetails?.price          ? `₹${Number(viewDetails.price).toLocaleString('en-IN')}`          : '—'} /></Grid>
                    </>
                  )}
                </Grid>
              </SectionCard>

              {/* SECTION 5: SEO METADATA (conditional — only shown when metadata exists) */}
              {viewDetails?.metadata?.length > 0 && (
                <SectionCard label="SEO Metadata" sx={{ mb: 2.5 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} md={6}>
                      <FieldRow label="Meta Title" value={viewDetails.metadata[0]?.meta_title} />
                      <Box sx={{ mt: 2 }}><FieldRow label="Meta Description" value={viewDetails.metadata[0]?.meta_description} /></Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Meta Image</Typography>
                      {viewDetails.metadata[0]?.meta_image
                        ? <Box component="img" src={viewDetails.metadata[0].image_url} alt="Meta" sx={{ mt: 0.5, width: '100%', maxWidth: 180, borderRadius: 2, border: '1px solid #e5e7eb', display: 'block' }} />
                        : <EmptyValue />
                      }
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* SECTION 6: TOOLS — card grid (conditional) */}
              {viewDetails?.tools?.length > 0 && (
                <SectionCard label={`Tools (${viewDetails.tools.length})`} sx={{ mb: 2.5 }}>
                  <Grid container spacing={2}>
                    {viewDetails.tools.map((tool, i) => (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, p: 1.5, textAlign: 'center', bgcolor: '#fff', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } }}>
                          {tool.image_url && (<Box component="img" src={tool.image_url} alt={tool.tools_title} sx={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 1, mb: 1 }} />)}
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', fontSize: 12 }}>{tool.tools_title || '—'}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>
              )}

              {/* SECTION 7: FAQS — accordion-style rows (conditional) */}
              {viewDetails?.faqs?.length > 0 && (
                <SectionCard label={`FAQs (${viewDetails.faqs.length})`}>
                  <Stack spacing={1.5}>
                    {viewDetails.faqs.map((faq, i) => (
                      <Box key={i} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                        {/* Grey question header mirrors an accordion trigger */}
                        <Box sx={{ bgcolor: '#f3f4f6', px: 2, py: 1.2, borderBottom: '1px solid #e5e7eb' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                            Q{i + 1}. {faq.question || '—'}
                          </Typography>
                        </Box>
                        <Box sx={{ px: 2, py: 1.5, bgcolor: '#fff' }}>
                          <Typography variant="body2" sx={{ color: '#4b5563', lineHeight: 1.75 }}>
                            {faq.answer || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              )}

            </Box>
          </DialogContent>

          {/* ── STICKY FOOTER ─────────────────────────────────────────── */}
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', bgcolor: '#fff' }}>
            <Button onClick={handleViewClose} variant="contained"
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4, bgcolor: '#111827', '&:hover': { bgcolor: '#000' } }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </MainCard>
  );
};

export default WebinarList;