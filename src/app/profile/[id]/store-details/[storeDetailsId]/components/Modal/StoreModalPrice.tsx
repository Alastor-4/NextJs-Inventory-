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

export default function StoreModalPrice(props) {
    const { open, setOpen, dialogTitle } = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen({ active: false, storeDepot: [] });
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
                <Button onClick={handleClose}>Salir</Button>
            </DialogActions>
        </Dialog>
    )
}


