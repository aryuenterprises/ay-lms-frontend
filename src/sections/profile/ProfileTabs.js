import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, FormLabel, Grid, TextField, Stack, Typography, Dialog, DialogContent, DialogActions, Button } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import ProfileTab from './ProfileTab';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import { ThemeMode } from 'config';

// assets
import { Camera } from 'iconsax-react';


import { APP_PATH_BASE_URL } from 'config';
import { Capitalise } from 'utils/capitalise';
import axiosInstance from 'utils/axios';

const ProfileTabs = () => {
  const avatarImage = require.context('assets/images/users/', true);
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [avatar, setAvatar] = useState(avatarImage(`./avatar-thumb-1.png`));
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef(null);
  const auth = JSON.parse(localStorage.getItem('auth'));
  const userId = auth?.user?.employee_id || auth?.user?.user_id;
  const regId = auth?.user?.student_id;
  const userType = auth?.loginType;

  const fetchData = useCallback(async () => {
    try {
      let response;
      if (userType === 'tutor') {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/trainers/${userId}`);
      } else {
        response = await axiosInstance.get(`${APP_PATH_BASE_URL}api/student_profile/${regId}`);
      }

      const result = response.data;
      if (userType === 'tutor') {
        setData(result.data);
      } else {
        setData(result.data);
      }

      if (userType === 'tutor') {
        if (result.data.profile_pic_url) {
          setAvatar(`${result.data.profile_pic_url}`);
        }
      } else {
        if (result.data.profile_pic) {
          setAvatar(`${result.data.profile_pic}`);
        }
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
  }, [userId, regId, userType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = useCallback(
    async (imageFile) => {
      try {
        const formData = new FormData();
        formData.append('profile_pic', imageFile, imageFile.name);

        let endpoint;
        if (userType === 'tutor') {
          endpoint = `${APP_PATH_BASE_URL}api/trainers/${userId}`;
        } else {
          endpoint = `${APP_PATH_BASE_URL}api/student_profile/${regId}`;
        }

        const response = await axiosInstance.patch(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        await response.data;

        dispatch(
          openSnackbar({
            open: true,
            message: 'Profile image updated successfully.',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            autoHideDuration: 3000,
            close: true
          })
        );

        await fetchData();
      } catch (err) {
        dispatch(
          openSnackbar({
            open: true,
            message: err.message || 'Update failed',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            autoHideDuration: 3000,
            close: true
          })
        );
      }
    },
    [userId, regId, userType, fetchData]
  );

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImageLoaded(false);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

        setAvatar(croppedImageUrl);
        setCropModalOpen(false);

        const croppedImageFile = new File([croppedImageBlob], 'profile-pic.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        await handleImageUpload(croppedImageFile);
      } catch (error) {
        console.error('Error cropping image:', error);
        dispatch(
          openSnackbar({
            open: true,
            message: 'Failed to crop image',
            variant: 'alert',
            alert: {
              color: 'error'
            },
            autoHideDuration: 3000,
            close: true
          })
        );
      }
    }
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
            <Stack spacing={1} alignItems="center">
              <FormLabel
                htmlFor="change-avatar"
                sx={{
                  position: 'relative',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  '&:hover .MuiBox-root': { opacity: 1 },
                  cursor: 'pointer',
                  border: `2px dashed ${theme.palette.primary.light}`,
                  padding: 0.5
                }}
              >
                <Avatar
                  alt="Profile Photo"
                  src={avatar}
                  sx={{
                    width: 128,
                    height: 128,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <Stack spacing={0.5} alignItems="center">
                    <Camera
                      style={{
                        color: theme.palette.primary.secondary,
                        fontSize: '2rem',
                        strokeWidth: 1.5
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.primary.secondary,
                        fontWeight: 600
                      }}
                    >
                      Update Profile Photo
                    </Typography>
                  </Stack>
                </Box>
              </FormLabel>

              <TextField
                type="file"
                id="change-avatar"
                variant="outlined"
                sx={{ display: 'none' }}
                onChange={onSelectFile}
                accept="image/*"
              />

              <Stack spacing={1} alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {Capitalise(data.first_name || data.full_name)}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'text.secondary',
                    bgcolor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 4
                  }}
                >
                  {userType === 'tutor' ? `Tutor` : `Student`}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {data.registration_id || data.employee_id}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Grid>
        <Grid item sm={3} sx={{ display: { sm: 'block', md: 'none' } }} />
        <Grid item xs={12}>
          <ProfileTab />
        </Grid>
      </Grid>

      {/* Crop Modal */}
      <Dialog open={cropModalOpen} onClose={() => setCropModalOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Crop your profile picture
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                style={{ maxWidth: '100%' }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(false)}
                  alt={`${data.first_name || 'User'} profile`}
                />
              </ReactCrop>
            )}
            {!isImageLoaded && <Typography>Loading image...</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCropModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCropComplete} color="primary" variant="contained" disabled={!isImageLoaded || !completedCrop}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

ProfileTabs.propTypes = {
  focusInput: PropTypes.func
};

export default ProfileTabs;
