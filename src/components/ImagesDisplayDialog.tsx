import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Grid,
} from "@mui/material";
import React, { useEffect } from "react";
import { Circle, CircleOutlined, ControlPoint, FormatListBulletedOutlined } from "@mui/icons-material";
import { images } from "@prisma/client";

interface ImagesDisplayDialogProps {
    open: boolean;
    setOpen: (bool: boolean) => void;
    dialogTitle?: string;
    images: images[] | null;
}

export default function ImagesDisplayDialog({ dialogTitle, images, open, setOpen }: ImagesDisplayDialogProps) {

    const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
        setOpen(false);
    };

    const [imageIndex, setImageIndex] = React.useState(0)

    useEffect(() => {
        if (images?.length) {
            setImageIndex(0);
        }
    }, [images]);

    return (
        <Dialog open={open} onClose={handleClose}>
            {
                dialogTitle && (
                    <DialogTitle>{dialogTitle}</DialogTitle>
                )
            }

            <DialogContent sx={{p: "5px"}}>
                <Grid container rowSpacing={2}>
                    <Grid container item xs={12} justifyContent={"center"}>
                        {
                            !!images?.length! && (
                                <Avatar
                                    src={images[imageIndex]?.fileUrl ?? ""}
                                    variant={"rounded"}
                                    sx={{ width: "300px", maxWidth: "300px", height: "auto" }}
                                />
                            )
                        }
                    </Grid>

                    {
                        images?.length! > 1 && (
                            <Grid container item xs={12} justifyContent={"center"}>
                                {images?.map((item: any, index: number) => (
                                    <React.Fragment key={item.id}>
                                        {
                                            imageIndex === index ? (
                                                <Circle color={"info"} sx={{ cursor: "pointer", mx: "7px" }} />
                                            ) : (
                                                <CircleOutlined
                                                    onClick={() => setImageIndex(index)}
                                                    sx={{ cursor: "pointer", mx: "7px" }}
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