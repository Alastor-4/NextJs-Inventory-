// @ts-nocheck
"use client"

import { AppBar, Box, Button, Card, Grid, TextField, Toolbar, Typography } from "@mui/material";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useParams, useRouter } from 'next/navigation';
import roles from "../request/roles";

export default function RolesForm({userId}) {
    const [updateItem, setUpdateItem] = React.useState()

    const params = useParams()
    const router = useRouter()

    const roleId = params?.roleId

    React.useEffect(() => {
        async function fetchRole(id) {
            const rol = await roles.roleDetails(userId, id)
            setUpdateItem(rol)
        }
        if (roleId !== undefined) {
            fetchRole(roleId)
        }
    }, [userId, roleId, setUpdateItem])

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
                        {updateItem ? "Modificar rol" : "Crear role"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        name: updateItem ? updateItem.name : "",
        description: updateItem ? updateItem.description : "",
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("campo requerido"),
        description: Yup.string().required("campo requerido"),
    })

    const handleSubmit = async (values) => {
        let response

        if (updateItem) {
            response = await roles.update(userId, { id: updateItem.id, name: values.name, description: values.description })
        } else {
            response = await roles.create(userId, { name: values.name, description: values.description })
        }

        if (response.status === 200) {
            router.push(`/inventory/admin/role`)
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
                                name={"description"}
                                label="Descripción"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("description")}
                                error={formik.errors.description && formik.touched.description}
                                helperText={(formik.errors.description && formik.touched.description) && formik.errors.description}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            onClick={() => router.push(`/inventory/admin/role`)}
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