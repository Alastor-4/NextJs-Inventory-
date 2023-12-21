// @ts-nocheck
"use client"

import {
    AppBar,
    Box,
    Button,
    Card,
    FormHelperText,
    Grid,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"
import { useRouter } from 'next/navigation';
import DepartmentProductsSelect from "@/components/DepartmentProductsSelect";
import { notifyError } from "@/utils/generalFunctions";
import warehouseDepots from "../requests/warehouseDepots";

export default function UserWarehouseForm({ ownerId, warehouseId }) {
    const router = useRouter()

    const [departmentProductsList, setDepartmentProductsList] = React.useState([])

    React.useEffect(() => {
        async function fetchData() {
            const departmentProductsList = await warehouseDepots.allProductsWithoutDepots(ownerId, warehouseId)

            setDepartmentProductsList(departmentProductsList)
        }

        fetchData()
    }, [ownerId, warehouseId])

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Nuevo depósito
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        product: null,
        productTotalUnits: "",
    }

    const validationSchema = Yup.object({
        product: Yup.object().required("seleccione un producto"),
        productTotalUnits: Yup.number().integer().required("especifique cantidad"),
    })

    const handleSubmit = async (values) => {
        let response = await warehouseDepots.createDepot(
            {
                warehouseId: warehouseId,
                userId: ownerId,
                productId: values.product.id,
                productTotalUnits: values.productTotalUnits,
                insertedById: ownerId,
            }
        )

        if (response?.status === 200) {
            router.push(`/inventory/owner/warehouse/${warehouseId}`)
        } else {
            //ToDo: catch validation errors
            notifyError("Hay un error en la creación de depósitos")
        }
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    })

    return (
        <Card variant={"outlined"}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container rowSpacing={2}>
                    <Grid item xs={12}>
                        <CustomToolbar />
                    </Grid>

                    <Grid container item rowSpacing={2} sx={{ padding: "25px" }}>
                        <Grid item xs={12}>
                            <TextField
                                name={"productTotalUnits"}
                                label="Cantidad de unidades"
                                size={"small"}
                                {...formik.getFieldProps("productTotalUnits")}
                                error={formik.errors.productTotalUnits && formik.touched.productTotalUnits}
                                helperText={(formik.errors.productTotalUnits && formik.touched.productTotalUnits) && formik.errors.productTotalUnits}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <DepartmentProductsSelect
                                departmentProductsList={departmentProductsList}
                                setDepartmentProductsList={setDepartmentProductsList}
                                selectedProduct={formik.values.product}
                                setSelectedProduct={(value) => formik.setFieldValue("product", value)}
                            />
                            <FormHelperText sx={{ color: "red" }}>
                                {formik.errors.product}
                            </FormHelperText>
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{ paddingRight: "25px" }}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            onClick={() => router.push(`/inventory/owner/warehouse/${warehouseId}`)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type={"submit"}
                            color={"primary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{ m: 1 }}
                            disabled={!formik.isValid}
                        >
                            Create
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}