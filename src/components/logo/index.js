import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// material-ui
import { ButtonBase } from '@mui/material';

// project-imports
import { APP_DEFAULT_PATH, APP_PATH_BASE_URL } from 'config';
import axiosInstance from 'utils/axios';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ isIcon, sx, to }) => {
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');

  useEffect(() => {
    const fetchLogoData = async () => {
      try {
        const res = await axiosInstance.get(`${APP_PATH_BASE_URL}api/pics`);
        // setLogoData(res.data);
        const mainIcon = res.data.data.general_logo_url;
        const favIcon = res.data.data.secondary_logo_url;
        setLogo(mainIcon);
        setFavicon(favIcon);
      } catch (err) {
        console.error('Failed to fetch logo data:', err);
      }
    };

    fetchLogoData();
  }, []);

  // Render loading state or default logo while fetching
  return (
    <ButtonBase
    disableRipple
    component={Link}
    to={!to ? APP_DEFAULT_PATH : to}
    sx={sx}
  >
    <img
      src={isIcon ? favicon : logo}
      alt="Logo"
      style={{
        height: 35,        // change this value (30–45 ideal)
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  </ButtonBase>
  );
};

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
