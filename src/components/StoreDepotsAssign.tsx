"use client"

import {
    AppBar, Box, Card, CardContent, Grid, IconButton,
    MenuItem, TextField, Toolbar, Typography,
} from "@mui/material";
import ShowProductsStore from "@/app/inventory/owner/store-assign/components/ShowProductsStore";
import { StoreDepotsAssignProps, storeWithStoreDepots } from "@/types/interfaces";
import { stores, warehouses } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { ArrowLeft } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import * as Yup from "yup";

export const StoreDepotsAssign = ({ warehouseList, selectedWarehouseId, selectedStoreId, storeList, userId }: StoreDepotsAssignProps) => {

    const router = useRouter();

    const [selectedWarehouse, setSelectedWarehouse] = useState<warehouses | null>(null);
    const [selectedStore, setSelectedStore] = useState<stores | null>(null);

    //SELECT initial warehouse
    useEffect(() => {
        if (selectedWarehouseId) {
            const index = warehouseList?.findIndex(item => item.id === selectedWarehouseId);
            if (warehouseList && (index! > -1)) {
                setSelectedWarehouse(warehouseList[index!]);
            }
        }
    }, [selectedWarehouseId, warehouseList]);

    useEffect(() => {
        if (selectedStoreId) {
            const index = storeList?.findIndex(item => item.id === selectedStoreId);
            if (storeList && (index! > -1)) {
                setSelectedStore(storeList[index!]);
            }
        }
    }, [selectedStoreId, storeList]);

    const initialValues = {
        selectedWarehouse: selectedWarehouse?.name ?? "",
        selectedStore: selectedStore?.name ?? "",
    }

    const validationSchema = Yup.object({
        selectedWarehouse: Yup.string().required("Seleccione un almacén"),
        selectedStore: Yup.string().required("Seleccione una tienda"),
    })

    const handleNavigateBack = () => router.back();

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
            onSubmit={() => { }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <CustomToolbar />
                        <CardContent>
                            <Grid container rowSpacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Almacén"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedWarehouse")}
                                        error={!!formik.errors.selectedWarehouse && !!formik.touched.selectedWarehouse}

                                        helperText={(formik.errors.selectedWarehouse && formik.touched.selectedWarehouse) && formik.errors.selectedWarehouse}
                                    >
                                        {
                                            warehouseList?.map((warehouse: warehouses) => (
                                                <MenuItem key={warehouse.id} value={warehouse.name!}>
                                                    {`${warehouse.name} (${warehouse.description?.slice(0, 20) ?? ''})`}
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
                                        helperText={(formik.errors.selectedStore && formik.touched.selectedStore) && formik.errors.selectedStore}
                                    >
                                        {
                                            storeList?.map((store: storeWithStoreDepots) => (
                                                <MenuItem key={store.id} onClick={() => { setSelectedStore(store) }} value={store.name!}>{`${store.name} (${store.description?.slice(0, 20) ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>

                                {
                                    formik.values.selectedWarehouse && formik.values.selectedStore && (
                                        <Grid item xs={12}>
                                            <ShowProductsStore
                                                dataStore={selectedStore!}
                                                dataWarehouse={selectedWarehouse!}
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

export default StoreDepotsAssign