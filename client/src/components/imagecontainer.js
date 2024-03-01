import React from 'react';
import { Grid, Paper } from '@mui/material';

function ViewerPage() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper>
          {/* Place your image here */}
          <img src="/images/sample.jpg" alt="sample.jpg" style={{ width: '100%' }} />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ViewerPage;
