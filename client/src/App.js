import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import ImageCollectionGallery from "./components/dashboard";
import ViewerPage from "./components/viewer3";
import ImageCanvas from "./components/annotator";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ImageCollectionGallery />} />
                <Route path="/:ctgName/:collectionName/:split/:currentIndex" element={<ViewerPage/>} />
                <Route path="/annotate/:ctgName/:collectionName/:split/:currentIndex" element={<ImageCanvas/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;