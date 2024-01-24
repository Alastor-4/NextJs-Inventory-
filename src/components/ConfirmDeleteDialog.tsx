import React from "react";
import {
    AppBar,
    Button,
    Dialog,
    DialogActions,
    DialogContent, DialogTitle,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import {WarningOutlined} from "@mui/icons-material";


interface ConfirmDeleteDialogProps {
    open: boolean,
    handleClose: () => void
    title: string,
    message: string,
    confirmAction: () => Promise<void>
}

export default function ConfirmDeleteDialog({ open, handleClose, title, message, confirmAction }: ConfirmDeleteDialogProps) {

    async function confirm() {
        await confirmAction()

        handleClose()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                sx={{ bgcolor: '#1976d3' }}
            >
                {title}

                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant={"subtitle2"} component={"div"} display={"flex"} alignItems={"center"}>
                    <WarningOutlined color={"warning"} sx={{mr: 1}}/>
                    {message}
                </Typography>

            </DialogContent>

            <DialogActions>
                <Button color={"inherit"} onClick={handleClose}>
                    Cancelar
                </Button>

                <Button onClick={confirm}>
                    Proceder
                </Button>
            </DialogActions>
        </Dialog>
    )
}