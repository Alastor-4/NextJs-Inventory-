import { AddOutlined, Close, CloseOutlined, DeleteOutline, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { Button, Card, Collapse, Grid, IconButton, Stack, TextField, TextareaAutosize, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { storeDetails } from '../request/storeDetails';
import { useParams } from 'next/navigation';
import StoreModalDefault from './Modal/StoreModalDefault';
import { Formik } from 'formik';
import * as Yup from 'yup'

function StoreListOffers( props : any ) {
 const { productStoreDepot, loadDates, showOffers, setShowOffers } = props;
  const params = useParams()

  
  const [offers, setOffers] = useState(productStoreDepot.offer_notes !== null ? productStoreDepot.offer_notes.split('||') : [])

  const [activeModalCreateOffer, setActiveModalCreateOffer] = useState(false)
  const [activeModalEditOffer, setActiveModalEditOffer] = useState(false);
  const [indexEditOffer, setIndexEditOffer] = useState<any>()

  const refreshAndShowOffers = () => {
    if (showOffers) loadDates();
    setShowOffers(!showOffers);
  }
  // Update offer_notes (bd)
  const updateOfferNotesBd = async (newOffers : Array<String> ) => {
    productStoreDepot.offer_notes = newOffers.join('||');

    const response = await storeDetails.update(params.id, params.storeDetails, productStoreDepot)

    if (response !== 200) {
      //Error
    }
  }

  // Componente para editar cada nota ( create and update )
  function EditOffer({ notes } : { notes : String}) {

    const setValidationSchema = (
      Yup.object({

        text: Yup.string().required("Escriba una oferta")

      })
    )

    const handleSubmit = (value : any) => {
      let newOffers: any  = [...offers]

      if (activeModalCreateOffer) {

        newOffers.push(value.text)
        setActiveModalCreateOffer(false)
      } else {
        newOffers[indexEditOffer] = value.text
        setActiveModalEditOffer(false)
      }
      updateOfferNotesBd(newOffers)

      setOffers(newOffers)
    }

    return (
      <>
        <Formik
          initialValues={{ text: notes }}
          validationSchema={setValidationSchema}
          onSubmit={handleSubmit}
        >
          {
            (formik : any) =>
              <Card variant='outlined' sx={{ padding: '20px' }}>

                <form onSubmit={formik.handleSubmit}>
                  <Stack spacing={1}>
                    <TextField
                      name='text'
                      label='Oferta'
                      multiline
                      {...formik.getFieldProps("text")}
                      error={formik.errors.text && formik.touched.text}
                      helperText={(formik.errors.text && formik.touched.text) && formik.errors.text}
                    />
                    <Button type='submit' variant='contained' >Aceptar</Button>
                  </Stack>
                </form>
              </Card>

          }

        </Formik>
      </>
    )
  }


  const removeOffer = async (ind : number) => {
    let newOffers = [...offers];
    newOffers.splice(ind, 1);

    updateOfferNotesBd(newOffers)

    setOffers(newOffers)

  }

  return (
    <>

      <StoreModalDefault
        dialogTitle={"Nueva oferta"}
        open={activeModalCreateOffer}
        setOpen={setActiveModalCreateOffer}
      >
        <EditOffer notes={""} />
      </StoreModalDefault>

      <StoreModalDefault
        dialogTitle={"Modificar Oferta"}
        open={activeModalEditOffer}
        setOpen={setActiveModalEditOffer}
      >
        <EditOffer notes={offers[indexEditOffer]} />
      </StoreModalDefault>


      <Grid container item xs={12} columnSpacing={1} >
        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Ofertas</Grid>

        <Grid item>
          <IconButton sx={{ padding: 0 }} onClick={refreshAndShowOffers}>
            {(showOffers)
              ? <ExpandLessOutlined />
              : <ExpandMoreOutlined />
            }
          </IconButton>
        </Grid>

        <Grid item >
          {
            showOffers && (
              <IconButton sx={{ padding: 0 }} onClick={() => setActiveModalCreateOffer(true)} >
                <AddOutlined color='primary' />
              </IconButton>
            )
          }
        </Grid>

      </Grid >

      <Collapse in={showOffers} timeout="auto" unmountOnExit>
        {
          offers.length !== 0
            ? (
              <Stack>
                {offers.length > 0
                  ? offers.map((item: any, index: number) => (
                    <Grid container
                      key={index}
                      sx={{
                        display: "inline-flex",
                        margin: "3px",
                        backgroundColor: "rgba(170, 170, 170, 0.8)",
                        padding: "2px 4px",
                        borderRadius: "5px 2px 2px 2px",
                        border: "1px solid rgba(130, 130, 130)",
                        fontSize: 14,
                      }}
                      onClick={() => {
                        setActiveModalEditOffer(true)
                        setIndexEditOffer(index)
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
                        sx={{ color: "rgba(16,27,44,0.8)" }}>
                        {`${item}`}
                      </Grid>

                      <Grid item sx={{ marginLeft: "3px" }}  >
                        <CloseOutlined
                          fontSize={"small"}
                          color='secondary'
                          sx={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeOffer(index)
                          }}
                        />

                      </Grid>

                    </Grid>
                  )
                  ) : "-"
                }

              </Stack>
            )
            : (
              'No hay ofertas'
            )
        }

      </Collapse>


    </>
  )
}

export default StoreListOffers
