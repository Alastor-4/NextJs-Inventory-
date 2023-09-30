"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Checkbox, Chip, CircularProgress,
    Divider, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined } from "@mui/icons-material";
import stores from "@/app/profile/[id]/store/requests/stores";
import { useParams, useRouter } from "next/navigation";
import userProfileStyles from "@/assets/styles/userProfileStyles";
import dayjs from "dayjs";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreMain() {
    const [storeDetails, setStoreDetails] = React.useState(null)

    const params = useParams()
    const router = useRouter()
    
    const userId = params.id
    const sellerStoreId = params.sellerStoreId

    //ToDo: use global isLoading
    const isLoading = false

    //get initial storeDetails
    React.useEffect(() => {
        fetcher(`/profile/${userId}/seller/store/${sellerStoreId}/api`).then((data) => setStoreDetails(data))
    }, [sellerStoreId, userId])



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
                        Mi Tienda
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    return (
        <Card variant={"outlined"}>
            <CustomToolbar/>

            <CardContent>
                <Grid container rowSpacing={5}>
                    <Grid container item rowSpacing={3}>
                        <Grid container item xs={12} spacing={1}>
                            <Grid item sx={userProfileStyles.leftFlex}>Nombre:</Grid>
                            <Grid item sx={userProfileStyles.rightFlex}>
                                {storeDetails?.name ?? "-"}
                            </Grid>
                        </Grid>

                        <Grid container item xs={12} spacing={1}>
                            <Grid item sx={userProfileStyles.leftFlex}>Descripción:</Grid>
                            <Grid item sx={userProfileStyles.rightFlex}>
                                {storeDetails?.description ?? "-"}
                            </Grid>
                        </Grid>

                        <Grid container item xs={12} spacing={1}>
                            <Grid item sx={userProfileStyles.leftFlex}>Slogan:</Grid>
                            <Grid item sx={userProfileStyles.rightFlex}>
                                {storeDetails?.slogan ?? ""}
                            </Grid>
                        </Grid>

                        <Grid container item xs={12} spacing={1}>
                            <Grid item sx={userProfileStyles.leftFlex}>Dirección:</Grid>
                            <Grid item sx={userProfileStyles.rightFlex}>
                                {storeDetails?.address ?? ""}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}