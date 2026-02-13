import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Capitalise } from 'utils/capitalise';
import { formatDateTime } from 'utils/dateUtils';

export const ProfileTab = (data) => {
  const selectedStudent = data?.data;
  return (
    <>
      {(selectedStudent?.user_type === 'tutor' || selectedStudent?.user_type === 'admin') && (
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Name
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.full_name)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Email
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.email}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Contact No
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.contact_no}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Employee ID
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.employee_id}</Typography>
          </Grid>
        </Grid>
      )}
      {selectedStudent?.user_type !== 'tutor' && selectedStudent?.user_type !== 'admin' && (
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              First Name
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.first_name)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Last Name
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.last_name)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Email
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.email}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Contact No
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.contact_no}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Date of Birth
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {formatDateTime(selectedStudent?.dob, { includeTime: false })}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Registration ID
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.registration_id}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Joining Date
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {formatDateTime(selectedStudent?.joining_date, { includeTime: false })}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Student Type
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.student_type}</Typography>
          </Grid>

          {/* Common Address Fields */}
          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Current Address
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.current_address)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Permanent Address
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.permanent_address)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              City
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.city)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              State
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.state)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Country
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.country)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Parent/Guardian Name
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.parent_guardian_name)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Parent/Guardian Phone
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.parent_guardian_phone}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Parent/Guardian Address
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {Capitalise(selectedStudent?.parent_guardian_occupation)}</Typography>
          </Grid>

          <Grid item xs={5}>
            <Typography variant="body1" fontWeight="bold">
              Internship
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="body1">: {selectedStudent?.internship ? selectedStudent?.internship + ' ' + 'months' : '-'}</Typography>
          </Grid>
          {/* Conditional Fields based on Student Type */}
          {selectedStudent?.student_type === 'jobseeker' && (
            <>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Current Qualification
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.jobseeker?.current_qualification}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Passed Out Year
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.jobseeker?.passed_out_year}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Preferred Job Role
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.jobseeker?.preferred_job_role}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Resume
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">
                  :{' '}
                  {selectedStudent?.jobseeker?.resume_url ? (
                    <a href={selectedStudent?.jobseeker?.resume_url} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  ) : (
                    '-'
                  )}
                </Typography>
              </Grid>
            </>
          )}

          {selectedStudent?.student_type === 'school_student' && selectedStudent?.school_student && (
            <>
              {/* Add school student specific fields here */}
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  School Name
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.school_student?.school_name}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Class/Grade
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.school_student?.school_class}</Typography>
              </Grid>
              {/* Add more school student fields as needed */}
            </>
          )}

          {selectedStudent?.student_type === 'college_student' && selectedStudent?.college_student && (
            <>
              {/* Add college student specific fields here */}
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  College Name
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.college_student?.college_name}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Degree
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.college_student?.degree}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Year of Complition
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.college_student?.year_of_study}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Resume
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">
                  :{' '}
                  <a href={selectedStudent?.college_student.resume_url} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Typography>
              </Grid>
              {/* Add more college student fields as needed */}
            </>
          )}

          {selectedStudent?.student_type === 'employee' && selectedStudent?.employee && (
            <>
              {/* Add college student specific fields here */}
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Company Name
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.employee?.company_name}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Designation
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.employee?.designation}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Experience
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.employee?.experience}</Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1" fontWeight="bold">
                  Skills
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">: {selectedStudent?.employee?.skills}</Typography>
              </Grid>
              {/* Add more college student fields as needed */}
            </>
          )}
        </Grid>
      )}
    </>
  );
};
