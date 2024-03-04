import React, { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Checkbox } from '@mui/material';

const generateListItems = (labels, todoPrefix, selected, setSelected) => {
    return labels.map((label, index) => (
        <ListItemButton key={index} onClick={() => setSelected(label)}>
            <ListItemText primary={label} />
            <Checkbox 
                checked={selected.includes(label)} 
                onChange={() => {
                    if (selected.includes(label)) {
                        setSelected(selected.filter(item => item !== label));
                    } else {
                        setSelected([...selected, label]);
                    }
                }} 
            />
        </ListItemButton>
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

export default MainListItems
