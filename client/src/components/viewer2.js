import React, { useState } from 'react';
import { Box, Toolbar, Container, Grid, Paper, Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const images = ["/images/sample.jpg", "/images/sample2.jpg"]; // Array of image URLs

const Slideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    return (
        <Box
            component="main"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'auto',
            }}
        >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    height="auto"
                                    image={images[currentIndex]}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {"hello"}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                        <Card>
                            <ArrowBackIcon onClick={handlePrevious} style={{ position: 'absolute', top: '50%', left: '100px', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                        </Card>
                        <Card>
                        <ArrowForwardIcon onClick={handleNext} style={{ position: 'absolute', top: '50%', right: '100px', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Slideshow;
