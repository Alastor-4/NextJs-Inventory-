"use client"

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, IconButton, InputAdornment, TextField
} from '@mui/material';
import { Close, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { ChangeAccountPasswordModalProps } from '@/types/interfaces';
import account from '../../requests/account';
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ChangeAccountPasswordModal = ({ user, isOpen, setIsOpen }: ChangeAccountPasswordModalProps) => {
    const handleClose = () => setIsOpen(false);

    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const toggleVisibilityOldPassword = () => setShowOldPassword(!showOldPassword);
    const toggleVisibilityPassword = () => setShowPassword(!showPassword);
    const toggleVisibilityConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const changePasswordInitialValues = {
        oldPassword: '',
        password: '',
        confirmPassword: ''
    };
    const changePasswordValidationSchema = Yup.object({
        oldPassword: Yup.string()
            .required('Este campo es requerido'),
        password: Yup.string()
            .required('Este campo es requerido')
            .min(8, 'Debe contener al menos 8 caracteres'),
        confirmPassword: Yup.string()
            .required('Este campo es requerido')
            .nullable()
            .oneOf([Yup.ref("password"), null],
                "Las contraseñas no coinciden")
    });
    return <Formik
        initialValues={changePasswordInitialValues}
        validationSchema={changePasswordValidationSchema}
        onSubmit={async ({ oldPassword, password }, { setFieldError }) => {
            const response = await account.changeAccountPassword(user?.id!, oldPassword, password);
            if (response === "Contraseña antigua incorrecta") setFieldError("oldPassword", response);
            if (response === "Contraseña cambiada correctamente") handleClose();
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors, isValid, resetForm }) => (
                <Dialog open={isOpen} onClose={handleClose}>
                    <DialogTitle
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        color={"white"}
                        fontWeight={"400"}
                        sx={{ bgcolor: '#1976d3' }}
                    >
                        Cambiar contraseña
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => { handleClose(); resetForm(); }}
                            aria-label="close"
                            sx={{ marginLeft: "10px" }}
                        >
                            <Close />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <form onSubmit={handleSubmit}>
                            <Grid container item xs={12} spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Contraseña antigua"
                                        size={"small"}
                                        type={showOldPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("oldPassword")}
                                        error={!!errors.oldPassword && touched.oldPassword}
                                        helperText={(errors.oldPassword && touched.oldPassword) && errors.oldPassword}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityOldPassword}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showOldPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Contraseña*"
                                        size={"small"}
                                        type={showPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("password")}
                                        error={!!errors.password && touched.password}
                                        helperText={(errors.password && touched.password) && errors.password}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityPassword}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Confirmar Contraseña*"
                                        size={"small"}
                                        type={showConfirmPassword ? "text" : "password"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("confirmPassword")}
                                        error={!!errors.confirmPassword && touched.confirmPassword}
                                        helperText={(errors.confirmPassword && touched.confirmPassword) && errors.confirmPassword}
                                        InputProps={{
                                            endAdornment:
                                                <InputAdornment
                                                    position="end"
                                                    onClick={toggleVisibilityConfirmPassword}
                                                >
                                                    <IconButton size={"small"}>
                                                        {showConfirmPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                                    </IconButton>
                                                </InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </form >
                    </DialogContent>

                    <DialogActions>
                        <Button color="error" type='reset' variant="outlined" onClick={() => { handleClose(); resetForm() }}>Cancelar</Button>
                        <Button
                            color="primary"
                            variant="outlined"
                            type='submit'
                            disabled={!isValid}
                        >
                            Cambiar
                        </Button>
                    </DialogActions>
                </Dialog>
            )
        }
    </Formik >
}

export default ChangeAccountPasswordModal