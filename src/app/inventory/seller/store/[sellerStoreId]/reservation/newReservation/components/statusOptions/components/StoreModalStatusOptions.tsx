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
import { reservation } from "../../../request/reservation";
import dayjs from "dayjs";

export default function StoreModalStatusOptions(props: any) {
    const { open, setOpen, dialogTitle, setDataReservation, storeId } = props

    const getData = async () => {
        let newDataReservation = await reservation.getAllReservations(storeId)
        setDataReservation(
            newDataReservation.sort((a: any, b: any) => -(dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()))
        )
    }

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        getData();
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth >
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


