"use client"

import React from "react";
import {useUploadThing} from "@/app/api/uploadthing/utils";
import {notifyError, notifySuccess} from "@/utils/generalFunctions";
import products from "@/app/inventory/owner/product/requests/products";
import {CircularProgress, Grid} from "@mui/material";
import {InfoOutlined, WarningOutlined} from "@mui/icons-material";

export const ImageUploadContext = React.createContext(null)

export function ImageUploadProvider({ children }: { children: React.ReactNode }) {
    const [uploadingImages, setUploadingImages] = React.useState(false)

    const { startUpload } = useUploadThing("imageUploader", {
        onClientUploadComplete: () => notifySuccess("Imágenes subidas satisfactoriamente"),
        onUploadError: () => notifyError("Ha ocurrido un error durante la subida de las imágenes"),
    });
    
    const startImagesUpload = React.useCallback(async (productId: string, images: File[]) => {
        setUploadingImages(true)

        try {
            const files = await startUpload(images)

            if (files) {
                await products.insertImages({productId, productImages: files})
            }
        } finally {
            setUploadingImages(false)
        }
    }, [startUpload])

    const values = React.useMemo(() => (
        {startImagesUpload}
    ), [startImagesUpload])

    const UploadingImagesIndicator = () => (
        <Grid container alignItems={"center"} sx={{my: "5px", border: "1px solid black", borderRadius: "3px", p: "3px"}}>
            <WarningOutlined sx={{fontSize: 18, mr: "5px"}}/>
            Subiendo imágenes. Mantenga conexión a internet
            <CircularProgress color="inherit" size={16} sx={{ml: "10px"}}/>
        </Grid>
    )

    return (
        // @ts-ignore
        <ImageUploadContext.Provider value={values}>
            {uploadingImages && <UploadingImagesIndicator/>}

            {children}
        </ImageUploadContext.Provider>
    )
}

export default function useImageUploadContext() {
    return React.useContext(ImageUploadContext)
}