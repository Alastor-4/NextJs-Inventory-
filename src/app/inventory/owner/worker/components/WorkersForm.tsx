"use client"

import { AppBar, Box, Button, Card, Grid, IconButton, TextField, Toolbar, Typography } from "@mui/material";
import workerSearchResultStyles from "@/assets/styles/workerSearchResultStyles";
import { Done, InfoOutlined } from "@mui/icons-material";
import { handleKeyDown } from "@/utils/handleKeyDown";
import ownerUsers from "../requests/ownerUsers";
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import { users } from "@prisma/client";
import { AxiosResponse } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup"
import InfoTooltip from "@/components/InfoTooltip";

interface WorkersFormProps {
    ownerId?: number;
}

export default function WorkersForm({ ownerId }: WorkersFormProps) {
    const router = useRouter();

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
                        Agregar trabajador
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const [displaySearchResult, setDisplaySearchResult] = useState(false);
    const [foundUserData, setFoundUserData] = useState<users | null>(null);

    const [isOpenTooltipUp, setIsOpenTooltipUp] = useState<boolean>(false);
    const handleTooltipUpClose = () => setIsOpenTooltipUp(false);
    const handleTooltipUpOpen = () => setIsOpenTooltipUp(true);

    const [isOpenTooltipDown, setIsOpenTooltipDown] = useState<boolean>(false);
    const handleTooltipDownClose = () => setIsOpenTooltipDown(false);
    const handleTooltipDownOpen = () => setIsOpenTooltipDown(true);
    interface valuesProps {
        username: string;
        phone: number | string;
    }
    const initialValues: valuesProps = {
        username: "",
        phone: "",
    }

    const validationSchema = Yup.object({
        username: Yup.string().required("Este campo es requerido"),
        phone: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\d{8}$/, 'El teléfono debe tener 8 dígitos'),
    })

    const handleSubmit = async (values: valuesProps) => {
        let response: AxiosResponse | boolean = await ownerUsers.findNewUser(values.username, values.phone);

        if (!response) return;

        if (response.status === 200) {
            setFoundUserData(response.data);
            setDisplaySearchResult(true);
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
        const response: AxiosResponse | boolean = await ownerUsers.addNewUser(ownerId, foundUserData?.id)

        if (!response) return;

        if (response.status === 200) {
            router.push(`/inventory/owner/worker`)
        } else {
            //ToDo: make something with the error
        }

    }

    return (
        <Card variant={"outlined"}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container rowSpacing={2}>
                    <Grid item xs={12}>
                        <CustomToolbar />
                    </Grid>

                    <Grid item sx={{ paddingX: "25px" }}>
                        <Typography variant={"subtitle1"} sx={{ textWrap: "balance" }}>
                            Proporcione los datos exactos de un usuario para hacerlo su trabajador.
                        </Typography>
                    </Grid>

                    <Grid item sx={{ paddingX: "25px" }}>
                        El usuario debe estar registrado y verificado en el sistema y no puede ser trabajador de ningún usuario.
                        <InfoTooltip
                            isOpenTooltip={isOpenTooltipUp}
                            handleTooltipClose={handleTooltipUpClose}
                            message="Si el usuario es ya trabajador de algún usuario, primero debe darse baja para
                            que sea elegible en esta opción"
                        >
                            <IconButton size={"small"} onClick={handleTooltipUpOpen}>
                                <InfoOutlined fontSize={"small"}/>
                            </IconButton>
                        </InfoTooltip>
                    </Grid>

                    <Grid container item rowSpacing={2} sx={{ paddingX: "25px" }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Nombre de usuario"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("username")}
                                error={!!formik.errors.username && formik.touched.username}
                                helperText={(formik.errors.username && formik.touched.username) && formik.errors.username}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Teléfono del usuario"
                                size={"small"}
                                onKeyDown={handleKeyDown}
                                inputMode="tel"
                                fullWidth
                                {...formik.getFieldProps("phone")}
                                error={!!formik.errors.phone && formik.touched.phone}
                                helperText={(formik.errors.phone && formik.touched.phone) && formik.errors.phone}
                            />
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        {
                            displaySearchResult && (
                                <Button
                                    color={"secondary"}
                                    variant={"outlined"}
                                    size={"small"}
                                    sx={{ m: 1 }}
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
                            sx={{ m: 1 }}
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
                                                        Usuario encontrado:
                                                    </Grid>
                                                    <Grid container item rowSpacing={2}>
                                                        <Grid container item rowSpacing={1}>
                                                            <Grid item xs={12}>
                                                                {foundUserData.username}
                                                            </Grid>

                                                            <Grid item xs={12}>
                                                                Nombre: {foundUserData.name}
                                                            </Grid>

                                                            <Grid item xs={12}>
                                                                Teléfono: {foundUserData.phone}
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Button
                                                                variant={"outlined"}
                                                                color={"primary"}
                                                                size={"small"}
                                                                startIcon={<Done />}
                                                                onClick={handleAddWorker}
                                                            >
                                                                Agregar trabajador
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid item xs={12} sx={{textWrap: "pretty"}}>
                                                    No se encontró ningún usuario coincidente con los datos proporcionados.
                                                    <InfoTooltip
                                                        isOpenTooltip={isOpenTooltipDown}
                                                        handleTooltipClose={handleTooltipDownClose}
                                                        message="Póngase en contacto con el usuario y verifique los datos."
                                                    >
                                                        <IconButton size={"small"} onClick={handleTooltipDownOpen}>
                                                            <InfoOutlined fontSize={"small"}/>
                                                        </IconButton>
                                                    </InfoTooltip>
                                                </Grid>
                                            )
                                    }
                                </Card>
                            </Grid>
                        )
                    }

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            onClick={() => router.push(`/inventory/owner/worker`)}
                        >
                            Cancelar
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}