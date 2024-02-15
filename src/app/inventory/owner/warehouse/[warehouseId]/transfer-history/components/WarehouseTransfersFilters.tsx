'use client'
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton, MenuItem,
    Stack,
    TextField
} from '@mui/material';
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { allProductsByDepartmentProps } from '@/types/interfaces';
import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import * as Yup from "yup";
import {stores} from "@prisma/client";
import {Formik} from "formik";

interface FiltersProps {
    open: boolean
    handleClose: () => void
    storeOptions: stores[]
    loadData: (storeId: string, startDate: string, endDate: string) => void
}

const WarehouseTransfersFilters = ({ open, handleClose, storeOptions, loadData  }: FiltersProps) => {

    const initialValues = {
        storeId: "",
        startDate: "",
        endDate: '',
    }

    const validationSchema = Yup.object({
        storeId: Yup.string(),
        startDate: Yup.string(),
        endDate: Yup.string(),
    })

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                loadData(values.storeId, values.startDate, values.endDate)
                handleClose()
            }}
        >
            {
                formik => (
                    <Dialog open={open} fullWidth onClose={handleClose}>
                        <DialogTitle
                            display={"flex"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            color={"white"}
                            padding={{ xs: "10px" }}
                            sx={{ bgcolor: '#1976d3' }}
                        >
                            Filtrar transferencias
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={handleClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent dividers>
                            <Grid container rowSpacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Tienda"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("storeId")}
                                        error={!!formik.errors.storeId && formik.touched.storeId}
                                        helperText={(formik.errors.storeId && formik.touched.storeId) && formik.errors.storeId}
                                    >
                                        {
                                            storeOptions.map(item => (<MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>))
                                        }
                                    </TextField>
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                startIcon={<FilterAlt />}
                                color="primary"
                                variant="outlined"
                                onClick={() => formik.handleSubmit()}
                            >
                                Aplicar
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            }
        </Formik>
    );
}

export default WarehouseTransfersFilters