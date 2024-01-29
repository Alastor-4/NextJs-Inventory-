"use client"

import React, { useEffect, useState } from "react";
import {
    AppBar, Box, Button, Card, CardContent, Chip,
    Divider, Grid, IconButton, Toolbar, Typography
} from "@mui/material";
import {
    ArrowCircleRightOutlined, ChevronRightOutlined, HomeOutlined,
    LogoutOutlined, RocketLaunchOutlined
} from "@mui/icons-material";
import { userStatsRequest } from "@/app/inventory/request/userStats";
import userProfileStyles from "@/assets/styles/userProfileStyles";
import { getRoleTranslation } from "@/utils/getRoleTranslation";
import { getColorByRole } from "@/utils/getColorbyRole";
import { signOut } from "next-auth/react";
import Link from "next/link";
import dayjs from "dayjs";

export default function UserProfileMain({ userId }: { userId: number }) {
    const [userDetails, setUserDetails] = useState<null | any>(null);
    const [userRole, setUserRole] = useState<null | any>(null);

    const [ownerWarehouses, setOwnerWarehouses] = useState<null | any[]>(null);
    const [ownerStores, setOwnerStores] = useState<null | any[]>(null);
    const [ownerProductsCount, setOwnerProductsCount] = useState<null | number>(null);
    const [globalAndOwnerDepartments, setGlobalAndOwnerDepartments] = useState<null | any[]>(null);
    const [ownerWorkersCount, setOwnerWorkersCount] = useState<null | number>(null);

    const [sellerStores, setSellerStores] = useState<null | any[]>(null);

    useEffect(() => {
        async function fetchData() {
            const response = await userStatsRequest.defaultStats(userId);

            if (response) {
                setOwnerWarehouses(response.ownerWarehouses);
                setGlobalAndOwnerDepartments(response.globalAndOwnerDepartments);
                setUserDetails(response.userDetails);
                setUserRole(response.userRole);
                setOwnerWarehouses(response.ownerWarehouses);
                setOwnerStores(response.ownerStores);
                setOwnerProductsCount(response.ownerProductsCount);
                setOwnerWorkersCount(response.ownerWorkersCount);
                setSellerStores(response.sellerStores);
            }
        }

        fetchData();
    }, [userId]);

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

    const WelcomeModule = () => (
        <Grid container rowSpacing={1}>
            <Grid item xs={12}>
                <Typography variant={"subtitle1"} display={"flex"} alignItems={"center"}>
                    <RocketLaunchOutlined sx={{ mr: "5px" }} /> Bienvenido a Inventario Plus
                </Typography>
            </Grid>

            <Grid container item xs={12} alignItems={"center"}>
                <Grid item xs={"auto"}>
                    <ChevronRightOutlined />
                </Grid>

                <Grid item xs={true} sx={{ textWrap: "pretty" }}>
                    Este sistema ha sido pensado para ayudar con todo el proceso de gestión y venta de cualquier
                    producto. Cada etapa de este proceso ha sido automatizada.
                </Grid>
            </Grid>

            <Grid container item xs={12} alignItems={"center"}>
                <Grid item xs={"auto"}>
                    <ChevronRightOutlined />
                </Grid>

                <Grid item xs={true} sx={{ textWrap: "pretty" }}>
                    Inventario+ no hace diferencias entre ningún producto, el límite es su imaginación.
                </Grid>
            </Grid>

            <Grid container item xs={12} alignItems={"center"}>
                <Grid item xs={"auto"}>
                    <ChevronRightOutlined />
                </Grid>

                <Grid item xs={true} sx={{ textWrap: "pretty" }}>
                    Esta aplicación esta destinada a aquellos usuario que son trabajadores de tiendas
                    gestionadas en este sitema. Si busca comprar online en estas tiendas debe utilizar xxxxx.
                </Grid>
            </Grid>

            <Grid container item xs={12} alignItems={"center"}>
                <Grid item xs={"auto"}>
                    <ChevronRightOutlined />
                </Grid>

                <Grid item xs={true} sx={{ textWrap: "pretty" }}>
                    Si quiere comezar a gestionar su tienda en nuestro sistema pongase en contacto con el equipo de
                    soporte mediante xxxxx.
                </Grid>
            </Grid>

            <Grid container item xs={12} alignItems={"center"}>
                <Grid item xs={"auto"}>
                    <ChevronRightOutlined />
                </Grid>

                <Grid item xs={true} sx={{ textWrap: "pretty" }}>
                    Si su objetivo es ser trabajador de algún dueño con tienda(s) en nuestro sistema, este debe hacerlo su
                    trabajador mediante esa funcionalidad en su panel administrativo.
                </Grid>
            </Grid>
        </Grid>
    )

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
            <Card variant="outlined" sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Administrar
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
                    <Grid item xs={12}>
                        <LinksTemplate
                            pageAddress={`/inventory/admin/role`}
                            title={"Roles"}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <LinksTemplate
                            pageAddress={`/inventory/admin/user`}
                            title={"Usuarios"}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <LinksTemplate
                            pageAddress={`/inventory/admin/warehouse`}
                            title={"Almacenes"}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <LinksTemplate
                            pageAddress={`/inventory/admin/departments`}
                            title={"Departamentos"}
                        />
                    </Grid>
                </Grid>
            </Card>
        )
    }

    const OwnerModule = (
        { globalAndOwnerDepartments, ownerWarehouses, ownerStores, ownerProductsCount, ownerWorkersCount }: {
            globalAndOwnerDepartments: any[], ownerWarehouses: any[], ownerStores: any[], ownerProductsCount: number, ownerWorkersCount: number
        }
    ) => {
        const DepartmentsButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Departamentos
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
                    <Grid container item xs={12}>
                        <Grid container item rowSpacing={2}>
                            <Grid container item xs={"auto"} alignItems={"center"}>
                                <ChevronRightOutlined fontSize={"small"} />
                            </Grid>
                            <Grid item xs={"auto"}>
                                {globalAndOwnerDepartments.filter(item => !item.usersId).length} globales
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12}>
                        <Link href={`/inventory/owner/departments`}>
                            <Grid container item rowSpacing={2}>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                </Grid>
                                <Grid item xs={"auto"}>
                                    {globalAndOwnerDepartments.filter(item => !!item.usersId).length}
                                    {`${globalAndOwnerDepartments.filter(item => !!item.usersId).length === 1 ? " personal" : " personales"}`}
                                </Grid>
                            </Grid>
                        </Link>
                    </Grid>
                </Grid>
            </Card>
        )

        const WarehouseButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Almacenes
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
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
            </Card>
        )

        const StoreButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Tiendas
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
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
            </Card>
        )

        const ProductButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Productos
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
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
            </Card>
        )

        const UsersButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Trabajadores
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
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
            </Card>
        )

        return (
            <Grid container item spacing={2}>
                <Grid container item xs={6} justifyContent={"center"}>
                    <DepartmentsButton />
                </Grid>

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
        )
    }

    const KeeperModule = ({ ownerStores, ownerProductsCount, ownerWarehouses }: { ownerStores: any[], ownerProductsCount: number, ownerWarehouses: any[] }) => {
        const ProductButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Productos
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
                    <Link href={`/inventory/keeper/product`}>
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
            </Card>
        )

        const WarehouseButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Almacenes
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
                    {ownerWarehouses.map((item: any, index: number) => (
                        <Grid container key={item.id}>
                            <Link href={`/inventory/keeper/warehouse/${item.id}`} key={item.id}>
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
                </Grid>
            </Card>
        )

        const StoreButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Tiendas
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
                    {ownerStores.map((item, index) => (
                        <Grid container key={item.id}>
                            <Link href={`/inventory/keeper/store-details/${item.id}`} >
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
            </Card>
        )

        return (
            <Grid container item spacing={2}>
                <Grid container item xs={6} justifyContent={"center"}>
                    <ProductButton />
                </Grid>

                <Grid container item xs={6} justifyContent={"center"}>
                    <WarehouseButton />
                </Grid>

                <Grid container item xs={6} justifyContent={"center"}>
                    <StoreButton />
                </Grid>
            </Grid>
        )
    }

    const SellerModule = ({ sellerStores }: { sellerStores: any[] }) => {
        const StoreButton = () => (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    Tiendas
                </Typography>

                <Grid container rowSpacing={1} mt={"8px"}>
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
            </Card>
        )

        return (
            <Grid container item spacing={2}>
                <Grid container item xs={6} justifyContent={"center"}>
                    <StoreButton />
                </Grid>
            </Grid>
        )
    }

    const [activeTab, setActiveTab] = useState<string>("welcome");
    function handleChangeActiveTab(value: string) {
        setActiveTab(value);
    }

    useEffect(() => {
        switch (userRole) {
            case "admin":
                return setActiveTab("admin");
            case "store_owner":
                return setActiveTab("owner");
            case "store_keeper":
                return setActiveTab("keeper");
            case "store_seller":
                return setActiveTab("seller");
            default:
                break
        }
    }, [userRole])

    return (
        <>
            <Card variant={"outlined"}>
                <CustomToolbar />

                <CardContent>
                    <Grid container rowSpacing={3}>
                        <Grid container item rowSpacing={2}>
                            <Grid container item xs={12} justifyContent={"flex-end"}>
                                {
                                    userDetails?.roles?.name && (
                                        <Chip
                                            size={"small"}
                                            label={getRoleTranslation(userDetails.roles.name)}
                                            color={getColorByRole(userDetails.roles.name)}
                                            sx={{ border: "1px solid lightGreen", ml: "5px" }}
                                        />
                                    )
                                }
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Nombre:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails?.name ?? "-"}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Usuario:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails?.username ?? "-"}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Correo:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails?.mail ?? "-"}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Teléfono:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails?.phone ?? "-"}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={userProfileStyles.leftFlex}>Unido en:</Grid>
                                <Grid item sx={userProfileStyles.rightFlex}>
                                    {userDetails?.created_at ? dayjs(userDetails.created_at).format("DD/MM/YYYY") : "-"}
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider flexItem color={"primary"} variant={"fullWidth"} orientation={"horizontal"} />
                        </Grid>

                        <Grid container item xs={12} rowSpacing={1}>
                            <Grid item xs={12}>
                                <IconButton
                                    size={"small"}
                                    onClick={() => handleChangeActiveTab("welcome")}
                                    color={activeTab === "welcome" ? "primary" : "inherit"}
                                >
                                    <HomeOutlined />
                                </IconButton>

                                {
                                    userRole === 'admin' && (
                                        <Button
                                            color={activeTab === "admin" ? "primary" : "inherit"}
                                            onClick={() => handleChangeActiveTab("admin")}
                                        >
                                            Admin
                                        </Button>
                                    )
                                }

                                {
                                    userRole === "store_owner" &&
                                    globalAndOwnerDepartments &&
                                    ownerWarehouses &&
                                    ownerStores &&
                                    ownerProductsCount !== null &&
                                    ownerWorkersCount !== null && (
                                        <Button
                                            color={activeTab === "owner" ? "primary" : "inherit"}
                                            onClick={() => handleChangeActiveTab("owner")}
                                        >
                                            Dueño
                                        </Button>
                                    )
                                }
                                {
                                    userRole === "store_keeper" &&
                                    ownerProductsCount !== null && (
                                        <Button
                                            color={activeTab === "keeper" ? "primary" : "inherit"}
                                            onClick={() => handleChangeActiveTab("keeper")}
                                        >
                                            Almacenero
                                        </Button>
                                    )
                                }

                                {
                                    (userRole === "store_owner" || userRole === "store_keeper" || userRole === "store_seller") && sellerStores && (
                                        <Button
                                            color={activeTab === "seller" ? "primary" : "inherit"}
                                            onClick={() => handleChangeActiveTab("seller")}
                                        >
                                            Vendedor
                                        </Button>
                                    )
                                }
                            </Grid>

                            <Grid item xs={12}>
                                {activeTab === "welcome" && <WelcomeModule />}

                                {activeTab === "admin" && <AdminModule />}

                                {activeTab === "owner" && (
                                    <OwnerModule
                                        globalAndOwnerDepartments={globalAndOwnerDepartments!}
                                        ownerProductsCount={ownerProductsCount!}
                                        ownerWarehouses={ownerWarehouses!}
                                        ownerStores={ownerStores!}
                                        ownerWorkersCount={ownerWorkersCount!}
                                    />
                                )}

                                {activeTab === "keeper" && (
                                    <KeeperModule ownerProductsCount={ownerProductsCount!} ownerWarehouses={ownerWarehouses!} ownerStores={ownerStores!} />
                                )}

                                {activeTab === "seller" && (
                                    <SellerModule sellerStores={sellerStores!} />
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}