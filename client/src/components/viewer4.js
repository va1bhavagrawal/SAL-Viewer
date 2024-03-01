import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.min.css';

const MyComponent = () => {
    useEffect(() => {
        const viewer = new Viewer(document.getElementById('image-gallery'));
        return () => {
            viewer.destroy();
        };
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <CardActionArea id="image-gallery">
                            <CardMedia
                                component="img"
                                height="auto"
                                image="/images/sample2.jpg"
                            />
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {"hello"}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default MyComponent;
