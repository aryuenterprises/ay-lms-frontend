import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import MainCard from 'components/MainCard';
import { APP_PATH_BASE_URL } from 'config';
import { CloseSquare, SearchNormal1 } from 'iconsax-react';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/reducers/snackbar';
import axiosInstance from 'utils/axios';
import { Capitalise } from 'utils/capitalise';

const TabStudent = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const dispatch = useDispatch();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false); // Track expanded panel
  console.log('filteredStudents :', filteredStudents);
  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${userId}`);

      const result = response.data.data;
      console.log('result :', result);
      if (result.batch && result.batch.length > 0) {
        setStudents(result.batch);
        setFilteredStudents(result.batch);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load user data',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  }, [userId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = students
      .map((student) => {
        // Filter assignments within each student
        const filteredAssignments = student.course_trainer_assignments
          .filter((assignment) => assignment.employee_id === userId)
          .filter(
            (assignment) =>
              assignment.name.toLowerCase().includes(query) ||
              assignment.course_name.toLowerCase().includes(query) ||
              assignment.registration_id.toString().toLowerCase().includes(query) ||
              student.batch_name.toLowerCase().includes(query)
          );

        // Return student with filtered assignments (if any match)
        return {
          ...student,
          course_trainer_assignments: filteredAssignments
        };
      })
      .filter(
        (student) =>
          // Keep students who have matching assignments OR batch name matches
          student.course_trainer_assignments.length > 0 || student.batch_name.toLowerCase().includes(query)
      );

    setFilteredStudents(filtered);
  }, [searchQuery, students, userId]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <MainCard content={false} title="Assigned Students Information" sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}>
      <Box sx={{ p: 2.5 }}>
        {/* Search Field */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton onClick={handleClear} edge="end" size="small">
                      <CloseSquare size={20} />
                    </IconButton>
                  )}
                </InputAdornment>
              )
            }}
          />
        </Box>
        {filteredStudents?.length === 0 ? (
          <Typography>{students.length === 0 ? 'No students assigned' : 'No students match your search'}</Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredStudents?.map((batch, index) => {
              const assignments = batch.students;
              const panelId = `panel-${index}`;

              return (
                <Grid item xs={12} md={6} key={batch.batch_id}>
                  <Accordion
                    expanded={expanded === panelId}
                    onChange={handleAccordionChange(panelId)}
                    sx={{
                      mb: 2,
                      boxShadow: 'none',
                      border: 'none',
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        '&:hover': { backgroundColor: '#eeeeee' },
                        minHeight: '48px !important',
                        '& .MuiAccordionSummary-content': {
                          my: 0.5,
                          alignItems: 'center',
                          justifyContent: 'center'
                        },
                        borderRadius: 1
                      }}
                    >
                      <Chip label={`Batch: ${batch.title}`} sx={{ mr: 2 }} color="primary" variant="outlined" />
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                      {assignments.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          No students found in this batch
                        </Typography>
                      ) : (
                        assignments.map((assignment, assignmentIndex) => (
                          <Box
                            key={assignmentIndex}
                            sx={{
                              p: 2,
                              mb: 1,
                              borderRadius: 1,
                              backgroundColor: '#fafafa',
                              border: '1px solid #f0f0f0'
                            }}
                          >
                            <Grid container spacing={1}>
                              <Grid item xs={12} display="flex">
                                <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                                  Registration ID
                                </Typography>
                                <Typography>: {assignment.registration_id}</Typography>
                              </Grid>
                              <Grid item xs={12} display="flex">
                                <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                                  Name
                                </Typography>
                                <Typography>: {Capitalise(assignment.student_name)}</Typography>
                              </Grid>
                              <Grid item xs={12} display="flex">
                                <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
                                  Course Name
                                </Typography>
                                <Typography>: {batch.course_name}</Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        ))
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </MainCard>
  );
};

export default TabStudent;
