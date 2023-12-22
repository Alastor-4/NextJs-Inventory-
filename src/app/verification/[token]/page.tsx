'use client'
import { Box, Button, Card, CardContent, Grid, Typography, styled } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const EmailVerification = () => {
    const token = useParams();
    const [verified, setVerified] = useState<boolean>(false);
    const [message, setMessage] = useState<{ message: string, color: string }>({ message: 'Validando...', color: "black" });

    useEffect(() => {
        const validToken = async () => {
            try {
                const isValidToken = await axios.get(`http://localhost:3000/api/auth/register?token=${token.token}`);
                if ([201, 202].includes(isValidToken.status)) setMessage({ message: isValidToken.data, color: "green" });
            } catch (error) {
                setMessage({ message: "El token de verificación proporcionado no es correcto", color: "red" });
            }
            setVerified(true);
        }
        !verified && validToken();
    }, [token, verified]);

    return (
        <Grid container justifyContent={"center"} flex={1} height={'100vh'} alignItems={"center"}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Confirmando su correo electrónico
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