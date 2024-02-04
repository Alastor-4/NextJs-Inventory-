"use client"

import { Toolbar, AppBar, IconButton, Box, Typography, Card, Grid, Avatar, Button, TextField } from '@mui/material';
import ChangeAccountPasswordModal from './Modal/ChangePasswordModal';
import { AddAPhoto, ArrowLeftOutlined } from '@mui/icons-material';
import { handleKeyDown } from '@/utils/handleKeyDown';
import { AccountProps } from '@/types/interfaces';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

const Account = ({ user }: AccountProps) => {
    const router = useRouter();

    const handleNavigateBack = () => router.back();

    const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] = useState<boolean>(false);

    const initialValues = {
        username: user?.username,
        email: user?.mail,
        name: user?.name,
        phone: user?.phone
    }

    const signUpValidationSchema = Yup.object({
        username: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\S*$/, 'No puede contener espacios')
            .min(6, 'Debe contener al menos 6 caracteres')
            .test('lowercase', 'Debe estar todo en minúsculas', (value) => {
                return value === value.toLowerCase();
            }),
        email: Yup.string()
            .required('Este campo es requerido')
            .email('No es un correo válido'),
        name: Yup.string()
            .required('Este campo es requerido'),
        phone: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\d{8}$/, 'El teléfono debe tener 8 dígitos')
    });

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeftOutlined fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{ fontWeight: 700, letterSpacing: ".1rem", color: "white" }}
                    >
                        Mi Perfil
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={signUpValidationSchema}
            onSubmit={async (data, { setFieldError }) => {
                // const messages: { "key": string, "message": string }[] = await auth.verifyRegisterData(data.username, data.phone, data.email);
                // if (messages.length === 0) {
                //     await auth.register(data);
                //     setShowRegisterForm(false);
                // } else {
                //     messages.forEach((({ key, message }) => setFieldError(key, message)));
                // }
            }}
        >
            {
                ({ handleSubmit, getFieldProps, touched, errors, isValid, resetForm }) => (
                    <Card variant='outlined'>
                        <CustomToolbar />
                        <ChangeAccountPasswordModal isOpen={isOpenChangePasswordModal} setIsOpen={setIsOpenChangePasswordModal} user={user} />
                        <Card variant='outlined' sx={{ marginX: "1.5rem", marginTop: "4rem", overflow: "visible", marginBottom: "2rem" }}>
                            <Grid item container justifyContent={"center"} marginBottom={"2rem"}>
                                <Grid item container width={"auto"} sx={{ marginTop: "-3rem", position: "relative" }}>
                                    <Grid item>
                                        <Avatar sx={{ height: "8rem", width: "8rem", border: "3px solid white" }} />
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            sx={{
                                                position: "absolute", bottom: 0,
                                                right: 0, backgroundColor: "white",
                                                borderRadius: "25px", "&:hover": { backgroundColor: "white" }
                                            }}
                                            onClick={() => {
                                                // TODO: editar foto
                                            }}
                                        >
                                            <AddAPhoto />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                <Grid item container justifyContent={"center"} sx={{ padding: "1rem", marginX: "1rem" }}>
                                    <Grid item xs={12}>
                                        <form onSubmit={handleSubmit}>
                                            <Grid container item xs={12} spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Usuario"
                                                        size={"small"}
                                                        fullWidth
                                                        variant="outlined"
                                                        {...getFieldProps("username")}
                                                        error={!!errors.username && touched.username}
                                                        helperText={(errors.username && touched.username) && errors.username}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Nombre"
                                                        size={"small"}
                                                        fullWidth
                                                        variant="outlined"
                                                        {...getFieldProps("name")}
                                                        error={!!errors.name && touched.name}
                                                        helperText={(errors.name && touched.name) && errors.name}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Teléfono"
                                                        size={"small"}
                                                        onKeyDown={handleKeyDown}
                                                        inputMode="tel"
                                                        fullWidth
                                                        variant="outlined"
                                                        {...getFieldProps("phone")}
                                                        error={!!errors.phone && touched.phone}
                                                        helperText={(errors.phone && touched.phone) && errors.phone}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Correo"
                                                        size={"small"}
                                                        fullWidth
                                                        variant="outlined"
                                                        inputMode="email"
                                                        {...getFieldProps("email")}
                                                        error={!!errors.email && touched.email}
                                                        helperText={(errors.email && touched.email) && errors.email}
                                                    />
                                                </Grid>
                                                <Grid item container marginTop={"1rem"} justifyContent={"space-around"}>
                                                    <Button
                                                        type="reset"
                                                        color='secondary'
                                                        variant="outlined"
                                                        onClick={() => { resetForm() }}
                                                    >
                                                        Reestablecer
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        color='primary'
                                                        variant="outlined"
                                                        disabled={!isValid}
                                                    >
                                                        Guardar
                                                    </Button>
                                                </Grid>
                                                <Grid item mx={"auto"} justifyContent={"center"}>
                                                    <Button variant='outlined' onClick={() => { setIsOpenChangePasswordModal(true) }}>Cambiar Contraseña</Button>
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Card>
                    </Card>)}
        </Formik>
    )
}

export default Account