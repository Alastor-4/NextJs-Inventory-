import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { StoreModalDefaultProps } from "@/types/interfaces";
import React from "react";

export const StoreModalDefault = ({ children, dialogTitle, setOpen, open }: StoreModalDefaultProps) => {

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
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
                <Button onClick={handleClose}>Salir</Button>
            </DialogActions>
        </Dialog>
    )
}

export default StoreModalDefault