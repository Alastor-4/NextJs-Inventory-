'use client'

import { Button, Card, Grid, Typography, AppBar, Box, TextField } from '@mui/material';
import auth from '../requests/auth';
import { Formik } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import {useRouter} from "next/navigation";

const SendEmailPage = () => {
    const router = useRouter();

    const sendEmailInitialValues = {
        email: '',
    };

    const sendEmailValidationSchema = Yup.object({
        email: Yup.string()
            .required('Especifique correo')
            .email('No es un correo válido'),
    });

    return <Formik
        initialValues={sendEmailInitialValues}
        validationSchema={sendEmailValidationSchema}
        onSubmit={async ({ email }) => {
            await auth.sendEmailToFindUser(email)

            return router.replace("/")
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors }) => (
                <form onSubmit={handleSubmit}>
                    <Grid display={"flex"} justifyContent={"center"} alignItems={"center"} height={'100vh'}>
                        <Card sx={{width: {xs: "80vw", sm: "70vw", md: "40vw", lg: "30vw"}}}>
                            <AppBar position={"static"} variant={"elevation"} color={"primary"}>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: ".1rem",
                                        color: "white",
                                        padding: "10px"
                                    }}
                                >
                                    Recuperar contraseña
                                </Typography>
                            </AppBar>
                            <Grid item xs={12} padding={"20px"} mb={"10px"}>
                                <TextField
                                    label="Correo*"
                                    size={"small"}
                                    fullWidth
                                    autoComplete='off'
                                    variant="outlined"
                                    inputMode="email"
                                    {...getFieldProps("email")}
                                    error={!!errors.email && touched.email}
                                    helperText={(errors.email && touched.email) && errors.email}
                                />
                            </Grid>
                            <Grid item display={"flex"} mb={"20px"} px={"20px"} justifyContent={"flex-end"}>
                                <Button
                                    type={"submit"}
                                    color={"inherit"}
                                    variant={"outlined"}
                                    onClick={() => router.push("/")}
                                >
                                    Regresar
                                </Button>

                                <Button
                                    type={"submit"}
                                    color={"primary"}
                                    disabled={!!errors.email && touched.email}
                                    variant={"outlined"}
                                    sx={{ml: "20px"}}
                                >
                                    Enviar
                                </Button>
                            </Grid>
                        </Card>
                    </Grid>
                </form>
            )
        }
    </Formik >
}

export default SendEmailPage