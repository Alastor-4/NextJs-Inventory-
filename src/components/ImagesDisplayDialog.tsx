import {
    Avatar,
    Box,
    Button, Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid,
} from "@mui/material";
import React from "react";

export default function ImagesDisplayDialog(props) {
    const {open, setOpen, dialogTitle, images} = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
    };

    const [imageIndex, setImageIndex] = React.useState(0)

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Grid container rowSpacing={2}>
                    <Grid container item xs={12} justifyContent={"center"}>
                        {
                            images.length && (
                                <Avatar
                                    src={images[imageIndex].fileUrl}
                                    variant={"rounded"}
                                    sx={{width: "250px", maxWidth: "300px", height: "auto"}}
                                />
                            )
                        }
                    </Grid>

                    <Grid container item xs={12} justifyContent={"space-around"}>
                        {images.map((item, index) => (
                            <Chip
                                key={item.id}
                                label={`imagen-${index + 1}`}
                                variant={"outlined"}
                                color={index === imageIndex ? "primary" : "info"}
                                onClick={() => setImageIndex(index)}
                            />
                        ))}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color={"inherit"}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
 }