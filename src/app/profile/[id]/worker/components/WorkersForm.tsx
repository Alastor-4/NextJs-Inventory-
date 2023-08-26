"use client"

import {AppBar, Box, Button, Card, Grid, TextField, Toolbar, Typography} from "@mui/material";
import React from "react";
import {useFormik} from "formik";
import * as Yup from "yup"
import {useParams, useRouter} from 'next/navigation';
import roles from "@/app/role/requests/roles";

export default function WorkersForm({ownerId}) {
    const [updateItem, setUpdateItem] = React.useState()

    const router = useRouter()

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
                        Agregar trabajador
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        username: "",
        phone: "",
    }

    const validationSchema = Yup.object({
        username: Yup.string().required("campo requerido"),
        phone: Yup.string().required("campo requerido"),
    })

    const handleSubmit = async (values) => {
        let response = await roles.create({name: values.name, description: values.description})

        if (response.status === 200) {

        } else {
            //ToDo: catch validation errors
        }
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    })

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
                                name={"usuario"}
                                label="Usuario"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("username")}
                                error={formik.errors.username && formik.touched.username}
                                helperText={(formik.errors.username && formik.touched.username) && formik.errors.username}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"phone"}
                                label="Teléfono"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("phone")}
                                error={formik.errors.phone && formik.touched.phone}
                                helperText={(formik.errors.phone && formik.touched.phone) && formik.errors.phone}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{paddingRight: "25px"}}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{m: 1}}
                            onClick={() => router.push("/role")}
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
                            Buscar
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}