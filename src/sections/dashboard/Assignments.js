import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';

import { Card, CardContent, Typography, Collapse, Box, IconButton, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { Capitalise } from 'utils/capitalise';

// Styled IconButton to rotate when expanded
const ExpandMore = styled((props) => {
  const { ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}));

const Assignments = ({ assignments }) => {
  const [expanded, setExpanded] = useState(null);

  const handleExpandClick = (studentId) => {
    setExpanded(expanded === studentId ? null : studentId);
  };

  return (
    <MainCard title="Assignments">
      <Box
        sx={{
          height: 400,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#fafbfc'
        }}
      >
        {assignments?.map((student) => (
          <Card
            key={student.student_id}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
            }}
          >
            <CardContent
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => handleExpandClick(student.student_id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleExpandClick(student.student_id);
                }
              }}
              aria-expanded={expanded === student.student_id}
              aria-controls={`student-content-${student.student_id}`}
            >
              <Typography variant="h6" component="div">
                {Capitalise(student.student_name)}
              </Typography>
              <ExpandMore
                expand={expanded === student.student_id}
                aria-expanded={expanded === student.student_id}
                aria-label="show more"
                tabIndex={-1} // prevent IconButton from tabbing separately
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardContent>
            <Collapse in={expanded === student.student_id} timeout="auto" unmountOnExit id={`student-content-${student.student_id}`}>
              <CardContent>
                {student.per_course.map((course) => (
                  <Box
                    key={course.course_id}
                    sx={{
                      backgroundColor: '#f5f7fa',
                      borderRadius: 1,
                      p: 2,
                      mb: 2
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {course.course_name}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="body2">
                        Submitted: <b>{course.submitted}</b>
                      </Typography>
                      <Typography variant="body2">
                        Pending: <b>{course.pending}</b>
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Collapse>
          </Card>
        ))}
      </Box>
    </MainCard>
  );
};

Assignments.propTypes = {
  assignments: PropTypes.array.isRequired
};

export default Assignments;
