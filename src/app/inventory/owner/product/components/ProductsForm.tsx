//@ts-nocheck
"use client"

import {
    Avatar,
    Badge,
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import React, { useEffect } from "react";
import { Formik } from "formik";
import * as Yup from "yup"
import { AddOutlined, Cancel, Close, DeleteOutline, Done } from "@mui/icons-material";
import { handleKeyDownWithDot } from "@/utils/handleKeyDown";
import { useDropzone } from "react-dropzone";
import products from "../requests/products";
import useImageUploadContext from "@/providers/ImageUploadProvider";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";

export default function ProductsForm(props: any) {
    const { userId, departments, productId, setOpen } = props

    const [updateItem, setUpdateItem] = React.useState()

    const { startImagesUpload } = useImageUploadContext()

    //initial values
    const [department, setDepartment] = React.useState("");

    useEffect(() => {
        async function fetchProduct(id: string) {
            const product = await products.productDetails(id)
            setUpdateItem(product)

            if (product?.departments?.id) {
                const index = departments.findIndex((item: { id: any; }) => item.id === product.departments.id)
                if (index > -1) {
                    setDepartment(departments[index])
                }
            }
        }
        if (productId !== null) {
            fetchProduct(productId)
        }
    }, [productId, userId, setUpdateItem, departments])

    const initialValues = {
        name: updateItem ? updateItem.name : "",
        description: updateItem?.description ? updateItem.description : "",
        buyPrice: updateItem?.buy_price ? updateItem.buy_price : "",
        imagesMaxErrorField: "",
        department: department,
        characteristics: updateItem?.characteristics?.length ? updateItem.characteristics : [],
        deletedCharacteristics: [],
        images: updateItem?.images?.length ? updateItem.images : [],
        deletedImages: [],
        characteristicName: "",
        characteristicValue: "",
        displayCharacteristicForm: false,
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("campo requerido"),
        description: Yup.string(),
        buyPrice: Yup.number().nullable(),
        images: Yup.array(),
        imagesMaxErrorField: Yup.string(),
        department: Yup.object().required("Debes seleccionar un departamento"),
        characteristics: Yup.array().of(Yup.object()),
        characteristicName: Yup.string().nullable(),
        characteristicValue: Yup.string().nullable(),
    })

    const handleSubmit = async (values) => {
        let data = {
            id: undefined,
            name: values.name,
            description: values.description,
            buyPrice: values.buyPrice,
            departmentId: values.department.id,
            userId: userId,
            characteristics: null,
            deletedCharacteristics: values.deletedCharacteristics.length ? values.deletedCharacteristics : null,
            images: null,
            deletedImages: null,
        }

        if (values.characteristics.length) {
            const newCharacteristics = values.characteristics.filter(item => !item.id)
            data.characteristics = newCharacteristics.length ? newCharacteristics : null
        }

        if (values.deletedImages.length) {
            data.deletedImages = values.deletedImages.map(item => ({ id: item.id, fileKey: item.fileKey }))
        }

        let response

        if (updateItem) {
            data.id = updateItem.id

            response = await products.update(data)
        } else {
            response = await products.create(data)
        }

        if (response.status === 200) {
            if (values.images.length) {
                const newImages = values.images.filter(item => !item.fileKey)
                if (newImages.length) {
                    startImagesUpload(response.data.id, newImages)
                }
            }

            notifySuccess(
                updateItem
                    ? "Se ha modificado el producto"
                    : "Se ha creado el producto"
            )
        } else {
            notifyError(
                updateItem
                    ? "Error al modificar el producto"
                    : "Error al crear el producto"
            )

        }

        setOpen(false)
    }

    function handleAddCharacteristic(formik) {
        if (formik.values.characteristicName && formik.values.characteristicValue) {
            let characteristics = [...formik.values.characteristics, { name: formik.values.characteristicName, value: formik.values.characteristicValue }]
            formik.setFieldValue("characteristics", characteristics)

            formik.setFieldValue("characteristicName", "")
            formik.setFieldValue("characteristicValue", "")
            formik.setFieldValue("displayCharacteristicForm", false)
        } else {
            if (!formik.values.characteristicName)
                formik.setFieldError("characteristicName", "campo requerido")

            if (!formik.values.characteristicValue)
                formik.setFieldError("characteristicValue", "campo requerido")
        }
    }

    function handleRemoveCharacteristic(formik, index) {
        let characteristics = [...formik.values.characteristics]

        if (characteristics[index].id) {
            let deletedCharacteristics = formik.values.deletedCharacteristics
            deletedCharacteristics.push(characteristics[index].id)
            formik.setFieldValue("deletedCharacteristics", deletedCharacteristics)
        }
        characteristics.splice(index, 1)
        formik.setFieldValue("characteristics", characteristics)
    }

    function MyDropzone({ formik }) {
        function onDrop(acceptedFiles) {
            const newFiles = [...acceptedFiles]
            let addedFiles = [...formik.values.images]

            newFiles.forEach((newFile) => {
                //only 1 image allowed
                if (addedFiles.length < 1) {
                    const index = formik.values.images.findIndex((item) => item.name === newFile.name)
                    if (index < 0) {
                        newFile.fileUrl = URL.createObjectURL(newFile)
                        addedFiles.push(newFile)
                    }
                }
            })

            formik.setFieldValue("images", addedFiles)
        }

        const { getRootProps, getInputProps, isDragActive } = useDropzone(
            {
                accept: {
                    'image/*': ['.jpeg', '.jpg', '.png']
                },
                multiple: true,
                maxFiles: 1,
                maxSize: 4 * 1024 * 1024, //~4MB
                onDrop: onDrop,
            }
        )

        return (
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    backgroundColor: "rgba(0, 0 , 0, 0.09)",
                    color: "#bdbdbd"
                }}
            >
                <Box
                    {...getRootProps()}
                    sx={{
                        padding: "20px",
                        borderWidth: "2px",
                        borderRadius: "2px",
                        borderColor: "#2e5c45",
                        borderStyle: "dashed",
                        color: "#bdbdbd",
                        textAlign: "center"
                    }}
                >
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Suelte las imágenes aquí ...</p> :
                            <p>Arrastre una imágen hasta aquí o click para seleccionar. <br />
                                Solo un archivo menor de 4MB. <br />
                                Formatos permitidos .jpeg, .jpg o .png
                            </p>
                    }
                </Box>
            </Box>
        )
    }

    function handleRemoveImage(formik, deletedItem) {
        let images = formik.values.images

        let deleteIndex = formik.values.images.findIndex((item) => item.name === deletedItem.name)
        if (images[deleteIndex].id) {
            const deletedImage = formik.values.deletedImages
            deletedImage.push(images[deleteIndex])
            formik.setFieldValue("deletedImages", [...deletedImage])
        } else {
            URL.revokeObjectURL(images[deleteIndex].preview)
        }

        images.splice(deleteIndex, 1)

        formik.setFieldValue("images", [...images])
    }

    const thumbs = (formik) => formik.values.images.map((file) => (
        <Badge
            key={file.name ? file.name : file.fileKey}
            overlap={"circular"}
            badgeContent={<Cancel sx={{ color: "red", cursor: "pointer" }} />}
            onClick={() => handleRemoveImage(formik, file)}
        >
            <Avatar src={file.fileUrl} variant={"rounded"} sx={{ width: "120px", height: "120px", marginX: "10px" }} />
        </Badge>
    ))

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
        >
            {
                (formik) => (

                    <form onSubmit={formik.handleSubmit}>
                        <Grid container rowSpacing={2}>

                            <Grid container item rowSpacing={4} >
                                <Grid item xs={12}>
                                    <TextField
                                        name={"Nombre*"}
                                        label="Nombre"
                                        size={"small"}
                                        fullWidth
                                        {...formik.getFieldProps("name")}
                                        error={formik.errors.name && formik.touched.name}
                                        helperText={(formik.errors.name && formik.touched.name) && formik.errors.name}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name={"description"}
                                        label="Descripción"
                                        size={"small"}
                                        fullWidth
                                        {...formik.getFieldProps("description")}
                                        error={formik.errors.description && formik.touched.description}
                                        helperText={(formik.errors.description && formik.touched.description) && formik.errors.description}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name={"buyPrice"}
                                        label="Precio de compra"
                                        size={"small"}
                                        onKeyDown={handleKeyDownWithDot}
                                        fullWidth
                                        {...formik.getFieldProps("buyPrice")}
                                        error={formik.errors.buyPrice && formik.touched.buyPrice}
                                        helperText={(formik.errors.buyPrice && formik.touched.buyPrice) && formik.errors.buyPrice}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name={"department"}
                                        label="Departamento"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("department")}
                                        error={formik.errors.department && formik.touched.department}
                                        helperText={(formik.errors.department && formik.touched.department) && formik.errors.department}
                                    >
                                        {
                                            departments?.map(item => (<MenuItem key={item.id} value={item}>{item.name}</MenuItem>))
                                        }
                                    </TextField>
                                </Grid>

                                <Grid item container xs={12} rowSpacing={2}>
                                    <Grid item xs={12} sx={{ paddingX: "15px" }}>
                                        <FormControlLabel
                                            label={
                                                <Typography variant={"subtitle2"}>
                                                    Agregue características que describan el producto. Ej: Talla: XL, Color: Negro, Material: Aluminio
                                                </Typography>
                                            }
                                            control={<></>}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        {
                                            formik.values.characteristics.map((item, index) => (
                                                <Grid
                                                    key={index}
                                                    sx={{
                                                        display: "inline-flex",
                                                        margin: "3px",
                                                        backgroundColor: "rgba(170, 170, 170, 0.8)",
                                                        padding: "2px 4px",
                                                        borderRadius: "5px 2px 2px 2px",
                                                        border: "1px solid rgba(130, 130, 130)",
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                                                        <Typography variant={"caption"} sx={{ color: "white", fontWeight: "600" }}>
                                                            {item.name.toUpperCase()}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container item alignItems={"center"} sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                        {item.value}
                                                    </Grid>
                                                    <Grid item sx={{ marginLeft: "3px" }}>
                                                        <DeleteOutline
                                                            fontSize={"small"}
                                                            color={"secondary"}
                                                            onClick={() => handleRemoveCharacteristic(formik, index)}
                                                            sx={{ cursor: "pointer" }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            ))
                                        }
                                        {
                                            !formik?.values?.displayCharacteristicForm && (
                                                <IconButton onClick={() => formik.setFieldValue("displayCharacteristicForm", true)}>
                                                    <AddOutlined />
                                                </IconButton>
                                            )
                                        }
                                    </Grid>

                                    {
                                        formik?.values?.displayCharacteristicForm && (
                                            <Grid container item xs={12} spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name={"characteristicName"}
                                                        label="Característica"
                                                        size={"small"}
                                                        fullWidth
                                                        {...formik.getFieldProps("characteristicName")}
                                                        error={formik.errors.characteristicName && formik.touched.characteristicName}
                                                        helperText={(formik.errors.characteristicName && formik.touched.characteristicName) && formik.errors.characteristicName}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name={"characteristicValue"}
                                                        label="Valor"
                                                        size={"small"}
                                                        fullWidth
                                                        {...formik.getFieldProps("characteristicValue")}
                                                        error={formik.errors.characteristicValue && formik.touched.characteristicValue}
                                                        helperText={(formik.errors.characteristicValue && formik.touched.characteristicValue) && formik.errors.characteristicValue}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <IconButton color={"primary"} onClick={() => handleAddCharacteristic(formik)}>
                                                        <Done color={"primary"} />
                                                    </IconButton>

                                                    <IconButton onClick={() => formik.setFieldValue("displayCharacteristicForm", false)}>
                                                        <Close />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        )
                                    }

                                    <Grid item xs={12} sx={{ mt: "15px" }}>
                                        <MyDropzone formik={formik} />
                                    </Grid>
                                    <Grid item container xs={12} justifyContent={"center"}>
                                        <aside>{thumbs(formik)}</aside>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item sx={{ paddingX: "1.5em" }} xs={12} >

                                <Button
                                    type={"submit"}
                                    fullWidth
                                    color={"primary"}
                                    variant={"contained"}
                                    size={"small"}
                                    disabled={!formik.isValid}
                                >
                                    {updateItem ? "Actualizar" : "Crear"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                )
            }
        </Formik>

    )
}