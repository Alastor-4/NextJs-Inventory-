// @ts-nocheck
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React from "react";
import AddProductFromWharehouse from "../components/AddProductFromWarehouse";

export default function ModalAddProductFromWarehouse(props) {
    const { open, setOpen, dialogTitle, loadData } = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
        loadData();
    };


    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {props.children}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>


    )
}