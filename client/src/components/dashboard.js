import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation
import {
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    CardMedia
} from "@mui/material";

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch categories from backend API
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://10.4.16.102:1510/");
                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }
                const data = await response.json();
                setCategories(data.categories); // Assuming your response has a key "categories" containing the categories list
                console.log(data.categories)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            {categories.map((category) => (
                <div key={category.title}>
                    <Typography variant="h4" gutterBottom>
                        {category.title}
                    </Typography>
                    <Grid container spacing={2}>
                        {category.collections.map((collection) => (
                            <Grid item xs={12} sm={6} md={4} key={collection}>
                                <Card>
                                    <CardActionArea
                                        component={Link}
                                        to={`/${category.title}/${collection.title}/train/0`}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={collection.thumbnail} // Assuming your category objects have a property "representativeImageUrl"
                                            alt={collection.title}
                                        />
                                        <CardContent>
                                            <Typography variant="h6" component="div">
                                                {collection.title}
                                            </Typography>
                                            {/* You can add more details about the collection here */}
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            ))}
        </Container>
    );
};

export default HomePage;
