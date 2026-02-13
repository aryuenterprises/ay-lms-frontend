import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import Error404 from 'pages/maintenance/error/404';
import { APP_PATH_BASE_URL } from 'config';
import FooterBlock from 'layout/CommonLayout/FooterBlock';

const CmsTemplate = () => {
  const { title } = useParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (title) {
      fetchData(title);
    } else {
      setError(true);
    }
  }, [title]);

  const fetchData = async (title) => {
    try {
      setLoading(true);
      const response = await axios.get(`${APP_PATH_BASE_URL}/api/cms/${title}`);
      // console.log('response :', response);
      setHtmlContent(response.data.description || '');
      // if (response.data.success === true) {
      //   setHtmlContent(response.data.data.descrption || '');
      // } else {
      //   setHtmlContent('');
      // }
    } catch (error) {
      console.error('Error fetching CMS data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <Error404 />;
  }

  if (loading) {
    return (
      <MainCard sx={{ width: '100%', height: 'auto', margin: '30px auto', p: 3 }}>
        <Typography variant="h6" align="center">
          Loading content...
        </Typography>
      </MainCard>
    );
  }

  return (
    <>
      {/* <MainCard
        sx={{
          width: '100%',
          height: 'auto',
          margin: '30px auto',
          pb: { md: 1, xs: 7 },
          pt: { md: 0.25, xs: 2.5 }
        }}
      > */}
      <Grid
        container
        sx={{
          width: '80%',
          minHeight: '400px',
          marginTop: '40px',
          marginLeft: 'auto',
          marginRight: 'auto',
          pb: { md: 1, xs: 7 },
          pt: { md: 0.25, xs: 2.5 }
        }}
      >
        <Grid item xs={12}>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </Grid>
      </Grid>
      <FooterBlock isFull />
      {/* </MainCard> */}

      {/* <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} textAlign="center">
          <Typography variant="body1">© {new Date().getFullYear()} Aryu. All Rights Reserved.</Typography>
        </Grid>
      </Grid> */}
    </>
  );
};

export default CmsTemplate;
