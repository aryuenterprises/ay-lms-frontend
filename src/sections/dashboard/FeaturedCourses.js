import PropTypes from 'prop-types';
import { Grid, Card, CardContent, Typography, Button, CardMedia } from '@mui/material';

const FeaturedCourses = ({ courses, onEnroll }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <Grid container spacing={3}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} key={course.course_id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="160"
              image={course.course_pic_url}
              alt={course.course_name}
            />

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {course.course_name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {course.course_category}
              </Typography>

              {course.duration && (
                <Typography variant="caption" display="block">
                  Duration: {course.duration}
                </Typography>
              )}

              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => onEnroll(course)}
              >
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

FeaturedCourses.propTypes = {
  courses: PropTypes.array.isRequired,
  onEnroll: PropTypes.func.isRequired
};

export default FeaturedCourses;
