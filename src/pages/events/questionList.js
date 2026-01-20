import React from 'react';
import { Card, CardContent, Typography, IconButton, Stack, Chip, Box, Grid } from '@mui/material';
import { Edit, Delete, Timer, Grade } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Eye } from 'iconsax-react';

const QuestionList = ({ questions, onEdit, onDelete, onView }) => {
  return (
    <Grid container spacing={3}>
      {questions.map((question, index) => (
        <Grid item xs={12} sm={6} md={4} lg={4} key={question.id}>
          <Card
            variant="outlined"
            sx={{
              '&:hover': {
                boxShadow: 1,
                borderColor: 'primary.light'
              }
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="h6" color="text.secondary">
                      Q{index + 1}.
                    </Typography>
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      {question.questionTitle}
                    </Typography>
                  </Stack>

                  <Grid container mt={1} spacing={2} alignItems="center">
                    <Grid item>
                      <Chip icon={<Timer />} label={`${question.questionTime}s`} size="small" color="info" variant="outlined" />
                    </Grid>
                    <Grid item>
                      <Chip
                        icon={<Grade />}
                        label={`${question.mark} mark${question.mark > 1 ? 's' : ''}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  <IconButton color="secondary" size="small" onClick={() => onView(question)} title="View">
                    <Eye fontSize="small" />
                  </IconButton>
                  <IconButton color="info" size="small" onClick={() => onEdit(question)} title="Edit">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => onDelete(question.id)} title="Delete">
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

QuestionList.propTypes = {
  questions: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func
};

export default QuestionList;
