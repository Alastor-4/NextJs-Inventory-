//@ts-nocheck
"use client"

import React, { useEffect } from "react";
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
    ArrowCircleRightOutlined,
    ChevronRightOutlined,
    LogoutOutlined,
} from "@mui/icons-material";
import userProfileStyles from "@/assets/styles/userProfileStyles"
import Link from "next/link";
import dayjs from "dayjs";
import { signOut } from "next-auth/react";
import { setProductsCount } from "@/app/store/store";

export default function UserProfileMain(props) {
    const { userDetails, userRole, ownerWarehouses, ownerStores, ownerProductsCount, ownerWorkersCount, sellerStores } = props;

    useEffect(() => {
        setProductsCount(ownerProductsCount);
    }, [ownerProductsCount])


    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                <Box sx={{ display: "flex", color: "white" }}>
                    <IconButton
                        color={"inherit"}
                        onClick={() => signOut({
                            redirect: true,
                            callbackUrl: '/'
                        })}
                    >
                        <LogoutOutlined />
                    </IconButton>
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

    const AdminModule = () => {
        const LinksTemplate = ({ pageAddress, title }: { pageAddress: string, title: string }) => (
            <Grid container>
                <Link href={pageAddress}>
                    <Grid container item columnSpacing={2}>
                        <Grid container item xs={"auto"} alignItems={"center"}>
                            <ChevronRightOutlined fontSize={"small"} />
                        </Grid>
                        <Grid item xs={"auto"}>
                            {title}
                        </Grid>
                    </Grid>
                </Link>
            </Grid>
        )

        return (
            <Card variant="outlined">
                <CardHeader title={"Administrar:"} />
                <CardContent>
                    <Grid container direction={"column"} rowGap={1}>
                        <Grid item>
                            <LinksTemplate
                                pageAddress={`/inventory/admin/role`}
                                title={"Roles"}
                            />
                        </Grid>

                        <Grid item>
                            <LinksTemplate
                                pageAddress={`/inventory/admin/user`}
                                title={"Usuarios"}
                            />
                        </Grid>

                        <Grid item>
                            <LinksTemplate
                                pageAddress={`/inventory/admin/warehouse`}
                                title={"Almacenes"}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )
    }

    const OwnerModule = ({ ownerWarehouses, ownerStores, ownerProductsCount, ownerWorkersCount }) => {
        const WarehouseButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <CardHeader title={"Almacenes"} />

                <CardContent>
                    <Grid container>
                        {ownerWarehouses.map((item: any, index: number) => (
                            <Grid container key={item.id}>
                                <Link href={`/inventory/owner/warehouse/${item.id}`} key={item.id}>
                                    <Grid container item xs={12} sx={index > 0 ? { mt: "10px" } : { mt: "0" }}>
                                        <Grid container item xs={"auto"} alignItems={"center"}>
                                            <ChevronRightOutlined fontSize={"small"} />
                                        </Grid>
                                        <Grid item xs={"auto"}>
                                            {item.name}
                                        </Grid>
                                    </Grid>
                                </Link>
                            </Grid>
                        ))}

                        {/*<Grid container>*/}
                        {/*    <Link href={"#"}>*/}
                        {/*        <Grid container columnSpacing={1} item sx={{ mt: "15px" }}>*/}
                        {/*            <Grid container item xs={"auto"} alignItems={"center"}>*/}
                        {/*                <ArrowCircleRightOutlined fontSize={"small"} />*/}
                        {/*            </Grid>*/}
                        {/*            <Grid item xs={"auto"}>*/}
                        {/*                Mis almacenes*/}
                        {/*            </Grid>*/}
                        {/*        </Grid>*/}
                        {/*    </Link>*/}
                        {/*</Grid>*/}
                    </Grid>
                </CardContent>
            </Card>
        )

        const StoreButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <CardHeader title={"Tiendas"} />

                <CardContent>
                    <Grid container>
                        {ownerStores.map((item, index) => (
                            <Grid container key={item.id}>
                                <Link href={`/inventory/owner/store-details/${item.id}`} >
                                    <Grid container columnSpacing={1} item sx={index > 0 ? { mt: "10px" } : { mt: "0" }}>
                                        <Grid container item xs={"auto"} alignItems={"center"}>
                                            <ChevronRightOutlined fontSize={"small"} />
                                        </Grid>
                                        <Grid item xs={true}>
                                            {item.name}
                                        </Grid>
                                    </Grid>
                                </Link>
                            </Grid>
                        ))}

                        <Grid container>
                            <Link href={`/inventory/owner/store`}>
                                <Grid container columnSpacing={1} item xs={12} sx={{ mt: "15px" }}>
                                    <Grid container item xs={"auto"} alignItems={"center"}>
                                        <ArrowCircleRightOutlined fontSize={"small"} />
                                    </Grid>
                                    <Grid item xs={true}>
                                        Mis tiendas
                                    </Grid>
                                </Grid>
                            </Link>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )

        const ProductButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <CardHeader title={"Productos"} />

                <CardContent>
                    <Grid container>
                        <Link href={`/inventory/owner/product`}>
                            <Grid container item rowSpacing={2}>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                </Grid>
                                <Grid item xs={"auto"}>
                                    {`${ownerProductsCount} ${ownerProductsCount === 1 ? "producto" : "productos"}`}
                                </Grid>
                            </Grid>
                        </Link>
                    </Grid>
                </CardContent>
            </Card>
        )

        const UsersButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <CardHeader title={"Trabajadores"} />

                <CardContent>
                    <Grid container>
                        <Link href={`/inventory/owner/worker`}>
                            <Grid container rowSpacing={2} item xs={12}>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                </Grid>
                                <Grid item xs={"auto"}>
                                    {`${ownerWorkersCount} ${ownerWorkersCount === 1 ? "trabajador" : "trabajadores"}`}
                                </Grid>
                            </Grid>
                        </Link>
                    </Grid>
                </CardContent>
            </Card>
        )

        return (
            <Grid container rowSpacing={3}>
                <Grid item xs={12}>
                    <Divider flexItem color={"primary"} variant={"fullWidth"} orientation={"horizontal"} />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant={"h5"} sx={{ textAlign: "center" }}>Administración</Typography>
                </Grid>

                <Grid container item spacing={2}>
                    <Grid container item xs={6} justifyContent={"center"}>
                        <ProductButton />
                    </Grid>

                    <Grid container item xs={6} justifyContent={"center"}>
                        <UsersButton />
                    </Grid>

                    <Grid container item xs={6} justifyContent={"center"}>
                        <WarehouseButton />
                    </Grid>

                    <Grid container item xs={6} justifyContent={"center"}>
                        <StoreButton />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    const SellerModule = ({ sellerStores }) => {
        const StoreButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <CardHeader title={"Tiendas"} />

                <CardContent>
                    <Grid container>
                        {sellerStores.map((item, index) => (
                            <Grid container key={item.id}>
                                <Link href={`/inventory/seller/store/${item.id}`} >
                                    <Grid container columnSpacing={1} item sx={index > 0 ? { mt: "10px" } : { mt: "0" }}>
                                        <Grid container item xs={"auto"} alignItems={"center"}>
                                            <ChevronRightOutlined fontSize={"small"} />
                                        </Grid>
                                        <Grid item xs={true}>
                                            {item.name}
                                        </Grid>
                                    </Grid>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        )

        return (
            <Grid container rowSpacing={3}>
                <Grid item xs={12}>
                    <Divider flexItem color={"primary"} variant={"fullWidth"} orientation={"horizontal"} />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant={"h5"} sx={{ textAlign: "center" }}>Vendedor</Typography>
                </Grid>

                <Grid container item spacing={2}>
                    <Grid container item xs={6} justifyContent={"center"}>
                        <StoreButton />
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    return (
        <>
            <Card variant={"outlined"}>
                <CustomToolbar />

                <CardContent>
                    <Grid container rowSpacing={5}>
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
                                                sx={{ border: "1px solid lightGreen", ml: "5px" }}
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

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Unido en:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {dayjs(userDetails.created_at).format("DD/MM/YYYY")}
                                </Grid>
                            </Grid>
                        </Grid>
                        {
                            userRole === 'admin' && (
                                <Grid item xs={12}>
                                    <AdminModule />
                                </Grid>
                            )
                        }

                        {
                            userRole === "store_owner" && (
                                <Grid item xs={12}>
                                    <OwnerModule
                                        ownerWarehouses={ownerWarehouses}
                                        ownerStores={ownerStores}
                                        ownerProductsCount={ownerProductsCount}
                                        ownerWorkersCount={ownerWorkersCount}
                                    />
                                </Grid>
                            )
                        }

                        {
                            (userRole === "store_owner" || userRole === "store_seller") && (
                                <Grid item xs={12}>
                                    <SellerModule sellerStores={sellerStores} />
                                </Grid>
                            )
                        }
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}