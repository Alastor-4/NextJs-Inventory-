"use client"

import React from "react";
import {
    AppBar,
    Badge,
    Box, Button,
    Card,
    CardContent, CardHeader,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl, Grid,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {
    ArrowLeft,
    ChangeCircleOutlined,
    DeleteOutline,
    Done,
    PauseOutlined,
    PersonOutlined,
    StartOutlined,
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
 import infoDisplayStyles from "@/assets/styles/infoDisplayStyles"

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
        <Card variant={"outlined"}>
            <CardHeader title={"Almacenes"}/>

            <CardContent>
                {userDetails.warehouses.length} almacén(es)
            </CardContent>
        </Card>
    )

    const StoreButton = () => (
        <Card variant={"outlined"}>
            <CardHeader title={"Tiendas"}/>

            <CardContent>
                {userDetails.stores.length} tienda(s)
            </CardContent>
        </Card>
    )

    const ProductButton = () => (
        <Card variant={"outlined"}>
            <CardHeader title={"Productos"}/>

            <CardContent>
                {userDetails.stores.length} tienda(s)
            </CardContent>
        </Card>
    )

    const UsersButton = () => (
        <Card variant={"outlined"}>
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
                                <Grid item sx={infoDisplayStyles.leftFlex}>Nombre:</Grid>
                                <Grid item sx={infoDisplayStyles.rightFlex}>
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
                                <Grid item sx={infoDisplayStyles.leftFlex}>Usuario:</Grid>
                                <Grid item sx={infoDisplayStyles.rightFlex}>
                                    {userDetails.username}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={infoDisplayStyles.leftFlex}>Correo:</Grid>
                                <Grid item sx={infoDisplayStyles.rightFlex}>
                                    {userDetails.mail}
                                </Grid>
                            </Grid>

                            <Grid container item xs={12} spacing={1}>
                                <Grid item sx={infoDisplayStyles.leftFlex}>Teléfono:</Grid>
                                <Grid item sx={infoDisplayStyles.rightFlex}>
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