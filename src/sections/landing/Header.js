import { useTheme } from '@mui/material/styles';
import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Login from 'pages/auth/auth1/login';

// import CardContent from '@mui/material/CardContent';
// import Card from '@mui/material/Card';
// import {CardMedia,Stack}from '@mui/material';
// import {useMediaQuery} from "@mui/material";
// import Aryuimage from 'assets/images/Aryuimage/webimage.png'
// as
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

const HeaderPage = () => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);

  // const largeSize = useMediaQuery(theme.breakpoints.up('lg'));


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
    const el = scrollContainerRef.current;
    if (!el) return;

    let speed = 1;
    let raf;

    const scroll = () => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += speed;
      }
      raf = requestAnimationFrame(scroll);
    };

    raf = requestAnimationFrame(scroll);

    el.addEventListener('mouseenter', () => (speed = 0));
    el.addEventListener('mouseleave', () => (speed = 1));

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <Container
        sx={{
          flexGrow: 1,
          pt: { xs: 3, md: 2 }
        }}
      >
        <Grid container spacing={4} alignItems="stretch">
          {/* LEFT – WELCOME CONTENT */}
          <Grid item xs={12} md={7} display="flex" height="100%" maxHeight={320} alignItems="center">
            <Box sx={{ mt: 30, mb: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.0rem', md: '3.4rem' },
                    fontWeight: 700
                  }}
                >
                  Welcome to the
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(90deg,#25a1f4,#ff0d0d,#a825f4)',
                      backgroundSize: '400%',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    Aryu Academy
                    <br />
                  </Box>
                  Student Portal
                </Typography>

                <Typography
                  sx={{
                    mt: 2,
                    maxWidth: 520,
                    lineHeight: 1.6,
                    color: 'text.secondary'
                  }}
                  variant="body1"
                >
                  Your personalized dashboard for accessing course materials, class schedules, assignments, progress tracking, and academic
                  tools.
                </Typography>
              </motion.div>
            </Box>
          </Grid>

          {/* RIGHT – LOGIN */}
          <Grid item xs={12} md={5} display="flex" alignItems="stretch">
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 420, sm: 520, md: 560 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 340, mt: 3 }}>
                <Login />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* TECH ICONS SECTION */}
      <Box
        sx={{
          width: '100%',
          mt: 4,
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'hidden',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            minHeight: 50
          }}
        >
          {[...techIcons, ...techIcons].map((tech, index) => (
            <Box
              key={index}
              sx={{
                mx: 3,
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.2)' }
              }}
            >
              <img src={tech.image} alt={tech.name} height={50} />
            </Box>
          ))}
        </Box>
      </Box>
      {/* {largeSize && (
        <Card display="flex" justifyContent="center" alignItems="center" textAlign="center" sx={{ margin: 2, background: '#E60010' }}>
          <CardContent variant="h4" sx={{ color: 'white' }}>
            <Stack>
              <CardMedia
                component="img" // Use the "img" component for a standard image element
                height="auto"
                image={Aryuimage}
                alt="Paella dish"
              />
            </Stack>
          </CardContent>
        </Card>
      )} */}
    </>
  );
};

export default HeaderPage;
