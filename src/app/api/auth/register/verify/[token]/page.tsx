'use client'

import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const EmailVerification = () => {
    const params = useParams();
    const [verified, setVerified] = useState<boolean | null>(false);
    const [message, setMessage] = useState<{ message: string, color: string }>({ message: 'Validando...', color: "black" });

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const axiosResponse = await axios.get("/api/auth/register", {params: {token: params.token}})
                if ([201, 202].includes(axiosResponse.status)) setMessage({ message: axiosResponse.data, color: "green" });
            } catch (error) {
                setMessage({ message: "El token de verificación proporcionado no es correcto", color: "red" });
            }
            setVerified(true);
        }
        !verified && verifyToken();
    }, [params, verified]);

    return (
        <Grid container justifyContent={"center"} flex={1} height={'100vh'} alignItems={"center"}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Verificando datos
                    </Typography>
                    <Typography paragraph color={message.color}>
                        {message.message}
                    </Typography>
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        size={"large"}
                        sx={{ m: 1 }}
                        href="/">
                        Ir a iniciar sesión
                    </Button>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default EmailVerification;