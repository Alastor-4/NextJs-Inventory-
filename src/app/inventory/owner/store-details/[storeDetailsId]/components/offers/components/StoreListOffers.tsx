import { AddOutlined, DeleteOutline, EditOutlined, WarningOutlined } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
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
import { notifyError, notifySuccess, notifyWarning } from '@/utils/generalFunctions';

function StoreListOffers(props: any) {
    const { priceProduct, currency, storeDepotId } = props;
    const params = useParams()

    const [offers, setOffers] = useState<any>([])

    const [activeModalCreateOffer, setActiveModalCreateOffer] = useState(false)
    const [activeModalEditOffer, setActiveModalEditOffer] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<any>()

    //Se pide a la bd las offertas del producto
    const getDataOffers = async () => {
        const newOffers = await storeDetails.getProductOffers(params.storeDetailsId, storeDepotId)
        setOffers(newOffers)
    }
    useEffect(() => {
        const getData = async () => {
            const newOffers = await storeDetails.getProductOffers(params.storeDetailsId, storeDepotId)
            setOffers(newOffers)
        }
        getData()
    }, [params.storeDetailsId, storeDepotId])

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
                response = await storeDetails.createProductOffers(params.storeDetailsId, data)
                setActiveModalCreateOffer(false)
            } else {
                response = await storeDetails.updateProductOffers(params.storeDetailsId, data)
                setActiveModalEditOffer(false)
            }
            if (response === false) {
                notifyError("Ha ocurrido un error")
            } else getDataOffers()

        }
        return (
            <Formik
                initialValues={setInitialValues}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
            >
                {
                    (formik: any) => (
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container rowSpacing={2}>
                                <Grid container item xs={12} rowGap={2}>
                                    <Grid
                                        item
                                        container
                                        xs={12}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        columnGap={1.3}
                                    >
                                        <Grid item>
                                            Operación:
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
                                                <MenuItem value={'='}>igual a</MenuItem>
                                                <MenuItem value={'>'}>más de</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12}>
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

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            name='newPrice'
                                            label={"Precio por unidades"}
                                            size='small'
                                            InputProps={{
                                                endAdornment: <InputAdornment
                                                    position='end'>{currency ?? "CUP"}</InputAdornment>
                                            }}
                                            {...formik.getFieldProps("newPrice")}
                                            error={formik.errors.newPrice && formik.touched.newPrice}
                                            helperText={(formik.errors.newPrice && formik.touched.newPrice) && formik.errors.newPrice}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid item xs={12}>
                                    {
                                        formik.values.selectedOperation === '='
                                            ? `Cuando compren ${formik.values.quantity} unidades de este producto, cada unidad tendrá un precio de ${formik.values.newPrice} ${currency}`
                                            : `Cuando compren más de ${formik.values.quantity} unidades de este producto, cada unidad tendrá un precio de ${formik.values.newPrice} ${currency}`
                                    }
                                </Grid>

                                <Grid container item xs={12} justifyContent={'flex-end'}>
                                    <Button type='submit' variant='outlined' size='small'>Aceptar</Button>
                                </Grid>
                            </Grid>
                        </form>
                    )
                }
            </Formik>
        )
    }

    const removeOffer = async (offerId: any) => {
        const response = await storeDetails.removeProductOffers(params.storeDetailsId, offerId)

        if (response === false) {
            notifyError("No se ha podido eliminar la oferta")
        } else await getDataOffers()
    }

    const handleToggleOffer = async (offerId: any) => {
        const response = await storeDetails.toggleProductOffers(params.storeDetailsId, offerId)

        if (response) {
            const isActive = response.is_active

            isActive
                ? notifySuccess("Oferta habilitada nuevamente")
                : notifyWarning("La oferta ha sido deshabilitada y no se está aplicando")

            await getDataOffers()
        } else {
            notifyError("No se ha podido cambiar el estado a la oferta")
        }
    }

    return (
        <>
            <StoreModalOffers
                dialogTitle={"Crear oferta"}
                open={activeModalCreateOffer}
                setOpen={setActiveModalCreateOffer}
            >
                <EditOffer offers={null}/>
            </StoreModalOffers>

            <StoreModalDefault
                dialogTitle={"Modificar Oferta"}
                open={activeModalEditOffer}
                setOpen={setActiveModalEditOffer}
            >
                <EditOffer offer={selectedOffer}/>
            </StoreModalDefault>


            <Grid item container xs={12}>
                <Grid item container>
                    <Grid item xs={"auto"} sx={{fontWeight: 600}} alignSelf={'center'}>Ofertas:</Grid>

                    <Grid item>
                        <IconButton
                            size='small'
                            color='primary'
                            onClick={() => setActiveModalCreateOffer(true)}
                            sx={{ml: "10px"}}
                        >
                            <AddOutlined fontSize='small'/>
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>

            {
                offers.length !== 0
                    ? (
                        <Grid container item xs={12} rowSpacing={1}>
                            {
                                offers.map((item: any, index: number) => (
                                    <Grid container item xs={12} key={index}>
                                        <Grid
                                            container
                                            item
                                            columnSpacing={1}
                                            maxWidth={"80vw"}
                                            sx={{
                                                width: 'fit-content',
                                                backgroundColor: "lightgray",
                                                padding: "2px 4px",
                                                borderRadius: "5px 2px 2px 2px",
                                                border: "1px solid",
                                                borderColor: item.is_active ? "seagreen" : "orange",
                                                fontSize: 14,
                                                cursor: "pointer",
                                                textDecorationLine: item.is_active ? "none" : "line-through",
                                            }}
                                            onClick={async () => {
                                                setActiveModalEditOffer(true)
                                                setSelectedOffer(item)
                                            }}
                                        >
                                            <Grid container item xs={12} justifyContent={"space-between"}>
                                                <Checkbox
                                                    size={"small"}
                                                    color={item.is_active ? "success" : "default"}
                                                    checked={item.is_active}
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        return await handleToggleOffer(item.id)
                                                    }}
                                                />

                                                <IconButton
                                                    size={"small"}
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        return await removeOffer(item.id)
                                                    }}
                                                >
                                                    <DeleteOutline fontSize={"small"} color='error'/>
                                                </IconButton>
                                            </Grid>

                                            <Grid
                                                container
                                                item
                                                xs={12}
                                                sx={{ color: "rgba(16,27,44,0.8)", textWrap: "pretty"}}>
                                                {
                                                    item.compare_function === '='
                                                        ? `${index + 1}. Cuando compren ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                                                        : `${index + 1}. Cuando compren más de ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                                                }
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    )
                    : (
                        'No hay ofertas'
                    )
            }
        </>
    )
}

export default StoreListOffers
