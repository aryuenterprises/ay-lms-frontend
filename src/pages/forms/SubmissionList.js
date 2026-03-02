import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  Paper,
  Stack,
  Fade,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/* ================= COMPONENT ================= */
const SubmissionList = ({ questions, onSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  /* -------- BUILD SUBMISSIONS + SEARCH INDEX -------- */
  const submissions = useMemo(() => {
    const map = {};

    questions.forEach((q) => {
      q.answers?.forEach((a) => {
        if (!map[a.submission_uuid]) {
          map[a.submission_uuid] = {
            uuid: a.submission_uuid,
            submitted_at: a.submitted_at,
            answers: [],
            searchIndex: ''
          };
        }

        map[a.submission_uuid].answers.push({
          question: q.label,
          ...a
        });
      });
    });

    return Object.values(map)
      .map((s) => {
        const answerText = s.answers
          .map((a) =>
            [
              a.question,
              a.value_text,
              a.value_number,
              Array.isArray(a.value_json)
                ? a.value_json.join(' ')
                : a.value_json
            ]
              .filter(Boolean)
              .join(' ')
          )
          .join(' ');

        return {
          ...s,
          searchIndex: `${s.uuid} ${answerText}`.toLowerCase()
        };
      })
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  }, [questions]);

  /* -------- FILTER -------- */
  const filtered = useMemo(() => {
    if (!search) return submissions;
    return submissions.filter((s) =>
      s.searchIndex.includes(search.toLowerCase())
    );
  }, [search, submissions]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        borderRight: isMobile ? 'none' : '1px solid #e0e0e0'
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 2,
          bgcolor: '#fff'
        }}
      >
        <Typography fontWeight={700} mb={1}>
          Submissions ({filtered.length})
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Search name, answer, keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Divider />

      {/* ================= LIST ================= */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: isMobile ? 1.5 : 1,
          py: 1
        }}
      >
        <Stack spacing={isMobile ? 1.5 : 1}>
          {filtered.map((s, index) => (
            <Fade in timeout={150 + index * 30} key={s.uuid}>
              <Paper
                onClick={() => {
                  setActive(s.uuid);
                  onSelect(s);
                }}
                sx={{
                  p: isMobile ? 2 : 1.8,
                  borderRadius: 2.5,
                  cursor: 'pointer',
                  border:
                    active === s.uuid
                      ? '2px solid'
                      : '1px solid transparent',
                  borderColor:
                    active === s.uuid ? 'primary.main' : 'transparent',
                  bgcolor:
                    active === s.uuid
                      ? 'primary.lighter'
                      : '#fafafa',
                  transition: 'all 0.2s ease',
                  '&:hover': !isMobile
                    ? {
                        bgcolor: 'primary.lighter',
                        transform: 'translateX(2px)'
                      }
                    : undefined
                }}
              >
                <Typography fontWeight={600}>
                  Submission #{filtered.length - index}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {new Date(s.submitted_at).toLocaleString()}
                </Typography>
              </Paper>
            </Fade>
          ))}

          {filtered.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              mt={4}
            >
              No submissions found
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SubmissionList;