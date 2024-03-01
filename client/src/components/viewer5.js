import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    card: {
        cursor: 'pointer',
    },
    focusedImage: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(1)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 9999,
        maxHeight: '90vh',
        maxWidth: '90vw',
        '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            cursor: 'zoom-in', // Change cursor to zoom-in on hover
        },
    },
}));

const MyComponent = () => {
    const classes = useStyles();
    const [isImageFocused, setIsImageFocused] = useState(false);
    const [transformStyle, setTransformStyle] = useState('translate(-50%, -50%) scale(1)');
    const [imageSrc, setImageSrc] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleImageClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleCardClick = (src) => {
        setImageSrc(src);
        setIsImageFocused(true);
    };

    const handleImageClose = () => {
        setIsImageFocused(false);
        setImageSrc('');
        setZoomLevel(1); // Reset zoom level when image is closed
    };

    const handleImageClick = (e) => {
        if (e.target.tagName === 'IMG') {
            // If the click occurred on the image itself, handle zoom
            const rect = e.target.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            if (e.ctrlKey) {
                // Control click
                setZoomLevel(zoomLevel > 1 ? zoomLevel - 1 : 1);
            } else {
                // Regular click
                const newZoomLevel = zoomLevel + 1;
                setZoomLevel(newZoomLevel);

                // Calculate new position to keep the clicked point centered
                const newX = offsetX - (offsetX - window.innerWidth / 2) * (newZoomLevel / zoomLevel);
                const newY = offsetY - (offsetY - window.innerHeight / 2) * (newZoomLevel / zoomLevel);

                // Adjust transform style
                const transformValue = `translate(${newX}px, ${newY}px) scale(${newZoomLevel})`;
                setTransformStyle(transformValue);
            }
        } else {
            // If the click occurred outside the image, close the image
            handleImageClose();
        }
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
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Card
                                className={classes.card}
                                onClick={() => handleCardClick('/images/sample.jpg')}
                            >
                                <CardActionArea id="image-gallery">
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image="/images/sample.jpg"
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
            </Container>

            {
                isImageFocused && (
                    <div onClick={handleImageClick}>
                        <img
                            src={imageSrc}
                            alt="Focused Image"
                            className={classes.focusedImage}
                            style={{ transform: transformStyle }}
                        />

                    </div>
                )
            }
        </Box >
    );
};

export default MyComponent;
