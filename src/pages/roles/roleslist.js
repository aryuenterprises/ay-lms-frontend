import React, { useCallback, useEffect, useState, lazy, Suspense, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  Paper,
  FormLabel,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { Search, Close, Add } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from 'utils/axios';
import 'assets/css/DataTable.css';
import { APP_PATH_BASE_URL } from 'config';
import { CloseSquare, Edit, Lock, Trash } from 'iconsax-react';
import Swal from 'sweetalert2';
import { usePermission } from 'hooks/usePermission';

// Lazy load the permissions form component
const PermissionsForm = lazy(() => import('./PermissionsForm'));

// Yup validation schema
const roleValidationSchema = Yup.object({
  name: Yup.string()
    .required('Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .test('no-empty-spaces', 'Role name cannot be only spaces', (value) => {
      return value ? value.trim().length > 0 : false;
    })
});

const RolesTable = () => {
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Roles', 'create');
  const canUpdate = checkPermission('Roles', 'update');
  const canDelete = checkPermission('Roles', 'delete');

  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  // Formik form for role management
  const roleFormik = useFormik({
    initialValues: {
      name: ''
    },
    validationSchema: roleValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        let response;
        if (currentRole) {
          // Update existing role
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/roles/${currentRole.role_id}`, {
            name: values.name
          });

          if (response.data.success) {
            fetchRoles();
            Swal.fire('Success', 'Role updated successfully', 'success');
          }
        } else {
          // Add new role
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/roles`, {
            name: values.name
          });

          if (response.data.success) {
            fetchRoles();
            Swal.fire('Success', 'Role added successfully', 'success');
          }
        }

        resetForm();
        handleCloseAddForm();
      } catch (error) {
        console.error('Error saving role:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save role';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Fetch all roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/roles`);
      const matchData = response.data.data.map((item, index) => ({ ...item, sno: index + 1 }));
      setData(matchData || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      Swal.fire('Error', 'Failed to fetch roles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Reset form when currentRole changes
  useEffect(() => {
    if (showAddForm && currentRole) {
      roleFormik.setValues({
        name: currentRole.name || ''
      });
    } else if (showAddForm) {
      roleFormik.resetForm();
    }
  }, [currentRole, showAddForm]);

  // Column configuration
  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Name',
      selector: (row) => row.name,
      sortable: true
    },
    ...(canUpdate || canDelete
      ? [
          {
            name: 'Actions',
            cell: (row) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {canUpdate && (
                  <Tooltip title="Set Permissions">
                    <IconButton color="primary" onClick={() => handleSetPermissions(row)}>
                      <Lock />
                    </IconButton>
                  </Tooltip>
                )}
                {canUpdate && (
                  <Tooltip title="Edit Role">
                    <IconButton color="info" onClick={() => handleRoleEdit(row)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                )}
                {canDelete && (
                  <Tooltip title="Delete Role">
                    <IconButton color="error" onClick={() => handleDelete(row.role_id)}>
                      <Trash />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ),
            width: '500px'
          }
        ]
      : [])
  ];

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item?.name?.toLowerCase().includes(filterText.toLowerCase()));
  }, [data, filterText]);

  const handleSetPermissions = async (role) => {
    setCurrentRole(role);
    setShowForm(true);
  };

  const handleRoleAdd = () => {
    setCurrentRole(null);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowAddForm(false);
    setCurrentRole(null);
  };

  const handleRoleEdit = (role) => {
    setCurrentRole(role);
    setShowAddForm(true);
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
        const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/roles/${id}/archive`);
        console.log('res :', res);
        if (!res.data.success) {
          throw new Error('Failed to delete role');
        }
        fetchRoles();
        Swal.fire('Deleted!', 'Role has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting role:', error);
        Swal.fire('Error!', 'Failed to delete role.', 'error');
      }
    }
  };

  const handleClear = () => {
    setFilterText('');
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setCurrentRole(null);
    roleFormik.resetForm();
  };

  // Separate handler for form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    roleFormik.handleSubmit();
  };

  return (
    <Box>
      {!showForm && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', width: '200px' }}>
              <TextField
                placeholder="Search..."
                variant="outlined"
                size="small"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {filterText && (
                        <IconButton onClick={handleClear} edge="end" size="small">
                          <Close size={20} />
                        </IconButton>
                      )}
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ display: 'flex' }}>
              {canCreate && (
                <Button color="success" variant="contained" startIcon={<Add />} onClick={handleRoleAdd}>
                  Add Role
                </Button>
              )}
            </Box>
          </Box>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            highlightOnHover
            responsive
            progressPending={loading}
            progressComponent={<Typography>Loading roles...</Typography>}
            noDataComponent={<Typography>No roles found</Typography>}
          />
        </Paper>
      )}

      {/* Set Permissions Form */}
      {showForm && (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
          <Suspense fallback={<div>Loading permissions form...</div>}>
            <PermissionsForm onCancel={handleCancel} roleId={currentRole?.id} currentRole={currentRole} />
          </Suspense>
        </Paper>
      )}

      {/* Role Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onClose={handleCloseAddForm} maxWidth="xs" fullWidth component="form" onSubmit={handleFormSubmit}>
        <DialogTitle className="dialogTitle">
          {currentRole ? 'Edit Role' : 'Add Role'}
          <IconButton color="dark" onClick={handleCloseAddForm} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <FormLabel>Role Name*</FormLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                placeholder="Role Name"
                value={roleFormik.values.name}
                onChange={roleFormik.handleChange}
                onBlur={roleFormik.handleBlur}
                error={roleFormik.touched.name && Boolean(roleFormik.errors.name)}
                helperText={roleFormik.touched.name && roleFormik.errors.name}
                autoFocus
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ mt: 3, p: 2 }}>
          <Button onClick={handleCloseAddForm} disabled={roleFormik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={roleFormik.isSubmitting}>
            {currentRole ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RolesTable;
