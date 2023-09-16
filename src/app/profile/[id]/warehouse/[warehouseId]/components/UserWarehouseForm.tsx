"use client"

import {
    AppBar,
    Box,
    Button,
    Card,
    FormHelperText,
    Grid,
    IconButton,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React, {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup"
import {useRouter} from 'next/navigation';
import DepartmentProductsSelect from "@/components/DepartmentProductsSelect";
import warehouseDepots from "@/app/profile/[id]/warehouse/[warehouseId]/requests/warehouseDepots";

export default function UserWarehouseForm({ownerId, warehouseId, departmentProducts}) {
    const router = useRouter()

    const [updateItem, setUpdateItem] = React.useState()
    const [departmentProductsList, setDepartmentProductsList] = React.useState(departmentProducts)

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
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
            router.push(`/profile/${ownerId}/warehouse/${warehouseId}`)
        } else {
            //ToDo: catch validation errors
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
                        <CustomToolbar/>
                    </Grid>

                    <Grid container item rowSpacing={2} sx={{padding: "25px"}}>
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
                            <FormHelperText sx={{color: "red"}}>
                                {formik.errors.product}
                            </FormHelperText>
                        </Grid>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"} sx={{paddingRight: "25px"}}>
                        <Button
                            color={"secondary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{m: 1}}
                            onClick={() => router.push(`/profile/${ownerId}/warehouse/${warehouseId}`)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type={"submit"}
                            color={"primary"}
                            variant={"outlined"}
                            size={"small"}
                            sx={{m: 1}}
                            disabled={!formik.isValid}
                        >
                            {updateItem ? "Update" : "Create"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}