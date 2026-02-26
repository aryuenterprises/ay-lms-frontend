// PermissionsForm.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  FormLabel,
  TextField,
  DialogActions,
  CircularProgress,
  CardActions,
  Typography
} from '@mui/material';
import { Formik, Form } from 'formik';
import PropTypes from 'prop-types';
import { ArrowBack } from '@mui/icons-material';
import axiosInstance from 'utils/axios';
import Swal from 'sweetalert2';
import { APP_PATH_BASE_URL } from 'config';
import { CloseSquare } from 'iconsax-react';
import 'assets/css/commonStyle.css';

const permissionsList = ['create', 'read', 'update', 'delete'];

const PermissionsForm = ({ onCancel, currentRole }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({ permissions: [] });

  // Open dialog for adding new module

  // Open dialog for editing module
  const handleEditModule = (module) => {
    setCurrentModule(module);
    setShowAddForm(true);
  };

  // Close dialog
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setCurrentModule(null);
  };

  // Get initial values for module form
  const getModuleInitialValues = () => {
    if (currentModule) {
      return {
        moduleName: currentModule.module,
        permissions: currentModule.permissions || []
      };
    }
    return {
      moduleName: '',
      permissions: []
    };
  };

  // Validate module form
  const validateModule = (values) => {
    const errors = {};
    if (!values.moduleName) {
      errors.moduleName = 'Module name is required';
    }
    return errors;
  };

  // Handle fetch role permissions
  const handleFetchPermissions = useCallback(
    async (permission) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/roles/${currentRole.role_id}`);
        if (response.data.success) {
          const permissionData = response.data.data.module_permissions || [];
          const modulesData = response.data.modules || [];
          // console.log('modulesData :', modulesData);

          // Create normalized modules by matching module_id
          const normalizedModules = modulesData.map((module) => {
            // Find matching permission by module_id
            const matchingPermission = permissionData.find((perm) => perm.module_id === module.module_id);

            return {
              id: module.module_id || null,
              module_id: module.module_id,
              module: module.module,
              permissions: matchingPermission?.allowed_actions || [] // Set allowed_actions as permissions
            };
          });

          setModules(normalizedModules);
          setFormValues({ permissions: normalizedModules });

          if (permission) {
            // Get current auth data from localStorage
            const authData = JSON.parse(localStorage.getItem('auth'));

            if (authData && authData.user) {
              // Update permissions in the auth data
              const updatedAuthData = {
                ...authData,
                user: {
                  ...authData.user,
                  permissions: normalizedModules.map((module) => ({
                    module_id: module.module_id,
                    module_name: module.module,
                    allowed_actions: module.permissions // This comes from allowed_actions
                  }))
                }
              };
              // console.log('updatedAuthData :', updatedAuthData);
              // Save back to localStorage
              localStorage.setItem('auth', JSON.stringify(updatedAuthData));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch module data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch module data. Please try again.',
          showConfirmButton: true
        });
      } finally {
        setLoading(false);
      }
    },
    [currentRole.role_id]
  );

  // Fetch role permissions when component mounts
  useEffect(() => {
    handleFetchPermissions();
  }, [handleFetchPermissions]);

  // Handle permissions form submission - FIXED
  const handlePermissionsSubmit = async (values, { setSubmitting }) => {
    try {
      // Transform the permissions data to match the required API format
      const module_permissions = values.permissions
        .filter((permission) => permission.permissions)
        .map((permission) => ({
          module_id: permission.id,
          allowed_actions: permission.permissions
        }));

      // Save permissions via API
      const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/roles&permissions`, {
        role_id: currentRole.role_id,
        module_permissions: module_permissions
      });

      if (response.data.success) {
        // Refresh module list
        const update = true;
        await handleFetchPermissions(update);

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Permissions updated successfully',
          showConfirmButton: true
        });
      } else {
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message || 'Failed to save permissions',
          showConfirmButton: true
        });
        throw new Error(response.data.message || 'Failed to save permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save permissions',
        showConfirmButton: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle module form submission
  const handleModuleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (currentModule) {
        // Edit existing module
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/modules&permissions/${currentModule.module_id}`, {
          module: values.moduleName.trim(),
          actions: [...permissionsList]
        });

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Module Updated',
            text: 'The module has been updated successfully.',
            showConfirmButton: true
          });
        }
      } else {
        // Add new module
        const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/modules&permissions`, {
          module: values.moduleName.trim(),
          actions: [...permissionsList]
        });

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Module Added',
            text: 'The new module has been added successfully.',
            showConfirmButton: true
          });
        }
      }

      // Refresh module list
      await handleFetchPermissions();
      handleCloseAddForm();
      resetForm();
    } catch (error) {
      console.error('Failed to save module:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save module. Please try again.',
        showConfirmButton: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete module
  const handleDeleteModule = async (moduleToDelete) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the module "${moduleToDelete.module}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/modules&permissions/${moduleToDelete.id}/archive`);

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The module has been deleted.',
            showConfirmButton: true
          });

          await handleFetchPermissions();
        }
      } catch (error) {
        console.error('Failed to delete module:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete module. Please try again.',
          showConfirmButton: true
        });
      }
    }
  };

  // Select all permissions for a module
  const selectAllPermissions = (module, setFieldValue, values) => {
    const newPermissions = [...values.permissions];
    const existingModuleIndex = newPermissions.findIndex((m) => m.id === module.id);

    if (existingModuleIndex === -1) {
      newPermissions.push({
        id: module.id,
        module_id: module.module_id,
        module: module.module,
        permissions: [...permissionsList]
      });
    } else {
      newPermissions[existingModuleIndex].permissions = [...permissionsList];
    }

    setFieldValue('permissions', newPermissions);
  };

  // Clear all permissions for a module
  const clearAllPermissions = (module, setFieldValue, values) => {
    const newPermissions = [...values.permissions];
    const existingModuleIndex = newPermissions.findIndex((m) => m.id === module.id);

    if (existingModuleIndex !== -1) {
      newPermissions[existingModuleIndex].permissions = [];
      setFieldValue('permissions', newPermissions);
    }
  };
  const handleAddModuleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/modules&permissions`, {
        module: values.moduleName.trim(),
        actions: permissionsList
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Module Created',
          text: 'New module added successfully',
          confirmButtonColor: '#3085d6'
        });

        await handleFetchPermissions();
        setShowAddForm(false);
        resetForm();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create module'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle individual permission toggle
  const handlePermissionToggle = (module, permission, checked, setFieldValue, values) => {
    const newPermissions = [...values.permissions];
    const existingModuleIndex = newPermissions.findIndex((m) => m.id === module.id);

    if (existingModuleIndex === -1) {
      newPermissions.push({
        id: module.id,
        module_id: module.module_id,
        module: module.module,
        permissions: checked ? [permission] : []
      });
    } else {
      if (checked) {
        if (!newPermissions[existingModuleIndex].permissions.includes(permission)) {
          newPermissions[existingModuleIndex].permissions.push(permission);
        }
      } else {
        newPermissions[existingModuleIndex].permissions = newPermissions[existingModuleIndex].permissions.filter((p) => p !== permission);
      }
    }
    setFieldValue('permissions', newPermissions);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Set Permissions for {currentRole?.name}
        </Typography>

        <Button
          variant="contained"
          onClick={() => setShowAddForm(true)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderRadius: 2
          }}
        >
          + Add Module
        </Button>
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary" startIcon={<ArrowBack />}>
          Back
        </Button>
      </Stack>

      {/* MAIN PERMISSIONS FORM - FIXED */}
      <Formik initialValues={formValues} onSubmit={handlePermissionsSubmit} enableReinitialize>
        {({ values, setFieldValue, isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {modules.map((module) => {
                const formModule = values.permissions.find((m) => m.id === module.id);
                const modulePermissions = formModule ? formModule.permissions : [];

                return (
                  <Grid item xs={12} sm={6} md={4} key={module.id}>
                    <Card sx={{ mb: 3, boxShadow: 2, height: '100%' }}>
                      <CardHeader
                        title={module.module}
                        action={
                          <Stack direction="row" gap={1}>
                            <Button size="small" onClick={() => selectAllPermissions(module, setFieldValue, values)}>
                              Select All
                            </Button>
                            <Button size="small" color="error" onClick={() => clearAllPermissions(module, setFieldValue, values)}>
                              Clear All
                            </Button>
                          </Stack>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          {permissionsList.map((permission) => {
                            const isChecked = modulePermissions.includes(permission);

                            return (
                              <Grid item xs={6} key={permission}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={isChecked}
                                      onChange={(e) => handlePermissionToggle(module, permission, e.target.checked, setFieldValue, values)}
                                      color="success"
                                    />
                                  }
                                  label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </CardContent>
                      <CardActions>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Button size="small" color="primary" onClick={() => handleEditModule(module)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteModule(module)}>
                            Delete
                          </Button>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Permissions'}
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      {/* Module Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onClose={handleCloseAddForm} maxWidth="xs" fullWidth>
        <DialogTitle className="dialogTitle">
          {currentModule ? `Edit ${currentModule.module}` : 'Add Module'}
          <IconButton color="dark" onClick={handleCloseAddForm} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <Divider />
        <Formik initialValues={getModuleInitialValues()} validate={validateModule} onSubmit={handleModuleSubmit} enableReinitialize>
          {({ errors, touched, handleChange, handleBlur, values, isSubmitting, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <Box>
                  <Stack spacing={2}>
                    <FormLabel>Module Name*</FormLabel>
                    <TextField
                      fullWidth
                      id="moduleName"
                      name="moduleName"
                      placeholder="Module Name"
                      value={values.moduleName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.moduleName && Boolean(errors.moduleName)}
                      helperText={touched.moduleName && errors.moduleName}
                      disabled={isSubmitting}
                    />
                  </Stack>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={handleCloseAddForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting || !values.moduleName.trim()}>
                  {isSubmitting ? 'Saving...' : currentModule ? 'Update' : 'Add Module'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      <Dialog open={showAddForm} onClose={handleCloseAddForm} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          Add New Module
          <IconButton onClick={() => setShowAddForm(false)}>
            <CloseSquare size={22} />
          </IconButton>
        </DialogTitle>

        <Formik
          initialValues={{ moduleName: '' }}
          validate={(values) => {
            const errors = {};
            if (!values.moduleName) {
              errors.moduleName = 'Module name is required';
            }
            return errors;
          }}
          onSubmit={handleAddModuleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur, values, isSubmitting, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent sx={{ py: 3 }}>
                <Stack spacing={2}>
                  <FormLabel sx={{ fontWeight: 600 }}>Module Name *</FormLabel>

                  <TextField
                    fullWidth
                    name="moduleName"
                    placeholder="Example: Courses, Batches, Webinar"
                    value={values.moduleName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.moduleName && Boolean(errors.moduleName)}
                    helperText={touched.moduleName && errors.moduleName}
                    disabled={isSubmitting}
                  />
                </Stack>
              </DialogContent>

              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={() => setShowAddForm(false)} variant="outlined" disabled={isSubmitting}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !values.moduleName.trim()}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {isSubmitting ? 'Saving...' : 'Create Module'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

PermissionsForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  currentRole: PropTypes.object.isRequired
};

export default PermissionsForm;
