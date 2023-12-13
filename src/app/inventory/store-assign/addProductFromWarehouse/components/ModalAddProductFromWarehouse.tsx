// @ts-nocheck
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import React from "react";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";

export default function ModalAddProductFromWarehouse(props) {
    const { open, setOpen, dialogTitle, loadData } = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
        loadData();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"md"}>
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {props.children}
                </Box>
            </DialogContent>
        </Dialog>
    )
}