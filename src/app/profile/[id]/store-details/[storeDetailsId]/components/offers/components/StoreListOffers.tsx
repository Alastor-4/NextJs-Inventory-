import { AddOutlined, CloseOutlined } from '@mui/icons-material';
import {
  Button,
  Card,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { storeDetails } from '../../../request/storeDetails';
import { useParams } from 'next/navigation';
import StoreModalDefault from '../../Modal/StoreModalDefault';
import { Formik } from 'formik';
import * as Yup from 'yup'
import StoreModalOffers from './StoreModalOffers';
import { notifyError } from '@/utils/generalFunctions';

function StoreListOffers(props: any) {
  const { priceProduct, currency, storeDepotId } = props;
  const params = useParams()

  const [offers, setOffers] = useState<any>([])

  const [activeModalCreateOffer, setActiveModalCreateOffer] = useState(false)
  const [activeModalEditOffer, setActiveModalEditOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>()

  //Se pide a la bd las offertas del producto
  const getDataOffers = async () => {
    const newOffers = await storeDetails.getProductOffers(params.id, params.storeDetailsId, storeDepotId)
    setOffers(newOffers)
  }
  useEffect(() => {
    if (offers.length === 0) {
      getDataOffers();
    }
  }, [])

  // Componente para editar cada nota ( create and update )
  function EditOffer(props: any) {
    const { offer } = props;

    const setInitialValues = {
      quantity: offer?.compare_units_quantity ?? 2,

      newPrice: offer?.price_per_unit ?? priceProduct,

      selectedOperation: offer?.compare_function ?? "="
    }

    const setValidationSchema = (
      Yup.object({

        quantity: Yup.number()
          .typeError("Solo cantidades numéricas")
          .min(2, "La cantidad mínima es 2")
          .required("Ponga alguna cantidad"),

        newPrice: Yup.number()
          .typeError("Solo precios numéricos")
          .min(0, "La cantidad mínima es 0")
          .max(priceProduct, `El precio no puede exeder al precio del producto original (${priceProduct} ${currency})`)
          .required("Ponga algun precio"),

        selectedOperation: Yup.string()


      })
    )

    const handleSubmit = async (value: any) => {
      let response;

      const data = {
        id: offer?.id ?? null,
        compare_units_quantity: parseInt(value.quantity),
        compare_function: value.selectedOperation,
        price_per_unit: parseInt(value.newPrice),
        store_depot_id: parseInt(storeDepotId)
      }

      if (activeModalCreateOffer) {
        response = await storeDetails.createProductOffers(params.id, params.storeDetailsId, data)
        setActiveModalCreateOffer(false)
      } else {
        response = await storeDetails.updateProductOffers(params.id, params.storeDetailsId, data)
        setActiveModalEditOffer(false)
      }
      if (response === false) {
        notifyError("Ha ocurrido un error")
      } else getDataOffers()

    }
    return (
      <>
        <Formik
          initialValues={setInitialValues}
          validationSchema={setValidationSchema}
          onSubmit={handleSubmit}
        >
          {
            (formik: any) => (
              <Card variant='outlined' sx={{ padding: '20px', width: "100%" }}>

                <form onSubmit={formik.handleSubmit} >
                  <Grid container direction={'column'} rowGap={2} >

                    <Grid item container
                      justifyContent={"center"}
                      alignItems={"center"}
                      columnGap={1.3}

                    >

                      <Grid item>
                        Operacion:
                      </Grid>

                      <Grid item>
                        <TextField
                          variant='standard'
                          name='selectedOperation'
                          size='small'
                          select
                          {...formik.getFieldProps("selectedOperation")}
                          value={formik.values.selectedOperation === "" ? "=" : formik.values.selectedOperation}
                        >

                          <MenuItem value={'='} >igual a</MenuItem>
                          <MenuItem value={'>'} >más de</MenuItem>

                        </TextField>
                      </Grid>

                    </Grid>

                    <Grid item>
                      <TextField
                        fullWidth
                        name='quantity'
                        label={"Cantidad de unidades"}
                        size='small'
                        {...formik.getFieldProps("quantity")}
                        error={formik.errors.quantity && formik.touched.quantity}
                        helperText={(formik.errors.quantity && formik.touched.quantity) && formik.errors.quantity}

                      />
                    </Grid>

                    <Grid item>
                      <TextField
                        fullWidth
                        name='newPrice'
                        label={"Nuevo Precio del producto"}
                        size='small'
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>{currency ?? "CUP"}</InputAdornment>
                        }}
                        {...formik.getFieldProps("newPrice")}
                        error={formik.errors.newPrice && formik.touched.newPrice}
                        helperText={(formik.errors.newPrice && formik.touched.newPrice) && formik.errors.newPrice}

                      />
                    </Grid>

                  </Grid>

                  <Grid container
                    marginTop={2}
                    justifyContent={'flex-end'}

                  >

                    <Grid item>
                      <Button
                        type='submit'
                        variant='outlined'
                        size='small'
                      >Aceptar</Button>
                    </Grid>

                  </Grid>
                </form>
              </Card>
            )
          }

        </Formik>
      </>
    )
  }

  const removeOffer = async (offerId: any) => {
    const response = await storeDetails.removeProductOffers(params.id, params.storeDetailsId, offerId)

    if (response === false) {
      notifyError("No se ha podido eliminar la oferta")
    } else getDataOffers()

  }
  return (
    <>

      <StoreModalOffers
        dialogTitle={"Nueva oferta"}
        open={activeModalCreateOffer}
        setOpen={setActiveModalCreateOffer}
      >
        <EditOffer offers={null} />
      </StoreModalOffers>

      <StoreModalDefault
        dialogTitle={"Modificar Oferta"}
        open={activeModalEditOffer}
        setOpen={setActiveModalEditOffer}
      >
        <EditOffer offer={selectedOffer} />
      </StoreModalDefault>


      <Grid item container xs={12}>
        <Grid item container >
          <Grid item xs={"auto"} sx={{ fontWeight: 600 }} alignSelf={'center'}>Ofertas:</Grid>

          <Grid item>
            <IconButton
              size='small'
              sx={{ padding: 0 }}
              color='primary'
              onClick={() => setActiveModalCreateOffer(true)}
            >
              <AddOutlined fontSize='small' />
            </IconButton>
          </Grid>

        </Grid>

      </Grid >
      {
        offers.length !== 0
          ? (
            <Stack>
              {
                offers.map((item: any, index: number) => (
                  <Grid container
                    key={index}
                    sx={{
                      // display: "inline-flex",
                      width: 'fit-content',
                      margin: "3px",
                      backgroundColor: "rgba(170, 170, 170, 0.8)",
                      padding: "2px 4px",
                      borderRadius: "5px 2px 2px 2px",
                      border: "1px solid rgba(130, 130, 130)",
                      fontSize: 14,
                    }}
                    onClick={() => {
                      setActiveModalEditOffer(true)
                      setSelectedOffer(item)
                    }}
                  >
                    <Grid item sx={{ marginRight: "8px" }} >
                      <Typography variant={"caption"}
                        sx={{ color: "white", fontWeight: "600" }}>
                        {`${index + 1} -- `}
                      </Typography>
                    </Grid>

                    <Grid item
                      textAlign={"center"}
                      sx={{ color: "rgba(16,27,44,0.8)" }}
                    >
                      {
                        item.compare_function === '='
                          ? `Si se compran ${item.compare_units_quantity} unidades cada producto se venderá a ${item.price_per_unit} ${currency}`
                          : `Si se compran más de ${item.compare_units_quantity} unidades cada producto se venderá a ${item.price_per_unit} ${currency}`
                      }
                    </Grid>

                    <Grid item sx={{ marginLeft: "3px" }}  >
                      <CloseOutlined
                        fontSize={"small"}
                        color='secondary'
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOffer(item.id)
                        }
                        }
                      />

                    </Grid>

                  </Grid>
                ))
              }
            </Stack>
          )
          : (
            'No hay ofertas'
          )
      }

    </>
  )
}

export default StoreListOffers
