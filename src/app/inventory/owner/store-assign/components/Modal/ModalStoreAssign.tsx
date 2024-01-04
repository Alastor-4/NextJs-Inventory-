import { ModalStoreAssignProps } from "@/types/interfaces";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React, { ReactNode } from "react";

export default function ModalStoreAssign({ dialogTitle, open, setOpen, children }: ModalStoreAssignProps) {

    const handleClose = () => {
        setOpen(false);
    };


    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {children}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    )
}