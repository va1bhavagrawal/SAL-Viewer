import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import ImageCollectionGallery from "./components/dashboard";
import ViewerPage from "./components/viewer3";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ImageCollectionGallery />} />
                <Route path="/collection/:ctgName/:collectionName/:currentIndex" element={<ViewerPage/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;