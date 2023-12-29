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
import React, { ReactNode } from "react";

interface ModalUpdateProductProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle: string;
    setForceRender: (bool: boolean) => void;
    children?: ReactNode;
}

export default function ModalAddProduct({ open, setOpen, dialogTitle, children, setForceRender }: ModalUpdateProductProps) {

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
        setForceRender(true)
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
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                {children}
            </DialogContent>

        </Dialog>
    )
}


