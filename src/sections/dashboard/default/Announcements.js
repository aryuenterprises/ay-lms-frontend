// material-ui
import { Grid, Typography, Stack, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// asset
import cardBack from 'assets/images/widget/img-dropbox-bg.svg';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import twemoji from 'twemoji';

// ==============================|| ANALYTICS - WELCOME ||============================== //

const Announcements = ({ announcements = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Filter and process announcements
  const processedAnnouncements = announcements
    .filter((announcement) => announcement && typeof announcement === 'object')
    .map((announcement) => ({
      id: announcement.id || '',
      title: announcement.title || 'No title',
      content: announcement.content || 'No content available',
      background: announcement.background_pic_url || cardBack,
      content_pic: announcement.content_pic_url || cardBack
    }));

  // Animation effect
  useEffect(() => {
    if (processedAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentAnnouncementIndex((prev) => (prev + 1) % processedAnnouncements.length);
        setFade(true);
      }, 500); // Half second for fade out before changing
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [processedAnnouncements.length]);

  const EmojiText = ({ text }) => (
    <Box
      component="span"
      sx={{
        '& img.emoji': {
          width: '1em !important',
          height: '1em !important',
          margin: '0 0.05em !important',
          verticalAlign: '-0.1em !important'
        }
      }}
      dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }}
    />
  );

  if (processedAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = processedAnnouncements[currentAnnouncementIndex];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          border={false}
          sx={{
            color: 'common.white',
            bgcolor: theme.palette.mode === ThemeMode.DARK ? 'secondary.900' : 'secondary.800',
            '&:after': {
              content: '""',
              backgroundImage: `url(${currentAnnouncement.background})`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              opacity: 0.9,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            },
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            minHeight: isMobile ? 200 : 300,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container alignItems="center" sx={{ height: '100%' }}>
            <Grid item xs={12}>
              <Stack
                spacing={2}
                sx={{
                  p: isMobile ? 2 : 3,
                  zIndex: 2,
                  position: 'relative',
                  width: '100%',
                  textAlign: isMobile ? 'center' : 'left',
                  ml: isMobile ? 0 : isTablet ? '10%' : '15%',
                  mr: isMobile ? 0 : '5%'
                }}
              >
                {/* <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  sx={{
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  <EmojiText text={currentAnnouncement.title} />
                </Typography> */}
                <Typography
                  variant={isMobile ? 'body1' : 'h6'}
                  sx={{
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line' // Preserve line breaks from content
                  }}
                >
                  <EmojiText text={currentAnnouncement.content} />
                </Typography>
              </Stack>
            </Grid>
            {/* {currentAnnouncement.content_pic && !isMobile && (
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-end',
                    alignItems: 'center',
                    p: isMobile ? 2 : 3,
                    zIndex: 2,
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src={currentAnnouncement.content_pic}
                    alt="Announcement"
                    sx={{
                      width: isMobile ? '100%' : isTablet ? '180px' : '200px',
                      height: 'auto',
                      borderRadius: 1,
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Grid>
            )} */}
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

Announcements.propTypes = {
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      content: PropTypes.string,
      background_pic_url: PropTypes.string,
      content_pic_url: PropTypes.string
    })
  ),
  text: PropTypes.string
};

Announcements.defaultProps = {
  announcements: []
};

export default Announcements;
