'use client';

import { Button, Card, Grid, Typography, AppBar, TextField, InputAdornment, IconButton } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import auth from '../../../requests/auth';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {notifySuccess} from "@/utils/generalFunctions";

const ChangePassword = () => {
    const router = useRouter();

    const { token } = useParams();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const toggleVisibilityPassword = () => setShowPassword(!showPassword);
    const toggleVisibilityConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const [errorMessage, setErrorMessage] = useState<string>("");

    const changePasswordInitialValues = {
        password: '',
        confirmPassword: ''
    };

    const changePasswordValidationSchema = Yup.object({
        password: Yup.string()
            .required('Este campo es requerido')
            .min(8, 'Debe contener al menos 8 caracteres'),
        confirmPassword: Yup.string()
            .required('Este campo es requerido')
            .nullable()
            .oneOf([Yup.ref("password"), null],
                "Las contraseñas no coinciden")
    });

    return <Formik
        initialValues={changePasswordInitialValues}
        validationSchema={changePasswordValidationSchema}
        onSubmit={async ({ password }) => {
            const response = await auth.changePassword(token.toString(), password);

            if (response) {
                if (response.status === 200) {
                    notifySuccess("Nueva contraseña establecida. Ahora puede iniciar sesión")

                    router.push('/');
                } else {
                    setErrorMessage(response)
                }
            }
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors, isValid }) => (
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
                                    Establecer contraseña
                                </Typography>
                            </AppBar>
                            <Grid container item xs={12} spacing={2} paddingY={"20px"} paddingX={"30px"} mb={"10px"}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Contraseña"
                                        size={"small"}
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("password")}
                                        error={!!errors.password && touched.password}
                                        helperText={(errors.password && touched.password) && errors.password}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityPassword}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Confirmar contraseña"
                                        size={"small"}
                                        type={showConfirmPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("confirmPassword")}
                                        error={!!errors.confirmPassword && touched.confirmPassword}
                                        helperText={(errors.confirmPassword && touched.confirmPassword) && errors.confirmPassword}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityConfirmPassword}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showConfirmPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            {errorMessage &&
                                <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} mb={"10px"} >
                                    <Typography variant='subtitle1' color={"red"} align='center'>
                                        {errorMessage}
                                    </Typography>
                                </Grid>}

                            <Grid item display={"flex"} mb={"20px"} px={"20px"} justifyContent={"flex-end"}>
                                <Button
                                    color={"inherit"}
                                    variant={"outlined"}
                                    onClick={() => router.replace("/")}
                                    size={"small"}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type={"submit"}
                                    color={"primary"}
                                    disabled={!isValid}
                                    variant={"outlined"}
                                    size={"small"}
                                    sx={{ml: "10px"}}
                                >
                                    Restablecer
                                </Button>
                            </Grid>
                        </Card>
                    </Grid>
                </form >
            )
        }
    </Formik >
};

export default ChangePassword;