'use client'

import { Button, Card, Grid, Typography, AppBar, Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EmailVerification = () => {
    const router = useRouter();

    const params = useParams();
    const [verified, setVerified] = useState<boolean | null>(false);
    const [message, setMessage] = useState<{ message: string, color: string }>({ message: 'Validando token...', color: "black" });

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const axiosResponse = await axios.get("/api/auth/register", { params: { token: params.token } })
                if ([201, 202].includes(axiosResponse.status)) setMessage({ message: axiosResponse.data, color: "green" });
            } catch (error) {
                setMessage({ message: "Token de verificación incorrecto", color: "red" });
            }
            setVerified(true);
        }
        !verified && verifyToken();
    }, [params, verified]);

    return (
        <Grid display={"flex"} justifyContent={"center"} height={'100vh'} mx={"auto"} width={'80vw'} alignItems={"center"}>
            <Card >
                <AppBar position={"static"} variant={"elevation"} color={"primary"}>
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
                            Verificando datos
                        </Typography>
                    </Box>
                </AppBar>
                <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} padding={"20px"}>
                    <Typography variant='subtitle1' color={message.color} align='center' >
                        {message.message}
                    </Typography>
                </Grid>
                <Grid item display={"flex"} mb={"20px"} px={"40px"} justifyContent={"center"} alignItems={"center"}>
                    <Button
                        color={"primary"}
                        type="submit"
                        variant={"contained"}
                        size={"large"}
                        onClick={() => { router.push("/") }}
                    >
                        Ir a iniciar sesión
                    </Button>
                </Grid>
            </Card>
        </Grid>
    );
};

export default EmailVerification;