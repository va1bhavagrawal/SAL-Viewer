import React from "react";
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
  // Sample data for categories and sub-collections
  const categories = [
    { title: "Nature", collections: ["Landscapes", "Animals", "Flowers"] },
    { title: "Travel", collections: ["Europe", "Asia", "America"] },
    { title: "Food", collections: ["Fruits", "Vegetables", "Desserts"] }
    // Add more categories as needed
  ];

  // Sample URL for representative image
  const representativeImageUrl = "/images/sample.jpg";

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
                    to={`/collection/${collection}`}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={representativeImageUrl} // Use the representative image URL here
                      alt={collection}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {collection}
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

