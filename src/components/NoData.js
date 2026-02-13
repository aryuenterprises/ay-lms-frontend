// SimpleNoData.js
import { Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const NoData = ({ title }) => {
  return (
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <Typography variant="subtitle1">{title}</Typography>
    </Grid>
  );
};

NoData.propTypes = {
  title: PropTypes.string
};

export default NoData;
