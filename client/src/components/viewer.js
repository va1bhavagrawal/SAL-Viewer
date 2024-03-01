import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, IconButton, Grid } from "@mui/material";
import { ZoomIn, ZoomOut, Fullscreen } from "@mui/icons-material";

const ViewerPage = () => {
    const { collectionName } = useParams(); // Assuming the collection name is provided via React Router

    // Sample URL for the image
    const imageUrl = "/images/sample2.jpg";

    const [zoomLevel, setZoomLevel] = useState(100);

    const handleZoomIn = () => {
        setZoomLevel((prevZoom) => Math.min(prevZoom + 10, 200)); // Increase zoom by 10%
    };

    const handleZoomOut = () => {
        setZoomLevel((prevZoom) => Math.max(prevZoom - 10, 10)); // Decrease zoom by 10%
    };

    const handleFullScreen = () => {
        const img = document.getElementById("fullscreen-image");
        if (img.requestFullscreen) {
            img.requestFullscreen();
        } else if (img.webkitRequestFullscreen) {
            /* Safari */
            img.webkitRequestFullscreen();
        } else if (img.msRequestFullscreen) {
            /* IE11 */
            img.msRequestFullscreen();
        }
    };

    return (
        <Container>
            <Grid container justifyContent="center" alignItems="center" style={{ height: "100vh" }}>
                <img
                    id="fullscreen-image"
                    src={imageUrl}
                    alt={collectionName}
                    style={{ width: `${zoomLevel}%`, cursor: "zoom-in" }}
                    onClick={handleFullScreen}
                />
                {/* <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <IconButton onClick={handleZoomIn}>
                        <ZoomIn />
                    </IconButton>
                    <IconButton onClick={handleZoomOut}>
                        <ZoomOut />
                    </IconButton>
                </div> */}
            </Grid>
        </Container>
    );
};

export default ViewerPage;
