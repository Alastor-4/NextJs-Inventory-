'use client';

import { Button, Card, Grid, Typography, AppBar, Box, TextField, InputAdornment, IconButton } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import auth from '../../requests/auth';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const ChangePassword = () => {
    const router = useRouter();

    const { token } = useParams();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordChanged, setPasswordChanged] = useState<boolean>(false);

    const toggleVisibilityPassword = () => setShowPassword(!showPassword);
    const toggleVisibilityConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const [verified, setVerified] = useState<boolean | null>(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [message, setMessage] = useState<{ message: string, color: string }>({ message: 'Validando token...', color: "black" });

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const axiosResponse = await axios.get("/api/auth/register", { params: { token: token } })
                if (axiosResponse.status === 200) {
                    setMessage({ message: axiosResponse.data.message, color: "green" });
                    setVerified(true);
                    setUserEmail(axiosResponse.data.email);
                }
            } catch (error) {
                setMessage({ message: "Token de verificación incorrecto", color: "red" });
            }
        }
        !verified && verifyToken();
    }, [token, verified]);

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
            if (verified && !passwordChanged) {
                const response = await auth.changePassword(userEmail!, password);
                if (response?.status === 200) {
                    setPasswordChanged(true);
                }
            }
            if (passwordChanged) {
                router.push('/');
            }
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors, isValid }) => (
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
                                        {!passwordChanged ? "Cambiar contraseña" : "Contraseña cambiada"}
                                    </Typography>
                                </Box>
                            </AppBar>
                            <Grid container item xs={12} spacing={2} paddingY={"20px"} paddingX={"30px"} mb={"10px"}>
                                {!passwordChanged &&
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Contraseña*"
                                            size={"small"}
                                            type={showPassword ? "text" : "password"}
                                            fullWidth
                                            autoComplete='off'
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
                                    </Grid>}
                                {!passwordChanged && <Grid item xs={12}>
                                    <TextField
                                        label="Confirmar Contraseña*"
                                        size={"small"}
                                        type={showConfirmPassword ? "text" : "password"}
                                        fullWidth
                                        autoComplete='off'
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
                                </Grid>}
                            </Grid>
                            {!passwordChanged &&
                                <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} mb={"10px"} >
                                    <Typography variant='subtitle1' color={message.color} align='center' >
                                        {message.message}
                                    </Typography>
                                </Grid>}
                            <Grid item display={"flex"} mb={"20px"} px={"40px"} justifyContent={"center"} alignItems={"center"}>
                                <Button
                                    type={"submit"}
                                    color={"primary"}
                                    disabled={!isValid || !!errors.password && touched.password && !!errors.confirmPassword && touched.confirmPassword || !verified}
                                    variant={"contained"}
                                    size={"large"}
                                >
                                    {passwordChanged ? "Ir a iniciar sesión" : "Cambiar contraseña"}
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