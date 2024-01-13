import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button } from '@mui/material';
import { ModalSellsTodayProps } from '@/types/interfaces';
import { Close } from '@mui/icons-material';
import React from 'react';

const ModalSellsToday = ({ isOpen, setIsOpen, dialogTitle }: ModalSellsTodayProps) => {

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} fullWidth onClose={handleCloseModal}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                fontWeight={"400"}
                sx={{ bgcolor: '#1976d3' }}
            >
                {dialogTitle}
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleCloseModal}
                    aria-label="close"
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers >
            </DialogContent>
            <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
                <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}
export default ModalSellsToday