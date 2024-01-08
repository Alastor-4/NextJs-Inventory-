import { StoreModalPriceProps } from "@/types/interfaces";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";

export const StoreModalPrice = ({ open, setOpen, dialogTitle, children }: StoreModalPriceProps) => {

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen({ active: false, storeDepot: null });
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

export default StoreModalPrice