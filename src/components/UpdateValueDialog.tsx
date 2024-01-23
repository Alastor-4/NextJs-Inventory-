import { AppBar, Box, Dialog, DialogContent, IconButton, Toolbar, Typography } from "@mui/material";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { UpdateValueDialogProps } from "@/types/interfaces";
import React from "react";

export default function UpdateValueDialog({ dialogTitle, open, formik, setOpen, children, fullScreen }: UpdateValueDialogProps) {

    const handleClose = () => {
        !!formik && formik.resetForm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {dialogTitle}
                    </Typography>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    )
}