"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";
import {
    ArrowLeft, ChevronRightOutlined,
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
 import userProfileStyles from "@/assets/styles/userProfileStyles"
import Link from "next/link";

export default function UserProfileMain(props) {
   const {userDetails} = props

    const router = useRouter()

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={() => router.back()}>
                        <ArrowLeft fontSize={"large"}/>
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Mi usuario
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    function getColorByRole(roleName) {
        switch (roleName) {
            case "admin":
                return "primary"

            case "store_owner":
                return "secondary"

            case "store_keeper":
                return "error"

            case "store_seller":
                return "success"

            default:
                return "info"
        }
    }

    const WarehouseButton = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <CardHeader title={"Almacenes"}/>

            <CardContent>
                <Grid container>
                    {userDetails.warehouses.map(item => (
                        <Link href={`/profile/warehouse/${item.id}`} key={item.id}>
                            <Grid container rowSpacing={2} item xs={12}>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"}/>
                                </Grid>
                                <Grid item xs={true}>
                                    {item.name}
                                </Grid>
                            </Grid>
                        </Link>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    )

    const StoreButton = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <CardHeader title={"Tiendas"}/>

            <CardContent>
                <Grid container>
                    {userDetails.stores.map(item => (
                        <Link href={`/profile/store/${item.id}`} key={item.id}>
                            <Grid container rowSpacing={2} item xs={12}>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"}/>
                                </Grid>
                                <Grid item xs={true}>
                                    {item.name}
                                </Grid>
                            </Grid>
                        </Link>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    )

    const ProductButton = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <CardHeader title={"Productos"}/>

            <CardContent>
                {userDetails.stores.length} tienda(s)
            </CardContent>
        </Card>
    )

    const UsersButton = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <CardHeader title={"Usuarios"}/>

            <CardContent>
                {userDetails.stores.length} tienda(s)
            </CardContent>
        </Card>
    )

    return (
        <>
            <Card variant={"outlined"}>
                <CustomToolbar/>

                <CardContent>
                    <Grid container rowSpacing={3}>
                        <Grid container item rowSpacing={3}>
                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Nombre:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails.name}
                                    {
                                        userDetails?.roles?.name && (
                                            <Chip
                                                size={"small"}
                                                label={userDetails.roles.name}
                                                color={getColorByRole(userDetails.roles.name)}
                                                sx={{border: "1px solid lightGreen", ml: "5px"}}
                                            />
                                        )
                                    }
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Usuario:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails.username}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Correo:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails.mail}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Teléfono:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails.phone}
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider flexItem color={"primary"} variant={"fullWidth"} orientation={"horizontal"}/>
                        </Grid>

                        <Grid container item rowSpacing={2}>
                            <Grid container item xs={6} justifyContent={"center"}>
                                <WarehouseButton/>
                            </Grid>

                            <Grid container item xs={6} justifyContent={"center"}>
                                <StoreButton/>
                            </Grid>

                            <Grid container item xs={6} justifyContent={"center"}>
                                <ProductButton/>
                            </Grid>

                            <Grid container item xs={6} justifyContent={"center"}>
                                <UsersButton/>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}