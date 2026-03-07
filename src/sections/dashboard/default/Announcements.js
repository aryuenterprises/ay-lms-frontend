// import React, { useEffect, useState, useRef } from 'react';
// import { Typography, Box, useMediaQuery } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import PropTypes from 'prop-types';
// import twemoji from 'twemoji';

// const Announcements = ({ announcements = [] }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const [index, setIndex] = useState(0);
//   const [duration, setDuration] = useState(10);

//   const textRef = useRef(null);

//   const processedAnnouncements = announcements.map((a) => ({
//     id: a?.id || '',
//     content: a?.content || 'No content available'
//   }));

//   const EmojiText = ({ text }) => (
//     <Box component="span" dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }} />
//   );

//   useEffect(() => {
//     if (!textRef.current || processedAnnouncements.length === 0) return;

//     const textWidth = textRef.current.offsetWidth;
//     const containerWidth = window.innerWidth;

//     const totalDistance = textWidth + containerWidth;
//     const speed = 120;

//     const newDuration = totalDistance / speed;
//     setDuration(newDuration);

//     const timer = setTimeout(() => {
//       setIndex((prev) => (prev + 1) % processedAnnouncements.length);
//     }, newDuration * 1000);

//     return () => clearTimeout(timer);
//   }, [index, processedAnnouncements.length]);

//   if (processedAnnouncements.length === 0) return null;

//   const current = processedAnnouncements[index];

//   return (
//     <Box
//       sx={{
//         backgroundColor: 'rgb(107, 107, 107)',
//         px: 2,
//         py: 1,
//         overflow: 'hidden',
//         position: 'relative',
//         height: 40,
//         display: 'flex',
//         alignItems: 'center'
//       }}
//     >
//       <Typography
//         ref={textRef}
//         key={index}
//         variant={isMobile ? 'body1' : 'h6'}
//         sx={{
//           position: 'absolute',
//           whiteSpace: 'nowrap',
//           animation: `ticker ${duration}s linear forwards`,
//           color: 'white',
//           fontSize: '18px'
//         }}
//       >
//         <EmojiText text={current.content} />
//       </Typography>

//       <style>
//         {`
//         @keyframes ticker {
//           from { transform: translateX(100%); }
//           to { transform: translateX(-100%); }
//         }
//         `}
//       </style>
//     </Box>
//   );
// };

// Announcements.propTypes = {
//   announcements: PropTypes.array
// };

// export default React.memo(Announcements);


// import React, { useEffect, useState, useRef } from 'react';
// import { Typography, Box, useMediaQuery } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import PropTypes from 'prop-types';
// import twemoji from 'twemoji';

// const Announcements = ({ announcements = [] }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

//   const [index, setIndex] = useState(0);
//   const [duration, setDuration] = useState(10);

//   const textRef = useRef(null);

//   const processedAnnouncements = announcements.map((a) => ({
//     id: a?.id || '',
//     content: a?.content || 'No content available'
//   }));

//   const EmojiText = ({ text }) => (
//     <Box component="span" dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }} />
//   );

//   useEffect(() => {
//     if (!textRef.current || processedAnnouncements.length === 0) return;

//     const textWidth = textRef.current.offsetWidth;
//     const containerWidth = window.innerWidth;

//     const totalDistance = textWidth + containerWidth;
//     const speed = 120;

//     const newDuration = totalDistance / speed;
//     setDuration(newDuration);

//     const timer = setTimeout(() => {
//       setIndex((prev) => (prev + 1) % processedAnnouncements.length);
//     }, newDuration * 1000);

//     return () => clearTimeout(timer);
//   }, [index, processedAnnouncements.length]);

//   if (processedAnnouncements.length === 0) return null;

//   const current = processedAnnouncements[index];

//   return (
//     <Box
//       sx={{
//         backgroundColor: 'rgb(107, 107, 107)',
//         px: 2,
//         py: 1,
//         overflow: 'hidden',
//         position: 'relative',
//         height: 40,
//         display: 'flex',
//         alignItems: 'center'
//       }}
//     >
//       <Typography
//         ref={textRef}
//         key={index}
//         variant={isMobile ? 'body1' : 'h6'}
//         sx={{
//           position: 'absolute',
//           whiteSpace: 'nowrap',
//           animation: `ticker ${duration}s linear forwards`,
//           color: 'white',
//           fontSize: '18px'
//         }}
//       >
//         <EmojiText text={current.content} />
//       </Typography>

//       <style>
//         {`
//         @keyframes ticker {
//           from { transform: translateX(100%); }
//           to { transform: translateX(-100%); }
//         }
//         `}
//       </style>
//     </Box>
//   );
// };

// Announcements.propTypes = {
//   announcements: PropTypes.array
// };

// export default React.memo(Announcements);

import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, useMediaQuery, Paper, IconButton, Avatar, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import twemoji from 'twemoji';
import {
  Pause,
  PlayArrow,
  Close,
  Campaign as MegaphoneIcon,
  NavigateNext,
  NavigateBefore,

} from '@mui/icons-material';

const Announcements = ({ announcements = [], onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [index, setIndex] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const textRef = useRef(null);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const processedAnnouncements = announcements.map((a) => ({
    id: a?.id || Math.random().toString(36).substr(2, 9),
    content: a?.content || 'No content available',
  
  }));

  const EmojiText = ({ text }) => (
    <Box
      component="span"
      dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }}
      sx={{
        '& img': {
          width: '1.3em',
          height: '1.3em',
          verticalAlign: 'middle',
          margin: '0 0.2em',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
        }
      }}
    />
  );

  useEffect(() => {
    if (!textRef.current || !containerRef.current || processedAnnouncements.length === 0 || isPaused) return;

    const textWidth = textRef.current.offsetWidth;
    const containerWidth = containerRef.current.offsetWidth;

    const baseSpeed = isMobile ? 50 : 70;
    const totalDistance = textWidth + containerWidth;

    const pauseDuration = textWidth < 250 ? 3 : 1;
    const newDuration = Math.max(totalDistance / baseSpeed + pauseDuration, 6);

    setDuration(newDuration);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (!isPaused) {
        setIndex((prev) => (prev + 1) % processedAnnouncements.length);
      }
    }, newDuration * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, processedAnnouncements.length, isMobile, isPaused]);

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + processedAnnouncements.length) % processedAnnouncements.length);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % processedAnnouncements.length);
    setTimeout(() => setIsPaused(false), 3000);
  };

  if (!isVisible || processedAnnouncements.length === 0) return null;

  const current = processedAnnouncements[index];

  return (
    <Paper
      ref={containerRef}
      elevation={0}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      sx={{
        background: `linear-gradient(135deg, #40105c 0%, #6a1b9a 100%)`,
        position: 'relative',
        width: '100%',
        zIndex: 1100,
        borderRadius: { xs: 0, sm: '20px 20px 20px 20px' },
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        // boxShadow: '0 8px 20px rgba(189,0,0,0.25)',
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 100%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 1.8 },
          overflow: 'hidden',
          position: 'relative',
          height: { xs: 56, sm: 64, md: 72 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2.5 }
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background:
              'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)',
            pointerEvents: 'none'
          }}
        />

        {/* Left Section - Enhanced with modern design */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
            position: 'relative'
          }}
        >
          {/* Animated Icon Container */}
          <Box
            sx={{
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0))',
                animation: 'pulse 2s infinite',
                zIndex: 0
              }
            }}
          >
            <Avatar
              sx={{
                width: { xs: 36, sm: 42, md: 48 },
                height: { xs: 36, sm: 42, md: 48 },
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(5px)',
                border: '2px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                animation: 'float 3s ease-in-out infinite',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  background: 'rgba(255,255,255,0.35)'
                }
              }}
            >
              <MegaphoneIcon />
            </Avatar>
          </Box>

          {/* Modern Badge Design */}
          {!isMobile && (
              <Box
                sx={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 0.8,
                  borderRadius: '30px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '0.55rem', fontWeight: 500, letterSpacing: '0.5px' }}>
                  {processedAnnouncements.length} UPDATE{processedAnnouncements.length > 1 ? 'S' : ''}
                </Typography>
              </Box>
          )}
        </Box>

        {/* Announcement Text Container - Enhanced with glass morphism */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            mx: 1
          }}
        >
          {/* Scrolling Text with Modern Style */}
          <Typography
            ref={textRef}
            key={index}
            variant="body2"
            sx={{
              position: 'absolute',
              whiteSpace: 'nowrap',
              animation: isPaused ? 'none' : `slide ${duration}s linear infinite`,
              color: 'white',
              fontWeight: 600,
              fontSize: { xs: '15px', sm: '16px', md: '18px' },
              letterSpacing: '0.3px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              '&:hover': {
                animationPlayState: 'paused'
              },
              '& .highlight': {
                background: 'rgba(255,255,255,0.3)',
                px: 1,
                py: 0.3,
                borderRadius: '12px',
                fontSize: '0.8em'
              }
            }}
          >
            {/* Decorative element */}
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 10px white',
                animation: 'pulse 2s infinite',
                mr: 1
              }}
            />
            <EmojiText text={current.content} />
          </Typography>
        </Box>

        {/* Right Section - Enhanced Controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0
          }}
        >
          {/* Navigation Arrows - Visible on hover */}
          <Fade in={showControls && !isMobile && processedAnnouncements.length > 1}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={handlePrev}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(5px)',
                  width: 30,
                  height: 30,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <NavigateBefore sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNext}
                sx={{
                  color: 'white',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(5px)',
                  width: 30,
                  height: 30,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <NavigateNext sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Fade>

          {/* Modern Progress Indicator */}
          {!isMobile && processedAnnouncements.length > 1 && (
            <Tooltip title={`${index + 1} of ${processedAnnouncements.length}`} arrow>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.8,
                  mx: 1,
                  position: 'relative'
                }}
              >
                {processedAnnouncements.map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: i === index ? 20 : 8,
                      height: 8,
                      borderRadius: '10px',
                      background: i === index ? 'white' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      boxShadow: i === index ? '0 0 10px white' : 'none',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.5)',
                        transform: 'scale(1.1)'
                      }
                    }}
                    onClick={() => {
                      setIndex(i);
                      setTimeout(() => setIsPaused(false), 3000);
                    }}
                  />
                ))}
              </Box>
            </Tooltip>
          )}

          {/* Play/Pause with enhanced design */}
          <Tooltip title={isPaused ? 'Play' : 'Pause'} arrow>
            <IconButton
              size="small"
              onClick={handlePauseToggle}
              sx={{
                color: 'white',
                background: isPaused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(5px)',
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.3)',
                  transform: 'scale(1.1)',
                  borderColor: 'white'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isPaused ? <PlayArrow sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <Pause sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            </IconButton>
          </Tooltip>

          {/* Close Button with modern design */}
          <Tooltip title="Close announcements" arrow>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)',
                width: { xs: 30, sm: 34 },
                height: { xs: 30, sm: 34 },
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  background: 'rgba(255,0,0,0.3)',
                  transform: 'scale(1.1) rotate(90deg)',
                  borderColor: 'white'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Close sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Add keyframe animations */}
      <style>
        {`
        @keyframes slide {
          0% { 
            transform: translateX(100%); 
            opacity: 0;
          }
          5% {
            transform: translateX(100%);
            opacity: 1;
          }
          95% {
            transform: translateX(-100%);
            opacity: 1;
          }
          100% { 
            transform: translateX(-100%); 
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        `}
      </style>
    </Paper>
  );
};

// Fade component for transitions
const Fade = ({ in: inProp, children, timeout = 300, ...props }) => {
  const [shouldRender, setShouldRender] = useState(inProp);

  useEffect(() => {
    if (inProp) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), timeout);
      return () => clearTimeout(timer);
    }
  }, [inProp, timeout]);

  return shouldRender ? (
    <Box
      sx={{
        opacity: inProp ? 1 : 0,
        transition: `opacity ${timeout}ms ease-in-out`,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  ) : null;
};

Announcements.propTypes = {
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      type: PropTypes.oneOf(['info', 'event', 'deadline', 'achievement']),
      timestamp: PropTypes.string
    })
  ),
  onClose: PropTypes.func,
  portalName: PropTypes.string
};

export default React.memo(Announcements);
