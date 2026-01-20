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
  MenuItem,
  FormLabel,
  InputAdornment,
  CircularProgress,
  Typography,
  FormHelperText,
  Tooltip,
  Autocomplete,
  Chip,
  FormControl,
  Select
  // Select
} from '@mui/material';
import { UserAdd, UserEdit, Eye, EyeSlash, CloseSquare, SearchNormal1, Book, Calendar, UserTag } from 'iconsax-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupTransition } from 'components/@extended/Transitions';
import Swal from 'sweetalert2';
import countries from 'data/countries';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';
import useDate from '../../config';

//css import
import 'assets/css/commonStyle.css';
import 'assets/css/DataTable.css';

// Impots
import { APP_PATH_BASE_URL } from 'config';
import { formatDate } from 'utils/formatDate';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';
import { formatDateTime } from 'utils/dateUtils';
import { Notes } from '@mui/icons-material';
import { usePermission } from 'hooks/usePermission';

const StudentTable = () => {
  const navigate = useNavigate();
  const { checkPermission } = usePermission();

  const canCreate = checkPermission('Students', 'create');
  const canUpdate = checkPermission('Students', 'update');
  const canDelete = checkPermission('Students', 'delete');

  const [loading, setIsLoading] = useState(false);

  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(false);
  // const [openViewDedails, setOpenViewDedails] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [showNotesField, setShowNotesField] = useState(true);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [rowActions, setRowActions] = useState({});
  const [notespopup, setNotesPopup] = useState(false);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [initialStatus, setInitialStatus] = useState(null);

  const auth = JSON.parse(localStorage.getItem('auth'));
  // const token = localStorage.getItem('serviceToken');
  // const userId = auth?.user?.employer_id;
  const company = auth?.user?.company_id;
  const regId = auth?.user?.employee_id || auth?.user?.user_id;
  const userType = auth?.loginType;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      if (userType === 'admin' || userType === 'super_admin') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_list`);
      } else if (userType === 'employer') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/employer/${company}/student_list`);
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainer/${regId}/student_list`);
      }

      const result = response?.data;
      const data = result?.students || result?.data || [];
      const dataWithSerial = data?.map((item) => ({
        ...item
      }));
      setData(dataWithSerial || []);
      setCompanies(result?.companies || []);
      setCourses(result?.courses || []);
      setBatches(result?.batches || []);
      setCategories(result?.categories || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userType, regId, company]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler functions to maintain consistency
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedCourse(null);
    setSelectedBatch(null);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedBatch(null);
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
  };

  const handleOpen = () => {
    setCurrentStudent(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
    setResetDialogOpen(false);
    setSelectedUser(null);
    setPassword('');
    setNotesPopup(false);
    setNotes('');
    setRowActions({});
  };

  const handleAction = (e, row) => {
    const selectedValue = e.target.value;
    setRowActions((prev) => ({
      ...prev,
      [row.registration_id]: selectedValue
    }));

    switch (selectedValue) {
      case 'Reset Password':
        handleResetPassword(row);
        break;
      case 'Delete':
        handleDelete(row.student_id);
        break;
      case 'action':
        // Do nothing or default behavior
        break;
      default:
        break;
    }
  };

  const handleView = useCallback(
    (data) => {
      if (data) {
        navigate(`/students/${data.registration_id}`, {
          state: {
            name: data.first_name,
            student_id: data.student_id
          }
        });
      }
    },
    [navigate]
  );

  const handleViewBatch = useCallback(
    (data) => {
      if (data) {
        navigate(`/batch`, {
          state: {
            N_UserId: data.student_id,
            N_UserType: 'student'
          }
        });
      }
    },
    [navigate]
  );

  const handleCourse = useCallback(
    (data) => {
      if (data) {
        navigate(`/students/${data.registration_id}`, {
          state: {
            name: data.first_name,
            student_id: data.student_id,
            notification: 'topics'
          }
        });
      }
    },
    [navigate]
  );

  const handleNotes = async (data) => {
    setNotesPopup(true);
    setNotes(data.notes);
  };

  const handleAttendance = useCallback(
    (data) => {
      if (data) {
        navigate(`/students/${data.registration_id}`, {
          state: {
            name: data.first_name,
            student_id: data.student_id,
            notification: 'attendance'
          }
        });
      }
    },
    [navigate]
  );

  const handleEdit = useCallback((student) => {
    setCurrentStudent(student);
    setInitialStatus(student.status);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
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
          setIsLoading(true);
          const response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/student_profile/${id}/archive`);

          if (response.data.success) {
            await Swal.fire({
              title: 'Success!',
              text: 'Student deleted successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            fetchData();
          } else {
            throw new Error(response.data.message || 'Error deleting data');
          }
        } catch (error) {
          console.error('Delete error:', error);
          Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete student.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchData]
  );

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleResetSubmit = async () => {
    // Example API call:
    const res = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/student_profile/${selectedUser.student_id}/admin_reset_password`, {
      new_password: password
    });
    if (res.data.success === true) {
      await Swal.fire({
        title: 'Success!',
        text: 'Password reset successfully',
        icon: 'success',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    } else {
      await Swal.fire({
        title: 'Error!',
        text: res?.data?.message || 'Error resetting password',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      });
    }
    setResetDialogOpen(false);
    handleClose();
  };

  const columns = [
    {
      name: 'S.No',
      selector: (row) => row.sno,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Name',
      selector: (row) => `${Capitalise(row.first_name)} ${row.last_name}`,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Status',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={row.status === true ? 'Active' : 'In active'}
            sx={{
              backgroundColor: row.status === true ? 'success.lighter' : 'error.lighter',
              color: row.status === true ? 'success.main' : 'error.main'
            }}
          />
        </Box>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Joining Date',
      selector: (row) => formatDateTime(row.joining_date, { includeTime: false }),
      sortable: true,
      width: '200px'
    },
    {
      name: 'Actions',
      cell: (row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View">
            <IconButton variant="contained" color="secondary" onClick={() => handleView(row)}>
              <Eye />
            </IconButton>
          </Tooltip>
          <Tooltip title="Batch">
            <IconButton variant="contained" color="secondary" onClick={() => handleViewBatch(row)}>
              <UserTag />
            </IconButton>
          </Tooltip>

          {(userType === 'admin' || userType === 'super_admin') && (
            <>
              <Tooltip title="Course">
                <IconButton color="success" variant="contained" onClick={() => handleCourse(row)}>
                  <Book />
                </IconButton>
              </Tooltip>
              <Tooltip title="Notes">
                <IconButton color="success" variant="contained" onClick={() => handleNotes(row)}>
                  <Notes />
                </IconButton>
              </Tooltip>
              <Tooltip title="Attendance">
                <IconButton color="warning" variant="contained" onClick={() => handleAttendance(row)}>
                  <Calendar />
                </IconButton>
              </Tooltip>
              {canUpdate && (
                <Tooltip title="Edit">
                  <IconButton color="info" variant="contained" onClick={() => handleEdit(row)}>
                    <UserEdit />
                  </IconButton>
                </Tooltip>
              )}
              {canUpdate || canDelete ? (
                <Select
                  value={rowActions[row.registration_id] || 'action'}
                  onChange={(e) => handleAction(e, row)}
                  sx={{ width: '100px', height: '30px', mt: 0.5 }}
                >
                  <MenuItem value="action">Action</MenuItem>
                  {canUpdate && <MenuItem value="Reset Password">Reset Password</MenuItem>}
                  {canDelete && <MenuItem value="Delete">Delete</MenuItem>}
                </Select>
              ) : null}
            </>
          )}
        </Box>
      )
    }
  ];

  const validationSchema = Yup.object().shape({
    // Common fields (required for all student types)
    first_name: Yup.string()
      .required('First name is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'First name cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    last_name: Yup.string()
      .required('Last name is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Last name cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    password: currentStudent
      ? Yup.string()
      : Yup.string()
          .required('Password is required')
          .min(8, 'Password must be at least 8 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least one uppercase letter, one number, and one special character'
          ),

    email: Yup.string().required('Email is required').email('Email is invalid'),

    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .test('no-only-spaces', 'Username cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    dob: Yup.string().required('Date of birth is required'),

    contact_no: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),

    status: Yup.string().required('Status is required'),

    current_address: Yup.string()
      .required('Current address is required')
      .test('no-only-spaces', 'Current address cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    permanent_address: Yup.string()
      .required('Permanent address is required')
      .test('no-only-spaces', 'Permanent address cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    city: Yup.string()
      .required('City is required')
      .test('no-only-spaces', 'City cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    state: Yup.string()
      .required('State is required')
      .test('no-only-spaces', 'State cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    country: Yup.string()
      .required('Country is required')
      .test('no-only-spaces', 'Country cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    // course_name: Yup.array().of(Yup.string()).min(1, 'Select at least one course').required('Course selection is required'),

    parent_guardian_name: Yup.string()
      .required('Parent/Guardian name is required')
      .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
      .test('no-only-spaces', 'Parent/Guardian name cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    parent_guardian_phone: Yup.string().required('Parent/Guardian phone is required'),

    parent_guardian_occupation: Yup.string()
      .required('Parent/Guardian occupation is required')
      .test('no-only-spaces', 'Parent/Guardian occupation cannot be only spaces', (value) => {
        return value && value.trim().length > 0;
      }),

    student_type: Yup.string().required('Student type is required'),

    // Conditional validation using consistent arrow function syntax
    notes: Yup.string().when([], {
      is: () => shouldShowNotesField,
      then: () =>
        Yup.string()
          .required('Notes are required')
          .test('no-only-spaces', 'Notes cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string().notRequired()
    }),

    school_name: Yup.string().when('student_type', {
      is: (val) => val === 'school_student',
      then: () =>
        Yup.string()
          .required('School name is required')
          .test('no-only-spaces', 'School name cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    school_class: Yup.string().when('student_type', {
      is: (val) => val === 'school_student',
      then: () =>
        Yup.string()
          .required('Class/Grade is required')
          .test('no-only-spaces', 'Class/Grade cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    college_name: Yup.string().when('student_type', {
      is: (val) => val === 'college_student',
      then: () =>
        Yup.string()
          .required('College name is required')
          .test('no-only-spaces', 'College name cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    degree: Yup.string().when('student_type', {
      is: (val) => val === 'college_student',
      then: () =>
        Yup.string()
          .required('Degree is required')
          .test('no-only-spaces', 'Degree cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    year_of_study: Yup.string().when('student_type', {
      is: (val) => val === 'college_student',
      then: () =>
        Yup.string()
          .required('Year of study is required')
          .test('no-only-spaces', 'Year of study cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    passed_out_year: Yup.string().when('student_type', {
      is: (val) => val === 'jobseeker',
      then: () =>
        Yup.string()
          .required('Passed out year is required')
          .test('no-only-spaces', 'Passed out year cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    current_qualification: Yup.string().when('student_type', {
      is: (val) => val === 'jobseeker',
      then: () =>
        Yup.string()
          .required('Current qualification is required')
          .test('no-only-spaces', 'Current qualification cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    preferred_job_role: Yup.string().when('student_type', {
      is: (val) => val === 'jobseeker',
      then: () =>
        Yup.string()
          .required('Preferred job role is required')
          .test('no-only-spaces', 'Preferred job role cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    company_name: Yup.string().when('student_type', {
      is: (val) => val === 'employee',
      then: () =>
        Yup.string()
          .required('Company name is required')
          .test('no-only-spaces', 'Company name cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    designation: Yup.string().when('student_type', {
      is: (val) => val === 'employee',
      then: () =>
        Yup.string()
          .required('Designation is required')
          .test('no-only-spaces', 'Designation cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    experience: Yup.string().when('student_type', {
      is: (val) => val === 'employee',
      then: () =>
        Yup.string()
          .required('Experience is required')
          .test('no-only-spaces', 'Experience cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    }),

    skills: Yup.string().when('student_type', {
      is: (val) => val === 'employee',
      then: () =>
        Yup.string()
          .required('Skills is required')
          .test('no-only-spaces', 'Skills cannot be only spaces', (value) => {
            return value && value.trim().length > 0;
          }),
      otherwise: () => Yup.string()
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: currentStudent?.first_name || '',
      last_name: currentStudent?.last_name || '',
      username: currentStudent?.username || '',
      password: currentStudent?.password || '',
      email: currentStudent?.email || '',
      contact_no: currentStudent?.contact_no || '',
      status: currentStudent?.status ?? true,
      current_address: currentStudent?.current_address || '',
      permanent_address: currentStudent?.permanent_address || '',
      city: currentStudent?.city || '',
      state: currentStudent?.state || '',
      country: currentStudent?.country || '',
      dob: currentStudent?.dob || '',
      // course_name: currentStudent?.course?.map((course) => course.course_id) || [],
      parent_guardian_name: currentStudent?.parent_guardian_name || '',
      parent_guardian_phone: currentStudent?.parent_guardian_phone || '',
      parent_guardian_occupation: currentStudent?.parent_guardian_occupation || '',
      reference_number: currentStudent?.reference_number || '',
      student_type: currentStudent?.student_type || '',
      internship: currentStudent?.internship || '',
      notes: '',
      resume: currentStudent?.jobseeker?.resume || currentStudent?.college_student?.resume || null,

      // Jobseeker specific fields (from jobseeker object)
      passed_out_year: currentStudent?.jobseeker?.passed_out_year || '',
      current_qualification: currentStudent?.jobseeker?.current_qualification || '',
      preferred_job_role: currentStudent?.jobseeker?.preferred_job_role || '',
      // School student fields (not present in this data)
      school_name: currentStudent?.school_student?.school_name || '',
      school_class: currentStudent?.school_student?.school_class || '',

      // College student fields (not present in this data)
      college_name: currentStudent?.college_student?.college_name || '',
      degree: currentStudent?.college_student?.degree || '',
      year_of_study: currentStudent?.college_student?.year_of_study || '',

      designation: currentStudent?.employee?.designation || '',
      experience: currentStudent?.employee?.experience || '',
      skills: currentStudent?.employee?.skills || '',
      company_name: currentStudent?.employee?.company_name || '',

      // Get company_id from any of the possible locations
      company_id:
        currentStudent?.school_student?.company_id ||
        currentStudent?.college_student?.company_id ||
        currentStudent?.employee?.company_id ||
        currentStudent?.jobseeker?.company_id
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      // Prevent multiple submissions
      if (isSubmitting) return;

      setIsSubmitting(true);
      const formData = new FormData();

      // Append basic fields
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('username', values.username);
      formData.append('password', values.password);
      formData.append('email', values.email);
      formData.append('contact_no', values.contact_no);
      formData.append('status', values.status);
      formData.append('dob', formatDate(values.dob));
      formData.append('permanent_address', values.permanent_address);
      formData.append('current_address', values.current_address);
      formData.append('city', values.city);
      formData.append('state', values.state);
      formData.append('country', values.country);
      // formData.append('course_ids', JSON.stringify(values.course_name));
      formData.append('parent_guardian_name', values.parent_guardian_name);
      formData.append('parent_guardian_phone', values.parent_guardian_phone);
      formData.append('parent_guardian_occupation', values.parent_guardian_occupation);
      formData.append('reference_number', values.reference_number);
      formData.append('student_type', values.student_type);
      formData.append('internship', values.internship);

      formData.append('notes', values.notes);

      // Handle nested objects based on student_type
      if (values.student_type === 'school_student') {
        formData.append('school_student.school_name', values.school_name);
        formData.append('school_student.school_class', values.school_class);
        if (values.company_id) {
          formData.append('school_student.company_id', values.company_id);
        }
      } else if (values.student_type === 'college_student') {
        if (values.resume instanceof File) {
          formData.append('college_student.resume', values.resume);
        }
        formData.append('college_student.college_name', values.college_name);
        formData.append('college_student.degree', values.degree);
        formData.append('college_student.year_of_study', values.year_of_study);
        if (values.company_id) {
          formData.append('college_student.company_id', values.company_id);
        }
      } else if (values.student_type === 'jobseeker') {
        if (values.resume instanceof File) {
          formData.append('jobseeker.resume', values.resume);
        }
        formData.append('jobseeker.passed_out_year', values.passed_out_year);
        formData.append('jobseeker.current_qualification', values.current_qualification);
        formData.append('jobseeker.preferred_job_role', values.preferred_job_role);
        if (values.company_id) {
          formData.append('jobseeker.company_id', values.company_id);
        }
      } else if (values.student_type === 'employee') {
        if (values.company_id) {
          formData.append('employee.company_id', values.company_id);
        }
        formData.append('employee.company_name', values.company_name);
        formData.append('employee.designation', values.designation);
        formData.append('employee.experience', values.experience);
        formData.append('employee.skills', values.skills);
      }
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      try {
        let response;

        if (currentStudent) {
          response = await axiosInstance.patch(`${APP_PATH_BASE_URL}api/student_profile/${currentStudent.student_id}`, formData, config);
        } else {
          response = await axiosInstance.post(`${APP_PATH_BASE_URL}api/student_registration`, formData, config);
        }

        if (response.data.success === true) {
          Swal.fire({
            title: 'Success!',
            text: currentStudent ? 'Student updated successfully!' : 'Student added successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          resetForm();
          handleClose();
          fetchData();
        } else {
          // Transform the error message structure
          // const formattedErrors = {};

          // if (response.data.message) {
          //   Object.entries(response.data.message).forEach(([field, messages]) => {
          //     // Take the first error message for each field
          //     formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          //   });
          // }

          // setError(formattedErrors);

          Swal.fire({
            title: 'Error!',
            text: response?.data?.message || 'Error submitting student data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Error submitting student data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setSubmitting(false);
        setIsSubmitting(false);
      }
    }
  });

  const shouldShowNotesField = useMemo(() => {
    if (!currentStudent) return false;
    return formik.values.status !== initialStatus;
  }, [formik.values.status, initialStatus, currentStudent]);

  const { filteredCategories, filteredCourses, filteredBatches, filteredCompanies, filteredStudents } = useMemo(() => {
    // Filter students based on all criteria
    const filteredStudents = data.filter((student) => {
      // Search filter
      if (filterText) {
        const searchTermLower = filterText.toLowerCase();
        const matchesSearch =
          student.first_name?.toLowerCase().includes(searchTermLower) ||
          student.last_name?.toLowerCase().includes(searchTermLower) ||
          student.email?.toLowerCase().includes(searchTermLower) ||
          student.contact_no?.toLowerCase().includes(searchTermLower) ||
          student.registration_id?.toLowerCase().includes(searchTermLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active' ? true : false;
        if (student.status !== isActive) return false;
      }

      // Type filter
      if (typeFilter !== 'all') {
        if (student.student_type !== typeFilter) return false;
      }

      // Company filter - Check both company_id and school_student.company_id
      if (selectedCompany?.company_id) {
        const studentCompanyId = student.company_id || student.school_student?.company_id;
        if (studentCompanyId !== selectedCompany.company_id) return false;
      }

      // Category filter - Check if array contains the category_id
      if (selectedCategory?.category_id) {
        const studentCategories = student.category_id || [];
        if (!studentCategories.includes(selectedCategory.category_id)) return false;
      }

      // Course filter - Check if array contains the course_id
      if (selectedCourse?.course_id) {
        const studentCourses = student.course_id || [];
        if (!studentCourses.includes(selectedCourse.course_id)) return false;
      }

      // Batch filter - Check if array contains the batch_id
      if (selectedBatch?.batch_id) {
        const studentBatches = student.batch_id || [];
        if (!studentBatches.includes(selectedBatch.batch_id)) return false;
      }

      return true;
    });

    // Filter categories, courses, batches based on selections
    let filteredCategories = categories;
    let filteredCourses = courses;
    let filteredBatches = batches;
    let filteredCompanies = companies;

    // Filter companies based on selection
    if (selectedCompany?.company_id) {
      filteredCompanies = companies.filter((company) => company.company_id === selectedCompany.company_id);
    }

    // Filter categories based on selection
    if (selectedCategory?.category_id) {
      filteredCategories = categories.filter((cat) => cat.category_id === selectedCategory.category_id);

      // Filter courses by category
      filteredCourses = courses.filter((course) => course.category_id === selectedCategory.category_id);

      // Filter batches by category
      filteredBatches = batches.filter((batch) => batch.category_id === selectedCategory.category_id);
    }

    // Filter courses based on selection
    if (selectedCourse?.course_id) {
      const selectedCourseData = courses.find((c) => c.course_id === selectedCourse.course_id);

      if (selectedCourseData) {
        // Filter categories to show only the category of selected course
        filteredCategories = categories.filter((cat) => cat.category_id === selectedCourseData.course_category_id);

        // Show only the selected course
        filteredCourses = courses.filter((course) => course.course_id === selectedCourse.course_id);

        // Filter batches by course
        filteredBatches = batches.filter((batch) => batch.course_id === selectedCourse.course_id);
      }
    }

    // Filter batches based on selection
    if (selectedBatch?.batch_id) {
      const selectedBatchData = batches.find((b) => b.batch_id === selectedBatch.batch_id);

      if (selectedBatchData) {
        // Use the batch's category and course IDs to filter
        filteredCategories = categories.filter((cat) => cat.category_id === selectedBatchData.category_id);

        filteredCourses = courses.filter((course) => course.course_id === selectedBatchData.course_id);

        // Show only the selected batch
        filteredBatches = batches.filter((batch) => batch.batch_id === selectedBatch.batch_id);
      }
    }

    return {
      filteredCategories,
      filteredCourses,
      filteredBatches,
      filteredCompanies,
      filteredStudents
    };
  }, [
    data,
    categories,
    courses,
    batches,
    companies,
    selectedCategory,
    selectedCourse,
    selectedBatch,
    selectedCompany,
    statusFilter,
    typeFilter,
    filterText
  ]);

  const filteredItems = filteredStudents.map((item, index) => ({
    ...item,
    sno: index + 1
  }));

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    const handleStatusClear = () => {
      setStatusFilter('all');
    };

    const handleTypeClear = () => {
      setTypeFilter('all');
    };

    return (
      <Grid container justifyContent="space-between" alignItems="center" my={3} spacing={2}>
        {/* Filters Section */}
        <Grid item xs={12}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} width="100%">
            {/* Filters Container - Wraps to next row */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 2,
                width: { xs: '100%', sm: 'auto' },
                '& > *': {
                  minWidth: { xs: 'calc(50% - 8px)', sm: 200 },
                  flexGrow: 1
                }
              }}
            >
              {/* Search Field - Always full width on mobile */}
              <TextField
                placeholder="Search by name, ID, email, or phone..."
                variant="outlined"
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 250 },
                  flexGrow: 1
                }}
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
              {(userType === 'admin' || userType === 'super_admin') && (
                <>
                  {/* Category Filter */}
                  <Autocomplete
                    id="category_id"
                    options={filteredCategories || []}
                    getOptionLabel={(option) => option.category_name || ''}
                    value={selectedCategory}
                    onChange={(event, newValue) => {
                      handleCategorySelect(newValue);
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by category..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.category_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.category_id === value.category_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.category_id}>
                        {option.category_name}
                      </li>
                    )}
                  />

                  {/* Course Filter */}
                  <Autocomplete
                    id="course_id"
                    options={filteredCourses || []}
                    getOptionLabel={(option) => option.course_name || ''}
                    value={selectedCourse}
                    onChange={(event, newValue) => {
                      handleCourseSelect(newValue);
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    size="small"
                    renderInput={(params) => <TextField {...params} placeholder="Filter by course..." />}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.course_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.course_id}>
                        {option.course_name}
                      </li>
                    )}
                  />

                  {/* Batch Filter */}
                  <Autocomplete
                    id="batch_id"
                    options={filteredBatches || []}
                    getOptionLabel={(option) => option.title || ''}
                    value={selectedBatch}
                    onChange={(event, newValue) => {
                      handleBatchSelect(newValue);
                    }}
                    size="small"
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by batch..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.title?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.batch_id === value.batch_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.batch_id}>
                        {option.title}
                      </li>
                    )}
                  />

                  {/* Company Filter */}
                  <Autocomplete
                    id="company_id"
                    options={filteredCompanies || []}
                    getOptionLabel={(option) => option.company_name}
                    value={selectedCompany}
                    onChange={(event, newValue) => {
                      setSelectedCompany(newValue);
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Filter by organization..."
                        InputProps={{
                          ...params.InputProps
                        }}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter((option) => option.company_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                    }}
                    isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.company_id}>
                        {option.company_name}
                      </li>
                    )}
                    sx={{
                      minWidth: { xs: '100%', sm: 180, md: 200 },
                      flex: '1 1 auto'
                    }}
                  />

                  {/* Type Filter */}
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: { xs: '100%', sm: 180 },
                      flex: { xs: '1 1 100%', sm: '0 1 auto' },
                      maxWidth: { sm: 250 }
                    }}
                  >
                    <Select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      displayEmpty
                      endAdornment={
                        typeFilter !== 'all' && (
                          <InputAdornment position="end" sx={{ mr: 3 }}>
                            <IconButton onClick={handleTypeClear} edge="end" size="small">
                              <CloseSquare size={16} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      <MenuItem value="all">Select type</MenuItem>
                      <MenuItem value="school_student">School Student</MenuItem>
                      <MenuItem value="college_student">College Student</MenuItem>
                      <MenuItem value="jobseeker">Job Seeker</MenuItem>
                      <MenuItem value="employee">Employee</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Status Filter */}
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 180 },
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                  maxWidth: { sm: 250 }
                }}
              >
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  endAdornment={
                    statusFilter !== 'all' && (
                      <InputAdornment position="end" sx={{ mr: 3 }}>
                        <IconButton onClick={handleStatusClear} edge="end" size="small">
                          <CloseSquare size={16} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                >
                  <MenuItem value="all">Select Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">In active</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Grid>

        {/* Add Button Section */}
        <Grid item xs={12}>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            {(userType === 'admin' || userType === 'super_admin') && canCreate && (
              <Button
                color="success"
                variant="contained"
                startIcon={<UserAdd />}
                onClick={handleOpen}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Add
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    );
  }, [
    filterText,
    resetPaginationToggle,
    userType,
    selectedCompany,
    statusFilter,
    typeFilter,
    canCreate,
    filteredCategories,
    filteredCourses,
    filteredBatches,
    filteredCompanies,
    selectedCategory,
    selectedCourse,
    selectedBatch
  ]);

  if (error) {
    return (
      <MainCard sx={{ borderRadius: 2 }}>
        <Box p={3} color="error.main">
          Error: {error}
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard sx={{ borderRadius: 2 }}>
      {subHeaderComponentMemo}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 30]}
          highlightOnHover
          responsive
        />
      )}

      <Dialog
        maxWidth="sm"
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
          {currentStudent ? 'Edit Student' : 'Add New Student'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {/*First Name*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>First Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="first_name"
                    placeholder="First Name"
                    name="first_name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                    helperText={formik.touched.first_name && formik.errors.first_name}
                  />
                </Stack>
              </Grid>
              {/*Last Name*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Last Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="last_name"
                    placeholder="Last Name"
                    name="last_name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                    helperText={formik.touched.last_name && formik.errors.last_name}
                  />
                </Stack>
              </Grid>
              {/*User Name*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>User Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="username"
                    placeholder="User Name"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    autoComplete="new-username"
                  />
                </Stack>
              </Grid>
              {/*Password*/}
              {!currentStudent && (
                <Grid item xs={12} md={6}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Password*</FormLabel>
                    <TextField
                      fullWidth
                      id="password"
                      placeholder="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      autoComplete="new-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <Eye /> : <EyeSlash />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Stack>
                </Grid>
              )}
              {/*Email Address*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Email Address*</FormLabel>
                  <TextField
                    fullWidth
                    id="email"
                    placeholder="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Stack>
              </Grid>
              {/*Mobile*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Mobile*</FormLabel>
                  <TextField
                    fullWidth
                    id="contact_no"
                    placeholder="Mobile"
                    name="contact_no"
                    type="number"
                    value={formik.values.contact_no}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.contact_no && Boolean(formik.errors.contact_no)}
                    helperText={formik.touched.contact_no && formik.errors.contact_no}
                  />
                </Stack>
              </Grid>
              {/*Date of Birth*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Date of Birth*</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      format={useDate.dateFormat}
                      value={formik.values.dob ? new Date(formik.values.dob) : null}
                      onChange={(date) => {
                        formik.setFieldValue('dob', date);
                        formik.setFieldTouched('dob', true, false);
                      }}
                      onBlur={() => formik.setFieldTouched('dob', true)}
                      renderInput={(params) => <TextField {...params} fullWidth error={formik.touched.dob && Boolean(formik.errors.dob)} />}
                    />
                  </LocalizationProvider>
                </Stack>
                {formik.touched.dob && formik.errors.dob && <FormHelperText error>{formik.errors.dob}</FormHelperText>}
              </Grid>
              {/*Current address*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Current address*</FormLabel>
                  <TextField
                    fullWidth
                    id="current_address"
                    placeholder="Current address"
                    name="current_address"
                    value={formik.values.current_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.current_address && Boolean(formik.errors.current_address)}
                    helperText={formik.touched.current_address && formik.errors.current_address}
                  />
                </Stack>
              </Grid>
              {/*Permanent address*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Permanent address*</FormLabel>
                  <TextField
                    fullWidth
                    id="permanent_address"
                    placeholder="Permanent address"
                    name="permanent_address"
                    value={formik.values.permanent_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.permanent_address && Boolean(formik.errors.permanent_address)}
                    helperText={formik.touched.permanent_address && formik.errors.permanent_address}
                  />
                </Stack>
              </Grid>
              {/*City*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>City*</FormLabel>
                  <TextField
                    fullWidth
                    id="city"
                    placeholder="City"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Stack>
              </Grid>
              {/*State*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>State*</FormLabel>
                  <TextField
                    fullWidth
                    id="state"
                    placeholder="State"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    helperText={formik.touched.state && formik.errors.state}
                  />
                </Stack>
              </Grid>
              {/*Country*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Country*</FormLabel>
                  <Autocomplete
                    id="country"
                    options={countries || []}
                    getOptionLabel={(option) => `${option.label} (${option.phone})`}
                    value={countries?.find((c) => c.label === formik.values.country) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('country', newValue?.label || '');
                    }}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search country..."
                        error={formik.touched.country && Boolean(formik.errors.country)}
                        helperText={formik.touched.country && formik.errors.country}
                      />
                    )}
                    filterOptions={(options = [], state) => {
                      return options.filter(
                        (option) =>
                          option.label.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.code.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                          option.phone.includes(state.inputValue)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                  />
                </Stack>
              </Grid>
              {/*Internship */}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Internship</FormLabel>
                  <TextField
                    select
                    fullWidth
                    name="internship"
                    value={formik.values.internship}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.internship && Boolean(formik.errors.internship)}
                    helperText={formik.touched.internship && formik.errors.internship}
                    SelectProps={{
                      displayEmpty: true
                    }}
                  >
                    <MenuItem value="">Select internship</MenuItem>
                    {[1, 2, 3, 4, 5, 6].map((month) => (
                      <MenuItem key={month} value={month.toString()}>
                        {month} month{month !== 1 ? 's' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
              {/*Parent (or) Guardian Name*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Parent (or) Guardian Name*</FormLabel>
                  <TextField
                    fullWidth
                    id="parent_guardian_name"
                    placeholder="Parent (or) Guardian Name"
                    name="parent_guardian_name"
                    value={formik.values.parent_guardian_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parent_guardian_name && Boolean(formik.errors.parent_guardian_name)}
                    helperText={formik.touched.parent_guardian_name && formik.errors.parent_guardian_name}
                  />
                </Stack>
              </Grid>
              {/*Parent (or) Guardian Number*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Parent (or) Guardian Number*</FormLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="parent_guardian_phone"
                    placeholder="Parent (or) Guardian Number"
                    name="parent_guardian_phone"
                    value={formik.values.parent_guardian_phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parent_guardian_phone && Boolean(formik.errors.parent_guardian_phone)}
                    helperText={formik.touched.parent_guardian_phone && formik.errors.parent_guardian_phone}
                  />
                </Stack>
              </Grid>
              {/*Parent (or) Guardian Address*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Parent (or) Guardian Address*</FormLabel>
                  <TextField
                    fullWidth
                    id="parent_guardian_occupation"
                    placeholder="Parent (or) Guardian Address"
                    name="parent_guardian_occupation"
                    value={formik.values.parent_guardian_occupation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parent_guardian_occupation && Boolean(formik.errors.parent_guardian_occupation)}
                    helperText={formik.touched.parent_guardian_occupation && formik.errors.parent_guardian_occupation}
                  />
                </Stack>
              </Grid>
              {/*Referral Number*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Referral Number</FormLabel>
                  <TextField
                    fullWidth
                    id="reference_number"
                    placeholder="Referral Number"
                    name="reference_number"
                    value={formik.values.reference_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.reference_number && Boolean(formik.errors.reference_number)}
                    helperText={formik.touched.reference_number && formik.errors.reference_number}
                  />
                </Stack>
              </Grid>
              {/*Student Type*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Student Type*</FormLabel>
                  <TextField
                    name="student_type"
                    select
                    fullWidth
                    placeholder="Student Type"
                    value={formik.values.student_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.student_type && Boolean(formik.errors.student_type)}
                    helperText={formik.touched.student_type && formik.errors.student_type}
                    SelectProps={{
                      displayEmpty: true
                    }}
                  >
                    <MenuItem value="">Select type</MenuItem>
                    <MenuItem value="school_student">School Student</MenuItem>
                    <MenuItem value="college_student">College Student</MenuItem>
                    <MenuItem value="jobseeker">Job Seeker</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              {formik.values.student_type === 'school_student' && (
                <>
                  {/*School Name*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>School Name*</FormLabel>
                      <TextField
                        fullWidth
                        id="school_name"
                        placeholder="School Name"
                        name="school_name"
                        value={formik.values.school_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.school_name && Boolean(formik.errors.school_name)}
                        helperText={formik.touched.school_name && formik.errors.school_name}
                      />
                    </Stack>
                  </Grid>
                  {/*Class/Grade*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Class/Grade*</FormLabel>
                      <TextField
                        fullWidth
                        id="school_class"
                        placeholder="Class/Grade"
                        name="school_class"
                        value={formik.values.school_class}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.school_class && Boolean(formik.errors.school_class)}
                        helperText={formik.touched.school_class && formik.errors.school_class}
                      />
                    </Stack>
                  </Grid>
                </>
              )}

              {formik.values.student_type === 'college_student' && (
                <>
                  {/*College Name*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>College Name*</FormLabel>
                      <TextField
                        fullWidth
                        id="college_name"
                        placeholder="College Name"
                        name="college_name"
                        value={formik.values.college_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.college_name && Boolean(formik.errors.college_name)}
                        helperText={formik.touched.college_name && formik.errors.college_name}
                      />
                    </Stack>
                  </Grid>
                  {/*Degree*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Degree*</FormLabel>
                      <TextField
                        fullWidth
                        id="degree"
                        placeholder="Degree"
                        name="degree"
                        value={formik.values.degree}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.degree && Boolean(formik.errors.degree)}
                        helperText={formik.touched.degree && formik.errors.degree}
                      />
                    </Stack>
                  </Grid>
                  {/*Year of Study*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Year of Completion*</FormLabel>
                      <TextField
                        fullWidth
                        id="year_of_study"
                        placeholder="Year of Completion"
                        name="year_of_study"
                        type="number"
                        value={formik.values.year_of_study}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.year_of_study && Boolean(formik.errors.year_of_study)}
                        helperText={formik.touched.year_of_study && formik.errors.year_of_study}
                      />
                    </Stack>
                  </Grid>
                  {/*Resume*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Resume</FormLabel>
                      {formik.values.resume ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1}
                            sx={{ border: '1px dashed', borderRadius: 1, p: 1 }}
                          >
                            <Typography variant="body2">
                              Current file:{' '}
                              {typeof formik.values.resume === 'string' ? formik.values.resume.split('/').pop() : formik.values.resume.name}
                            </Typography>
                            <IconButton variant="outlined" color="error" size="small" onClick={() => formik.setFieldValue('resume', null)}>
                              <CloseSquare />
                            </IconButton>
                          </Box>
                          <Button variant="outlined" component="label" size="small">
                            Change File
                            <input
                              type="file"
                              hidden
                              id="resume"
                              name="resume"
                              onChange={(event) => {
                                formik.setFieldValue('resume', event.currentTarget.files[0]);
                              }}
                              onBlur={formik.handleBlur}
                            />
                          </Button>
                        </Stack>
                      ) : (
                        <TextField
                          fullWidth
                          type="file"
                          id="resume"
                          name="resume"
                          InputLabelProps={{ shrink: true }}
                          onChange={(event) => {
                            formik.setFieldValue('resume', event.currentTarget.files[0]);
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.resume && Boolean(formik.errors.resume)}
                          helperText={formik.touched.resume && formik.errors.resume}
                        />
                      )}
                    </Stack>
                  </Grid>
                </>
              )}

              {formik.values.student_type === 'jobseeker' && (
                <>
                  {/*Passed Out Year*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Passed Out Year*</FormLabel>
                      <TextField
                        fullWidth
                        id="passed_out_year"
                        placeholder="Passed Out Year"
                        name="passed_out_year"
                        type="number"
                        value={formik.values.passed_out_year}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.passed_out_year && Boolean(formik.errors.passed_out_year)}
                        helperText={formik.touched.passed_out_year && formik.errors.passed_out_year}
                      />
                    </Stack>
                  </Grid>
                  {/*Current Qualification*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Current Qualification* (eg.B.E/B.COM)</FormLabel>
                      <TextField
                        fullWidth
                        id="current_qualification"
                        placeholder="Current Qualification"
                        name="current_qualification"
                        value={formik.values.current_qualification}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.current_qualification && Boolean(formik.errors.current_qualification)}
                        helperText={formik.touched.current_qualification && formik.errors.current_qualification}
                      />
                    </Stack>
                  </Grid>
                  {/*Preferred Job Role*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Preferred Job Role*</FormLabel>
                      <TextField
                        fullWidth
                        id="preferred_job_role"
                        placeholder="Preferred Job Role"
                        name="preferred_job_role"
                        value={formik.values.preferred_job_role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.preferred_job_role && Boolean(formik.errors.preferred_job_role)}
                        helperText={formik.touched.preferred_job_role && formik.errors.preferred_job_role}
                      />
                    </Stack>
                  </Grid>
                  {/*Resume*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Resume</FormLabel>
                      {formik.values.resume ? (
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1}
                            sx={{ border: '1px dashed', borderRadius: 1, p: 1 }}
                          >
                            <Typography variant="body2">
                              Current file:{' '}
                              {typeof formik.values.resume === 'string' ? formik.values.resume.split('/').pop() : formik.values.resume.name}
                            </Typography>
                            <IconButton variant="outlined" color="error" size="small" onClick={() => formik.setFieldValue('resume', null)}>
                              <CloseSquare />
                            </IconButton>
                          </Box>
                          <Button variant="outlined" component="label" size="small">
                            Change File
                            <input
                              type="file"
                              hidden
                              id="resume"
                              name="resume"
                              onChange={(event) => {
                                formik.setFieldValue('resume', event.currentTarget.files[0]);
                              }}
                              onBlur={formik.handleBlur}
                            />
                          </Button>
                        </Stack>
                      ) : (
                        <TextField
                          fullWidth
                          type="file"
                          id="resume"
                          name="resume"
                          InputLabelProps={{ shrink: true }}
                          onChange={(event) => {
                            formik.setFieldValue('resume', event.currentTarget.files[0]);
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.resume && Boolean(formik.errors.resume)}
                          helperText={formik.touched.resume && formik.errors.resume}
                        />
                      )}
                    </Stack>
                  </Grid>
                </>
              )}

              {formik.values.student_type === 'employee' && (
                <>
                  {/*Company Name*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Company Name*</FormLabel>
                      <TextField
                        fullWidth
                        id="company_name"
                        placeholder="Company Name"
                        name="company_name"
                        value={formik.values.company_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                        helperText={formik.touched.company_name && formik.errors.company_name}
                      />
                    </Stack>
                  </Grid>
                  {/*Designation*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Designation*</FormLabel>
                      <TextField
                        fullWidth
                        id="designation"
                        placeholder="Designation"
                        name="designation"
                        value={formik.values.designation}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.designation && Boolean(formik.errors.designation)}
                        helperText={formik.touched.designation && formik.errors.designation}
                      />
                    </Stack>
                  </Grid>
                  {/*Experience*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Experience*</FormLabel>
                      <TextField
                        fullWidth
                        id="experience"
                        placeholder="Experience"
                        name="experience"
                        value={formik.values.experience}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.experience && Boolean(formik.errors.experience)}
                        helperText={formik.touched.experience && formik.errors.experience}
                      />
                    </Stack>
                  </Grid>
                  {/*Skills*/}
                  <Grid item xs={12} md={6}>
                    <Stack sx={{ mt: 2, gap: 1 }}>
                      <FormLabel>Skills*</FormLabel>
                      <TextField
                        fullWidth
                        id="skills"
                        placeholder="Skills"
                        name="skills"
                        value={formik.values.skills}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.skills && Boolean(formik.errors.skills)}
                        helperText={formik.touched.skills && formik.errors.skills}
                      />
                    </Stack>
                  </Grid>
                </>
              )}
              {/* Organization Dropdown */}
              {formik.values.student_type && (
                <Grid item xs={12} md={6}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Organization</FormLabel>
                    <Autocomplete
                      id="company_id"
                      options={companies || []}
                      getOptionLabel={(option) => option.company_name}
                      value={companies?.find((company) => company.company_id === formik.values.company_id) || null}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('company_id', newValue ? newValue.company_id : '');
                      }}
                      onBlur={formik.handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select organization..."
                          error={formik.touched.company_id && Boolean(formik.errors.company_id)}
                          helperText={formik.touched.company_id && formik.errors.company_id}
                        />
                      )}
                      filterOptions={(options = [], state) => {
                        return options.filter((option) => option.company_name?.toLowerCase().includes(state.inputValue.toLowerCase()));
                      }}
                      isOptionEqualToValue={(option, value) => option.company_id === value.company_id}
                      renderOption={(props, option) => (
                        <li {...props} key={option.company_id}>
                          {option.company_name}
                        </li>
                      )}
                    />
                  </Stack>
                </Grid>
              )}
              {/*Status*/}
              <Grid item xs={12} md={6}>
                <Stack sx={{ mt: 2, gap: 1 }}>
                  <FormLabel>Status*</FormLabel>
                  <TextField
                    select
                    fullWidth
                    id="status"
                    name="status"
                    value={formik.values.status} // This should be boolean
                    onChange={formik.handleChange} // Use formik's handleChange directly
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              {/*Notes*/}
              {/* Notes - Show only when status is changed */}
              {shouldShowNotesField && (
                <Grid item xs={12}>
                  <Stack sx={{ mt: 2, gap: 1 }}>
                    <FormLabel>Notes*</FormLabel>
                    <TextField
                      fullWidth
                      id="notes"
                      placeholder="Notes"
                      name="notes"
                      multiline
                      rows={4}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                      helperText={formik.touched.notes && formik.errors.notes}
                    />
                  </Stack>
                </Grid>
              )}
            </Grid>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting} // Disable when submitting
              >
                {formik.isSubmitting ? 'Processing...' : currentStudent ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Tutor Dialog */}
      <Dialog
        maxWidth="xs"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={resetDialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Reset Password
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <FormLabel>Reset Password</FormLabel>
                <TextField
                  autoFocus
                  margin="dense"
                  placeholder="New Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mt: 2 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleResetSubmit} variant="contained" color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        open={notespopup}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') handleClose();
        }}
        BackdropProps={{
          onClick: (event) => event.stopPropagation()
        }}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="dialogTitle" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Notes
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderBottom: 1, borderColor: 'divider', py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {notes && notes.length > 0 ? (
                  notes.map((note) => (
                    <Box
                      key={note.id}
                      sx={{
                        p: 3,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Grid container spacing={3} alignItems="flex-start">
                        {/* Created By with enhanced styling */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              CREATED BY
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: note.status === 'True' ? 'success.main' : 'error.main'
                                }}
                              />
                              <Typography variant="body1" fontWeight="medium" fontSize="1.1rem">
                                {note.created_by || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Reason with enhanced text wrapping */}
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              REASON
                            </Typography>
                            <Box
                              sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: 'grey.50',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'flex-start'
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  lineHeight: 1.5,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  width: '100%'
                                }}
                              >
                                {note.reason || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Date with improved formatting */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              DATE
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                backgroundColor: 'action.hover',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                display: 'inline-block',
                                width: 'fit-content'
                              }}
                            >
                              {formatDateTime(note.created_at, { includeTime: false }) || '-'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Status with badge styling */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              STATUS
                            </Typography>
                            <Box
                              sx={{
                                borderRadius: 2,
                                width: 'fit-content'
                              }}
                            >
                              <Chip
                                label={note.status === 'True' ? 'Active' : 'Inactive'}
                                sx={{
                                  color: note.status === 'True' ? 'success.dark' : 'error.dark',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: 2,
                      borderColor: 'divider',
                      borderStyle: 'dashed',
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      my: 2
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Notes Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      There are no notes to display at the moment.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default StudentTable;
