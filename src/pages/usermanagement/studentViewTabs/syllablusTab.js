import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Box, Typography, Card, CardContent, CardActions, IconButton, Tooltip, useTheme } from '@mui/material';
import { Document as DocumentIcon, Gallery, DocumentText, Eye } from 'iconsax-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SyllablesTab = ({ courses }) => {
  /**
   * Returns the appropriate icon based on file type
   * @param {string} fileType - The MIME type of the file
   * @returns {JSX.Element} - The corresponding icon component
   */
  const getFileIcon = (fileType) => {
    if (!fileType) return <DocumentIcon size="48" color="#666" />;
    if (fileType.includes('image')) return <Gallery size="48" color="#666" />;
    if (fileType.includes('pdf')) return <DocumentText size="48" color="#ff5252" />;
    if (fileType.includes('word')) return <DocumentText size="48" color="#2b579a" />;
    return <DocumentIcon size="48" color="#666" />;
  };


  /**
   * Formats file size from bytes to human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size string
   */

  const theme = useTheme();

  // const formatFileSize = (bytes) => {
  //   if (!bytes || bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {courses?.length > 0 ? (
            courses.map((course) => (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <Box key={course.course_name || course.course_id} sx={{ mb: 5 }}>
                    {/* Course Header */}
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
                      {course.course_name || 'Course'}
                    </Typography>

                    {/* Syllabus Items Grid */}
                    {course.syllabus_info?.length > 0 ? (
                      <Grid container spacing={3}>
                        {course.syllabus_info.map((item, index) => (
                          <Grid item xs={12} key={item.id || `${course.course_name}-${index}`}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                height: '100%',
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
                                }
                              }}
                              // elevation={2}
                            >
                              <CardContent
                                sx={{
                                  flexGrow: 1,
                                  overflow: 'hidden', // Hide overflow
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                {/* File Icon */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    my: 2
                                  }}
                                >
                                  {getFileIcon(item.file?.type)}
                                </Box>

                                <Typography variant="h4" fontWeight={600} gutterBottom sx={{ textAlign: 'center' }}>
                                  Course Syllabus
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textAlign: 'center' }}>
                                  View the complete syllabus for this course to see all learning objectives, topics covered, and assessment
                                  criteria.
                                </Typography>

                                {/* File Name with Tooltip */}
                                {/* <Tooltip title={item.file?.name || 'Unnamed File'} arrow placement="top">
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      textAlign: 'center',
                                      fontWeight: 'medium',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      minHeight: '2em'
                                    }}
                                  >
                                    {item.file?.name || 'Unnamed File'}
                                  </Typography>
                                </Tooltip> */}

                                {/* File Size */}
                                {/* <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    textAlign: 'center',
                                    display: 'block'
                                  }}
                                >
                                  {formatFileSize(item.file?.size)}
                                </Typography> */}
                              </CardContent>

                              {/* Download Button */}
                              <CardActions sx={{ justifyContent: 'center' }}>
                                <Tooltip
                                  title="View"
                                  arrow
                                  placement="top"
                                  // componentsProps={{
                                  //   tooltip: {
                                  //     sx: {
                                  //       bgcolor: theme.palette.secondary.main,
                                  //       color: '#ffffff',
                                  //       fontSize: '0.875rem',
                                  //       '& .MuiTooltip-arrow': {
                                  //         color: theme.palette.primary.main
                                  //       }
                                  //     }
                                  //   }
                                  // }}
                                  color={theme.palette.primary.main}
                                >
                                  <IconButton
                                    onClick={() => item.file?.url && window.open(item.file.url, '_blank')}
                                    color="secondary"
                                    size="large"
                                    disabled={!item.file?.url}
                                  >
                                    <Eye />
                                  </IconButton>
                                </Tooltip>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      // Empty State
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 100,
                          backgroundColor: 'background.default',
                          borderRadius: 1,
                          p: 3,
                          mb: 2
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No syllabus available for this course
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </>
            ))
          ) : (
            // No Courses State
            <Grid item xs={12}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No courses available.
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

// PropTypes validation
SyllablesTab.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      course_name: PropTypes.string,
      course_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      syllabus_info: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          file: PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
            size: PropTypes.number,
            url: PropTypes.string
          })
        })
      )
    })
  )
};

// Default props
SyllablesTab.defaultProps = {
  courses: []
};

export default SyllablesTab;
