import {AppBar, Box, Dialog, DialogContent, IconButton, Toolbar, Typography} from "@mui/material";
import {CloseIcon} from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import React from "react";

interface GenericFullScreenModalProps {
    dialogTitle: string,
    open: boolean,
    setOpen: (val: boolean) => void,
    fullScreen: boolean,
    children: React.ReactElement
}

const GenericFullScreenModal = ({ dialogTitle, open, setOpen, fullScreen, children }: GenericFullScreenModalProps) => {
    const handleClose = () => setOpen(false)

    return (
        <Dialog open={open} onClose={handleClose} fullWidth fullScreen={fullScreen}>
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

export default GenericFullScreenModal