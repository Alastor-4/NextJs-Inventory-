"use client"

import { PersonOutlined, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { Button, Grid, IconButton, InputAdornment, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from 'yup';
import Link from "next/link";

const SignInForm = () => {
    const router = useRouter();

    const [loginTrysFailed, setLoginTrysFailed] = useState<number>(0);

    const initialValues = { username: "", password: "" };

    const signInValidationSchema = Yup.object({
        username: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\S*$/, 'No puede contener espacios')
            .min(6, 'Debe contener al menos 6 caracteres')
            .test('lowercase', 'Debe estar todo en minúsculas', (value) => {
                return value === value.toLowerCase();
            }),
        password: Yup.string()
            .required('Este campo es requerido')
    })

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const toggleVisibility = () => setShowPassword(!showPassword);

    return <Formik
        initialValues={initialValues}
        validationSchema={signInValidationSchema}
        onSubmit={async ({ username, password }, { setFieldError }) => {
            const responseNextAuth = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (responseNextAuth?.ok) router.push("/inventory");

            if (responseNextAuth?.error === "Contraseña incorrecta") {
                setFieldError("password", responseNextAuth.error);
                setLoginTrysFailed(loginTrysFailed + 1);
            } else {
                setFieldError("username", responseNextAuth?.error!)
            }
        }}
    >
        {
            ({ errors, touched, handleSubmit, getFieldProps }) => (
                <Grid container item xs={12}>
                    <form onSubmit={handleSubmit}>
                        <Grid container item xs={12} spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Usuario"
                                    size={"small"}
                                    fullWidth
                                    autoComplete="off"
                                    variant="outlined"
                                    {...getFieldProps("username")}
                                    error={!!errors.username && touched.username}
                                    helperText={(errors.username && touched.username) && errors.username}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end" sx={{ mr: "6px" }}>
                                                <PersonOutlined />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Contraseña"
                                    size={"small"}
                                    type={showPassword ? "text" : "password"}
                                    fullWidth
                                    autoComplete="off"
                                    variant="outlined"
                                    {...getFieldProps("password")}
                                    error={!!errors.password && touched.password}
                                    helperText={(errors.password && touched.password) && errors.password}
                                    InputProps={{
                                        endAdornment:
                                            <InputAdornment
                                                position="end"
                                                onClick={toggleVisibility}
                                            >
                                                <IconButton size={"small"}>
                                                    {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                                </IconButton>
                                            </InputAdornment>
                                    }}
                                />
                            </Grid>
                            {loginTrysFailed >= 2 &&
                                <Grid item xs={12} display={"flex"} justifyContent={"flex-end"} mx={"10px"} >
                                    <Link style={{ textDecoration: "none", color: "blue" }} href={"/api/auth/recover-password/send-email"}>¿Ha olvidado su contraseña?</Link>
                                </Grid>
                            }
                            <Grid item xs={12}>
                                <Button
                                    color={"primary"}
                                    type="submit"
                                    variant={"contained"}
                                    size={"large"}
                                    sx={{ width: "100%" }}
                                >
                                    Entrar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            )
        }
    </Formik >
}

export default SignInForm