import { ChangeDataFormProps } from '@/types/interfaces';
import { Grid, TextField, Button } from '@mui/material';
import { handleKeyDown } from '@/utils/handleKeyDown';
import { Formik } from 'formik';
import * as Yup from 'yup';
import React from 'react'

const ChangeDataForm = ({ initialValues, onSubmit }: ChangeDataFormProps) => {
    const signUpValidationSchema = Yup.object({
        username: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\S*$/, 'No puede contener espacios')
            .min(6, 'Debe contener al menos 6 caracteres')
            .test('lowercase', 'Debe estar todo en minúsculas', (value) => {
                return value === value.toLowerCase();
            }),
        email: Yup.string()
            .required('Este campo es requerido')
            .email('No es un correo válido'),
        name: Yup.string()
            .required('Este campo es requerido'),
        phone: Yup.string()
            .required('Este campo es requerido')
            .matches(/^\d{8}$/, 'El teléfono debe tener 8 dígitos')
    });
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={signUpValidationSchema}
            onSubmit={onSubmit}
        >
            {({ handleSubmit, getFieldProps, touched, errors, isValid, resetForm }) => (
                <form onSubmit={handleSubmit}>
                    <Grid container item xs={12} spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Usuario"
                                size={"small"}
                                fullWidth
                                variant="outlined"
                                {...getFieldProps("username")}
                                error={!!errors.username && touched.username}
                                helperText={(errors.username && touched.username) && errors.username}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Nombre"
                                size={"small"}
                                fullWidth
                                variant="outlined"
                                {...getFieldProps("name")}
                                error={!!errors.name && touched.name}
                                helperText={(errors.name && touched.name) && errors.name}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Teléfono"
                                size={"small"}
                                onKeyDown={handleKeyDown}
                                inputMode="tel"
                                fullWidth
                                variant="outlined"
                                {...getFieldProps("phone")}
                                error={!!errors.phone && touched.phone}
                                helperText={(errors.phone && touched.phone) && errors.phone}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Correo"
                                size={"small"}
                                fullWidth
                                variant="outlined"
                                inputMode="email"
                                {...getFieldProps("email")}
                                error={!!errors.email && touched.email}
                                helperText={(errors.email && touched.email) && errors.email}
                            />
                        </Grid>
                        <Grid item container marginTop={"1rem"} justifyContent={"space-between"}>
                            <Button
                                type="reset"
                                color='secondary'
                                variant="outlined"
                                onClick={() => { resetForm() }}
                            >
                                Reestablecer
                            </Button>
                            <Button
                                type="submit"
                                color='primary'
                                variant="outlined"
                                disabled={!isValid}
                            >
                                Guardar
                            </Button>
                        </Grid>
                    </Grid>
                </form>)}
        </Formik >)
}
export default ChangeDataForm