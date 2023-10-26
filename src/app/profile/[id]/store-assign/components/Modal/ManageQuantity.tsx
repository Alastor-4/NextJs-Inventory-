import { SwapHoriz } from '@mui/icons-material'
import { Box, Button, Card, Grid, IconButton, Stack, TextField, Typography } from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useState } from 'react'
import storeAssign from '../../requests/store-assign'
import { useParams } from 'next/navigation'

function ManageQuantity({ nameStore, nameWarehouse, productDetails, updateDepot, setactiveManageQuantity }) {

  const [swap, setSwap] = useState(false)

  const params = useParams()

  const maxUnits = {
    cant: (!swap)
      ? productDetails.depots[0].product_total_remaining_units
      : productDetails.depots[0].store_depots[0].product_remaining_units,

    text: `No hay esa cantidad en ${!swap
      ? 'el almacen'
      : 'la tienda'
      }`
  }

  const setValidationSchema = () => (
    Yup.object({

      units: Yup.number()
        .min(0, "No puedes pasar una cantidad negativa")
        .max(maxUnits.cant, maxUnits.text)
        .required("Campo obligatorio")

    })
  )

  const handleSubmit = async (values) => {
   
    let productStoreDepots = productDetails.depots[0].store_depots[0];
    let productDepots = productDetails.depots[0];

    if (!swap) {
      
      productStoreDepots.product_remaining_units += parseInt(values.units)
     
      productStoreDepots.product_units += parseInt(values.units)

    } else productStoreDepots.product_remaining_units -= parseInt(values.units)

    const result = await storeAssign.UpdateProductStore(params.id, productStoreDepots)

    if (result === 200) {
      (!swap )
      ? updateDepot(-parseInt(values.units), productDepots)
      : updateDepot(parseInt(values.units), productDepots)
    }
    setactiveManageQuantity(false);
  }

  return (
    <>
      <Card variant='outlined' sx={{ padding: '10px' }}>
        <Grid container direction={'column'} rowGap={3} >

          <Grid item container justifyContent={"space-between"}>

            <Stack alignItems={"center"}>
              <Typography variant='subtitle1'  >Unidades en la tienda</Typography>
              <Box> {productDetails.depots[0].store_depots[0].product_remaining_units} </Box>
            </Stack>

            <Stack alignItems={"center"}>
              <Typography variant='subtitle1'  >Unidades en el almacén</Typography>
              <Box> {productDetails.depots[0].product_total_remaining_units} </Box>
            </Stack>

          </Grid>

          
          <Grid item container justifyContent={"space-evenly"}>

            <Stack spacing={1} margin={1}>

              <small>{`Proveedor ( ${!swap ? "Almacén" : "Tienda"}  )`}</small>

              <Box>{!swap ? nameWarehouse : nameStore}</Box>

            </Stack>

            <Grid item margin={1}>
      
              <IconButton onClick={() => setSwap(!swap)} sx={{ boxShadow:"0px 1px 2px 0px black" }}>
                <SwapHoriz color='primary' />
              </IconButton>

            </Grid>

            <Stack spacing={1} margin={1}>

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
                    error={formik.errors.units && formik.touched.units}
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
