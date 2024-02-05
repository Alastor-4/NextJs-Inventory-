import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField } from '@mui/material';
import { ChangePasswordModalProps } from '@/types/interfaces';
import { Close } from '@mui/icons-material';
import users from '../../requests/users';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ChangePasswordModal = ({ open, setOpen, selectedUser, setSelectedUser }: ChangePasswordModalProps) => {

    const changePasswordValidationSchema = Yup.object({
        password: Yup.string()
            .required('Este campo es requerido')
            .min(8, 'Debe contener al menos 8 caracteres')
    });

    const handleClose = () => setOpen(false);

    return <Formik
        initialValues={{ password: '' }}
        validationSchema={changePasswordValidationSchema}
        onSubmit={async ({ password }) => {
            const response = await users.changePassword(selectedUser?.id!, password);

            if (response === "Contraseña cambiada correctamente") {
                setSelectedUser(null);
                handleClose();
            }
        }}
    >
        {
            ({ handleSubmit, getFieldProps, touched, errors, isValid }) => (
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        color={"white"}
                        fontWeight={"400"}
                        sx={{ bgcolor: '#1976d3' }}
                    >
                        {`Cambiar contraseña a "${selectedUser?.username}"`}
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                            sx={{ marginLeft: "10px" }}
                        >
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container item xs={12} spacing={2} paddingY={"20px"} paddingX={"30px"} mb={"10px"}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Contraseña*"
                                        size={"small"}
                                        fullWidth
                                        variant="outlined"
                                        {...getFieldProps("password")}
                                        error={!!errors.password && touched.password}
                                        helperText={(errors.password && touched.password) && errors.password}
                                    />
                                </Grid>
                            </Grid>
                            <DialogActions>
                                <Button color="error" variant="outlined" onClick={handleClose}>Cancelar</Button>
                                <Button
                                    color="primary"
                                    variant="outlined"
                                    type='submit'
                                    disabled={!isValid || !!errors.password && touched.password}
                                >
                                    Cambiar
                                </Button>
                            </DialogActions>
                        </form >
                    </DialogContent>
                </Dialog>
            )
        }
    </Formik >
}

export default ChangePasswordModal