'use client'

import { Button, Card, Grid, Typography, AppBar, Box, TextField } from '@mui/material';
import auth from '../../requests/auth';
import { Formik } from 'formik';
import * as Yup from 'yup';
import React from 'react';

const SendEmailPage = () => {
    const sendEmailInitialValues = {
        email: '',
    };

    const sendEmailValidationSchema = Yup.object({
        email: Yup.string()
            .required('Este campo es requerido')
            .email('No es un correo válido'),
    });

    return <Formik
        initialValues={sendEmailInitialValues}
        validationSchema={sendEmailValidationSchema}
        onSubmit={async ({ email }) => { await auth.sendEmailToFindUser(email) }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors }) => (
                <form onSubmit={handleSubmit}>
                    <Grid display={"flex"} justifyContent={"center"} height={'100vh'} mx={"auto"} width={'80vw'} alignItems={"center"}>
                        <Card >
                            <AppBar position={"static"} variant={"elevation"} color={"primary"} sx={{ paddingX: "40px" }}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", m: "10px" }}>
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        sx={{
                                            fontWeight: 700,
                                            letterSpacing: ".1rem",
                                            color: "white",
                                        }}
                                    >
                                        Introduzca su correo
                                    </Typography>
                                </Box>
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
                            <Grid item display={"flex"} mb={"20px"} px={"40px"} justifyContent={"center"} alignItems={"center"}>
                                <Button
                                    type={"submit"}
                                    color={"primary"}
                                    disabled={!!errors.email && touched.email}
                                    variant={"contained"}
                                    size={"large"}
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