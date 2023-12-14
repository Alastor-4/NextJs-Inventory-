import {
    AppBar,
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Toolbar,
    Typography,
} from "@mui/material";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import React from "react";

export default function StoreModalOffers(props: any) {
    const { open, setOpen, dialogTitle } = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
    };




    return (
        <Dialog open={open} onClose={handleClose} >
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
            <DialogContent >
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }} >
                    {props.children}
                </Box>
            </DialogContent>

        </Dialog>
    )
}


