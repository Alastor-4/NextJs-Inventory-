'use client'

import { Grid, Button, InputAdornment, IconButton, TextField } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { handleKeyDown } from '@/utils/handleKeyDown';
import auth from "@/app/api/auth/requests/auth";
import { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterForm = ({ setShowRegisterForm }: { setShowRegisterForm: (bool: boolean) => void }) => {

    const initialValues = {
        username: '',
        email: '',
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
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
            .matches(/^\d{8}$/, 'El teléfono debe tener 8 dígitos'),
        password: Yup.string()
            .required('Este campo es requerido')
            .min(8, 'Debe contener al menos 8 caracteres'),
        confirmPassword: Yup.string()
            .required('Este campo es requerido')
            .nullable()
            .oneOf([Yup.ref("password"), null],
                "Las contraseñas no coinciden")
    })

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const toggleVisibilityPassword = () => setShowPassword(!showPassword);
    const toggleVisibilityConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return <Formik
        initialValues={initialValues}
        validationSchema={signUpValidationSchema}
        onSubmit={async (data, { setFieldError }) => {
            const messages: { "key": string, "message": string }[] = await auth.verifyRegisterData(data.username, data.phone, data.email);
            if (messages.length === 0) {
                await auth.register(data);
                setShowRegisterForm(false);
            } else {
                messages.forEach((({ key, message }) => setFieldError(key, message)));
            }
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors, isValid }) => (
                <Grid item xs={12}>
                    <form onSubmit={handleSubmit}>
                        <Grid container item xs={12} spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Usuario*"
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
                                    label="Nombre*"
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
                                    label="Teléfono*"
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
                                    label="Correo*"
                                    size={"small"}
                                    fullWidth
                                    variant="outlined"
                                    inputMode="email"
                                    {...getFieldProps("email")}
                                    error={!!errors.email && touched.email}
                                    helperText={(errors.email && touched.email) && errors.email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Contraseña*"
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
                                                    {showConfirmPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                </IconButton>
                                            </InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Confirmar contraseña*"
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
                                            </InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    color={"primary"}
                                    type="submit"
                                    variant={"contained"}
                                    size={"large"}
                                    sx={{ width: "100%" }}
                                    disabled={!isValid}
                                >
                                    Registrar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            )
        }
    </Formik>
}

export default RegisterForm