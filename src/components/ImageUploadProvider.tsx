"use client"

import React from "react";
import {useUploadThing} from "@/app/api/uploadthing/utils";
import {notifyError, notifySuccess} from "@/utils/generalFunctions";
import products from "@/app/inventory/owner/product/requests/products";
import {CircularProgress, Grid} from "@mui/material";
import {WarningOutlined} from "@mui/icons-material";

export const ImageUploadContext = React.createContext(null)

export function ImageUploadProvider({ children }: { children: React.ReactNode }) {
    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: () => notifySuccess("Imagen subida satisfactoriamente. Recargue la página si no ve la imagen en su producto"),
        onUploadError: (res) => {
            switch (res.code) {
                case "BAD_REQUEST":
                    notifyError("Error. Permitido solo un archivo con 4MB o menos. Vuelva a intentarlo modificando el producto", true)
                    break

                default:
                    notifyError("Ha ocurrido un error durante la subida de las imágenes. Vuelva a intentarlo modificando el producto", true)
                    break
            }
        },
    });
    
    const startImagesUpload = React.useCallback(async (productId: string, images: File[]) => {
        try {
            const files = await startUpload(images)

            if (files) {
                await products.insertImages({productId, productImages: files})
            }
        } finally {}
    }, [startUpload])

    const values = React.useMemo(() => (
        {startImagesUpload}
    ), [startImagesUpload])

    const UploadingImagesIndicator = () => (
        <Grid container alignItems={"center"} sx={{my: "5px", border: "1px solid black", borderRadius: "3px", p: "3px 5px"}}>
            <WarningOutlined sx={{fontSize: 18, mr: "5px"}}/>
            Subiendo imágenes. Mantenga conexión a internet
            <CircularProgress color="inherit" size={16} sx={{ml: "10px"}}/>
        </Grid>
    )

    return (
        // @ts-ignore
        <ImageUploadContext.Provider value={values}>
            {isUploading && <UploadingImagesIndicator/>}

            {children}
        </ImageUploadContext.Provider>
    )
}

export default function useImageUploadContext() {
    return React.useContext(ImageUploadContext)
}