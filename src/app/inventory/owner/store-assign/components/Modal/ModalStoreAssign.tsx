import {
    Box, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, Grid, IconButton, Stack, TextField, Typography,
} from "@mui/material";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import { ModalStoreAssignProps } from "@/types/interfaces";
import { handleKeyDown } from '@/utils/handleKeyDown';
import storeAssign from "../../requests/store-assign";
import { SwapVert } from '@mui/icons-material';
import React, { useState } from 'react';
import { AxiosResponse } from "axios";
import { Formik } from 'formik';
import * as Yup from 'yup';

export default function ModalStoreAssign({
    dialogTitle, open, setOpen, nameStore,
    nameWarehouse, productDetails, updateDepot, setActiveManageQuantity
}: ModalStoreAssignProps) {

    const handleClose = () => {
        setOpen(false);
    };

    const [swap, setSwap] = useState<boolean>(false);

    const maxUnits = {
        cant: (!swap)
            ? productDetails.depots![0].product_total_remaining_units
            : productDetails.depots![0].store_depots![0].product_remaining_units,

        text: `No hay esa cantidad en ${!swap ? 'el almacén' : 'la tienda'}`
    }

    const setValidationSchema = () => (
        Yup.object({
            units: Yup.number()
                .min(0, "No puedes pasar una cantidad negativa")
                .max(maxUnits.cant!, maxUnits.text)
                .required("Campo obligatorio")
        })
    )

    const handleSubmit = async ({ units }: { units: string }) => {

        const unitsValue = +units;

        let productStoreDepots = productDetails.depots![0].store_depots![0];
        let productDepots = productDetails.depots![0];

        if (!swap) {
            productStoreDepots.product_remaining_units! += unitsValue;
            productStoreDepots.product_units! += unitsValue;
        } else productStoreDepots.product_remaining_units! -= unitsValue;

        const result: boolean | AxiosResponse = await storeAssign.updateProductStore(productStoreDepots);

        if (!result) return;

        if (result.status === 200) {
            (!swap)
                ? updateDepot(-unitsValue, productDepots)
                : updateDepot(unitsValue, productDepots)
        }
        setActiveManageQuantity(false);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
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
                    onClick={handleClose}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Grid container direction={'column'} rowGap={1}>
                        <Stack alignItems={"center"}>
                            <Typography variant='h6'>Unidades</Typography>
                        </Stack>
                        <Grid item container justifyContent={"space-around"}>
                            <Stack alignItems={"center"}>
                                <Typography variant='subtitle1'>En la tienda</Typography>
                                <Box> {productDetails.depots![0].store_depots![0].product_remaining_units} </Box>
                            </Stack>
                            <Stack alignItems={"center"}>
                                <Typography variant='subtitle1'>En el almacén</Typography>
                                <Box> {productDetails.depots![0].product_total_remaining_units} </Box>
                            </Stack>
                        </Grid>
                        <Grid item container direction="column" alignItems="center" justifyContent={"space-around"}>
                            <Stack spacing={1} alignItems="center" margin={1}>
                                {`Proveedor ${!swap ? "Almacén" : "Tienda"}`}
                                <Box>{!swap ? nameWarehouse : nameStore}</Box>
                            </Stack>
                            <Grid item margin={1}>
                                <IconButton onClick={() => setSwap(!swap)} sx={{ boxShadow: "0px 1px 2px 0px black" }}>
                                    <SwapVert color='primary' />
                                </IconButton>
                            </Grid>
                            <Stack spacing={1} alignItems="center" margin={1}>
                                {`Destinatario ${!swap ? "Tienda" : "Almacén"}`}
                                <Box>{!swap ? nameStore : nameWarehouse}</Box>
                            </Stack>
                        </Grid>
                        <Formik
                            initialValues={{ units: "" }}
                            validationSchema={setValidationSchema}
                            onSubmit={handleSubmit}
                        >
                            {(formik) => (
                                <form onSubmit={formik.handleSubmit}>
                                    <Stack alignContent={"center"} spacing={1} paddingX={3}>
                                        <TextField
                                            autoComplete='off'
                                            label="Trasladar unidades"
                                            onKeyDown={handleKeyDown}
                                            {...formik.getFieldProps("units")}
                                            error={!!formik.errors.units && formik.touched.units}
                                            helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                        />
                                    </Stack>
                                    <DialogActions sx={{ marginRight: "10px", marginTop: "10px" }}>
                                        <Button color="error" variant="outlined" onClick={() => { }}>Cerrar</Button>
                                        <Button color="primary" disabled={!formik.values.units} variant="outlined" type='submit'>Aceptar
                                        </Button>
                                    </DialogActions>
                                </form>
                            )}
                        </Formik>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    )
}