"use client"

import React from "react";
import {
    Avatar, Button,
    Card,
    Divider, Fade,
    Grid, IconButton, InputAdornment, TextField,
    Typography
} from "@mui/material";
import {
    ChevronLeft, ChevronRight,
    InfoOutlined,
    KeyboardDoubleArrowRightOutlined, PersonOutlined, VisibilityOffOutlined, VisibilityOutlined
} from "@mui/icons-material";

//forms
import { Formik } from "formik"
import * as Yup from 'yup';

import loginPageStyles from "@/assets/styles/loginPageStyles"

import {useRouter} from "next/navigation";

export default function Login() {
    const [showSignUpForm, setShowSignUpForm] = React.useState(false)

    const router = useRouter()

    const LoginForm = () => {
        const initialValues = {
            username: "",
            password: ""
        }

        const validationSchema = Yup.object({
            username: Yup.string()
                .required('field required'),
            password: Yup.string()
                .required('field required')
        })

        const [showPassword, setShowPassword] = React.useState(false);
        const toggleVisibility = () => {
            setShowPassword(!showPassword);
        }

        return <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setFieldError }) => {
                //login function
            }}
        >
            {
                formik => (
                    <Grid container item xs={12}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container item xs={12} spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="username"
                                        label="Username"
                                        size={"small"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("username")}
                                        error={formik.errors.username && formik.touched.username}
                                        helperText={(formik.errors.username && formik.touched.username) && formik.errors.username}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end" sx={{mr: "6px"}}>
                                                    <PersonOutlined />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="password"
                                        label="Password"
                                        size={"small"}
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("password")}
                                        error={formik.errors.password && formik.touched.password}
                                        helperText={(formik.errors.password && formik.touched.password) && formik.errors.password}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibility}
                                                >
                                                    <IconButton size={"small"}>
                                                        {
                                                            showPassword
                                                                ? <VisibilityOffOutlined/>
                                                                : <VisibilityOutlined/>
                                                        }
                                                    </IconButton>
                                                </InputAdornment>
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        color={"primary"}
                                        type="submit"
                                        variant={"contained"}
                                        size={"large"}
                                        sx={{width: "100%"}}
                                        onClick={() => router.push("/profile/2")}
                                    >
                                        Login
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                )
            }
        </Formik>
    }

    const SignUpForm = () => {
        const initialValues = {
            username: '',
            email: '',
            password1: '',
            password2: ''
        }

        const validationSchema = Yup.object({
            username: Yup.string()
                .required('field required')
                .min(6, 'username most contain 6 characters at least'),
            email: Yup.string()
                .required('field required')
                .email('email address is not valid'),
            password1: Yup.string()
                .required('field required')
                .min(8, 'most contain 8 characters at least'),
            password2: Yup.string()
                .required('field required')
                .when("password1", {
                    is: val => ((val && val.length > 0)),
                    then: Yup.string().oneOf(
                        [Yup.ref("password1")],
                        "password does not match"
                    )
                })
        })

        const [showPassword1, setShowPassword1] = React.useState(false);
        const [showPassword2, setShowPassword2] = React.useState(false);
        const toggleVisibilityPassword1 = () => {
            setShowPassword1(!showPassword1)
        }
        const toggleVisibilityPassword2 = () => {
            setShowPassword2(!showPassword2)
        }

        return <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(data, { setErrors }) => {
                //register here
            }}
        >
            {
                formik => (
                    <Grid item xs={12}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container item xs={12} spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="username"
                                        label="Username*"
                                        size={"small"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("username")}
                                        error={formik.errors.username && formik.touched.username}
                                        helperText={(formik.errors.username && formik.touched.username) && formik.errors.username}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="email"
                                        label="Email*"
                                        size={"small"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("email")}
                                        error={formik.errors.email && formik.touched.email}
                                        helperText={(formik.errors.email && formik.touched.email) && formik.errors.email}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="password1"
                                        label="Password*"
                                        size={"small"}
                                        type={showPassword1 ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("password1")}
                                        error={formik.errors.password1 && formik.touched.password1}
                                        helperText={(formik.errors.password1 && formik.touched.password1) && formik.errors.password1}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityPassword1}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showPassword1 ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="password2"
                                        label="Confirm Password*"
                                        size={"small"}
                                        type={showPassword2 ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...formik.getFieldProps("password2")}
                                        error={formik.errors.password2 && formik.touched.password2}
                                        helperText={(formik.errors.password2 && formik.touched.password2) && formik.errors.password2}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityPassword2}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showPassword2 ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
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
                                        sx={{width: "100%"}}
                                        disabled={!formik.isValid}
                                    >
                                        Create
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                )
            }
        </Formik>
    }

    return (
        <Grid container sx={loginPageStyles.container}>
            <Card variant={"elevation"} sx={loginPageStyles.card}>
                <Grid container sx={loginPageStyles.cardContainer}>
                    <Grid container item sx={loginPageStyles.leftColumnContainer}>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"}>
                            <Avatar
                                src="/logo200.png"
                                sx={{width: "200px", height: "200px"}}
                            />
                        </Grid>
                        <Grid container item xs={12} justifyContent={"center"} textAlign={"justify"}>
                            <Typography variant={"h4"}>
                                + Inventory
                            </Typography>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{p: 1}}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{p: 1}}>
                                <Typography variant={"body1"}>
                                    Inventario online
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{p: 1}}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{p: 1}}>
                                <Typography variant={"body1"}>
                                    Gestión de productos
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{p: 1}}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{p: 1}}>
                                <Typography variant={"body1"}>
                                    Gestión almacenes y tiendas
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{p: 1}}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{p: 1}}>
                                <Typography variant={"body1"}>
                                    Catálogo online
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item sx={loginPageStyles.rightColumnContainer}>
                        <Grid container item alignItems={"center"} sx={{ width: "100%", m: 3}}>
                            <Button
                                color={"primary"}
                                variant={showSignUpForm ? "text" : "outlined"}
                                onClick={() => setShowSignUpForm(false)}
                                size={"small"}
                            >
                                Login
                            </Button>

                            <Divider
                                orientation={"vertical"}
                                sx={{
                                    ml: 1,
                                    mr: 1,
                                    display: "inline-flex",
                                    width: "0",
                                    height: "30px",
                                    border: 0,
                                    borderLeft: 2
                                }}
                            />

                            <Button
                                color={"secondary"}
                                variant={showSignUpForm ? "outlined" : "text"}
                                onClick={() => setShowSignUpForm(true)}
                                size={"small"}
                            >
                                Sign up
                            </Button>
                        </Grid>

                        { showSignUpForm ? <SignUpForm/> : <LoginForm /> }
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}