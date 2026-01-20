import { Grid, Box, Typography, Button, Card, CardContent, CardActions, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { DocumentUpload, Document, CloseCircle, Gallery, DocumentText, Eye } from 'iconsax-react';
import { useState, useEffect, useCallback } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Modal } from '@mui/material';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import PropTypes from 'prop-types';
import { usePermission } from 'hooks/usePermission';

const SyllablesTab = ({ data, onAddItem, onUpdateItem }) => {
  const { checkPermission } = usePermission();
  const canUpdate = checkPermission('Course', 'update');

  const [syllables, setSyllables] = useState(data || []);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [itemData, setItemData] = useState({
    date: new Date(),
    file: null
  });

  const auth = JSON.parse(localStorage.getItem('auth'));
  const userType = auth?.loginType;

  useEffect(() => {
    if (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: error,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    }
  }, [error]);

  // Update local state when props change
  useEffect(() => {
    if (data) {
      setSyllables(data.filter((item) => item !== undefined));
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [data]);

  // Add or update syllabus item
  const saveSyllabusItem = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (isEditing) {
        const updatedItem = await onUpdateItem(currentItemId, itemData);
        setSyllables(syllables.map((item) => (item.id === currentItemId ? updatedItem : item)));
      } else {
        const newItem = await onAddItem(itemData);
        setSyllables([...syllables.filter((item) => item !== undefined), newItem]);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error(`Error ${isEditing ? 'updating' : 'adding'} syllabus item:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setItemData({
      date: new Date(),
      file: null
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditing(false);
    setCurrentItemId(null);
    setItemData({
      date: new Date(),
      file: null
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setItemData((prev) => ({ ...prev, file }));
    }
  };

  const handleRemoveFile = () => {
    setItemData((prev) => ({ ...prev, file: null }));
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) {
      return <Gallery size="48" color="#666" />;
    } else if (fileType.includes('pdf')) {
      return <DocumentText size="48" color="#ff5252" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocumentText size="48" color="#2b579a" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <DocumentText size="48" color="#217346" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <DocumentText size="48" color="#d24726" />;
    } else {
      return <Document size="48" color="#666" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [previewModal, setPreviewModal] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const handleViewFileSimple = useCallback((item) => {
    setCurrentFile(item);
    setPreviewModal(true);
  }, []);

  // Enhanced file type detection
  const getFileCategory = (fileName, fileType) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const type = fileType?.toLowerCase() || '';

    // Image files
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    if (imageExtensions.includes(extension) || type.includes('image')) {
      return 'image';
    }

    // PDF files
    if (extension === 'pdf' || type.includes('pdf')) {
      return 'pdf';
    }

    // Text files
    const textExtensions = ['txt', 'csv', 'json', 'xml', 'md'];
    if (textExtensions.includes(extension) || type.includes('text')) {
      return 'text';
    }

    // Office files
    const wordExtensions = ['doc', 'docx'];
    const excelExtensions = ['xls', 'xlsx', 'csv'];
    const powerpointExtensions = ['ppt', 'pptx'];

    if (wordExtensions.includes(extension) || type.includes('word') || type.includes('document')) {
      return 'word';
    }
    if (excelExtensions.includes(extension) || type.includes('excel') || type.includes('sheet')) {
      return 'excel';
    }
    if (powerpointExtensions.includes(extension) || type.includes('powerpoint') || type.includes('presentation')) {
      return 'powerpoint';
    }

    // Video files
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    if (videoExtensions.includes(extension) || type.includes('video')) {
      return 'video';
    }

    // Audio files
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
    if (audioExtensions.includes(extension) || type.includes('audio')) {
      return 'audio';
    }

    return 'unknown';
  };

  const renderFilePreview = () => {
    if (!currentFile) return null;

    const fileUrl = currentFile.file.url;
    const fileName = currentFile.file.name;
    const fileType = currentFile.file.type;
    const fileCategory = getFileCategory(fileName, fileType);

    switch (fileCategory) {
      case 'image':
      case 'text':
      case 'pdf':
      case 'word':
      case 'excel':
      case 'powerpoint': {
        // Use Google Docs Viewer for Office files
        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        return (
          <iframe
            src={googleViewerUrl}
            width="100%"
            height="100%"
            title={fileName}
            style={{ border: 'none' }}
            onError={(e) => {
              console.error('Google Docs Viewer failed:', e);
              // Fallback to download option
              e.target.style.display = 'none';
              const fallbackElement = document.getElementById('fallback-preview');
              if (fallbackElement) fallbackElement.style.display = 'flex';
            }}
          />
        );
      }

      default:
        return (
          <Box
            id="fallback-preview"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 3
            }}
          >
            <DocumentText size="64" color="#666" />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Preview Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              This file type cannot be previewed in the browser. Please download the file to view it.
            </Typography>
            <Button variant="contained" onClick={() => window.open(fileUrl, '_blank')} startIcon={<Eye />} sx={{ mb: 1 }}>
              Open in New Tab
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.click();
              }}
              startIcon={<DocumentUpload />}
            >
              Download File
            </Button>
          </Box>
        );
    }
  };

  // Render syllabus items
  const renderItems = () => {
    return syllables
      .filter((item) => item !== undefined)
      .map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            sx={{
              mb: 2,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'translateY(-4px)',
                borderColor: 'secondary.light'
              },
              borderRadius: 2,
              transition: 'all 0.2s ease',
              position: 'relative',
              minHeight: 120
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>{getFileIcon(item.file.type)}</Box>
              <Typography variant="h4" fontWeight={600} gutterBottom sx={{ textAlign: 'center' }}>
                Course Syllabus
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textAlign: 'center' }}>
                View the complete syllabus for this course to see all learning objectives, topics covered, and assessment criteria.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Box>
                <Tooltip title="View">
                  <IconButton color="secondary" sx={{ mr: 1 }} onClick={() => handleViewFileSimple(item)}>
                    <Eye />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardActions>
          </Card>
        </Grid>
      ));
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Syllabus List */}
        {syllables.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item container spacing={3}>
              {renderItems()}
            </Grid>
            <Grid item xs={12} container justifyContent="center">
              {canUpdate && (
                <Button
                  variant="contained"
                  onClick={handleOpenModal}
                  startIcon={<DocumentUpload />}
                  disabled={isLoading}
                  sx={{ width: 'auto' }}
                >
                  Update Syllabus
                </Button>
              )}
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 4
            }}
          >
            {isLoading ? (
              <Typography>Processing...</Typography>
            ) : (
              <>
                <Document size="64" color="#ddd" />
                <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                  No Syllabus Uploaded Yet
                </Typography>
                {userType === 'admin' && (
                  <>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Click the Upload Syllabus button to add your first syllabus file
                    </Typography>
                    <Box mt={2}>
                      <Button variant="contained" disabled={isProcessing} onClick={handleOpenModal} startIcon={<DocumentUpload />}>
                        Upload Syllabus
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        )}

        {/* Upload/Edit Syllabus Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2
            }}
          >
            <Typography variant="h5" gutterBottom>
              {isEditing ? 'Edit Syllabus' : 'Upload Syllabus'}
            </Typography>

            {/* File upload area */}
            <Box
              sx={{
                border: '2px dashed #ddd',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                mb: 2,
                bgcolor: itemData.file ? 'action.hover' : 'background.paper'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileChange({ target: { files: e.dataTransfer.files } });
                }
              }}
            >
              {itemData.file ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>{getFileIcon(itemData.file.type)}</Box>
                  <Typography variant="body1">{itemData.file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(itemData.file.size)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button variant="outlined" color="error" onClick={handleRemoveFile} startIcon={<CloseCircle />}>
                      Remove File
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <DocumentUpload size="48" color="#666" />
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Drag & drop syllabus file here or
                  </Typography>
                  <input
                    type="file"
                    id="syllabus-upload"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.jpeg,.txt,.xls,.xlsx,.mp4,.mp3"
                  />
                  <label htmlFor="syllabus-upload">
                    <Button variant="contained" component="span" sx={{ mt: 1 }}>
                      Browse Files
                    </Button>
                  </label>
                </>
              )}
            </Box>

            {/* Error message */}
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {/* Modal actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={handleCloseModal} sx={{ mr: 2 }} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="contained" onClick={saveSyllabusItem} disabled={!itemData.file || isLoading}>
                {isLoading ? 'Processing...' : isEditing ? 'Update Syllabus' : 'Upload Syllabus'}
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Enhanced File Preview Modal */}
        <Modal
          open={previewModal}
          onClose={() => setPreviewModal(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Box
            sx={{
              width: '90vw',
              height: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                {currentFile?.file.name}
              </Typography>
              <Box>
                <Tooltip title="Close">
                  <IconButton onClick={() => setPreviewModal(false)}>
                    <CloseCircle />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Modal Content - File Preview */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {renderFilePreview()}
            </Box>

            {/* Modal Footer */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'grey.50'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                File type: {currentFile?.file.type || 'Unknown'}
              </Typography>
              {(userType === 'admin' || userType === 'super_admin') && (
                <Button
                  variant="contained"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = currentFile?.file.url;
                    link.download = currentFile?.file.name;
                    link.click();
                  }}
                  startIcon={<DocumentUpload />}
                >
                  Download
                </Button>
              )}
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default SyllablesTab;

SyllablesTab.propTypes = {
  data: PropTypes.array.isRequired,
  onAddItem: PropTypes.func.isRequired,
  onUpdateItem: PropTypes.func.isRequired
};
