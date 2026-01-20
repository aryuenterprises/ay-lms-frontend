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
  Card,
  CardContent,
  Typography,
  Collapse,
  FormLabel
} from '@mui/material';
import MainCard from 'components/MainCard';
import { Formik, Form, FieldArray } from 'formik';
import { PopupTransition } from 'components/@extended/Transitions';
import { Add, Additem, CloseSquare } from 'iconsax-react';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import 'assets/css/commonStyle.css';

const CourseAdd = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = (panel) => {
    setExpandedCard(expandedCard === panel ? null : panel);
  };

  const handleOpen = () => {
    setCurrentCourse(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const cards = [
    {
      id: 'panel1',
      title: 'Course Title',
      subtitle: 'Core Principles of Design',
      syllabus: ['Introduction to design principles', 'Color theory basics', 'Typography fundamentals']
    },
    {
      id: 'panel2',
      title: 'Card 02',
      subtitle: 'Overview of Design Thinking',
      syllabus: ['Empathize phase', 'Define phase', 'Ideate phase', 'Prototype phase', 'Test phase']
    }
  ];

  const handleSubmit = () => {
    // Here you would typically save to your backend
    // console.log('Submitted values:', values);

    // For now, just close the dialog
    handleClose();
  };

  return (
    <MainCard>
      <Grid item container justifyContent="flex-end" mb={3}>
        <Grid item>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex' }}>
              <Button color="success" variant="contained" startIcon={<Additem />} onClick={handleOpen}>
                Add Course
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Grid item container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} key={card.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: '1px solid',
                borderColor: theme.palette.divider,
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent>
                <Stack direction="column" spacing={1.5} alignItems="center">
                  <Typography variant="h5">{card.title}</Typography>
                  <Typography variant="h6">{card.subtitle}</Typography>
                </Stack>
              </CardContent>
              <Collapse in={expandedCard === card.id}>
                <CardContent sx={{ borderTop: '1px solid', borderColor: theme.palette.divider }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Syllabus:
                  </Typography>
                  <ul>
                    {card.syllabus.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Course Dialog */}
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
          {currentCourse ? 'Edit Course' : 'Add Course'}
          <IconButton color="dark" onClick={handleClose} edge="end" size="big" aria-label="close" title="close">
            <CloseSquare height={30} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              title: '',
              subtitle: '',
              syllabus: ['']
            }}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <Grid container xs={12}>
                  <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                    <Stack spacing={1}>
                      <FormLabel>Course Title</FormLabel>
                      <TextField
                        fullWidth
                        id="title"
                        name="title"
                        placeholder="Course Title"
                        value={values.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.title && Boolean(errors.title)}
                        helperText={touched.title && errors.title}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6} p={1} sx={{ mt: 2 }}>
                    <Stack spacing={1}>
                      <FormLabel>Course Subtitle</FormLabel>
                      <TextField
                        fullWidth
                        id="subtitle"
                        name="subtitle"
                        placeholder="Course Subtitle"
                        value={values.subtitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.subtitle && Boolean(errors.subtitle)}
                        helperText={touched.subtitle && errors.subtitle}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                <Grid p={1} sx={{ mt: 2 }}>
                  <Stack spacing={1}>
                    <FormLabel variant="subtitle1">Syllabus</FormLabel>

                    <FieldArray name="syllabus">
                      {({ push, remove }) => (
                        <Stack spacing={2}>
                          {values.syllabus.map((item, index) => (
                            <Stack key={index} direction="row" spacing={1} alignItems="center">
                              <TextField
                                fullWidth
                                id={`syllabus.${index}`}
                                name={`syllabus.${index}`}
                                value={item}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.syllabus && touched.syllabus[index] && Boolean(errors.syllabus?.[index])}
                                helperText={touched.syllabus && touched.syllabus[index] && errors.syllabus?.[index]}
                              />
                              {index > 0 && (
                                <IconButton onClick={() => remove(index)} color="error">
                                  <CloseSquare size="20" />
                                </IconButton>
                              )}
                            </Stack>
                          ))}
                          <Button variant="outlined" startIcon={<Add />} onClick={() => push('')} sx={{ alignSelf: 'flex-start' }}>
                            Add Syllabus Item
                          </Button>
                        </Stack>
                      )}
                    </FieldArray>
                  </Stack>
                </Grid>
                <DialogActions sx={{ mt: 3 }}>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button type="submit" variant="contained">
                    {currentCourse ? 'Update' : 'Submit'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </MainCard>
  );
};

export default CourseAdd;
