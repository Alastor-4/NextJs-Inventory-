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

interface ModalAddProductFromWarehouseProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle?: string;
    loadData: () => Promise<void>;
    children?: ReactNode;
}

export default function ModalAddProductFromWarehouse({ loadData, dialogTitle, open, setOpen, children }: ModalAddProductFromWarehouseProps) {

    const handleClose = () => {
        setOpen(false);
        loadData();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullScreen>
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
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    )
}