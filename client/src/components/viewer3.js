import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom"
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { ListSubheader } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { MainListItems, SplitItems } from './listItems';
import Button from '@mui/material/Button';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.min.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia
} from "@mui/material";

const images = ["/images/sample.jpg", "/images/sample2.jpg"]; // Array of image URLs


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);



const defaultTheme = createTheme();

export default function Dashboard() {
    let { collectionName, ctgName } = useParams()
    const [open, setOpen] = React.useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [annotationNames, setAnnotationNames] = useState(0);
    const [annotations, setAnnotations] = useState([])
    const [loading, setLoading] = useState(true)
    const [numImages, setNumImages] = useState(0)
    const [split, setSplit] = useState("train")
    const [reAnnotate, setReAnnotate] = useState(false)
    const [remove, setRemove] = useState(false)
    const toggleDrawer = () => {
        setOpen(!open);
    };
    // console.log("annotation was set to " + annotation)
    const [imageSrc, setImageSrc] = useState("")

    const removeFromRemove = async () => {
        try {
            const response = await fetch("http://10.4.16.102:1510/remove_from_remove", {
                method: "GET",
                headers: {
                    "ctgName": ctgName,
                    "collectionName": collectionName,
                    "imgIdx": currentIndex,
                    "split": split,
                }
            });
            if (!response.ok) {
                throw new Error("Failed to send to reannotate");
            }
            const blob = await response.blob()
            setRemove(false)
            setLoading(false)
            // console.log("received image")
        } catch (error) {
            console.error("Failed to send to reannotate", error);
            setLoading(false);
        }
    };

    const sendToRemove = async () => {
        try {
            const response = await fetch("http://10.4.16.102:1510/send_to_remove", {
                method: "GET",
                headers: {
                    "ctgName": ctgName,
                    "collectionName": collectionName,
                    "imgIdx": currentIndex,
                    "split": split,
                }
            });
            if (!response.ok) {
                throw new Error("Failed to send to reannotate");
            }
            const blob = await response.blob()
            setRemove(true)
            setLoading(false)
            // console.log("received image")
        } catch (error) {
            console.error("Failed to send to reannotate", error);
            setLoading(false);
        }
    };



    const removeFromReAnnotate = async () => {
        try {
            const response = await fetch("http://10.4.16.102:1510/remove_from_reannotate", {
                method: "GET",
                headers: {
                    "ctgName": ctgName,
                    "collectionName": collectionName,
                    "imgIdx": currentIndex,
                    "split": split,
                }
            });
            if (!response.ok) {
                throw new Error("Failed to send to reannotate");
            }
            const blob = await response.blob()
            setReAnnotate(false)
            setLoading(false)
            // console.log("received image")
        } catch (error) {
            console.error("Failed to send to reannotate", error);
            setLoading(false);
        }
    };

    const sendToReAnnotate = async () => {
        try {
            const response = await fetch("http://10.4.16.102:1510/send_to_reannotate", {
                method: "GET",
                headers: {
                    "ctgName": ctgName,
                    "collectionName": collectionName,
                    "imgIdx": currentIndex,
                    "split": split,
                }
            });
            if (!response.ok) {
                throw new Error("Failed to send to reannotate");
            }
            const blob = await response.blob()
            setReAnnotate(true)
            setLoading(false)
            // console.log("received image")
        } catch (error) {
            console.error("Failed to send to reannotate", error);
            setLoading(false);
        }
    };


    useEffect(() => {
        // Fetch annotation names from backend API
        const fetchMetadata = async () => {
            setLoading(true)
            try {
                const response = await fetch("http://10.4.16.102:1510/fetch_metadata", {
                    method: "GET",
                    headers: {
                        "ctgName": ctgName,
                        "collectionName": collectionName,
                        "imgIdx": currentIndex,
                        "split": split,
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch annotation names");
                }
                const responseJSON = await response.json();
                if (responseJSON.splitNotFound === true) {
                    setAnnotationNames([])
                    setNumImages(0)
                    setReAnnotate(false)
                    setRemove(false)
                }
                else {
                    setAnnotationNames(responseJSON.annotation_names);
                    setNumImages(responseJSON.num_images)
                    setReAnnotate(responseJSON.reannotate)
                    setRemove(responseJSON.remove)
                }
                // console.log("Received annotation names:", annotationNames);
            } catch (error) {
                console.error("Error fetching annotation names:", error);
            }
        };
        const fetchAnnotation = async () => {
            setLoading(true)
            try {
                const response = await fetch("http://10.4.16.102:1510/fetch_annotation", {
                    method: "GET",
                    headers: {
                        "ctgName": ctgName,
                        "collectionName": collectionName,
                        "imgIdx": currentIndex,
                        "split": split,
                        "annotation": annotations
                    }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }
                const blob = await response.blob()
                setImageSrc(URL.createObjectURL(blob))
                setLoading(false)
                // console.log("received image")
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };
        fetchMetadata();
        fetchAnnotation();
        console.log("inside useEffect, reAnnotate is set to", reAnnotate)
    }, [annotations, split, ctgName, collectionName, currentIndex, reAnnotate, remove]);

    // console.log("currentIndex is set to " + currentIndex)


    useEffect(() => {
        // Initialize Viewer.js when imageSrc is set
        if (imageSrc) {
            const viewer = new Viewer(document.getElementById('image-gallery'), {
                inline: false,
                viewed() {
                    viewer.zoomTo(1); // Initial zoom level
                },
            });
        }
    }, [imageSrc]);

    const handleNext = () => {
        let nextIndex = currentIndex + 1
        if (nextIndex >= numImages) {
            nextIndex = 0
        }
        setCurrentIndex(nextIndex)
    };

    const handlePrevious = () => {
        let nextIndex = currentIndex - 1
        if (nextIndex === -1) {
            console.log("numImages is " + numImages)
            nextIndex = parseInt(numImages) - 1
            console.log("updated nextIndex to " + nextIndex)
        }
        setCurrentIndex(nextIndex)
    };


    if (loading) {
        return <div id="image-gallery">Loading...</div>;
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: '24px', // keep right padding when drawer closed
                        }}
                    >
                        {/* <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton> */}
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            {collectionName}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={true}>
                    <List component="nav">
                        <ListSubheader component="div" style={{ textAlign: 'center' }}>
                            Ground Truth Annotations
                        </ListSubheader>
                        {annotationNames.length > 0 && <MainListItems annotations={annotations} setAnnotations={setAnnotations} annotationNames={annotationNames} />}
                        <Divider />
                        <ListSubheader component="div" style={{ textAlign: 'center' }}>
                            Splits
                        </ListSubheader>
                        <SplitItems split={split} setSplit={setSplit} />
                    </List>
                    <Divider />
                </Drawer>
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
                        <Grid container spacing={3} justifyContent="center">
                            <ArrowBackIcon item xs={1} onClick={handlePrevious} style={{ cursor: 'pointer' }} />
                            <Grid item xs={10} justifyContent="center">
                                <Card>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px' }}>
                                        <Button variant="contained" disabled={remove} color={reAnnotate == false ? "warning" : "primary"} onClick={() => {
                                            if (reAnnotate) {
                                                removeFromReAnnotate()
                                            }
                                            else {
                                                if (remove === true) {
                                                    removeFromRemove()
                                                }
                                                sendToReAnnotate()
                                            }
                                        }}>
                                            {reAnnotate == false ? "Add to Re-Annotation List" : "Remove From Re-Annotation List"}
                                        </Button>
                                        {remove && <Typography variant="h6" color="red">DELETED</Typography>}
                                        {reAnnotate && <Typography variant="h6" color="orange">APPLIED FOR REANNOTATION</Typography>}
                                        <Button variant="contained" color={remove == false ? "error" : "primary"} onClick={() => {
                                            if (remove) {
                                                removeFromRemove()
                                            }
                                            else {
                                                if (reAnnotate === true) {
                                                    removeFromReAnnotate()
                                                }
                                                sendToRemove()
                                            }
                                        }}>
                                            {remove == false ? "Add to Delete List" : "Remove From Delete List"}
                                        </Button>

                                    </Box>
                                    <CardActionArea id="image-gallery" style={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="auto"
                                            image={imageSrc} // Use the representative image URL here
                                        />
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                                {currentIndex}
                                            </Typography>
                                            {/* You can add more details about the collection here */}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                            <ArrowForwardIcon item xs={1} onClick={handleNext} style={{ cursor: 'pointer' }} />
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider >
    );
}