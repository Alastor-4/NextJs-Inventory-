"use client"

import {
    AppBar,
    Box,
    Card,
    CardContent,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import ShowProductsStore from "@/app/inventory/store-assign/components/ShowProductsStore";
import { ArrowLeft } from "@mui/icons-material";
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";

export default function StoreDepotsAssign(
    { warehouseListProp, selectedWarehouseIdProp, selectedStoreIdProp, storeListProp, userId }:
        { userId: number, warehouseListProp: any[], selectedWarehouseIdProp: number | null, selectedStoreIdProp: number | null, storeListProp: any[] }
) {
    const router = useRouter()

    const [selectedWarehouse, setSelectedWarehouse] = useState<any>("")
    const [selectedStore, setSelectedStore] = useState<any>("")


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
        if (selectedStoreIdProp) {
            const index = storeListProp.findIndex(item => item.id === selectedStoreIdProp)
            if (index > -1) {
                setSelectedStore(storeListProp[index])
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

    function handleNavigateBack() {
        /*  selectedStoreIdProp
              ? router.push(`/inventory/store-details/${selectedStoreIdProp}`)
              : router.push(`/inventory/warehouse/${selectedWarehouseIdProp}`)
  */
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
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
                        <CustomToolbar />

                        <CardContent>
                            <Grid container rowSpacing={2} direction={"column"}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Almacén"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedWarehouse")}
                                        error={!!formik.errors.selectedWarehouse && !!formik.touched.selectedWarehouse}
                                        // @ts-ignore
                                        helperText={(formik.errors.selectedWarehouse && formik.touched.selectedWarehouse) && formik.errors.selectedWarehouse}
                                    >
                                        {
                                            warehouseListProp.map(item => (
                                                <MenuItem
                                                    key={item.id}
                                                    value={item}
                                                >
                                                    {`${item.name} (${item.description ?? ''})`}
                                                </MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Tienda"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedStore")}
                                        error={!!formik.errors.selectedStore && !!formik.touched.selectedStore}
                                        // @ts-ignore
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

                                {
                                    formik.values.selectedWarehouse && formik.values.selectedStore && (
                                        <Grid item xs={12}>
                                            <ShowProductsStore
                                                storeId={formik.values.selectedStore.id}
                                                nameStore={formik.values.selectedStore.name}
                                                dataStore={formik.values.selectedStore}
                                                nameWarehouse={formik.values.selectedWarehouse.name}
                                                warehouseId={formik.values.selectedWarehouse.id}
                                                userId={userId}
                                            />
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}