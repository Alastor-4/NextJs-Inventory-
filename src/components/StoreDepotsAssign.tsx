// @ts-nocheck
"use client"

import {
    AppBar, Box,
    Button,
    Card,
    CardContent, CircularProgress, Divider,
    Grid, IconButton,
    MenuItem,
    TextField, Toolbar, Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import ShowProductsStore from "@/app/profile/[id]/store-assign/components/ShowProductsStore";
import ShowProductsWarehouse from "@/app/profile/[id]/store-assign/components/ShowProductsWarehouse"
import {AddOutlined, ArrowLeft, DeleteOutline, ShareOutlined} from "@mui/icons-material";
import Link from "next/link";
import {router} from "next/client";

export default function StoreDepotsAssign(
    { warehouseListProp, selectedWarehouseIdProp, storeListProp, selectedStoreIdProp }
) {
    const [selectedWarehouse, setSelectedWarehouse] = useState("")
    const [selectedStore, setSelectedStore] = useState("")
    const [selectedButton, setSelectedButton] = useState(false)


    //initial make selected a warehouse
    React.useEffect(() => {
        if (selectedWarehouseIdProp !== null) {
            const index = warehouseListProp.findIndex(item => item.id === selectedWarehouseIdProp)
            if (index > -1) {
                setSelectedWarehouse(warehouseListProp[index])
            }
        }
    }, [selectedWarehouseIdProp, warehouseListProp])

    //initial make selected a store
    React.useEffect(() => {
        const { searchParams } = new URL(window.location.href);
        selectedStoreIdProp = searchParams.get("storeId");

        if (selectedStoreIdProp !== null) {
            const index = storeListProp.find(item => item.id === parseInt(selectedStoreIdProp))
            if (index !== -1) {
                setSelectedStore(index)
            }
        }

    }, [selectedStoreIdProp, storeListProp])

    const initialValues = {
        selectedWarehouse: selectedWarehouse ?? '',
        selectedStore: selectedStore ?? '',
    }

    const validationSchema = Yup.object({
        selectedWarehouse: Yup.object().required("seleccione un almacén"),
        selectedStore: Yup.object().required("seleccione una tienda"),
    })


    async function handleWarehouseChange(e, formik) {
        formik.setFieldValue("selectedWarehouse", e.target.value)
        const warehouseId = e.target.value.id

    }

    function handleStoreChange(e, formik) {
        formik.setFieldValue("selectedStore", e.target.value)
        setSelectedStore(e.target.value);
    }

    const showMainTable = () => {
        if (!selectedButton) {
            if (selectedStore !== '')
                return <ShowProductsStore
                    storeId={selectedStore.id}
                    nameStore={selectedStore.name}
                    nameWarehouse={selectedWarehouse.name}
                />

        } else {
            if (selectedStore !== '' && selectedWarehouse !== '')
                return <ShowProductsWarehouse
                    storeId={selectedStore.id}
                    warehouseId={selectedWarehouse.id}
                    defaultPercentage={selectedStore.fixed_seller_profit_percentage}
                    defaultQuantity={selectedStore.fixed_seller_profit_quantity}
                />
        }
    }

    function handleNavigateBack() {
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={handleNavigateBack}>
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
                        Distribuir productos
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize={true}
            onSubmit={() => {

            }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <CustomToolbar/>

                        <CardContent>
                            <Grid container rowSpacing={2} direction={"column"}>
                                <Grid item xs={12}>
                                    <TextField
                                        name={"selectedWarehouse"}
                                        label="Almacén"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedWarehouse")}
                                        value={formik.values.selectedWarehouse}
                                        onChange={(e) => handleWarehouseChange(e, formik)}
                                        error={formik.errors.selectedWarehouse && formik.touched.selectedWarehouse}
                                        helperText={(formik.errors.selectedWarehouse && formik.touched.selectedWarehouse) && formik.errors.selectedWarehouse}
                                    >
                                        {
                                            warehouseListProp.map(item => (
                                                <MenuItem key={item.id}
                                                    value={item}>{`${item.name} (${item.description ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name={"selectedStore"}
                                        label="Tienda"
                                        size={"small"}
                                        fullWidth
                                        select
                                        value={formik.values.selectedStore}
                                        onChange={(e) => handleStoreChange(e, formik)}
                                        error={formik.errors.selectedStore && formik.touched.selectedStore}
                                        helperText={(formik.errors.selectedStore && formik.touched.selectedStore) && formik.errors.selectedStore}
                                    >
                                        {
                                            storeListProp.map(item => (
                                                <MenuItem key={item.id}
                                                    value={item}>{`${item.name} (${item.description ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant={(!selectedButton) ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedButton((e) => false)}
                                    >
                                        Administar Tienda
                                    </Button>
                                    <Button
                                        variant={(selectedButton) ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedButton((e) => true)}
                                        sx={{ ml: "10px" }}
                                    >
                                        Agregar productos del almacen
                                    </Button>
                                </Grid>

                                <Grid item>
                                    {showMainTable()}

                                </Grid>

                            </Grid>
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}