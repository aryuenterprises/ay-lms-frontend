import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormLabel,
  TextField,
  Rating,
  Collapse
} from '@mui/material';
import { useState } from 'react';
import 'draft-js/dist/Draft.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { Capitalise } from 'utils/capitalise';
import { TickCircle, Note } from 'iconsax-react';
import PropTypes from 'prop-types';

const TopicsTab = ({ topics, completedTopics }) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [openTopicNotes, setOpenTopicNotes] = useState(false);
  const [notes, setNotes] = useState(null);

  // Assuming topics is an array of courses, each with their own topics
  const coursesWithTopics = topics || [];

  const handleTopicsNotes = (courseId, topicId) => {
    // Find the completed topic that matches both course and topic IDs
    const completedTopic = completedTopics?.find((completed) => completed.course_id === courseId && completed.topic === topicId);
    setNotes(completedTopic?.notes || 'No notes available');
    setOpenTopicNotes(true);
  };

  const toggleTopicExpansion = (topicId) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  // Check if a topic is completed
  const isTopicCompleted = (courseId, topicId) => {
    return completedTopics?.some((completed) => completed.course_id === courseId && completed.topic === topicId);
  };

  const renderTopicCard = (topic, index) => {
    const topicId = topic.topic_id;
    const courseId = topic.course;
    if (!topicId) return null;
    const isExpanded = expandedTopicId === topic.topic_id;
    const isCompleted = isTopicCompleted(courseId, topicId);

    return (
      <Card
        key={topic.topic_id}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            borderColor: 'secondary.light'
          },
          mb: 2,
          ml: 4
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body1">{`Title ${index + 1}: ${Capitalise(topic.title)}`}</Typography>
                {isCompleted && <TickCircle size={30} color="green" />}
                <Rating value={isCompleted ? completedTopics?.find((ct) => ct.topic === topic.topic_id)?.ratings : null} readOnly />
              </Box>
              <Box>
                {isCompleted && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTopicsNotes(courseId, topicId);
                    }}
                  >
                    <Note size={20} color="#666" />
                  </IconButton>
                )}
              </Box>
            </Box>
          }
          onClick={() => toggleTopicExpansion(topic.topic_id)}
          sx={{ cursor: 'pointer' }}
        />
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Box
              sx={{
                '& h1, & h2, & h3': { margin: '1em 0' },
                '& p': { margin: '0 0 1em 0' },
                '& ul, & ol': { margin: '0 0 1em 1em', paddingLeft: '2em' }
              }}
              dangerouslySetInnerHTML={{ __html: topic.description }}
            />
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  return (
    <Grid container sx={{ minHeight: '50vh' }}>
      <Grid item xs={12} padding={3}>
        {coursesWithTopics.length > 0 ? (
          <Grid container spacing={3}>
            {coursesWithTopics.map((course) => (
              <>
                <Grid item xs={12} key={course.id}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      backgroundColor: 'background.paper',
                      padding: 2,
                      borderRadius: 1,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      boxShadow: 1,
                      mb: 3
                    }}
                  >
                    {course.course_name || 'Unnamed Course'}
                  </Typography>
                </Grid>
                <Grid item container xs={12} key={course.id}>
                  {course.topic && course.topic.length > 0 ? (
                    course.topic.map((topicItem, index) => (
                      <Grid item xs={12} sm={6} key={topicItem.course}>
                        {renderTopicCard(topicItem, index)}
                      </Grid>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No topics available for this course
                    </Typography>
                  )}
                </Grid>
              </>
            ))}
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No courses with topics available.
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
        maxWidth="xs"
        keepMounted
        fullWidth
        open={openTopicNotes}
        onClose={() => setOpenTopicNotes(false)}
        aria-labelledby="login-details-dialog"
      >
        <DialogTitle>Student Feedback</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <FormLabel>Note</FormLabel>
                <TextField
                  fullWidth
                  placeholder="No note available"
                  name="notes"
                  value={notes}
                  rows={4}
                  multiline
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
          <Button onClick={() => setOpenTopicNotes(false)} variant="text">
            close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

TopicsTab.propTypes = {
  topics: PropTypes.array,
  completedTopics: PropTypes.array
};

export default TopicsTab;
