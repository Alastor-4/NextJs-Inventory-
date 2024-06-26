//@ts-nocheck
"use client"

import { AppBar, Box, Button, Card, Grid, MenuItem, TextField, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useParams, useRouter } from 'next/navigation';
import warehouses from "../requests/warehouses";

export default function WarehousesForm() {
    const [ownerUsers, setOwnerUsers] = React.useState([]);

    const [updateItem, setUpdateItem] = React.useState();

    const params = useParams();
    const router = useRouter();

    React.useEffect(() => {
        async function fetchOwnerUsers(id: any) {
            let ownerUsers = await warehouses.allOwnerUsers()

            if (ownerUsers.length) {
                setOwnerUsers(ownerUsers)
            }
        }

        fetchOwnerUsers()
    }, [])

    React.useEffect(() => {
        async function fetchWarehouse(id: any) {
            let item = await warehouses.warehouseDetails(id)

            const userIndex = ownerUsers.findIndex(userItem => userItem.id === item.users.id)

            item.users = ownerUsers[userIndex]

            setUpdateItem(item)
        }
        if (params?.warehouseId && ownerUsers.length) {
            fetchWarehouse(params.warehouseId)
        }
    }, [ownerUsers, params.warehouseId, setUpdateItem])

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
                        {updateItem ? "Modificar almacén" : "Crear almacén"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        owner: updateItem ? updateItem.users.id : "",
        name: updateItem ? updateItem.name : "",
        description: updateItem ? updateItem.description : "",
        address: updateItem ? updateItem.address : "",
    }

    const validationSchema = Yup.object({
        owner: Yup.string().required("Este campo es requerido"),
        name: Yup.string().required("Este campo es requerido"),
        description: Yup.string(),
        address: Yup.string(),
    })

    const handleSubmit = async (values) => {
        let response

        if (updateItem) {
            response = await warehouses.update(
                {
                    id: updateItem.id,
                    name: values.name,
                    description: values.description,
                    address: values.address,
                    ownerId: values.owner
                })
        } else {
            response = await warehouses.create(
                {
                    name: values.name,
                    description: values.description,
                    address: values.address,
                    ownerId: values.owner
                })
        }

        if (response.status === 200) {
            router.push(`/inventory/admin/warehouse`)
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
                                name={"owner"}
                                label="Dueño"
                                size={"small"}
                                fullWidth
                                select
                                {...formik.getFieldProps("owner")}
                                error={formik.errors.owner && formik.touched.owner}
                                helperText={(formik.errors.owner && formik.touched.owner) && formik.errors.owner}
                            >
                                {
                                    ownerUsers.map(item => (<MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>))
                                }
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"nombre"}
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
                                name={"address"}
                                label="Dirección"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("address")}
                                error={formik.errors.address && formik.touched.address}
                                helperText={(formik.errors.address && formik.touched.address) && formik.errors.address}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        <Button
                            color={"error"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            onClick={() => router.push(`/inventory/admin/warehouse`)}
                        >
                            Cerrar
                        </Button>

                        <Button
                            type={"submit"}
                            color={"primary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            disabled={!formik.isValid}
                        >
                            {updateItem ? "Modificar" : "Crear"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}