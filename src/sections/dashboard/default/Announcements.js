import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import twemoji from 'twemoji';

const Announcements = ({ announcements = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [index, setIndex] = useState(0);
  const [duration, setDuration] = useState(10);

  const textRef = useRef(null);

  const processedAnnouncements = announcements.map((a) => ({
    id: a?.id || '',
    content: a?.content || 'No content available'
  }));

  const EmojiText = ({ text }) => (
    <Box component="span" dangerouslySetInnerHTML={{ __html: twemoji.parse(text) }} />
  );

  useEffect(() => {
    if (!textRef.current || processedAnnouncements.length === 0) return;

    const textWidth = textRef.current.offsetWidth;
    const containerWidth = window.innerWidth;

    const totalDistance = textWidth + containerWidth;
    const speed = 120;

    const newDuration = totalDistance / speed;
    setDuration(newDuration);

    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % processedAnnouncements.length);
    }, newDuration * 1000);

    return () => clearTimeout(timer);
  }, [index, processedAnnouncements.length]);

  if (processedAnnouncements.length === 0) return null;

  const current = processedAnnouncements[index];

  return (
    <Box
      sx={{
        backgroundColor: 'rgb(107, 107, 107)',
        px: 2,
        py: 1,
        overflow: 'hidden',
        position: 'relative',
        height: 40,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Typography
        ref={textRef}
        key={index}
        variant={isMobile ? 'body1' : 'h6'}
        sx={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          animation: `ticker ${duration}s linear forwards`,
          color: 'white',
          fontSize: '18px'
        }}
      >
        <EmojiText text={current.content} />
      </Typography>

      <style>
        {`
        @keyframes ticker {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        `}
      </style>
    </Box>
  );
};

Announcements.propTypes = {
  announcements: PropTypes.array
};

export default React.memo(Announcements);
