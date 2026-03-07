import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";

import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";

import * as XLSX from "xlsx";
import axiosInstance from "utils/axios";

const Feedbackvalues = () => {

const { slug } = useParams();
const location = useLocation();
const navigate = useNavigate();

const feedbackId = slug || location.state?.feedbackId;

const [openDialog, setOpenDialog] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);

const [feedbackData, setFeedbackData] = useState(null);
const [loading, setLoading] = useState(false);

const [page, setPage] = useState(0);
const rowsPerPage = 100;

const today = new Date().toISOString().split("T")[0];

const [startDate, setStartDate] = useState(today);
const [endDate, setEndDate] = useState(today);

const [filterStart, setFilterStart] = useState("");
const [filterEnd, setFilterEnd] = useState("");

const [searchText, setSearchText] = useState("");

/* ---------- API ---------- */

const fetchFeedback = async () => {

try {

setLoading(true);

const response = await axiosInstance.get(
`api/webinar/web/${feedbackId}/`
);

setFeedbackData(response.data.data);

} catch (err) {

console.error("Failed to fetch feedback", err);

} finally {

setLoading(false);

}

};

useEffect(() => {
if (feedbackId) fetchFeedback();
}, [feedbackId]);

/* ---------- FILTER ---------- */

const applyFilter = () => {
setFilterStart(startDate);
setFilterEnd(endDate);
};

/* ---------- TABLE DATA ---------- */
/* FIX: only users who submitted feedback */

const rows =
feedbackData?.participants
?.filter((p) => p.feedback) 
?.map((p, index) => ({
id: index + 1,
date: p.feedback?.submitted_at?.split("T")[0] || "",
phone: p.phone || "",
name: p.name || "",
content_quality: p.feedback?.content_quality || "-",
interaction: p.feedback?.interaction_rating || "-",
pace: p.feedback?.pace_of_session || "-",
speaker: p.feedback?.speaker_quality || "-",
overall: p.feedback?.overall_rating || "-",
newfeed: p.feedback || {}
})) || [];

/* ---------- TABLE COLUMNS ---------- */

const columns = [
{ label: "Date", key: "date" },
{ label: "Name", key: "name" },
{ label: "Phone", key: "phone" },
{ label: "Content Quality", key: "content_quality" },
{ label: "Interaction", key: "interaction" },
{ label: "Pace", key: "pace" },
{ label: "Speaker", key: "speaker" },
{ label: "Overall", key: "overall" },
{ label: "View", key: "view" }
];

/* ---------- SEARCH + DATE FILTER ---------- */

const filteredRows = rows.filter((row) => {

if (filterStart || filterEnd) {

const rowDate = row.date || "";

if (filterStart && rowDate < filterStart) return false;
if (filterEnd && rowDate > filterEnd) return false;

}

if (searchText) {

const search = searchText.toLowerCase();

return Object.values(row)
.join(" ")
.toLowerCase()
.includes(search);

}

return true;

});

/* ---------- EXPORT ---------- */

const exportToExcel = () => {

const exportData = filteredRows.map((row) => ({

Date: row.date,
Name: row.name,
Phone: row.phone,
Content_Quality: row.content_quality,
Interaction: row.interaction,
Pace: row.pace,
Speaker: row.speaker,
Overall: row.overall

}));

const worksheet = XLSX.utils.json_to_sheet(exportData);
const workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

XLSX.writeFile(workbook, "feedback.xlsx");

};

/* ---------- KEY VALUE UI ---------- */

const KeyValue = ({ label, value }) => (

<Box sx={{ display: "flex", alignItems: "flex-start", py: 0.6 }}>

<Typography sx={{ width: 160, fontWeight: 600, fontSize: 14 }}>
{label}
</Typography>

<Typography sx={{ flex: 1, fontSize: 14, color: "text.secondary" }}>
{value ?? "-"}
</Typography>

</Box>

);

/* ---------- UI ---------- */

return (

<Box sx={{ p: 3 }}>

{/* HEADER */}

<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>

<Box>
<Typography variant="h5">Webinar Feedback</Typography>
<Typography variant="body2" color="text.secondary">
Webinar ID: {feedbackData?.uuid}
</Typography>
</Box>

<Button variant="outlined" onClick={() => navigate(-1)}>
Back
</Button>

</Box>

{/* FILTER BAR */}

<Box sx={{ display: "flex", gap: 2, mb: 3 }}>

<TextField
type="date"
label="Start Date"
InputLabelProps={{ shrink: true }}
value={startDate}
onChange={(e) => setStartDate(e.target.value)}
/>

<TextField
type="date"
label="End Date"
InputLabelProps={{ shrink: true }}
value={endDate}
onChange={(e) => setEndDate(e.target.value)}
/>

<Button variant="contained" onClick={applyFilter}>
Search
</Button>

<TextField
label="Search"
size="small"
value={searchText}
onChange={(e) => setSearchText(e.target.value)}
placeholder="Search all columns"
/>

<Box sx={{ flexGrow: 1 }} />

<Button variant="contained" onClick={exportToExcel}>
Export Excel
</Button>

</Box>

{/* LOADING */}

{loading ? (

<Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
<CircularProgress />
</Box>

) : (

<>

<TableContainer component={Paper}>

<Table>

<TableHead>
<TableRow>
{columns.map((col) => (
<TableCell key={col.key}>{col.label}</TableCell>
))}
</TableRow>
</TableHead>

<TableBody>

{filteredRows
.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
.map((row) => (

<TableRow key={row.id}>

{columns.map((col) => (

<TableCell key={col.key}>

{col.key === "view" ? (

<IconButton
onClick={() => {
setSelectedUser(row);
setOpenDialog(true);
}}
>
<VisibilityIcon />
</IconButton>

) : (
row[col.key]
)}

</TableCell>

))}

</TableRow>

))}

</TableBody>

</Table>

</TableContainer>

<TablePagination
component="div"
count={filteredRows.length}
page={page}
rowsPerPage={rowsPerPage}
rowsPerPageOptions={[]}
onPageChange={(e, newPage) => setPage(newPage)}
/>

</>

)}

{/* DIALOG */}

<Dialog
open={openDialog}
onClose={() => setOpenDialog(false)}
maxWidth="sm"
PaperProps={{ sx: { width: 420 } }}
>

<DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
Feedback Details
</DialogTitle>

<DialogContent dividers>

{selectedUser && (

<Box>

<Typography sx={{ fontWeight: 700, mb: 1 }}>
Participant
</Typography>

<Box sx={{ background: "#fafafa", p: 1.5, borderRadius: 2, mb: 2 }}>

<KeyValue label="Name" value={selectedUser.name} />
<KeyValue label="Phone" value={selectedUser.phone} />

</Box>

<Typography sx={{ fontWeight: 700, mb: 1 }}>
Feedback
</Typography>

<Box sx={{ background: "#fafafa", p: 1.5, borderRadius: 2, mb: 2 }}>

<KeyValue label="Learned New" value={selectedUser?.newfeed?.learned_something_new ? "Yes" : "No"} />
<KeyValue label="Recommend" value={selectedUser?.newfeed?.would_recommend ? "Yes" : "No"} />
<KeyValue label="Future Webinar" value={selectedUser?.newfeed?.interested_in_future_webinars ? "Yes" : "No"} />
<KeyValue label="Paid Course" value={selectedUser?.newfeed?.interested_in_paid_courses ? "Yes" : "No"} />

</Box>

<Typography sx={{ fontWeight: 700, mb: 1 }}>
Comments
</Typography>

<Box sx={{ background: "#fafafa", p: 1.5, borderRadius: 2 }}>

<KeyValue label="Liked Most" value={selectedUser?.newfeed?.liked_most || "No response"} />
<KeyValue label="Suggestion" value={selectedUser?.newfeed?.improvement_suggestions || "No suggestion"} />
<KeyValue label="Comments" value={selectedUser?.newfeed?.additional_comments || "No comments"} />

</Box>

</Box>

)}

</DialogContent>

<DialogActions>

<Button variant="contained" onClick={() => setOpenDialog(false)}>
Close
</Button>

</DialogActions>

</Dialog>

</Box>

);

};

export default Feedbackvalues;