import { Box, Button, Card, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { ManageQuantityProps } from '@/types/interfaces';
import storeAssign from '../../requests/store-assign';
import { handleKeyDown } from '@/utils/handleKeyDown';
import { SwapHoriz } from '@mui/icons-material';
import React, { useState } from 'react';
import { AxiosResponse } from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

function ManageQuantity({ userId, nameStore, nameWarehouse, productDetails, updateDepot, setActiveManageQuantity }: ManageQuantityProps) {

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
    <>
      <Card variant='outlined' sx={{ padding: '10px' }}>
        <Grid container direction={'column'} rowGap={3} >
          <Stack alignItems={"center"}>
            <Typography variant='h6' >Unidades</Typography>
          </Stack>
          <Grid item container justifyContent={"space-around"}>
            <Stack alignItems={"center"}>
              <Typography variant='subtitle1'  >En la tienda</Typography>
              <Box> {productDetails.depots![0].store_depots![0].product_remaining_units} </Box>
            </Stack>
            <Stack alignItems={"center"}>
              <Typography variant='subtitle1'  >En el almacén</Typography>
              <Box> {productDetails.depots![0].product_total_remaining_units} </Box>
            </Stack>
          </Grid>

          <Grid item container direction="column" alignItems="center" justifyContent={"space-around"}>
            <Stack spacing={1} alignItems="center" margin={1}>
              <small>{`Proveedor ( ${!swap ? "Almacén" : "Tienda"}  )`}</small>
              <Box>{!swap ? nameWarehouse : nameStore}</Box>
            </Stack>
            <Grid item margin={1}>
              <IconButton onClick={() => setSwap(!swap)} sx={{ boxShadow: "0px 1px 2px 0px black" }}>
                <SwapHoriz color='primary' />
              </IconButton>
            </Grid>
            <Stack spacing={1} alignItems="center" margin={1}>
              <small>{`Destinatario ( ${!swap ? "Tienda" : "Almacén"}  )`}</small>
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
                <Stack alignContent={"center"} spacing={1} paddingX={3} >
                  <TextField
                    label=" Trasladar unidades"
                    {...formik.getFieldProps("units")}
                    onKeyDown={handleKeyDown}
                    error={!!formik.errors.units && formik.touched.units}
                    helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                  />
                  <Button type='submit' size='small' variant='contained' >Aceptar</Button>
                </Stack>
              </form>
            )
            }
          </Formik>
        </Grid>
      </Card >
    </>
  )
}

export default ManageQuantity
