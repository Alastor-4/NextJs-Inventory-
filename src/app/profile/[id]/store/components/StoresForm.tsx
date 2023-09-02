"use client"

import {AppBar, Box, Button, Card, Grid, MenuItem, TextField, Toolbar, Typography} from "@mui/material";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useRouter } from 'next/navigation';
import stores from "@/app/profile/[id]/store/requests/stores";

export default function StoresForm(props) {
    const { userId, storeId, sellerUsers } = props

    const router = useRouter()

    const [updateItem, setUpdateItem] = React.useState()
    const [userSeller, setUserSeller] = React.useState("")

    React.useEffect(() => {
        async function fetchStore(id) {
            const store = await stores.storeDetails(userId, id)
            setUpdateItem(store)
            if (store.seller_user) {
                const index = sellerUsers.findIndex(item => item.id === store.seller_user.id)
                setUserSeller(index > -1 ? sellerUsers[index] : "")
            }
        }
        if (storeId !== undefined) {
            fetchStore(storeId)
        }
    }, [sellerUsers, storeId, userId])

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
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
                        {updateItem ? "Modificar Tienda" : "Crear Tienda"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        name: updateItem ? updateItem.name : "",
        description: updateItem ? updateItem.description : "",
        slogan: updateItem ? updateItem.slogan : "",
        address: updateItem ? updateItem.address : "",
        sellerUser: userSeller,
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("campo requerido"),
        description: Yup.string(),
        slogan: Yup.string(),
        address: Yup.string(),
        sellerUser: Yup.object(),
    })

    const handleSubmit = async (values) => {
        const data = {
            ownerId: parseInt(userId),
            storeId: parseInt(storeId),
            name: values.name,
            description: values.description,
            slogan: values.slogan,
            address: values.address,
            sellerUserId: values.sellerUser?.id ?? null
        }

        let response

        if (updateItem) {
            response = await stores.update(userId, data)
        } else {
            response = await stores.create(userId, data)
        }

        if (response.status === 200) {
            router.push(`/profile/${userId}/store`)
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

    return (
        <Card variant={"outlined"}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container rowSpacing={2}>

                    <Grid item xs={12}>
                        <CustomToolbar />
                    </Grid>

                    <Grid container item rowSpacing={4} sx={{ padding: "25px" }}>

                        <Grid item xs={12}>
                            <TextField
                                name={"Nombre"}
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
                                name={"Description"}
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
                                name={"Slogan"}
                                label="Slogan"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("slogan")}
                                error={formik.errors.slogan && formik.touched.slogan}
                                helperText={(formik.errors.slogan && formik.touched.slogan) && formik.errors.slogan}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Address"}
                                label="Dirección"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("address")}
                                error={formik.errors.address && formik.touched.address}
                                helperText={(formik.errors.address && formik.touched.address) && formik.errors.address}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Seller"}
                                label="Vendedor(a)"
                                size={"small"}
                                fullWidth
                                select
                                {...formik.getFieldProps("sellerUser")}
                                error={formik.errors.sellerUser && formik.touched.sellerUser}
                                helperText={(formik.errors.sellerUser && formik.touched.sellerUser) && formik.errors.sellerUser}
                            >
                                <MenuItem value={""}>Ninguno</MenuItem>
                                {
                                    sellerUsers.map(item => (
                                        <MenuItem key={item.id} value={item}>{`${item.name} (${item.username})`}</MenuItem>
                                    ))
                                }
                            </TextField>
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>

                        <Button
                            type={"submit"}
                            color={"primary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
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