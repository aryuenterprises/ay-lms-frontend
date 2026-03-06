import { Box, Container, Grid, Typography } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Login from "pages/auth/auth1/login";

/* ---------------- Floating Bubble ---------------- */
const Bubble = ({ size, top, left, right, bottom, delay }) => (
  <Box
    component={motion.div}
    animate={{ y: [0, -30, 0], opacity: [0.5, 0.9, 0.5] }}
    transition={{ duration: 18, repeat: Infinity, delay }}
    sx={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(255, 180, 180, 0.35)",
      top,
      left,
      right,
      bottom,
      zIndex: 0,
    }}
  />
);

const HeaderPage = () => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const leftInView = useInView(leftRef, { once: true, margin: "-100px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-100px" });

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #fff5f7 0%, #ffffff 60%)",
      }}>
      {/* ===== Background Blobs ===== */}
      <Bubble size={420} top="20%" right="-120px" delay={2} />
      <Bubble size={220} bottom="-100px" left="30%" delay={4} />
      <Bubble size={180} bottom="20%" right="40%" delay={6} />
      <Bubble size={260} top="-80px" left="-80px" delay={0} />

      {/* ===== Main Content ===== */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          minHeight: "84vh",
          px: { xs: 2.5, sm: 4, md: 20 },
          mt: { xs: 8, md: 10 },
          position: "relative",
          zIndex: 1,
        }}>
        <Grid container spacing={{ xs: 6, md: 4, mt: 5 }} alignItems="center">
          {/* ===== LEFT CONTENT ===== */}
          <Grid
            item
            xs={12}
            md={7}
            display="flex"
            justifyContent={{ xs: "center", md: "flex-start" }}
            textAlign={{ xs: "center", md: "left" }}>
            <Box ref={leftRef} sx={{ maxWidth: 560 }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={leftInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: "easeOut" }}>
                <Typography
                  sx={{
                    fontSize: { xs: "2.2rem", md: "3.8rem" },
                    fontWeight: 800,
                    mt: 5,
                    lineHeight: 1.15,
                    color: "#1c1c1c",
                  }}>
                  Welcome to{" "}
                  <Box component="span" sx={{ color: "#e63946" }}>
                    Aryu
                    <br />
                    Academy
                  </Box>
                  <br />
                  Student Portal
                </Typography>

                {/* Underline */}
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}>
                  <svg
                    width="200"
                    height="24"
                    viewBox="0 0 200 24"
                    style={{ overflow: "visible" }}>
                    <motion.path
                      d="
                    M6 30
                    C 50 9, 150 10, 130 30
                    C 80 12, 215 5, 280 15
                    "
                      stroke="#b71c1c"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1 }}
                    />
                  </svg>
                </Box>

                <Typography
                  sx={{
                    maxWidth: 520,
                    fontSize: 16,
                    lineHeight: 1.7,
                    mt: 3,
                    color: "#555",
                  }}>
                  Your personalized dashboard for accessing course materials,
                  schedules, assignments, progress tracking, and academic tools.
                </Typography>
              </motion.div>
            </Box>
          </Grid>

          {/* ===== RIGHT LOGIN (GLASS CARD) ===== */}
          <Grid item xs={12} md={5} display="flex" justifyContent="center">
            <motion.div
              ref={rightRef}
              initial={{ opacity: 0, y: 50 }}
              animate={rightInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              style={{ width: "100%", maxWidth: 380 }}>
              {/* Glass Card */}
              <Box
                sx={{
                  p: { xs: 0, sm: 5 },
                  // borderRadius: 4,
                  // background: 'rgba(255,255,255,0.55)',
                  // backdropFilter: 'blur(14px)',
                  // boxShadow: '0 25px 45px rgba(0,0,0,0.15)',
                  // border: '1px solid rgba(255,255,255,0.35)',
                  animation: "float 6s ease-in-out infinite",
                }}>
                <Login />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* ===== Floating Animation ===== */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeaderPage;
