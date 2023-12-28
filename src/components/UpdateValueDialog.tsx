import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React, { ReactNode } from "react";

interface UpdateValueDialogProps {
    open: boolean;
    setOpen: (boolean: boolean) => void;
    dialogTitle: string;
    children: ReactNode;
    formik?: any;
}
export default function UpdateValueDialog({ dialogTitle, open, formik, setOpen, children }: UpdateValueDialogProps) {

    const handleClose = () => {
        !!formik && formik.resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {children}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
            </DialogActions>
        </Dialog>
    )
}