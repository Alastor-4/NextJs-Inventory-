"use client"

import {
    AppBar, Avatar, Badge,
    Box,
    Button,
    Card, Fade,
    FormControlLabel, FormHelperText,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import {useFormik, Formik} from "formik";
import * as Yup from "yup"
import {useParams, useRouter} from 'next/navigation';
import products from "@/app/profile/[id]/product/requests/products";
import {AddOutlined, Cancel, Close, DeleteOutline, Done} from "@mui/icons-material";
import {useDropzone} from "react-dropzone";
import {useUploadThing} from "@/app/api/uploadthing/utils";

export default function ProductsForm(props) {
    const {userId, departments} = props

    const [updateItem, setUpdateItem] = React.useState()

    const params = useParams()
    const router = useRouter()
    
   /* React.useEffect(() => {
        async function fetchRole(id) {
            const rol = await roles.roleDetails(id)
            setUpdateItem(rol)
        }
        if (params?.id !== undefined) {
            fetchRole(params.id)
        } 
    }, [params?.id, setUpdateItem])*/

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {updateItem ? "Modificar producto" : "Crear producto"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const [displayCharacteristicForm, setDisplayCharacteristicForm] = React.useState(false)

    const initialValues = {
        name: updateItem ? updateItem.name : "",
        description: updateItem?.description ? updateItem.description : "",
        buyPrice: updateItem?.buy_price ? updateItem.buy_price : "",
        images: updateItem ? updateItem.images : [],
        imagesMaxErrorField: "",
        department: updateItem?.departments?.id ? updateItem.departments.id : "",
        characteristics: updateItem?.characteristics?.id ? updateItem.characteristics.id : [],
        characteristicName: "",
        characteristicValue: "",
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("campo requerido"),
        description: Yup.string(),
        buyPrice: Yup.number().nullable(),
        images: Yup.array(),
        imagesMaxErrorField: Yup.string(),
        department: Yup.object(),
        characteristics: Yup.array().of(Yup.object()),
        characteristicName: Yup.string().nullable(),
        characteristicValue: Yup.string().nullable(),
    })

    const { startUpload } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            return res
        },
        onUploadError: () => {
           return false
        },
    });

    const handleSubmit = async (values) => {
        let data = {
            name: values.name,
            description: values.description,
            buyPrice: values.buyPrice,
            departmentId: values.department.id,
            userId: userId,
            characteristics: undefined,
            images: undefined
        }

        if (values.characteristics.length)
            data.characteristics = values.characteristics

        if (values.images.length) {
            //ToDo: images upload and save data in db must be done in background
            const files = await startUpload(values.images)
            if (files) {
                //await products.syncImages({userId, productId: response.id, productImages: files})
                data.images = files.map(item => ({fileKey: item.fileKey, fileUrl: item.fileUrl}))
            }
        }

        let response

        if (updateItem) {
            response = await products.update({id: updateItem.id, name: values.name, description: values.description})
        } else {
            response = await products.create(userId, data)
        }

        if (response.status === 200) {
            router.push(`/profile/${userId}/product`)
        } else {
            //ToDo: catch validation errors
        }
    }

    function handleAddCharacteristic(formik) {
        if (formik.values.characteristicName && formik.values.characteristicValue) {
            let characteristics = [...formik.values.characteristics, {name: formik.values.characteristicName, value: formik.values.characteristicValue}]
            formik.setFieldValue("characteristics", characteristics)

            formik.setFieldValue("characteristicName", "")
            formik.setFieldValue("characteristicValue", "")
            setDisplayCharacteristicForm(false)
        } else {
            if (!formik.values.characteristicName)
                formik.setFieldError("characteristicName", "campo requerido")

            if (!formik.values.characteristicValue)
                formik.setFieldError("characteristicValue", "campo requerido")
        }
    }

    function handleRemoveCharacteristic(formik, index) {
        let characteristics = [...formik.values.characteristics]
        characteristics.splice(index, 1)
        formik.setFieldValue("characteristics", characteristics)
    }

    function MyDropzone({formik}) {
        function onDrop(acceptedFiles) {
            const newFiles = [...acceptedFiles]
            let addedFiles = [...formik.values.images]

            newFiles.forEach((newFile) => {
                //only 3 images allowed
                if (addedFiles.length < 3) {
                    const index = formik.values.images.findIndex((item) => item.name === newFile.name)
                    if (index < 0) {
                        newFile.preview = URL.createObjectURL(newFile)
                        addedFiles.push(newFile)
                    }
                }
            })

            formik.setFieldValue("images", addedFiles)
        }

        const {getRootProps, getInputProps, isDragActive} = useDropzone(
            {
                accept: {
                    'image/*': ['.jpeg', '.jpg', '.png']
                },
                multiple: true,
                maxFiles: 3,
                maxSize: 4000000,
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
                            <p>Arrastre imágenes hasta aquí o click para seleccionar. <br/>
                                Sube hasta 3 archivos menores de 4MB cada uno. <br/>
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
            //ToDo: inform backend about deleted images
        } else {
            URL.revokeObjectURL(images[deleteIndex].preview)
        }

        images.splice(deleteIndex, 1)

        formik.setFieldValue("images", [...images])
    }

    const thumbs = (formik) => formik.values.images.map((file) => (
        <Badge
            key={file.name}
            overlap={"circular"}
            badgeContent={<Cancel fontSize={"small"} sx={{color: "lighterRed", cursor: "pointer"}} />}
            onClick={() => handleRemoveImage(formik, file)}
        >
            <Avatar key={file.name} src={file.preview} variant={"rounded"} sx={{width: "50px", height: "50px", marginX: "5px"}}/>
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
                    <Card variant={"outlined"}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container rowSpacing={2}>
                                <Grid item xs={12}>
                                    <CustomToolbar/>
                                </Grid>

                                <Grid container item rowSpacing={4} sx={{padding: "25px"}}>
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
                                                departments.map(item => (<MenuItem key={item.id} value={item}>{item.name}</MenuItem>))
                                            }
                                        </TextField>
                                    </Grid>

                                    <Grid item container xs={12} rowSpacing={2}>
                                        <Grid item xs={12} sx={{paddingX: "15px"}}>
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
                                                        <Grid item sx={{marginLeft: "3px"}}>
                                                            <DeleteOutline
                                                                fontSize={"small"}
                                                                color={"secondary"}
                                                                onClick={() => handleRemoveCharacteristic(formik, index)}
                                                                sx={{cursor: "pointer"}}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                ))
                                            }
                                            {
                                                !displayCharacteristicForm && (
                                                    <IconButton onClick={() => setDisplayCharacteristicForm(true)}>
                                                        <AddOutlined />
                                                    </IconButton>
                                                )
                                            }
                                        </Grid>

                                        {
                                            displayCharacteristicForm && (
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
                                                            <Done color={"primary"}/>
                                                        </IconButton>

                                                        <IconButton onClick={() => setDisplayCharacteristicForm(false)}>
                                                            <Close />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            )
                                        }

                                        <Grid item xs={12} sx={{mt: "15px"}}>
                                            <MyDropzone formik={formik}/>
                                        </Grid>
                                        <Grid item container xs={12} justifyContent={"center"}>
                                            <aside>{thumbs(formik)}</aside>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid container item justifyContent={"flex-end"} sx={{paddingRight: "25px"}}>
                                    <Button
                                        color={"secondary"}
                                        variant={"outlined"}
                                        size={"small"}
                                        sx={{m: 1}}
                                        onClick={() => router.push(`/profile/${userId}/product`)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        type={"submit"}
                                        color={"primary"}
                                        variant={"outlined"}
                                        size={"small"}
                                        sx={{m: 1}}
                                        disabled={!formik.isValid}
                                    >
                                        {updateItem ? "Update" : "Create"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Card>
                )
            }
        </Formik>

    )
}