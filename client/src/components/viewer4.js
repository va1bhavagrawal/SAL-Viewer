import React, { useEffect, useRef } from 'react';
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
    const viewerRef = useRef(null);

    useEffect(() => {
        var imageId = document.getElementById("fuck")
        // Initialize Viewer when component mounts
        const viewer = new Viewer(imageId, {
            button: true, // Enables the next and previous buttons
        });
        viewerRef.current = viewer;

        return () => {
            // Cleanup function to destroy Viewer instance when component unmounts
            if (viewerRef.current) {
                viewerRef.current.destroy();
            }
        };
    }, []); // Empty dependency array to run only once on component mount

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Card>
                        <CardActionArea>
                            <div ref={viewerRef}>
                                <CardMedia
                                    id="fuck"
                                    component="img"
                                    height="auto"
                                    image="/images/sample.jpg" // Display the first image
                                    onClick={() => {
                                        if (viewerRef.current) {
                                            viewerRef.current.view(); // Show clicked image in the Viewer
                                        }
                                    }}
                                />
                            </div>
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
