import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, IconButton, Grid, Card, CardContent, RadioGroup, FormControlLabel, Radio, Menu, MenuItem } from "@mui/material";
import { ZoomIn, ZoomOut, Fullscreen, Menu as MenuIcon } from "@mui/icons-material";

const ViewerPage = () => {
  const { collectionName } = useParams(); // Assuming the collection name is provided via React Router

  // Default URL for the image
  const imageUrl = "/images/sample.jpg";

  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

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

  const handleAnnotationChange = (event) => {
    setSelectedAnnotationIndex(parseInt(event.target.value));
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Container>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        style={{ position: "fixed", left: 0, top: 0, zIndex: 9999 }}
      >
        <RadioGroup
          aria-label="Annotation Versions"
          name="annotationVersions"
          value={selectedAnnotationIndex.toString()}
          onChange={handleAnnotationChange}
        >
          {[...Array(3)].map((_, index) => (
            <MenuItem key={index} onClick={handleMenuClose}>
              <FormControlLabel
                value={index.toString()}
                control={<Radio />}
                label={`Annotated Version ${index + 1}`}
              />
            </MenuItem>
          ))}
        </RadioGroup>
      </Menu>
      <Grid container justifyContent="center">
        <Grid item xs={8}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <img
                    id="fullscreen-image"
                    src={imageUrl}
                    alt={collectionName}
                    style={{ width: `${zoomLevel}%`, cursor: "zoom-in" }}
                    onClick={handleFullScreen}
                  />
                  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                    <IconButton onClick={handleZoomIn}>
                      <ZoomIn />
                    </IconButton>
                    <IconButton onClick={handleZoomOut}>
                      <ZoomOut />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewerPage;
