import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
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
    FormLabel,
    InputAdornment,
    Tooltip,
    Typography,
    ButtonBase,


} from '@mui/material';
// import axiosInstance from 'utils/axios';
import { BoxAdd, CloseSquare, Edit, Eye, SearchNormal1, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Switch } from '@mui/material';

// Css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { usePermission } from 'hooks/usePermission';

import { useNavigate } from 'react-router';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { DateTimePicker } from '@mui/x-date-pickers';

const WebinarList = () => {

    //  const WebinarList = () => {
    const navigate = useNavigate();
    const { checkPermission } = usePermission();
    // const handleStatusChange = () => { ... };

    const canView = checkPermission('Webinar', 'view');
    const canCreate = checkPermission('Webinar', 'create');
    const canUpdate = checkPermission('Webinar', 'update');
    const canDelete = checkPermission('Webinar', 'delete');

    const [open, setOpen] = useState(false);
    const [currentWebinar, setCurrentWebinar] = useState(null);
    const [Webinar, setWebinar] = useState([]);
    const [error, setError] = useState('');
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(error);

    // const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    // const userId = auth?.user?.user_id;
    // const dummyWebinars = [
    //     {
    //         id: 1,
    //         title: 'React Basics Webinar',
    //         description: 'Introduction to React fundamentals',
    //         start_at: '2026-02-10',
    //         time: '10:30:00',
    //         max_participants: 100,
    //         status: true,
    //         started: false,
    //         link: 'https://meet.google.com/react-basics',
    //         price: 0,
    //         webinarType: 'Free'
    //     },
    //     {
    //         id: 2,
    //         title: 'Advanced Django REST',
    //         description: 'Deep dive into Django REST Framework',
    //         start_at: '2026-02-15',
    //         time: '14:00:00',
    //         max_participants: 75,
    //         status: true,
    //         started: true,
    //         link: 'https://zoom.us/j/987654321',
    //         price: 499,
    //         webinarType: 'Paid'
    //     },
    //     {
    //         id: 3,
    //         title: 'AI & Machine Learning',
    //         description: 'AI concepts with real-world examples',
    //         start_at: '2026-02-20',
    //         time: '18:00:00',
    //         max_participants: 150,
    //         status: false,
    //         started: false,
    //         link: 'https://teams.microsoft.com/ai-webinar',
    //         price: 999,
    //         webinarType: 'Paid'
    //     },
    //     {
    //         id: 4,
    //         title: 'Frontend Performance Optimization',
    //         description: 'Improve React app performance',
    //         start_at: '2026-02-25',
    //         time: '11:00:00',
    //         max_participants: 120,
    //         status: true,
    //         started: false,
    //         link: 'https://meet.google.com/frontend-perf',
    //         price: 0,
    //         webinarType: 'Free'
    //     }
    // ];


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`api/webinar/web`);
            const result = response?.data || [];
            console.log('Fetched webinars:', result);
            setWebinar(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const handleOpen = () => {
        setCurrentWebinar(null);
        setOpen(true);
    };

    const filteredItems = useMemo(() => {
        if (!Webinar || !Array.isArray(Webinar)) return [];

        if (filterText) {
            return Webinar?.filter(
                (item) =>
                    item.title.toLowerCase().includes(filterText.toLowerCase()) || item.description.toLowerCase().includes(filterText.toLowerCase())
            );
        }
        return Webinar ? Webinar : [];
    }, [Webinar, filterText]);

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <Grid container justifyContent="space-between" alignItems="center" my={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        placeholder="Search by webinar name or description..."
                        variant="outlined"
                        size="small"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchNormal1 size={20} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {filterText && (
                                        <IconButton onClick={handleClear} edge="end" size="small">
                                            <CloseSquare size={20} />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} textAlign="right">
                    {canCreate && (
                        <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
                            Add Webinar
                        </Button>
                    )}
                </Grid>
            </Grid>
        );
    }, [filterText, resetPaginationToggle, canCreate]);

    const handleEdit = (webinar) => {
        console.log(webinar);
        

        setCurrentWebinar({
            link: webinar.zoom_link,
            webinarName: webinar.title,
            webinarDescription: webinar.description,
            webinarDateTime: webinar.scheduled_start,
            id: webinar.uuid,
            webinarType: webinar.is_paid ? 'Paid' : 'Free',
            price: webinar.price,
        });
        setOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstance.delete(`api/webinar/web/${id}/`);
                if (response.data.status === true) {
                    Swal.fire({
                        title: 'Success!',
                        text: 'webinar has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    fetchData();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: response?.data?.message || 'Error deleting webinar.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Failed to delete webinar.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        formik.resetForm();
    };

    // const handleStatusChange = async (webinar, status) => {
    //     try {
    //         const newStatus = status; // Toggle status (true -> false, false -> true)
    //         const actionText = newStatus ? 'activate' : 'deactivate';

    //         const result = await Swal.fire({
    //             title: `${newStatus ? 'Activate' : 'Deactivate'} Webinar`,
    //             text: `Are you sure you want to ${actionText} this Webinar?`,
    //             icon: 'warning',
    //             showCancelButton: true,
    //             confirmButtonText: 'Yes',
    //             cancelButtonText: 'No'
    //         });

    //         // If user cancels, return early
    //         if (!result.isConfirmed) return;

    //         setLoading(true);
    //         await axiosInstance.patch(`${APP_PATH_BASE_URL}api/live-webinar/${Webinar.webinar_link}`, {
    //             status
    //         });

    //         // Update state
    //         setWebinar(webinar.map((w) => (w.webinar_link === webinar.webinar_link ? { ...w, status: newStatus } : w)));
    //     } catch (error) {
    //         console.error('Failed to change webinar status', error);
    //     }
    // };

    const handleViewChange = useCallback(
        (webinar) => {
            if (webinar) {
                console.log(webinar);
                
                navigate(`/webinar/${webinar.uuid}`, {
                    state: {
                        webinarData :{
                            ...webinar,
                        }
                    }
                });
            }
        },
        [navigate]
    );
    //  const validationSchema = Yup.object({
    //   price: Yup.number()
    //     .typeError('Price must be a number')
    //     .positive('Price must be greater than 0')
    // //     .required('Price is required')
    // });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            webinarName: currentWebinar?.webinarName || '',
            webinarDescription: currentWebinar?.webinarDescription || '',
            webinarDateTime: currentWebinar?.webinarDateTime ? new Date(currentWebinar.webinarDateTime) : null,
            price: currentWebinar?.price || '',
            webinarType: currentWebinar?.webinarType || 'Free',
            webinarLink: currentWebinar?.link || ''
        },

        validationSchema: Yup.object().shape({
            webinarName: Yup.string()
                .required('Webinar name is required')
                .matches(/^[A-Za-z0-9\s\-_,.!?;:'"()]+$/, 'Webinar name can only contain letters, numbers, spaces and basic punctuation')
                .trim(),
            webinarDescription: Yup.string().required('Webinar description is required').trim(),
            webinarDateTime: Yup.date().required('Webinar date is required').min(new Date(), 'Webinar date must be in the future').nullable(),
            
            webinarLink: Yup.string()
                .url('Enter a valid URL')
                .required('Webinar link is required'),
            price: Yup.number()
                .when('webinarType', {
                    is: 'Paid',
                    then: (schema) =>
                    schema
                        .required('Price is required for paid webinars')
                        .min(0, 'Price must be positive'),
                    otherwise: (schema) =>
                    schema.notRequired().nullable(),
                }),
            webinarType: Yup.string()
                .oneOf(['Free', 'Paid'])
                .required('Webinar type is required'),

        }),
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const payload = {
                    title: values.webinarName.trim(),
                    description: values.webinarDescription.trim(),
                    scheduled_start: values.webinarDateTime,
                    zoom_link: values.webinarLink,
                    price: Number(values.price),
                    is_paid: values.webinarType == 'Paid' ? true : false,
                };
                console.log('Payload to submit:', payload);

                const method = currentWebinar ? 'PATCH' : 'POST';
                const url = currentWebinar ? `api/webinar/web/${currentWebinar.id}/` : `api/webinar/web`;

                const response = await axiosInstance({
                    method: method,
                    url: url,
                    data: payload
                });

                const result = response.data;

                if (result.status === true) {
                    Swal.fire({
                        title: 'Success!',
                        text: currentWebinar ? 'Webinar updated successfully!' : 'Webinar added successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    resetForm();
                    fetchData();
                    handleClose();
                } else {
                    const errorMessage = result.message;
                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message;
                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setSubmitting(false);
            }
        }
    });
    console.log(formik.errors);
    

    const handleWebinarChange = async (action, currentWebinar) => {
    

        try {
            // Show confirmation dialog and wait for user response
            const confirmation = await Swal.fire({
                title: 'Confirm',
                text: `Are you sure you want to ${action} this webinar?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, ' + action + ' it!',
                cancelButtonText: 'Cancel'
            });

            // If user cancels, exit the function
            if (!confirmation.isConfirmed) {
                return;
            }

            // Make API call only after user confirms
            const response = await axiosInstance.patch(`api/webinar/web/${currentWebinar.uuid}/`, { status: action });

            const result = response.data;

            if (result.status === true) {
                await Swal.fire({
                    title: 'Success!',
                    text: `Webinar ${action}ed successfully!`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Refresh data
                fetchData();
            } else {
                const errorMessage = result.message;
                await Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const columns = [
        {
            name: 'S.No',
            selector: (row, index) => index + 1,
            sortable: true,
            width: '80px'
        },
        {
            name: 'Webinar Name',
            selector: (row) => row.title,
            sortable: true,
            wrap: true
        },
        {
            name: 'Webinar Date & Time',
            selector: (row) => row.scheduled_start,
            sortable: true,
            cell: (row) => formatDateTime(row.scheduled_start)
        },
        
        {
            name: 'Participants',
            selector: (row) => row.participants_count,
            sortable: true
        },
        {
            name: 'Status',
            cell: (row) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {row.is_completed === true ? (
                         <Box>
                            <Button variant="contained" color="success" size="small" >
                               Completed
                            </Button>
                        </Box>) : row.status == "DRAFT" ? (
                        <Box>
                            <Button variant="contained" color="error" size="small" onClick={() => handleWebinarChange('SHEDULED', row)}>
                                Webinar Not Sheduled
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button variant="contained" color="success" size="small" onClick={() => handleWebinarChange('DRAFT', row)}>
                                Webinar Sheduled
                            </Button>
                        </Box>
                    )}
                </Box>
            ),
            sortable: true
        },
        // {
        //     name: 'Active',
        //     cell: (row) => (
        //         <Tooltip title={row.status ? 'Deactivate' : 'Activate'}>
        //             <Switch
        //                 checked={row.status === true}
        //                 color={row.status ? 'success' : 'error'}
        //                 onClick={(e) => e.stopPropagation()}
        //                 onChange={() => handleStatusChange(row, !row.status)}
        //             />
        //         </Tooltip>
        //     )
        // },
        ...(canUpdate || canDelete || canView
            ? [
                {
                    name: 'Actions',
                    cell: (row) => (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewChange(row);
                                    }}
                                >
                                    <Eye />
                                </IconButton>
                            </Tooltip>
                            {canUpdate && (
                                <Tooltip title="Edit">
                                    <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {canDelete && (
                                <Tooltip title="Delete">
                                    <IconButton variant="contained" color="error" onClick={() => handleDelete(row.uuid)}>
                                        <Trash />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )
                }
            ]
            : [])
    ];

    // if (error) {
    //     return (
    //         <MainCard sx={{ borderRadius: 2 }}>
    //             <Box p={3} color="error.main">
    //                 Error: {error}
    //             </Box>
    //         </MainCard>
    //     );
    // }

    return (
        <MainCard>
            {subHeaderComponentMemo}

            <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[5, 10, 20, 30]}
                highlightOnHover
                progressPending={loading}
                responsive
                fixedHeader
                persistTableHead
            />

            {/* Add/Edit Webinar Dialog */}
            <Dialog
                maxWidth="sm"
                TransitionComponent={PopupTransition}
                keepMounted
                fullWidth
                open={open}
                onClose={(webinar, reason) => {
                    if (reason !== 'backdropClick') handleClose();
                }}
                BackdropProps={{
                    onClick: (webinar) => webinar.stopPropagation()
                }}
                sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle className="dialogTitle">
                    {currentWebinar ? (currentWebinar.viewOnly ? 'View webinar' : 'Edit Webinar') : 'Add New Webnar'}
                    <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close">
                        <CloseSquare />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <FormLabel>Webinar Name*</FormLabel>
                                        <TextField
                                            fullWidth
                                            link="webinarName"
                                            name="webinarName"
                                            placeholder="e.g., Annual Conference, Webinar on AI"
                                            value={formik.values.webinarName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.webinarName && Boolean(formik.errors.webinarName)}
                                            helperText={formik.touched.webinarName && formik.errors.webinarName}
                                            disabled={currentWebinar?.viewOnly}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <FormLabel>Webinar Description*</FormLabel>
                                        <TextField
                                            fullWidth
                                            link="webinarDescription"
                                            name="webinarDescription"
                                            placeholder="Describe the webinar details, agenda, and objectives..."
                                            value={formik.values.webinarDescription}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.webinarDescription && Boolean(formik.errors.webinarDescription)}
                                            helperText={formik.touched.webinarDescription && formik.errors.webinarDescription}
                                            multiline
                                            rows={4}
                                            disabled={currentWebinar?.viewOnly}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <FormLabel>Webinar Date & Time*</FormLabel>

                                        <DateTimePicker value={formik.values.webinarDateTime}
                                            onChange={(date) => formik.setFieldValue('webinarDateTime', date)}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: formik.touched.webinarDateTime && Boolean(formik.errors.webinarDateTime),
                                                    helperText: formik.touched.webinarDateTime && formik.errors.webinarDateTime,
                                                    disabled: currentWebinar?.viewOnly
                                                }
                                            }}
                                            disablePast />
                                    </Stack>
                                </Grid>




                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <FormLabel>Webinar Link*</FormLabel>
                                        <TextField
                                            fullWidth
                                            id="webinarLink"
                                            name="webinarLink"
                                            placeholder="Enter a valid URL, e.g., https://zoom.us/j/123456789"
                                            value={formik.values.webinarLink}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.webinarLink && Boolean(formik.errors.webinarLink)}
                                            helperText={formik.touched.webinarLink && formik.errors.webinarLink}
                                            disabled={currentWebinar?.viewOnly}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <FormLabel>
                                            Webinar Type*
                                        </FormLabel>

                                        <Grid display="flex" gap={2}
                                        >
                                            {/* FREE WEBINAR */}
                                            <ButtonBase
                                                onClick={() => formik.setFieldValue('webinarType', 'Free')}
                                                sx={{
                                                    border: '2px solid',
                                                    borderColor: formik.values.webinarType === 'Free' ? '#1976d2' : '#ccc',
                                                    bgcolor: formik.values.webinarType === 'Free' ? '#e3f2fd' : '#f5f5f5',
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography fontWeight={600} color="primary">
                                                    FREE WEBINAR
                                                </Typography>
                                            </ButtonBase>

                                            {/* PAID WEBINAR */}
                                            <ButtonBase
                                                onClick={() => formik.setFieldValue('webinarType', 'Paid')}
                                                sx={{
                                                    border: '2px solid',
                                                    borderColor: formik.values.webinarType === 'Paid' ? '#2e7d32' : '#ccc',
                                                    bgcolor: formik.values.webinarType === 'Paid' ? '#e8f5e9' : '#f5f5f5',
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography fontWeight={600} sx={{ color: '#2e7d32' }}>
                                                    PAID WEBINAR
                                                </Typography>
                                            </ButtonBase>

                                        </Grid>
                                    </Stack>

                                    {formik.touched.webinarType && formik.errors.webinarType && (
                                        <Typography color="error" variant="caption">
                                            {formik.errors.webinarType}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6} >

                                    {formik.values.webinarType === 'Paid' && (
                                        <><Stack spacing={1}>
                                            <FormLabel>
                                                Price*
                                            </FormLabel>
                                            <TextField
                                                fullWidth
                                                name="price"
                                                label="Price"
                                                type="number"
                                                value={formik.values.price}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.price && Boolean(formik.errors.price)}
                                                helperText={formik.touched.price && formik.errors.price}
                                            />
                                        </Stack>
                                        </>
                                    )}

                                </Grid>


                            </Grid>
                        </LocalizationProvider>

                        {!currentWebinar?.viewOnly && (
                            <DialogActions sx={{ mt: 3 }}>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                                    {currentWebinar ? 'Update' : 'Submit'}
                                </Button>
                            </DialogActions>
                        )}

                        {currentWebinar?.viewOnly && (
                            <DialogActions sx={{ mt: 3 }}>
                                <Button onClick={handleClose} variant="contained">
                                    Close
                                </Button>
                            </DialogActions>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </MainCard >
    );

};
export default WebinarList;
