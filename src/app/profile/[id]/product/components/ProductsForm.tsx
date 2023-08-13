"use client"

import {
    AppBar,
    Box,
    Button,
    Card, FormControl, FormControlLabel,
    Grid,
    Icon,
    IconButton,
    MenuItem,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import {useFormik} from "formik";
import * as Yup from "yup"
import {useParams, useRouter} from 'next/navigation';
import roles from "@/app/role/requests/roles";
import products from "@/app/profile/[id]/product/requests/products";
import {AddOutlined, Close, DeleteOutline, Done, RemoveOutlined} from "@mui/icons-material";

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
        image: updateItem ? updateItem.image : "",
        department: updateItem?.departments?.id ? updateItem.departments.id : "",
        characteristics: updateItem?.characteristics?.id ? updateItem.characteristics.id : [],
        characteristicName: "",
        characteristicValue: "",
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("field required"),
        description: Yup.string(),
        buyPrice: Yup.number().nullable(),
        image: Yup.string().nullable(),
        department: Yup.object(),
        characteristics: Yup.array().of(Yup.object()),
        characteristicName: Yup.string().nullable(),
        characteristicValue: Yup.string().nullable(),
    })

    const handleSubmit = async (values) => {
        let response

        let data = new FormData()

        if (updateItem) {
            response = await products.update({id: updateItem.id, name: values.name, description: values.description})
        } else {
            data.set("name", values.name)
            data.set("description", values.description)
            data.set("buyPrice", values.buyPrice)
            data.set("departmentId", values.department.id)
            data.set("userId", userId)
            data.set("characteristics", JSON.stringify(values.characteristics))
            data.set("image", values.image)

            response = await products.create(userId, data)
        }

        if (response.status === 200) {
            router.push(`/profile/${userId}/product`)
        } else {
            //ToDo: catch validation errors
        }
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    })

    function handleAddCharacteristic() {
        if (formik.values.characteristicName && formik.values.characteristicValue) {
            let characteristics = [...formik.values.characteristics, {name: formik.values.characteristicName, value: formik.values.characteristicValue}]
            formik.setFieldValue("characteristics", characteristics)

            formik.setFieldValue("characteristicName", "")
            formik.setFieldValue("characteristicValue", "")
            setDisplayCharacteristicForm(false)
        } else {
            if (!formik.values.characteristicName)
                formik.setFieldError("characteristicName", "field required")

            if (!formik.values.characteristicValue)
                formik.setFieldError("characteristicValue", "field required")
        }
    }

    function handleRemoveCharacteristic(index) {
        let characteristics = [...formik.values.characteristics]
        characteristics.splice(index, 1)
        formik.setFieldValue("characteristics", characteristics)
    }

    return (
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
                                    label={"Características"}
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
                                                    onClick={() => handleRemoveCharacteristic(index)}
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
                                                label="Nombre"
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
                                           <IconButton color={"primary"} onClick={handleAddCharacteristic}>
                                               <Done color={"primary"}/>
                                           </IconButton>

                                            <IconButton onClick={() => setDisplayCharacteristicForm(false)}>
                                                <Close />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                )
                            }

                            <Grid item xs={12}>
                                <TextField
                                    type={"file"}
                                    name={"image"}
                                    size={"small"}
                                    {...formik.getFieldProps("image")}
                                    error={formik.errors.image && formik.touched.image}
                                    helperText={(formik.errors.image && formik.touched.image) && formik.errors.image}
                                />
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