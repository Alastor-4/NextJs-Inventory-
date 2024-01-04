"use client"

import {
    Button,
    FormHelperText,
    Grid,
    TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup"
import DepartmentProductsSelect from "@/components/DepartmentProductsSelect";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import warehouseDepots from "../requests/warehouseDepots";
import { AxiosResponse } from "axios";
import { UserWarehouseFormProps } from "@/types/interfaces";

export default function UserWarehouseForm({ ownerId, warehouseId }: UserWarehouseFormProps) {

    const [departmentProductsList, setDepartmentProductsList] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const departmentProductsList = await warehouseDepots.allProductsWithoutDepots(ownerId!, warehouseId!)

            setDepartmentProductsList(departmentProductsList);
        }

        fetchData()
    }, [ownerId, warehouseId]);

    const initialValues = {
        product: null,
        productTotalUnits: "",
    }

    const validationSchema = Yup.object({
        product: Yup.object().required("Seleccione un producto"),
        productTotalUnits: Yup.number().integer().required("Especifique cantidad"),
    })

    const handleSubmit = async (values: any) => {
        let response: boolean | AxiosResponse = await warehouseDepots.createDepot(
            {
                warehouseId: warehouseId,
                userId: ownerId,
                productId: values.product.id,
                productTotalUnits: values.productTotalUnits,
                insertedById: ownerId,
            }
        )
        if (!response) return;

        if (response?.status === 200) {

            let selectedDepartments = new Map();
            departmentProductsList.forEach((element: any) => {
                if (element.selected) {
                    selectedDepartments.set(element.id, true)
                }
            })


            let newDepartmentProductsList = await warehouseDepots.allProductsWithoutDepots(ownerId!, warehouseId!)

            if (newDepartmentProductsList) {

                newDepartmentProductsList.forEach((element: any, index: number) => {
                    if (selectedDepartments.has(element.id)) {
                        newDepartmentProductsList[index].selected = true
                    }
                })

                formik.resetForm()
                setDepartmentProductsList(newDepartmentProductsList);
                notifySuccess("Se ha creado un nuevo depósito")

            } else notifyError("Error al cargar los datos")

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
        <form onSubmit={formik.handleSubmit} >
            <Grid container rowSpacing={2}>

                <Grid container item rowSpacing={2}>
                    <Grid item xs={12}>
                        <TextField

                            label="Cantidad de unidades"
                            size={"small"}
                            {...formik.getFieldProps("productTotalUnits")}
                            error={!!formik.errors.productTotalUnits && formik.touched.productTotalUnits}
                            helperText={(formik.errors.productTotalUnits && formik.touched.productTotalUnits) && formik.errors.productTotalUnits}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <DepartmentProductsSelect
                            departmentProductsList={departmentProductsList}
                            setDepartmentProductsList={setDepartmentProductsList}
                            selectedProduct={formik.values.product}
                            setSelectedProduct={(value: any) => formik.setFieldValue("product", value)}
                        />
                        <FormHelperText sx={{ color: "red" }}>
                            {formik.errors.product}
                        </FormHelperText>
                    </Grid>
                </Grid>

                <Grid item xs={12} paddingX={5}>

                    <Button
                        fullWidth
                        type={"submit"}
                        color={"primary"}
                        variant={"contained"}
                        size={"small"}
                        // sx={{ m: 1 }}
                        disabled={!formik.isValid}
                    >
                        Crear
                    </Button>
                </Grid>
            </Grid>
        </form>
    )
}