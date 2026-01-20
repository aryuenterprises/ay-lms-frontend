// import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Container, Grid, Link, Tooltip, Typography } from '@mui/material';

// third party
import { motion } from 'framer-motion';

// assets
// import AnimateButton from 'components/@extended/AnimateButton';
import techBootstrap from 'assets/images/landing/tech-bootstrap.svg';
import techReact from 'assets/images/landing/tech-react.svg';
import techMui from 'assets/images/landing/tech-mui.svg';
import techHtml from 'assets/images/landing/tech-html.svg';
import techCss from 'assets/images/landing/tech-css.svg';
import techJavascript from 'assets/images/landing/tech-javascript.svg';
import techWordpress from 'assets/images/landing/tech-wordpress.svg';
import techPython from 'assets/images/landing/tech-python.svg';
import techFigma from 'assets/images/landing/tech-figma.svg';
import techNode from 'assets/images/landing/tech-nodejs.svg';
import { useRef, useEffect } from 'react';

// ==============================|| LANDING - HeaderPage ||============================== //

const HeaderPage = () => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);

  const techIcons = [
    { name: 'Bootstrap 5', image: techBootstrap },
    { name: 'React', image: techReact },
    { name: 'React Material UI', image: techMui },
    { name: 'HTML', image: techHtml },
    { name: 'CSS', image: techCss },
    { name: 'JavaScript', image: techJavascript },
    { name: 'WordPress', image: techWordpress },
    { name: 'Node.js', image: techNode },
    { name: 'Python', image: techPython },
    { name: 'Figma Design System', image: techFigma }
  ];

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollSpeed = 1;
    let animationFrameId;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollSpeed;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => {
      scrollSpeed = 0;
    };

    const handleMouseLeave = () => {
      scrollSpeed = 1;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Container sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ pt: { md: 0, xs: 8 }, pb: { md: 0, xs: 5 } }}>
        <Grid item xs={12} md={9}>
          <Grid container spacing={3} sx={{ textAlign: 'center' }}>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, translateY: 550 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 30
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.825rem', sm: '2rem', md: '3.4375rem' },
                    fontWeight: 700,
                    lineHeight: 1.2
                  }}
                >
                  <span>Welcome to the </span>
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(90deg, rgb(37, 161, 244), rgba(255, 13, 13, 1), rgba(168, 37, 244, 1)) 0 0 / 400% 100%',
                      color: 'transparent',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      animation: 'move-bg 24s infinite linear',
                      '@keyframes move-bg': {
                        '100%': {
                          backgroundPosition: '400% 0'
                        }
                      }
                    }}
                  >
                    <span>Aryu Academy </span>
                  </Box>
                  <span> Student Portal</span>
                </Typography>
              </motion.div>
            </Grid>
            <Grid container justifyContent="center" item xs={12}>
              <Grid item xs={8}>
                <motion.div
                  initial={{ opacity: 0, translateY: 550 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 30,
                    delay: 0.2
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 400,
                      lineHeight: { xs: 1.4, md: 1.4 }
                    }}
                  >
                    Your personalized dashboard for accessing course materials, class schedules, assignments, progress tracking, and
                    academic tools.
                  </Typography>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          position: 'absolute',
          bottom: { xs: -30, sm: 0 },
          left: 0,
          right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          py: 2
        }}
      >
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            overflowX: 'hidden',
            '&:hover': {
              '& .tech-icon': {
                transform: 'scale(1.1)'
              }
            }
          }}
        >
          {/* Double the icons for seamless looping */}
          {[...techIcons, ...techIcons].map((tech, index) => (
            <motion.div
              key={`${tech.name}-${index}`}
              className="tech-icon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
              style={{
                flex: '0 0 auto',
                margin: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Tooltip title={tech.name} arrow>
                <Link
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={tech.image}
                    alt={tech.name}
                    sx={{
                      height: 40,
                      width: 'auto',
                      filter: 'grayscale(30%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        filter: 'grayscale(0%)'
                      }
                    }}
                  />
                </Link>
              </Tooltip>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Container>
  );
};
export default HeaderPage;
