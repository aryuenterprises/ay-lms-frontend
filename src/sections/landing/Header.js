// import { useTheme } from '@mui/material/styles';
import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Login from 'pages/auth/auth1/login';

// tech icons
// import techBootstrap from 'assets/images/landing/tech-bootstrap.svg';
// import techReact from 'assets/images/landing/tech-react.svg';
// import techMui from 'assets/images/landing/tech-mui.svg';
// import techHtml from 'assets/images/landing/tech-html.svg';
// import techCss from 'assets/images/landing/tech-css.svg';
// import techJavascript from 'assets/images/landing/tech-javascript.svg';
// import techWordpress from 'assets/images/landing/tech-wordpress.svg';
// import techPython from 'assets/images/landing/tech-python.svg';
// import techFigma from 'assets/images/landing/tech-figma.svg';
// import techNode from 'assets/images/landing/tech-nodejs.svg';

const Bubble = ({ size, top, left, right, bottom, delay }) => (
  <Box
    component={motion.div}
    animate={{
      y: [0, -30, 0],
      opacity: [0.6, 0.9, 0.6]
    }}
    transition={{
      duration: 18,
      repeat: Infinity,
      delay
    }}
    sx={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'rgba(255, 180, 180, 0.35)', // rose tone
      top,
      left,
      right,
      bottom,
      zIndex: 0
    }}
  />
);

const HeaderPage = () => {
  // const theme = useTheme();
  const scrollContainerRef = useRef(null);

  // const techIcons = [
  //   { name: 'Bootstrap 5', image: techBootstrap },
  //   { name: 'React', image: techReact },
  //   { name: 'React Material UI', image: techMui },
  //   { name: 'HTML', image: techHtml },
  //   { name: 'CSS', image: techCss },
  //   { name: 'JavaScript', image: techJavascript },
  //   { name: 'WordPress', image: techWordpress },
  //   { name: 'Node.js', image: techNode },
  //   { name: 'Python', image: techPython },
  //   { name: 'Figma Design System', image: techFigma }
  // ];

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
      {/* ================= PINK BLOB BACKGROUND ================= */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #fff5f7 0%, #ffffff 60%)'
        }}
      >
        {/* Blob 1 */}
        <Bubble size={420} top="20%" right="-120px" delay={2} />
        <Bubble size={220} bottom="-100px" left="30%" delay={4} />
        <Bubble size={180} bottom="10%" right="15%" delay={6} />
        <Bubble size={180} bottom="30%" right="40%" delay={6} />
        <Bubble size={100} top="60%" bottom="50%" right="48%" delay={6} />
        <Box sx={{ position: 'relative', zIndex: 2 }}></Box>
        <Bubble size={260} top="-80px" left="-80px" delay={0} />
        <Box
          component={motion.div}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(163, 108, 125, 0.25)',
            top: -120,
            left: -120,
            filter: 'blur(60px)',
            zIndex: 0
          }}
        />

        {/* Blob 2 */}
        <Box
          component={motion.div}
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity }}
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(226, 185, 199, 0.25)',
            bottom: -140,
            right: -140,
            filter: 'blur(70px)',
            zIndex: 0
          }}
        />

        {/* ================= MAIN CONTENT ================= */}
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            minHeight: '84vh',
            px: { xs: 10, md: 20 },
            mt: 10,
            mr: 10,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Grid container spacing={4} alignItems="stretch">
            {/* LEFT – WELCOME CONTENT */}
            {/* LEFT – LOGIN PAGE CONTENT */}
            <Grid item xs={12} md={7} display="flex" alignItems="center">
              <Box sx={{ mt: { xs: 6, md: 10 }, mb: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                >
                  {/* Heading */}
                  <Typography
                    sx={{
                      fontSize: { xs: '2.4rem', md: '3.8rem' },
                      fontWeight: 800,
                      lineHeight: 1.15,
                      color: '#1c1c1c'
                    }}
                  >
                    Welcome to the{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#e63946'
                      }}
                    >
                      Aryu
                      <br />
                      Academy
                    </Box>
                    <br />
                    Student Portal
                  </Typography>

                  {/* Decorative underline */}
                  <Box sx={{ mt: 1.5, ml: 1.5 }}>
                    <svg width="260" height="28" viewBox="0 0 260 28" fill="none" style={{ overflow: 'visible' }}>
                      <motion.path
                        d="
                    M6 30
                    C 50 9, 150 10, 130 30
                    C 80 12, 215 5, 280 15
                    "
                        stroke="#b71c1c"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 1.2,
                          ease: 'easeOut'
                        }}
                      />
                    </svg>
                  </Box>

                  {/* Description */}
                  <Typography
                    sx={{
                      maxWidth: 520,
                      fontSize: 16,
                      lineHeight: 1.7,
                      mt: 3,
                      color: '#555'
                    }}
                  >
                    Your personalized dashboard for accessing course materials, class schedules, assignments, progress tracking, and
                    academic tools.
                  </Typography>
                </motion.div>
              </Box>
            </Grid>

            {/* RIGHT – LOGIN */}
            <Grid item xs={10} md={5} display="flex" alignItems="center" pt={2}>
              <Box>
                <Login />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================= TECH ICONS SECTION ================= */}
    </>
  );
};

export default HeaderPage;
