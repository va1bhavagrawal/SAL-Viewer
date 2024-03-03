import React, { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Radio from '@mui/material/Radio';

// Function to generate list items dynamically
const generateListItems = (labels, todoPrefix, selected, setSelected) => {
    return labels.map((label, index) => (
        <ListItemButton key={index} onClick={() => setSelected(label)}>
            <ListItemText primary={label} />
            <Radio checked={selected === label} />
        </ListItemButton>
    ));
};

// Define the labels for the main list items
const mainListLabels = ['Dashboard', 'Orders', 'Customers', 'Reports', 'Integrations'];

const MainListItems = ({ annotation, setAnnotation }) => {
    return (
        <React.Fragment>
            {generateListItems(mainListLabels, 'Main Checkbox', annotation, setAnnotation)}
        </React.Fragment>
    );
};

export default MainListItems
