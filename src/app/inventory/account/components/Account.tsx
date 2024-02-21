"use client"

import { Toolbar, AppBar, IconButton, Box, Typography, Card, Grid, Avatar, Button, TextField } from '@mui/material';
import ChangeAccountPasswordModal from './Modal/ChangePasswordModal';
import { AddAPhoto, ArrowLeftOutlined } from '@mui/icons-material';
import userProfileStyles from '@/assets/styles/userProfileStyles';
import { AccountProps } from '@/types/interfaces';
import { useRouter } from 'next/navigation';
import account from '../requests/account';
import React, { useState } from 'react';
import * as Yup from 'yup';
import dayjs from 'dayjs';

const Account = ({ user }: AccountProps) => {
    const router = useRouter();

    const handleNavigateBack = () => router.back();

    const [initialValues, setInitialValues] = useState<{ name?: string, picture?: string | null }>({
        name: user?.name!,
        picture: user?.picture
    });

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Este campo es requerido'),
        picture: Yup.string()
    });


    //TODO: Editar name
    // const onSubmit = async (data: { [key: string]: string | undefined | null }) => {
    //     const response = await account.changeAccountData({ userId: user?.id!, ...data });
    //     if (response === 200) {
    //         const accountData = await account.getAccountData(user?.id!);
    //         setInitialValues({ ...accountData });
    //     };
    // }

    // const [edit, setEdit] = useState<boolean>(false);

    const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] = useState<boolean>(false);

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
        <Card variant='outlined'>
            <CustomToolbar />
            {isOpenChangePasswordModal && <ChangeAccountPasswordModal
                isOpen={isOpenChangePasswordModal}
                setIsOpen={setIsOpenChangePasswordModal} user={user} />}
            <Card variant='outlined' sx={{ marginX: "1.5rem", marginTop: "4rem", overflow: "visible", marginBottom: "2rem" }}>
                <Grid item container justifyContent={"center"} marginBottom={"2rem"}>
                    <Grid item container width={"auto"} sx={{ marginTop: "-3rem", position: "relative" }}>
                        <Grid item>
                            <Avatar sx={{ height: "8rem", width: "8rem", border: "2px solid gray" }} />
                        </Grid>
                        <Grid item>
                            <IconButton
                                sx={{
                                    position: "absolute", bottom: 0,
                                    right: 0, backgroundColor: "white",
                                    borderRadius: "25px", "&:hover": { backgroundColor: "white" }
                                }}
                                component="span"
                            >
                                <AddAPhoto />
                            </IconButton>
                        </Grid>
                    </Grid>
                    <Grid item container justifyContent={"center"} sx={{ padding: "1rem", marginX: "0.5rem" }}>
                        <Grid item xs={12}>
                            <Grid item container spacing={2} marginTop={"10px"}>
                                <Grid container item xs={12} spacing={1}>
                                    <Grid item sx={userProfileStyles.leftFlex}>Usuario:</Grid>
                                    <Grid item sx={userProfileStyles.rightFlex}>
                                        {user?.username}
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={1}>
                                    <Grid item sx={userProfileStyles.leftFlex}>Nombre:</Grid>
                                    <Grid item sx={userProfileStyles.rightFlex}>
                                        {user?.name}
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={1}>
                                    <Grid item sx={userProfileStyles.leftFlex}>Teléfono:</Grid>
                                    <Grid item sx={userProfileStyles.rightFlex}>
                                        {user?.phone}
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={1}>
                                    <Grid item sx={userProfileStyles.leftFlex}>Correo:</Grid>
                                    <Grid item sx={userProfileStyles.rightFlex}>
                                        {user?.mail}
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} spacing={1}>
                                    <Grid item sx={userProfileStyles.leftFlex}>Unido en:</Grid>
                                    <Grid item sx={userProfileStyles.rightFlex}>
                                        {user?.created_at ? dayjs(user.created_at).format("DD/MM/YYYY") : "-"}
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} marginTop={"10px"} justifyContent={"center"}>
                                    <Button variant='outlined' color='primary' onClick={() => { setIsOpenChangePasswordModal(true) }}>Cambiar Contraseña</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </Card>)
}

export default Account