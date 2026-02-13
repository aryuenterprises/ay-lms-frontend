import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Container
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserData, getLeaderboardStats } from './leaderboardData';

const MotionCard = motion(Card);

// Professional color palette
const COLORS = {
  primary: '#27323dff', // Dark blue-gray
  secondary: '#141414ec', // Bright blue
  accent: '#E74C3C', // Red accent
  success: '#2ECC71', // Green
  warning: '#F39C12', // Orange
  background: '#F8F9FA', // Light gray background
  text: '#2C3E50', // Dark text
  lightText: '#7F8C8D', // Gray text
  white: '#FFFFFF',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray800: '#343A40'
};

const EventPoints = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [sortedUsers, setSortedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);
  const [updatedUserIds, setUpdatedUserIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const previousPositions = useRef({});
  const animationId = useRef(0);
  const requestRef = useRef();

  // Initialize and fetch data
  useEffect(() => {
    loadUserData();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Optimized data loading with throttling
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserData();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      setUsers([]);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized sorting with memoization
  useEffect(() => {
    if (users.length === 0) return;

    const sorted = [...users].sort((a, b) => b.points - a.points);

    const withRank = sorted.map((user, index) => {
      const rank = index + 1;
      const previousRank = previousPositions.current[user.id] || user.previousPosition || rank;
      const positionChange = previousRank - rank;

      let changeIcon;
      let changeColor;
      if (positionChange > 0) {
        changeIcon = <TrendingUpIcon fontSize="small" />;
        changeColor = COLORS.success;
      } else if (positionChange < 0) {
        changeIcon = <TrendingDownIcon fontSize="small" />;
        changeColor = COLORS.accent;
      } else {
        changeIcon = <TrendingFlatIcon fontSize="small" />;
        changeColor = COLORS.lightText;
      }

      return {
        ...user,
        rank,
        positionChange,
        changeIcon,
        changeColor,
        changeText: positionChange > 0 ? `+${positionChange}` : positionChange.toString(),
        previousRank
      };
    });

    const newPositions = {};
    withRank.forEach((user) => {
      newPositions[user.id] = user.rank;
    });
    previousPositions.current = newPositions;

    setSortedUsers(withRank);
  }, [users]);

  // Split users into top 3 and others
  const topThreeUsers = sortedUsers.slice(0, 3);
  const otherUsers = sortedUsers.slice(3);
  const visibleOtherUsers = showAllUsers ? otherUsers : otherUsers.slice(0, 8);

  // Optimized simulation with requestAnimationFrame
  const simulateLiveUpdate = useCallback(async () => {
    if (simulationActive || users.length === 0) return;

    setSimulationActive(true);
    setError(null);
    const currentAnimationId = ++animationId.current;

    try {
      // Create a Set of all user IDs for animation highlighting
      const allUserIds = new Set(users.map((user) => user.id));
      setUpdatedUserIds(allUserIds);

      // Use requestAnimationFrame for smoother animations
      const animateUpdate = () => {
        // Update points for ALL users
        const updatedUsers = users.map((user) => {
          // Generate a random point change for each user
          const pointChange = Math.floor(Math.random() * 80) + 20;

          return {
            ...user,
            points: user.points + pointChange,
            previousPosition: user.rank || user.previousPosition
          };
        });

        setUsers(updatedUsers);

        // Clean up animation
        setTimeout(() => {
          if (currentAnimationId === animationId.current) {
            setUpdatedUserIds(new Set());
            setSimulationActive(false);
          }
        }, 600);
      };

      // Schedule animation for next frame
      requestRef.current = requestAnimationFrame(() => {
        setTimeout(animateUpdate, 50); // Small delay for visual feedback
      });
    } catch (err) {
      setError('Failed to update points');
      setSimulationActive(false);
      setUpdatedUserIds(new Set());
      setSnackbarOpen(true);
    }
  }, [users, simulationActive]);

  // Get medal icon based on rank
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <MilitaryTechIcon sx={{ fontSize: 32, color: COLORS.gold }} />;
      case 2:
        return <MilitaryTechIcon sx={{ fontSize: 28, color: COLORS.silver }} />;
      case 3:
        return <MilitaryTechIcon sx={{ fontSize: 24, color: COLORS.bronze }} />;
      default:
        return (
          <Typography variant="body1" fontWeight="bold" color={COLORS.text}>
            #{rank}
          </Typography>
        );
    }
  };

  // Get background color based on rank
  const getRankBackground = (rank) => {
    if (rank <= 3) {
      switch (rank) {
        case 1:
          return `linear-gradient(135deg, ${COLORS.gold}15 0%, ${COLORS.secondary}15 100%)`;
        case 2:
          return `linear-gradient(135deg, ${COLORS.silver}15 0%, ${COLORS.primary}15 100%)`;
        case 3:
          return `linear-gradient(135deg, ${COLORS.bronze}15 0%, ${COLORS.warning}15 100%)`;
      }
    }

    // Gradient based on rank for other positions
    const intensity = Math.min(15, Math.floor((rank / sortedUsers.length) * 20));
    return `linear-gradient(135deg, ${COLORS.secondary}${5 + intensity} 0%, ${COLORS.primary}${5 + intensity} 100%)`;
  };

  // Calculate progress percentage
  const calculateProgress = (points) => {
    const maxPoints = Math.max(...sortedUsers.map((u) => u.points), 2000);
    return Math.min((points / maxPoints) * 100, 100);
  };

  // Get stats for header
  const stats = getLeaderboardStats(users);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: COLORS.secondary }} size={60} />
      </Box>
    );
  }

  // Smooth podium cards render
  const renderPodiumCards = () => {
    const displayOrder = topThreeUsers.length === 3 ? [topThreeUsers[1], topThreeUsers[0], topThreeUsers[2]] : topThreeUsers;

    return (
      <Container maxWidth="lg" sx={{ mb: 3, px: { xs: 1, sm: 2 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: COLORS.primary,
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600
            }}
          >
            Top 3 Champions
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="center" alignItems="flex-end">
          <AnimatePresence>
            {displayOrder.map((user, index) => {
              const isUpdated = updatedUserIds.has(user.id);
              const podiumHeight = { xs: 180, sm: user.rank === 1 ? 220 : 200 };
              const fontSize = user.rank === 1 ? 'h5' : user.rank === 2 ? 'h6' : 'h6';
              const avatarSize = { xs: 50, sm: user.rank === 1 ? 60 : 50 };

              return (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  key={user.id}
                  sx={{
                    order: { xs: user.rank, sm: user.rank === 1 ? 2 : user.rank === 2 ? 1 : 3 }
                  }}
                >
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                      mass: 0.8
                    }}
                    style={{ height: '100%' }}
                  >
                    <MotionCard
                      sx={{
                        height: podiumHeight,
                        background: getRankBackground(user.rank),
                        border: `2px solid ${user.rank === 1 ? COLORS.gold : user.rank === 2 ? COLORS.silver : COLORS.bronze}`,
                        borderRadius: '16px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(44, 62, 80, 0.1)'
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: '0 15px 35px rgba(44, 62, 80, 0.15)',
                        transition: { duration: 0.3 }
                      }}
                      layout
                      layoutId={`podium-${user.id}`}
                    >
                      {/* Rank Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: index * 0.1 + 0.2,
                          type: 'spring',
                          stiffness: 200,
                          damping: 10
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: COLORS.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: `2px solid ${user.rank === 1 ? COLORS.gold : user.rank === 2 ? COLORS.silver : COLORS.bronze}`,
                            zIndex: 2
                          }}
                        >
                          {getMedalIcon(user.rank)}
                        </Box>
                      </motion.div>

                      <CardContent
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pt: 5,
                          pb: 1.5,
                          px: 1
                        }}
                      >
                        {/* Avatar */}
                        <motion.div animate={isUpdated ? { rotateY: 360 } : {}} transition={{ duration: 0.6, ease: 'easeInOut' }}>
                          <Avatar
                            sx={{
                              width: avatarSize,
                              height: avatarSize,
                              bgcolor: COLORS.secondary,
                              border: `2px solid ${user.rank === 1 ? COLORS.gold : user.rank === 2 ? COLORS.silver : COLORS.bronze}`,
                              mb: 1,
                              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Typography variant="h5" fontWeight="bold" color={COLORS.white}>
                              {user.name.charAt(0)}
                            </Typography>
                          </Avatar>
                        </motion.div>

                        {/* Name */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 + 0.1 }}>
                          <Typography
                            variant={fontSize}
                            fontWeight="600"
                            sx={{
                              mb: 0.5,
                              color: COLORS.primary,
                              textAlign: 'center',
                              fontSize: { xs: '0.9rem', sm: user.rank === 1 ? '1.1rem' : '1rem' }
                            }}
                          >
                            {user.name.length > 12 ? `${user.name.substring(0, 10)}...` : user.name}
                          </Typography>
                        </motion.div>

                        {/* Points */}
                        <motion.div
                          key={`points-${user.id}-${user.points}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 15,
                            delay: index * 0.1 + 0.2
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            sx={{
                              color: COLORS.secondary,
                              mb: 1,
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            {user.points.toLocaleString()}
                          </Typography>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '80%' }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                          style={{ width: '80%', marginBottom: '8px' }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(user.points)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: COLORS.gray200,
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${COLORS.secondary} 0%, ${COLORS.success} 100%)`,
                                borderRadius: 3
                              }
                            }}
                          />
                        </motion.div>

                        {/* Position Change */}
                        <motion.div
                          key={`change-${user.id}-${user.positionChange}`}
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 15,
                            delay: index * 0.1 + 0.4
                          }}
                        >
                          <Chip
                            icon={user.changeIcon}
                            label={`${user.positionChange > 0 ? '+' : ''}${user.positionChange}`}
                            sx={{
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              px: 1,
                              py: 0.2,
                              height: 22,
                              background: user.changeColor,
                              border: `1px solid ${user.changeColor}30`,
                              color: COLORS.white,
                              '& .MuiChip-icon': {
                                color: COLORS.white
                              }
                            }}
                          />
                        </motion.div>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      </Container>
    );
  };

  // Smooth other users render
  const renderOtherUsers = () => (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            color: COLORS.primary,
            textAlign: 'center',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600
          }}
        >
          Other Participants ({otherUsers.length})
        </Typography>
      </motion.div>

      <Grid container spacing={1}>
        <AnimatePresence>
          {visibleOtherUsers.map((user, index) => {
            const isUpdated = updatedUserIds.has(user.id);

            return (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: Math.min(index * 0.03, 0.5),
                    type: 'spring',
                    stiffness: 150,
                    damping: 15
                  }}
                  layout
                  layoutId={`user-${user.id}`}
                >
                  <MotionCard
                    sx={{
                      background: getRankBackground(user.rank),
                      border: `1px solid ${COLORS.gray300}`,
                      borderRadius: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 8px 24px rgba(44, 62, 80, 0.1)',
                      borderColor: COLORS.secondary
                    }}
                    layout
                  >
                    <CardContent sx={{ py: 1, px: 1.5 }}>
                      <Grid container alignItems="center" spacing={1}>
                        {/* Rank */}
                        <Grid item xs={2} sm={1}>
                          <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography
                                variant="body2"
                                fontWeight="600"
                                sx={{
                                  color: COLORS.primary,
                                  fontSize: '0.85rem',
                                  opacity: 0.9
                                }}
                              >
                                #{user.rank}
                              </Typography>
                            </Box>
                          </motion.div>
                        </Grid>

                        {/* Avatar and Name */}
                        <Grid item xs={4} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <motion.div animate={isUpdated ? { rotateY: 360 } : {}} transition={{ duration: 0.5, ease: 'easeInOut' }}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor: COLORS.secondary,
                                  border: `1px solid ${COLORS.white}`,
                                  fontSize: '0.8rem'
                                }}
                              >
                                <Typography variant="caption" color={COLORS.white}>
                                  {user.name.charAt(0)}
                                </Typography>
                              </Avatar>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(index * 0.03 + 0.1, 0.6) }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight="500"
                                sx={{
                                  color: COLORS.text,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {user.name.length > 12 ? `${user.name.substring(0, 10)}...` : user.name}
                              </Typography>
                            </motion.div>
                          </Box>
                        </Grid>

                        {/* Points */}
                        <Grid item xs={3} sm={3}>
                          <motion.div
                            key={`other-points-${user.id}-${user.points}`}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 15
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              sx={{
                                color: COLORS.secondary,
                                fontSize: '0.85rem',
                                marginLeft: 5.5
                              }}
                            >
                              {user.points.toLocaleString()}
                            </Typography>
                          </motion.div>
                        </Grid>

                        {/* Progress */}
                        <Grid item xs={3} sm={3}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{
                              delay: Math.min(index * 0.03 + 0.2, 0.7),
                              duration: 0.4
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={calculateProgress(user.points)}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: COLORS.gray200,
                                  flexGrow: 1,
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${COLORS.secondary} 0%, ${COLORS.success} 100%)`,
                                    borderRadius: 2
                                  }
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: COLORS.lightText,
                                  opacity: 0.9,
                                  minWidth: 25,
                                  fontSize: '0.7rem'
                                }}
                              >
                                {Math.round(calculateProgress(user.points))}%
                              </Typography>
                            </Box>
                          </motion.div>
                        </Grid>

                        {/* Change */}
                        <Grid item xs={2} sm={2}>
                          <motion.div
                            key={`other-change-${user.id}-${user.positionChange}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 15,
                              delay: Math.min(index * 0.03 + 0.3, 0.8)
                            }}
                          >
                            <Chip
                              icon={user.changeIcon}
                              label={user.changeText}
                              size="small"
                              sx={{
                                fontWeight: '600',
                                fontSize: '0.65rem',
                                height: 20,
                                background: user.changeColor,
                                color: COLORS.white,
                                border: `1px solid ${user.changeColor}30`,
                                '& .MuiChip-icon': {
                                  fontSize: '0.7rem',
                                  marginLeft: '4px',
                                  color: COLORS.white
                                }
                              }}
                            />
                          </motion.div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Show More/Less Button */}
      {otherUsers.length > 8 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              onClick={() => setShowAllUsers(!showAllUsers)}
              endIcon={showAllUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: COLORS.secondary,
                borderColor: COLORS.secondary,
                '&:hover': {
                  borderColor: COLORS.primary,
                  backgroundColor: `${COLORS.secondary}10`
                },
                fontWeight: 500
              }}
              variant="outlined"
              size="small"
            >
              {showAllUsers ? `Show Less (${otherUsers.length} total)` : `Show More (+${otherUsers.length - 8})`}
            </Button>
          </Box>
        </motion.div>
      )}
    </Container>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.white} 100%)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        color: COLORS.text,
        overflowX: 'hidden'
      }}
    >
      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      {/* Main content with proper scrolling */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
          py: 2
        }}
      >
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
          <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box
              sx={{
                textAlign: 'center',
                mb: 2,
                p: 2,
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.gray100} 100%)`,
                border: `1px solid ${COLORS.gray300}`,
                boxShadow: '0 8px 32px rgba(44, 62, 80, 0.08)'
              }}
            >
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >
                <EmojiEventsIcon sx={{ fontSize: 40, mb: 1, filter: 'drop-shadow(0 0 10px #707070ff)' }} />
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  sx={{
                    color: COLORS.primary,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Live Quiz Leaderboard
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Typography variant="body2" sx={{ color: COLORS.lightText, mb: 2, fontSize: '0.85rem' }}>
                  Real-time ranking updates with smooth animations
                </Typography>
              </motion.div>

              {/* Stats Overview */}
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {[
                  { value: stats.totalParticipants, label: 'Total Participants', color: COLORS.primary },
                  { value: stats.highestScore, label: 'Highest Score', color: COLORS.success },
                  { value: stats.averageScore, label: 'Average Score', color: COLORS.secondary }
                ].map((stat, index) => (
                  <Grid item xs={4} key={index}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      <Paper
                        sx={{
                          p: 1,
                          background: `${stat.color}08`,
                          borderRadius: '12px',
                          border: `1px solid ${stat.color}20`
                        }}
                      >
                        <motion.div
                          key={stat.value}
                          initial={{ scale: 0.7 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                        >
                          <Typography variant="h6" fontWeight="700" color={stat.color}>
                            {stat.value}
                          </Typography>
                        </motion.div>
                        <Typography variant="caption" color={COLORS.lightText}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ zIndex: 10, marginBottom: 16 }}>
          <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button
                  variant="contained"
                  onClick={simulateLiveUpdate}
                  disabled={simulationActive || users.length === 0}
                  startIcon={<RefreshIcon />}
                  sx={{
                    background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                    color: COLORS.white,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
                    },
                    minWidth: 140,
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
                  }}
                >
                  {simulationActive ? 'Updating...' : 'Live Update'}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button
                  variant="outlined"
                  onClick={loadUserData}
                  disabled={loading}
                  sx={{
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    '&:hover': {
                      borderColor: COLORS.secondary,
                      backgroundColor: `${COLORS.secondary}10`
                    },
                    minWidth: 140,
                    fontWeight: 600
                  }}
                >
                  Refresh Data
                </Button>
              </motion.div>
            </Box>
          </Container>
        </motion.div>

        {/* Top 3 Podium */}
        {topThreeUsers.length > 0 && renderPodiumCards()}

        {/* Other Participants */}
        {otherUsers.length > 0 && renderOtherUsers()}

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Typography
            sx={{
              mt: 3,
              pt: 2,
              textAlign: 'center',
              bgcolor: `${COLORS.primary}08`,
              px: 2,
              py: 1,
              borderTop: `1px solid ${COLORS.gray300}`,
              fontSize: '0.75rem',
              color: COLORS.lightText
            }}
          >
            © {new Date().getFullYear()} • Aryu Event Portal • Live Leaderboard Updates
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default EventPoints;
