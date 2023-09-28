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
import {Circle, CircleOutlined, ControlPoint, FormatListBulletedOutlined} from "@mui/icons-material";

export default function ImagesDisplayDialog(props) {
    const {open, setOpen, dialogTitle, images} = props

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
    };

    const [imageIndex, setImageIndex] = React.useState(0)

    React.useEffect(() => {
        if (images.length) {
            setImageIndex(0)
        }
    }, [images])

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <Grid container rowSpacing={2}>
                    <Grid container item xs={12} justifyContent={"center"}>
                        {
                            images.length && (
                                <Avatar
                                    src={images[imageIndex]?.fileUrl ?? ""}
                                    variant={"rounded"}
                                    sx={{width: "250px", maxWidth: "300px", height: "auto"}}
                                />
                            )
                        }
                    </Grid>

                    {
                        images.length > 1 && (
                            <Grid container item xs={12} justifyContent={"center"}>
                                {images.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        {
                                            imageIndex === index ? (
                                                <Circle color={"info"} sx={{cursor: "pointer", mx: "7px"}}/>
                                            ) : (
                                                <CircleOutlined
                                                    onClick={() => setImageIndex(index)}
                                                    sx={{cursor: "pointer", mx: "5px"}}
                                                />
                                            )
                                        }
                                    </React.Fragment>
                                ))}
                            </Grid>
                        )
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color={"inherit"}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
 }