"use client"

import { Avatar, Button, Card, Divider, Grid, Typography } from "@mui/material";
import { KeyboardDoubleArrowRightOutlined } from "@mui/icons-material";
import loginPageStyles from "@/assets/styles/loginPageStyles";
import React, { useEffect, useState } from "react";
import SignUpForm from "./auth/RegisterForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignInForm from "./auth/LoginForm";

const Login = () => {
    const { data: session } = useSession();

    const router = useRouter();

    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);

    useEffect(() => {
        if (session?.user.id) {
            router.push("/inventory");
        }
    }, [session, router]);

    return (
        <Grid container sx={loginPageStyles.container}>
            <Card variant={"elevation"} sx={loginPageStyles.card}>
                <Grid container sx={loginPageStyles.cardContainer}>
                    <Grid container item sx={loginPageStyles.leftColumnContainer}>
                        <Grid container item xs={12} justifyContent={"center"} alignItems={"center"} sx={{ pt: "20px" }}>
                            <Avatar
                                src="/logo200.png"
                                sx={{ width: "200px", height: "200px" }}
                            />
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{ p: 1 }}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{ p: 1 }}>
                                <Typography variant={"body1"}>
                                    Gestión de productos y tiendas
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{ p: 1 }}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{ p: 1 }}>
                                <Typography variant={"body1"}>
                                    Catálogo online
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{ p: 1 }}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{ p: 1 }}>
                                <Typography variant={"body1"}>
                                    Reservaciones online
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12}>
                            <Grid container item xs={"auto"} alignItems={"center"} sx={{ p: 1 }}>
                                <KeyboardDoubleArrowRightOutlined />
                            </Grid>
                            <Grid container item xs={true} alignItems={"center"} sx={{ p: 1 }}>
                                <Typography variant={"body1"}>
                                    Venta online y presencial
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item sx={loginPageStyles.rightColumnContainer}>
                        <Grid container item alignItems={"center"} sx={{ width: "100%", m: 3 }}>
                            <Button
                                color={"primary"}
                                variant={showRegisterForm ? "text" : "outlined"}
                                onClick={() => setShowRegisterForm(false)}
                                size={"small"}
                            >
                                Entrar
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
                                variant={showRegisterForm ? "outlined" : "text"}
                                onClick={() => setShowRegisterForm(true)}
                                size={"small"}
                            >
                                Registrarse
                            </Button>
                        </Grid>
                        {showRegisterForm ? <SignUpForm setShowRegisterForm={setShowRegisterForm} /> : <SignInForm />}
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    )
}

export default Login