import React, { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Avatar,
  Select,
  MenuItem
} from '@mui/material';
import { BoxAdd, CloseSquare, Edit, Trash } from 'iconsax-react';
import { useFormik } from 'formik';
import axiosInstance from 'utils/axios';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Quill } from 'react-quill';
import 'quill-emoji/dist/quill-emoji.css';
import * as Emoji from 'quill-emoji';


//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import Swal from 'sweetalert2';
import { Capitalise } from 'utils/capitalise';
import { usePermission } from 'hooks/usePermission';
Quill.register('modules/emoji', Emoji);
const Announcement = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Announcements', 'create');
  const canUpdate = checkPermission('Announcements', 'update');
  const canDelete = checkPermission('Announcements', 'delete');

  const [open, setOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const [backgroundPicPreview, setBackgroundPicPreview] = useState(null);
  // const [contentPicPreview, setContentPicPreview] = useState(null);

  // Fetch Announcements data from API
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/announcements`);

      const announcementsWithId = response.data.data.map((announcement, index) => ({
        ...announcement,
        sno: index + 1
      }));
      setAnnouncements(announcementsWithId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpen = () => {
    setCurrentAnnouncement(null);
    setEditorContent('');
    setBackgroundPicPreview(null);
    // setContentPicPreview(null);
    setOpen(true);
  };

  const handleEdit = (announcement) => {
    setCurrentAnnouncement(announcement);
    setEditorContent(announcement.content || '');
    setBackgroundPicPreview(announcement.background_pic_url ? `${announcement.background_pic_url}` : null);
    // setContentPicPreview(announcement.content_pic_url ? `${announcement.content_pic_url}` : null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      // Only proceed if user confirmed
      if (result.isConfirmed) {
        await axiosInstance.patch(`${APP_PATH_BASE_URL}api/announcements/${id}/archive`);
        setAnnouncements(announcements.filter((announcement) => announcement.id !== id));
        Swal.fire({
          title: 'Success!',
          text: 'Announcement deleted successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete announcement',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
  };




  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required')
  });

  const formik = useFormik({
    initialValues: {
      title: currentAnnouncement?.title || '',
      audience: currentAnnouncement?.audience || '',
      background_pic: null,
      // content_pic: null,
      content: currentAnnouncement?.content || ''
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('audience', values.audience);
        formData.append('content', editorContent);

        // Append files if they exist, or existing paths if in edit mode
        if (values.background_pic instanceof File) {
          formData.append('background_pic', values.background_pic);
        } else if (currentAnnouncement?.background_pic) {
          formData.append('background_pic_path', currentAnnouncement.background_pic);
        }

        // if (values.content_pic instanceof File) {
        //   formData.append('content_pic', values.content_pic);
        // } else if (currentAnnouncement?.content_pic) {
        //   formData.append('content_pic_path', currentAnnouncement.content_pic);
        // }

        let response;
        if (currentAnnouncement) {
          // Update existing announcement
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/announcements/${currentAnnouncement.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } else {
          // Add new announcement
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/announcements`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: response.data.message,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          fetchAnnouncements(); // Refresh the list
          handleClose();
        }
      } catch (error) {
        console.error('Error saving announcement:', error);
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to save announcement',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleBackgroundPicChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('background_pic', file);
      const reader = new FileReader();
      reader.onload = () => {
        setBackgroundPicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleContentPicChange = (event) => {
  //   const file = event.currentTarget.files[0];
  //   if (file) {
  //     formik.setFieldValue('content_pic', file);
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setContentPicPreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // ReactQuill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video', 'emoji'], // emoji button is already here
      ['code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    },
    'emoji-toolbar': true, // Add these emoji-specific configurations
    'emoji-textarea': false,
    'emoji-shortname': true
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'color',
    'background',
    'script',
    'align',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'code-block',
    'emoji' // emoji is already in formats
  ];

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Title',
      selector: (row) => Capitalise(row.title),
      sortable: true
    },
    {
      name: 'Type',
      selector: (row) => Capitalise(row.audience),
      sortable: true
    },
    {
      name: 'Background Image',
      cell: (row) =>
        row.background_pic_url ? <Avatar src={`${row.background_pic_url}`} variant="rounded" sx={{ width: 80, height: 60 }} /> : 'No image'
    },
    // {
    //   name: 'Content Image',
    //   cell: (row) =>
    //     row.content_pic_url ? <Avatar src={`${row.content_pic_url}`} variant="rounded" sx={{ width: 80, height: 60 }} /> : 'No image',
    //   width: '150px'
    // },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canUpdate && (
            <Tooltip title="Edit">
              <IconButton variant="contained" color="info" onClick={() => handleEdit(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton variant="contained" color="error" onClick={() => handleDelete(row.id)}>
                <Trash />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <MainCard>
      <Grid item container justifyContent="flex-end" mb={3}>
        <Grid item>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex' }}>
              {canCreate && (
                <Button color="success" variant="contained" startIcon={<BoxAdd />} onClick={handleOpen}>
                  Add New Announcement
                </Button>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={announcements}
        pagination
        progressPending={loading}
        paginationPerPage={10}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        highlightOnHover
        responsive
      />

      {/* Add/Edit Announcement Dialog */}
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle">
          {currentAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close">
            <CloseSquare />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Title *</FormLabel>
                  <TextField
                    fullWidth
                    id="title"
                    name="title"
                    placeholder="Enter announcement title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Select user *</FormLabel>
                  <Select
                    fullWidth
                    id="audience"
                    name="audience"
                    displayEmpty
                    value={formik.values.audience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.audience && Boolean(formik.errors.audience)}
                  >
                    <MenuItem value="">Select user</MenuItem>
                    <MenuItem value="students">Students</MenuItem>
                    <MenuItem value="trainers">Trainers</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Background Image</FormLabel>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="background-pic-upload"
                    type="file"
                    onChange={handleBackgroundPicChange}
                  />
                  <label htmlFor="background-pic-upload">
                    <Button variant="outlined" component="span" fullWidth>
                      Upload Background Image
                    </Button>
                  </label>
                  {formik.touched.background_pic && formik.errors.background_pic && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>{formik.errors.background_pic}</Box>
                  )}
                  {backgroundPicPreview && (
                    <Box mt={2}>
                      <Avatar src={backgroundPicPreview} variant="rounded" sx={{ width: '100%', height: 150 }} />
                    </Box>
                  )}
                </Stack>
              </Grid>

              {/* <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <FormLabel>Content Image</FormLabel>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="content-pic-upload"
                    type="file"
                    onChange={handleContentPicChange}
                  />
                  <label htmlFor="content-pic-upload">
                    <Button variant="outlined" component="span" fullWidth>
                      Upload Content Image
                    </Button>
                  </label>
                  {formik.touched.content_pic && formik.errors.content_pic && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>{formik.errors.content_pic}</Box>
                  )}
                  {contentPicPreview && (
                    <Box mt={2}>
                      <Avatar src={contentPicPreview} variant="rounded" sx={{ width: '100%', height: 150 }} />
                    </Box>
                  )}
                </Stack>
              </Grid> */}

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <FormLabel>Content</FormLabel>
                  <Box sx={{ height: 300, mb: 3 }}>
                    <ReactQuill
                      theme="snow"
                      value={editorContent}
                      onChange={setEditorContent}
                      modules={quillModules}
                      formats={formats}
                      style={{ height: '250px' }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                {currentAnnouncement ? 'Update Announcement' : 'Add Announcement'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default Announcement;
