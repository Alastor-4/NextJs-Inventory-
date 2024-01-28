import { AppBar, Box, Dialog, DialogContent, IconButton, Toolbar, Typography } from "@mui/material";
import { ModalUpdateProductProps } from "@/types/interfaces";
import { Close } from "@mui/icons-material";
import React from "react";

export default function ModalUpdateProduct({ open, setOpen, dialogTitle, children }: ModalUpdateProductProps) {

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullScreen >
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
                        <Close />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    )
}


