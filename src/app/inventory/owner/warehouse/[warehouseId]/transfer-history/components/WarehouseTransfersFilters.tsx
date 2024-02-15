'use client'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    TextField
} from '@mui/material';
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { FilterAlt } from '@mui/icons-material';
import React from 'react';
import * as Yup from "yup";
import {stores} from "@prisma/client";
import {Formik} from "formik";
import {DatePicker, esES, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";

interface FiltersProps {
    open: boolean
    handleClose: () => void
    storeOptions: stores[]
    loadData: (storeId: string, startDate: string, endDate: string) => void
}

const WarehouseTransfersFilters = ({ open, handleClose, storeOptions, loadData  }: FiltersProps) => {

    const initialValues = {
        storeId: "",
        startDate: dayjs().subtract(30, "day").set("hour", 0).set("minute", 0).set("second", 0),
        endDate: dayjs().set("hour", 23).set("minute", 59).set("second", 59),
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
                loadData(values.storeId, values.startDate.format(), values.endDate.format())
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

                                <Grid item xs={12} >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                                        adapterLocale='es'>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                slotProps={{ field: { clearable: true }, toolbar: { hidden: true }, textField: { size: 'small', fullWidth: true } }}
                                                label="Desde"
                                                disableFuture
                                                value={formik.values.startDate}
                                                onChange={(value) => formik.setFieldValue("startDate", value)}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                                        adapterLocale='es'>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                slotProps={{ field: { clearable: true }, toolbar: { hidden: true }, textField: { size: 'small', fullWidth: true } }}
                                                label="Hasta"
                                                disableFuture
                                                value={formik.values.endDate}
                                                onChange={(value) => formik.setFieldValue("endDate", value)}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
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