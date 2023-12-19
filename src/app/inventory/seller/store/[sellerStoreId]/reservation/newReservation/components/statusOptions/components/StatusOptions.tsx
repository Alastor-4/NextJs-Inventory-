import {
    Button,
    Card,
    Chip,
    Grid,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import statusRequest from '../request/statusRequest';
import { notifyError, notifyWarning } from '@/utils/generalFunctions';

function StatusOptions({ storeId, indUpdate, dataReservation, delivery, reservationStatusColors, justCancel }: { storeId: string, indUpdate: number, dataReservation: any, delivery: boolean, reservationStatusColors: any, justCancel: boolean }) {

    const [actualState, setActualState] = useState(dataReservation[indUpdate].reservation_status)

    const [activeStep, setActiveStep] = useState(0);

    const initialStates = () => {

        const defaultStates = [
            {
                name: "Pendiente",

                content: "No se ha tomado una decisión"

            },

            {
                name: "Reservado",

                content: "Los productos se han reservado para el cliente"

            }
        ]
        const requestedDelivery = {

            name: "En Camino",

            content: "Entrega en curso"

        }

        return delivery ? [...defaultStates, requestedDelivery] : defaultStates

    }

    const [dataState, setDataState] = useState(initialStates)

    useEffect(() => {
        switch (dataReservation[indUpdate].status_id) {
            case 1: setActiveStep(0); break
            case 2: setActiveStep(4); break
            case 3: setActiveStep(1); break
            case 4: setActiveStep(5); break
            case 5: setActiveStep(2); break

            default: setActiveStep(6)
        }
    }, [dataReservation, indUpdate])


    useEffect(() => {
        if (justCancel === true) {
            notifyWarning("La tienda no posee los productos necesarios para esta reservación")
        }
    }, [justCancel])

    // Se cambia de estado 
    const changeState = async (statusId: number, newActiveStep: number) => {

        let request = await statusRequest.updateReservation(storeId, {
            id: dataReservation[indUpdate].id,
            status_id: statusId
        })

        if (request) {

            if (newActiveStep > 4) {
                const data = {
                    total_price: dataReservation[indUpdate].total_price,
                    payment_method: dataReservation[indUpdate].payment_method,
                    from_reservation_id: dataReservation[indUpdate].id,
                    requesting_user_id: dataReservation[indUpdate].requesting_user_id
                }

                request = await statusRequest.postSells(storeId, data)
            }

            setActiveStep(newActiveStep)

        } else notifyError("Error al cambiar de estado")

    }

    // Esta funcion pasa por todos las unidades solicitadas y las devuelve o las quita segun la
    // operation es decir si esta en 1 las devuelve y si esta en -1 las quita
    // Si esta funcion sale con exito se procede a cambair de estado
    const ModifyRemainingUnitsInStoreDepots = async (operation: number, newState: number, newActiveStep: number) => {

        let incorrectRequests: boolean = false

        dataReservation[indUpdate].reservation_products.forEach(async (element: any) => {

            const request = await statusRequest.updateStoreDepots(storeId, {
                id: element.store_depots.id,
                unitsRemaining: element.store_depots.product_remaining_units + element.units_quantity * operation
            })

            if (!request) incorrectRequests = true

        })

        !incorrectRequests
            ? changeState(newState, newActiveStep)
            : notifyError("Error en los depósitos de la tienda")

    }

    //Cuando se va al estado anterior hay dos formas
    // si newActiveStep esta en 0 es q esta en Pendiente por lo tanto se devuelven las unidades
    // si esta en otro valor lo q se hace es cambiar de estado
    const previouState = async (newActiveStep: number) => {

        newActiveStep === 0
            ? await ModifyRemainingUnitsInStoreDepots(1, 1, newActiveStep)

            : await changeState(3, newActiveStep)

    }
    //Cuando se va al siguiente estado hay tres alternativas
    // *Se detecta si se llego al estado final y se procedea cambiar de estado
    // *Si el newActiveStep esta en 1 quiere decir q paso a Reservado por lo tanto se quitan las
    // unidades solicitadas del storeDepots
    // Si el newActiveStep esta en otro valor solo se cambia de estado
    const nextState = async (newActiveStep: number) => {

        if (newActiveStep === dataState.length) {

            newActiveStep === 2
                ? await changeState(4, 5)
                : await changeState(6, 6)

        } else {

            newActiveStep === 1
                ? await ModifyRemainingUnitsInStoreDepots(-1, 3, newActiveStep)
                : await changeState(5, newActiveStep)

        }
    }

    //AL cancelar al reservacion se comprueba si el activeStep no esta en pendiente , si se cumple
    // esto se procede a devolver las unidades a la tienda y el esatdo cambia a Cancelada
    // Si el activeStep esta en pendiente solo se cambia de estado
    const cancelReservation = async () => {

        activeStep > 0
            ? await ModifyRemainingUnitsInStoreDepots(1, 2, 4)
            : await changeState(2, 4)

    }

    return (
        <>
            <Card variant='outlined' sx={{ padding: '10px 10px', width: '100%' }}>

                <Grid container >
                    {
                        activeStep <= dataState.length
                            ? (
                                <Grid item marginLeft={'auto'} paddingBottom={1}>
                                    <Button
                                        variant='outlined'
                                        size='small'
                                        color='error'
                                        onClick={cancelReservation}
                                    >
                                        Cancelar Reservación
                                    </Button>
                                </Grid>
                            )
                            : (
                                <Grid item marginX={'auto'} paddingBottom={1}>
                                    <Chip
                                        label={

                                            activeStep === 4
                                                ? "Cancelada"
                                                : activeStep === 5
                                                    ? "Vendido"
                                                    : "Entregado"

                                        }
                                        color={reservationStatusColors[activeStep === 4 ? 2 : 6]}
                                    />
                                </Grid>
                            )
                    }


                    <Grid item xs={12}>
                        <Card variant='outlined'>
                            <Grid container justifyContent={'center'}>

                                <Stepper activeStep={activeStep} orientation='vertical'>
                                    {
                                        dataState.map((element, index) => (
                                            <Step key={index} >

                                                <StepLabel>
                                                    {element.name}
                                                </StepLabel>

                                                <StepContent>
                                                    <Typography fontSize={14} >{element.content}</Typography>
                                                </StepContent>

                                            </Step>
                                        ))
                                    }

                                </Stepper>

                            </Grid>
                        </Card>
                    </Grid>


                    <Grid item container justifyContent={'space-between'} columnGap={1} paddingTop={2} >

                        <Grid item xs={5}>

                            <Button
                                fullWidth
                                variant='outlined'
                                size='small'
                                disabled={activeStep === 0 || activeStep >= dataState.length || justCancel}
                                onClick={() => previouState(activeStep - 1)}
                            >
                                Atras
                            </Button>
                        </Grid>

                        <Grid item xs={5}>
                            <Button
                                fullWidth
                                variant='outlined'
                                size='small'
                                disabled={activeStep >= dataState.length || justCancel}
                                onClick={() => nextState(activeStep + 1)}
                            >
                                {
                                    activeStep === dataState.length - 1
                                        ? "Completar"
                                        : "Siguiente"
                                }
                            </Button>
                        </Grid>

                    </Grid>

                </Grid>

            </Card>


        </>
    )
}

export default StatusOptions
