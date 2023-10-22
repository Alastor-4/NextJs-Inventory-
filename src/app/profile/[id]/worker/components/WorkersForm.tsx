// @ts-nocheck
"use client"

import {AppBar, Box, Button, Card, Divider, Grid, IconButton, TextField, Toolbar, Typography} from "@mui/material";
import React, {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup"
import {useParams, useRouter} from 'next/navigation';
import roles from "@/app/role/requests/roles";
import ownerUsers from "@/app/profile/[id]/worker/requests/ownerUsers";
import {Done, InfoOutlined} from "@mui/icons-material";

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


    const [displaySearchResult, setDisplaySearchResult] = useState(false)
    const [foundUserData, setFoundUserData] = useState(null)

    const initialValues = {
        username: "",
        phone: "",
    }

    const validationSchema = Yup.object({
        username: Yup.string().required("campo requerido"),
        phone: Yup.string().required("campo requerido"),
    })

    const handleSubmit = async (values) => {
        let response = await ownerUsers.findNewUser(ownerId, values.username, values.phone)

        if (response?.status === 200) {
            setFoundUserData(response.data)
            setDisplaySearchResult(true)
        } else {
            //ToDo: catch validation errors
        }
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    })

    function handleCancelSearch() {
        formik.resetForm()
        setFoundUserData(null)
        setDisplaySearchResult(false)
    }

    async function handleAddWorker() {
        const response = await ownerUsers.addNewUser(ownerId, foundUserData.id)

        if (response?.status === 200) {
            router.push(`/profile/${ownerId}/worker`)
        } else {
            //ToDo: make something with the error
        }
    }

    return (
        <Card variant={"outlined"}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container rowSpacing={2}>
                    <Grid item xs={12}>
                        <CustomToolbar/>
                    </Grid>

                    <Grid item>
                       <Typography variant={"subtitle1"} sx={{paddingLeft: "20px"}}>
                           <InfoOutlined sx={{marginRight: "5px"}}/>
                           Proporcione los datos exactos de un usuario para hacerlo su trabajador y darle acceso en el sistema.
                           El usuario debe existir en el sistema, con su cuenta verificada y no puede ser trabajador de
                           otro usuario. Si el usuario es ya trabajador de algún usuario, primero debe darse baja para
                           que sea elegible en esta opción.
                       </Typography>
                    </Grid>

                    <Grid container item rowSpacing={4} sx={{padding: "25px"}}>
                        <Grid item xs={12}>
                            <TextField
                                name={"usuario"}
                                label="Nombre de usuario"
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
                                label="Teléfono del usuario"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("phone")}
                                error={formik.errors.phone && formik.touched.phone}
                                helperText={(formik.errors.phone && formik.touched.phone) && formik.errors.phone}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{paddingRight: "25px"}}>
                        {
                            displaySearchResult && (
                                <Button
                                    color={"secondary"}
                                    variant={"outlined"}
                                    size={"small"}
                                    sx={{m: 1}}
                                    onClick={handleCancelSearch}
                                >
                                    Limpiar busqueda
                                </Button>
                            )
                        }

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

                    {
                        displaySearchResult && (
                            <Grid item xs={12}>
                                <Card variant={"outlined"} sx={{ padding: "10px", margin: "0 15px 15px 15px" }}>
                                    {
                                        foundUserData
                                            ? (
                                                <Grid container rowSpacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant={"body1"}>
                                                            Encontrado un usuario que coincide con los datos proporcionados
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container item xs={12} rowSpacing={2}>
                                                        <Grid container item rowSpacing={1}>
                                                            <Grid container item columnSpacing={1}>
                                                                <Grid container item xs={1} justifyContent={"flex-end"}>
                                                                    Usuario:
                                                                </Grid>
                                                                <Grid item xs={11}>
                                                                    {foundUserData.username}
                                                                </Grid>
                                                            </Grid>

                                                            <Grid container item columnSpacing={1}>
                                                                <Grid container item xs={1} justifyContent={"flex-end"}>
                                                                    Nombre:
                                                                </Grid>
                                                                <Grid item xs={11}>
                                                                    {foundUserData.name}
                                                                </Grid>
                                                            </Grid>

                                                            <Grid container item columnSpacing={1}>
                                                                <Grid container item xs={1} justifyContent={"flex-end"}>
                                                                    Teléfono:
                                                                </Grid>
                                                                <Grid item xs={11}>
                                                                    {foundUserData.phone}
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Button
                                                                variant={"outlined"}
                                                                color={"primary"}
                                                                size={"small"}
                                                                startIcon={<Done/>}
                                                                onClick={handleAddWorker}
                                                            >
                                                                Agregar trabajador
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid container>
                                                    <Typography variant={"body1"}>
                                                        No se encontró ningun usuario con coincida con los datos
                                                        proporcionados. Pruebe proporcionando los valores exactos de
                                                        usuario y teléfono. Tenga en cuanta que el usuario debe tener su
                                                        cuanta verificada (tener acceso a nuestro sistema) y no puede ser
                                                        trabajador de ningun otro usuario.
                                                    </Typography>
                                                </Grid>
                                            )
                                    }
                                </Card>

                            </Grid>
                        )
                    }

                    <Grid container item justifyContent={"flex-end"} sx={{paddingRight: "25px"}}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{m: 1}}
                            onClick={() => router.push(`/profile/${ownerId}/worker`)}
                        >
                            Cancelar
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}