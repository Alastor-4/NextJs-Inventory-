import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField } from '@mui/material';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { ModalCreateUpdateDepartmentProps } from '@/types/interfaces';
import departmentsRequests from '../../requests/departments';
import { notifySuccess } from '@/utils/generalFunctions';
import { departments } from '@prisma/client';
import { AxiosResponse } from 'axios';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import React from 'react';

const ModalCreateUpdateDepartment = ({ userId, isOpen, setIsOpen, dialogTitle, department, handleForceRender }: ModalCreateUpdateDepartmentProps) => {

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    const initialValues: departments = {
        id: department ? department.id : -1,
        name: department ? department.name : '',
        description: department?.description ? department.description : '',
        created_at: department ? department.created_at : new Date(),
        usersId: userId!
    }

    const validationSchema = Yup.object({
        name: Yup.string().required("Este campo es requerido"),
        description: Yup.string(),
    });

    const handleSubmit = async (values: departments) => {
        const data: departments = {
            id: department ? department.id : -1,
            name: values.name,
            description: values.description,
            usersId: userId!,
            created_at: new Date()
        }
        if (department) {
            const response: AxiosResponse | boolean = await departmentsRequests.updateDepartment(data);
            if (response) notifySuccess("El departamento se ha modificado correctamente");
        } else {
            const response: AxiosResponse | boolean = await departmentsRequests.createDepartment(data);
            if (response) notifySuccess("El departamento se ha creado correctamente");
        }
        handleForceRender();
    }

    return (
        <Dialog open={isOpen} fullWidth onClose={handleCloseModal}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                fontWeight={"400"}
                sx={{ bgcolor: '#1976d3' }}
            >
                {dialogTitle}
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleCloseModal}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers >
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    onSubmit={handleSubmit}
                >
                    {(formik) => (
                        <Form>
                            <Grid container rowSpacing={2}>
                                <Grid container item rowSpacing={4} >
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Nombre"
                                            size={"small"}
                                            fullWidth
                                            autoComplete='off'
                                            {...formik.getFieldProps("name")}
                                            error={!!formik.errors.name && formik.touched.name}
                                            helperText={(formik.errors.name && formik.touched.name) && formik.errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Descripción"
                                            size={"small"}
                                            autoComplete='off'
                                            fullWidth
                                            {...formik.getFieldProps("description")}
                                            error={!!formik.errors.description && formik.touched.description}
                                            helperText={(formik.errors.description && formik.touched.description) && formik.errors.description}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <DialogActions sx={{ marginRight: "15px", marginTop: "20px" }}>
                                <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                                <Button color="primary" disabled={!formik.values.name} variant="outlined" type='submit'>Agregar</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    )
}

export default ModalCreateUpdateDepartment