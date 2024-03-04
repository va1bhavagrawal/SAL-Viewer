import React, { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Radio, Checkbox } from '@mui/material';


const generateListItems = (labels, todoPrefix, selected, setSelected) => {
    if (labels.length === 0) {
        return (
            <div></div>
        )
    }
    return labels.map((label, index) => (
        <ListItemButton key={index} onClick={() => {
            if (selected.includes(label)) {
                setSelected(selected.filter(item => item !== label));
            } 
            else {
                setSelected([...selected, label]);
            }
        }}>
            <ListItemText primary={label} />
            <Checkbox
                checked={selected.includes(label)}
                
            />
        </ListItemButton >
    ));
}


// Define the labels for the main list items

const MainListItems = ({ annotations, setAnnotations, annotationNames }) => {
    // console.log("the list was re-rendered!")
    // console.log("annotationNames: " + annotationNames)
    return (
        <React.Fragment>
            {generateListItems(annotationNames, 'Main Checkbox', annotations, setAnnotations)}
        </React.Fragment>
    );
};

const SplitItems = ({ split, setSplit }) => {
    // console.log("the list was re-rendered!")
    // console.log("annotationNames: " + annotationNames)
    return (
        <React.Fragment>
            <ListItemButton key={0} onClick={() => setSplit("train")}>
                <ListItemText primary="train" />
                <Radio checked={split === "train"} onChange={() => {
                    setSplit("train")
                }} />
            </ListItemButton>
            <ListItemButton key={1} onClick={() => setSplit("val")}>
                <ListItemText primary="val" />
                <Radio checked={split === "val"} onChange={() => {
                    setSplit("val")
                }} />
            </ListItemButton>
            <ListItemButton key={2} onClick={() => setSplit("test")}>
                <ListItemText primary="test" />
                <Radio checked={split === "test"} onChange={() => {
                    setSplit("test")
                }} />
            </ListItemButton>
        </React.Fragment>
    );
};


export { MainListItems, SplitItems }
