// export default InvoiceDesign;
import { Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import React from 'react';
import logo from 'assets/images/aryuheader.6ffbb16eea626a6d3575aba6abfe8819.svg';

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: 850,
    margin: '30px auto',
    border: '1px solid #ddd',
    boxShadow: '0 2px 8px #f1f1f1',
    background: '#fff'
  },
  header: { display: 'flex', alignItems: 'center', borderBottom: '2px solid #eee', padding: 2 },
  borderBottom: { borderBottom: '1px solid #ddd' },
  logo: { height: 60, marginRight: 20 },
  title: { fontWeight: 700, fontSize: 26, color: 'black' },
  title2: { fontWeight: 600 },
  table: { borderCollapse: 'collapse', width: '100%', marginX: 0, marginY: 2, border: '1px solid #ddd' },
  th: { border: '1px solid #ddd', padding: 1.5, background: '#fafafa', fontWeight: 600, textAlign: 'right' },
  td: { border: '1px solid #ddd', padding: 1.5, textAlign: 'right' },
  section: { padding: 2, mt: 1 },
  section1: { padding: 2 },
  bank: { background: '#fafafa', padding: 2, margin: '10px 0', fontSize: 15 },
  declaration: { background: '#f9f9f9', padding: 2, fontSize: 15, minHeight: 64 }
};

const InvoiceDesign = () => (
  <MainCard sx={styles.container}>
    {/* Header */}
    <Grid container justifyContent={'space-between'} sx={styles.header}>
      <Grid item>
        <img src={logo} alt="Company Logo" style={styles.logo} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Stack direction="row">
          <Typography sx={styles.title2} width={120}>
            Invoice No
          </Typography>
          <Typography>: AA241201</Typography>
        </Stack>
        <Stack direction="row">
          <Typography sx={styles.title2} width={120}>
            Dated
          </Typography>
          <Typography>: 04-12-2024</Typography>
        </Stack>
        <Stack direction="row">
          <Typography sx={styles.title2} width={120}>
            Payment Terms
          </Typography>
          <Typography>: within 30 days</Typography>
        </Stack>
      </Grid>
    </Grid>

    <Grid container sx={styles.section}>
      {/* Invoice Details */}
      <Grid item xs={12} md={7}>
        <Grid direction={'column'}>
          <Typography>No. 44(33), Jayammal Street, Ayyavoo Colony</Typography>
          <Typography> Aminjikarai, Chennai, Tamil Nadu - 600029.</Typography>
          <Stack direction="row">
            <Typography sx={styles.title2}>Email</Typography>
            <Typography>: yuvaraj@aryuenterprises.com</Typography>
          </Stack>
          <Stack direction="row">
            <Typography sx={styles.title2}>Phone No</Typography>
            <Typography>: 9994715106</Typography>
          </Stack>
          <Stack direction="row">
            <Typography sx={styles.title2}>Website</Typography>
            <Typography>: https://aryuenterprises.com</Typography>
          </Stack>
        </Grid>
      </Grid>

      <Grid item xs={12} md={5}>
        <Typography variant="h6">Buyer (Bill to):</Typography>
        <Typography>M.Vignesh Kumar</Typography>
        <Typography>765/8,F1, Sri Sai Square, 4th Kagithapuram Street, 2nd cross, Kolathur Chennai - 600117</Typography>
        <Stack direction="row">
          <Typography sx={styles.title2}>Mobile</Typography>
          <Typography>: 7845245078</Typography>
        </Stack>
      </Grid>
    </Grid>

    <Grid container spacing={2} sx={styles.section1}>
      {/* Service Table */}
      <Grid item xs={12}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.th}>Sl NO</TableCell>
              <TableCell sx={styles.th}>Description of service</TableCell>
              <TableCell sx={styles.th}>Quantity</TableCell>
              <TableCell sx={styles.th}>Rate</TableCell>
              <TableCell sx={styles.th}>Per</TableCell>
              <TableCell sx={styles.th}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={styles.td}>1</TableCell>
              <TableCell sx={styles.td}>test</TableCell>
              <TableCell sx={styles.td}>1 Nos</TableCell>
              <TableCell sx={styles.td}>₹ 0.00</TableCell>
              <TableCell sx={styles.td}>Nos</TableCell>
              <TableCell sx={styles.td}>-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', margin: '5px 0', width: '100%' }}>
          <Typography sx={styles.title2}>Total Value:</Typography>
          <Typography sx={styles.title2}>₹ 0.00</Typography>
        </Stack>
      </Grid>

      {/* Amount in Words */}
      <Grid item xs={12}>
        <Typography>
          <Typography sx={styles.title2}>Amount Chargeable (in Words)</Typography>
        </Typography>
        <Typography>Forty Thousand Rupees Only.</Typography>
      </Grid>

      {/* Bank Details */}
      <Grid item xs={12}>
        <Grid sx={styles.bank}>
          <Stack direction="row">
            <Typography sx={styles.title2} gutterBottom>
              Companys Bank Details
            </Typography>
          </Stack>
          <Stack direction="row">
            <Typography sx={styles.title2} width={120}>
              Bank Name
            </Typography>
            <Typography>: KOTAK BANK</Typography>
          </Stack>
          <Stack direction="row">
            <Typography sx={styles.title2} width={120}>
              A/c No
            </Typography>
            <Typography>: 1548305749</Typography>
          </Stack>
          <Stack direction="row">
            <Typography sx={styles.title2} width={120}>
              IFSC/BR
            </Typography>
            <Typography>: KKBK0000468 / T.Nagar</Typography>
          </Stack>
        </Grid>
      </Grid>

      {/* Declaration and Signature */}
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={8}>
            <Stack sx={styles.declaration}>
              <Typography variant="subtitle1" gutterBottom>
                Declaration
              </Typography>
              <Typography>
                We declare that this invoice shows the actual price of the service described and that all particulars are true and correct.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'right', alignSelf: 'flex-end' }}>
            <Typography>for ARYU ACADEMY</Typography>
            <Typography sx={{ marginTop: 5, fontWeight: 'bold' }}>Authorized Signatory</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </MainCard>
);

export default InvoiceDesign;
