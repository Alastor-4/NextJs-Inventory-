"use client"

import {
    AppBar, Box, Button, Card, Checkbox, DialogActions,
    Grid, MenuItem, TextField, Toolbar, Typography
} from "@mui/material";
import { openDaysStores } from "@/request/openDaysStores";
import { notifyError } from "@/utils/generalFunctions";
import { StoresFormProps } from "@/types/interfaces";
import React, { useEffect, useState } from "react";
import StoreOpeningDays from "./StoreOpeningDays";
import { useRouter } from 'next/navigation';
import stores from "../requests/stores";
import { useFormik } from "formik";
import * as Yup from "yup"
import dayjs from "dayjs";

const StoresForm = ({ ownerId, storeId, sellerUsers }: StoresFormProps) => {
    const router = useRouter();

    //Url de las api
    const urlApiStoreOpenDays = "/inventory/owner/store/apiOpenDays";
    const urlApiStoreOpenReservations = "/inventory/owner/store/apiReservations";

    const [updateItem, setUpdateItem] = useState<any>();
    const [userSeller, setUserSeller] = useState("");

    const [sellProfit, setSellProfit] = useState<boolean>(true);

    const [activeCollection, setActiveCollection] = useState<boolean>(false);
    const [activeReservations, setActiveReservations] = useState<boolean>(false);

    const defaultStartTime = dayjs();
    const defaultEndTime = dayjs();

    const [storeOpeningDays] = useState([
        {
            id: null,
            weekDayNumber: 1,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 2,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 3,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 4,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 5,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 6,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 7,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
    ])

    const [storeReservationDays] = useState([
        {
            id: null,
            weekDayNumber: 1,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,

        },
        {
            id: null,
            weekDayNumber: 2,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 3,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 4,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 5,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 6,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
        {
            id: null,
            weekDayNumber: 7,
            open: false,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
        },
    ])

    useEffect(() => {
        async function fetchStore(id: any) {
            const store = await stores.storeDetails(ownerId!, id);
            //TODO
            setUpdateItem(store)
            if (store.seller_user) {
                const index = sellerUsers.findIndex((item: any) => item.id === store.seller_user.id)
                setUserSeller(index > -1 ? sellerUsers[index] : "")
            }
        }
        if (storeId !== undefined) {
            fetchStore(storeId)
        }
    }, [sellerUsers, storeId, ownerId])

    useEffect(() => {
        if (updateItem) {
            setSellProfit(updateItem?.fixed_seller_profit_quantity === null)
            setActiveCollection(updateItem ? updateItem.online_catalog : false)
            setActiveReservations(updateItem ? updateItem.online_reservation : false)

            if (updateItem.store_open_days) {
                let newStoreOpeningDays = [...storeOpeningDays];

                updateItem.store_open_days.map((dataDay: any) => {
                    const ind = dataDay.week_day_number - 1
                    newStoreOpeningDays[ind].id = dataDay.id
                    newStoreOpeningDays[ind].weekDayNumber = dataDay.week_day_number
                    newStoreOpeningDays[ind].open = true
                    newStoreOpeningDays[ind].startTime = dayjs(dataDay.day_start_time)
                    newStoreOpeningDays[ind].endTime = dayjs(dataDay.day_end_time)
                })
            }

            if (updateItem.store_reservation_days) {
                const newStoreReservationDays = storeReservationDays
                updateItem.store_reservation_days.map((dataDay: any) => {
                    const ind = dataDay.week_day_number - 1
                    newStoreReservationDays[ind].id = dataDay.id
                    newStoreReservationDays[ind].weekDayNumber = dataDay.week_day_number
                    newStoreReservationDays[ind].open = true
                    newStoreReservationDays[ind].startTime = dayjs(dataDay.day_start_time)
                    newStoreReservationDays[ind].endTime = dayjs(dataDay.day_end_time)
                })
            }
        }
    }, [updateItem, storeOpeningDays, storeReservationDays])

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {updateItem ? "Modificar Tienda" : "Crear Tienda"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const initialValues = {
        name: updateItem ? updateItem.name : "",
        description: updateItem ? updateItem.description : "",
        slogan: updateItem ? updateItem.slogan : "",
        address: updateItem ? updateItem.address : "",
        sellerUser: userSeller,
        valueSellProfit: sellProfit
            ? (updateItem?.fixed_seller_profit_percentage ?? 0)
            : (updateItem?.fixed_seller_profit_quantity ?? 0),
        openingDays: storeOpeningDays,  //store_open_days table
        reservationDays: storeReservationDays, //store_reservation_days table
    }

    const validationSchema = Yup.object<any>({
        name: Yup.string().required("Este campo es requerido"),
        description: Yup.string(),
        slogan: Yup.string(),
        address: Yup.string(),
        sellerUser: Yup.object(),
        valueSellProfit: sellProfit
            ? (
                Yup.number()
                    .min(0, "El minimo q puedes ingresar es 0")
                    .max(100, "El maximo q puedes ingresar es 100")
                    .required("Este campo es obligatorio")

            )
            : (
                Yup.number()
                    .min(0, "El minimo q puedes ingresar es 0")
                    .required("Este campo es obligatorio")
            ),
        openingDays: Yup.array(),  //ToDo: make validation to selected days and times
        reservationDays: Yup.array(),  //ToDo: make validation to selected days and times
        //currency: Yup.object()
    })

    const handleSubmit = async (values: any) => {
        const data = {
            ownerId: ownerId,
            storeId: +storeId! ?? 1,
            name: values.name,
            description: values.description,
            slogan: values.slogan,
            address: values.address,
            sellerUserId: values.sellerUser?.id ?? null,
            fixed_seller_profit_percentage: (sellProfit) ? parseFloat(values.valueSellProfit) : null,
            fixed_seller_profit_quantity: (!sellProfit) ? parseFloat(values.valueSellProfit) : null,
            online_catalog: activeCollection,
            online_reservation: activeReservations
        }
        let response: any

        if (updateItem) {
            response = await stores.update(ownerId!, data);
        } else {
            response = await stores.create(ownerId!, data);
        }

        let openDaysResponse: any;
        for (const item of values.openingDays) {
            if (item.id !== null) {
                item.open
                    ? openDaysResponse = await openDaysStores.update(urlApiStoreOpenDays, item)
                    : openDaysResponse = await openDaysStores.delete(urlApiStoreOpenDays, item.id)
            } else
                if (item.open) {
                    let newItem = item;
                    openDaysResponse = await openDaysStores.create(urlApiStoreOpenDays, newItem, response.data.id)
                }
        }

        let daysReservationsResponse: any;
        for (const item of values.reservationDays) {
            if (item.id !== null) {
                item.open
                    ? daysReservationsResponse = await openDaysStores.update(urlApiStoreOpenReservations, item)
                    : daysReservationsResponse = await openDaysStores.delete(urlApiStoreOpenReservations, item.id)
            } else
                if (item.open) {
                    let newItem = item;
                    daysReservationsResponse = await openDaysStores.create(urlApiStoreOpenReservations, newItem, response.data.id)
                }
        }

        if (response.status === 200) {
            router.push(`/inventory/owner/store`)
        } else {
            //ToDo: catch validation errors
            notifyError(`Ha ocurrido un error en la ${updateItem ? "modificación" : "creación"} de los datos de la tienda`)
        }
    }

    const formik: any = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    })

    const editPercentage = (formik: any) => (
        <Grid item container columnSpacing={1}>
            <Grid item>
                <TextField
                    name={"sell_profit_percentage"}
                    label="Ganancia del vendedor"
                    size={"small"}
                    {...formik.getFieldProps("valueSellProfit")}
                    error={formik.errors.valueSellProfit && formik.touched.valueSellProfit}
                    helperText={(formik.errors.valueSellProfit && formik.touched.valueSellProfit) && formik.errors.valueSellProfit}
                />
            </Grid>

            <Grid item alignSelf={"center"}>
                <Typography variant="h6" >%</Typography>
            </Grid>

        </Grid>

    )

    const editQuantity = (formik: any) => (
        <Grid item container columnSpacing={1}>
            <Grid item>
                <TextField
                    name={"sell_profit_quantity"}
                    label="Ganancia del vendedor"
                    size={"small"}
                    {...formik.getFieldProps("valueSellProfit")}
                    error={formik.errors.valueSellProfit && formik.touched.valueSellProfit}
                    helperText={(formik.errors.valueSellProfit && formik.touched.valueSellProfit) && formik.errors.valueSellProfit}
                />
            </Grid>

            <Grid item alignSelf={"center"}>
                <Typography variant="h6" >CUP</Typography>
            </Grid>
        </Grid>
    )

    return (
        <Card variant={"outlined"}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container rowSpacing={2}>

                    <Grid item xs={12}>
                        <CustomToolbar />
                    </Grid>

                    <Grid container item rowSpacing={4} sx={{ padding: "25px" }}>
                        <Grid item xs={12}>
                            <TextField
                                name={"Nombre"}
                                label="Nombre"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("name")}
                                error={formik.errors.name && formik.touched.name}
                                helperText={(formik.errors.name && formik.touched.name) && formik.errors.name}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Description"}
                                label="Descripción"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("description")}
                                error={formik.errors.description && formik.touched.description}
                                helperText={(formik.errors.description && formik.touched.description) && formik.errors.description}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Slogan"}
                                label="Slogan"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("slogan")}
                                error={formik.errors.slogan && formik.touched.slogan}
                                helperText={(formik.errors.slogan && formik.touched.slogan) && formik.errors.slogan}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Address"}
                                label="Dirección"
                                size={"small"}
                                fullWidth
                                {...formik.getFieldProps("address")}
                                error={formik.errors.address && formik.touched.address}
                                helperText={(formik.errors.address && formik.touched.address) && formik.errors.address}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name={"Seller"}
                                label="Vendedor(a)"
                                size={"small"}
                                fullWidth
                                select
                                {...formik.getFieldProps("sellerUser")}
                                error={formik.errors.sellerUser && formik.touched.sellerUser}
                                helperText={(formik.errors.sellerUser && formik.touched.sellerUser) && formik.errors.sellerUser}
                            >
                                <MenuItem value={""}>Ninguno</MenuItem>
                                {
                                    sellerUsers.map((item: any) => (
                                        <MenuItem key={item.id} value={item}>{`${item.name} (${item.username})`}</MenuItem>
                                    ))
                                }
                            </TextField>
                        </Grid>

                        {formik.values.sellerUser &&
                            <Grid item xs={12}>
                                {
                                    sellProfit
                                        ? editPercentage(formik)
                                        : editQuantity(formik)
                                }

                                <Grid item container>
                                    <Grid item>
                                        <Grid item container>
                                            <Grid item >
                                                <Checkbox
                                                    size="small"
                                                    checked={sellProfit}
                                                    onClick={() => setSellProfit(true)}
                                                />
                                            </Grid>
                                            <Grid item alignSelf={"center"}>
                                                <Typography variant="subtitle2">Porcentaje</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item>
                                        <Grid item container>
                                            <Grid item >
                                                <Checkbox
                                                    size="small"
                                                    checked={!sellProfit}
                                                    onClick={() => setSellProfit(false)}
                                                />
                                            </Grid>
                                            <Grid item alignSelf={"center"} >
                                                <Typography variant="subtitle2">Cantidad</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        }

                        <Grid item xs={12}>
                            <StoreOpeningDays
                                title={"Horario de apertura de la tienda"}
                                formik={formik}
                                valuesFieldKey={"openingDays"}
                            />
                        </Grid>

                        {/*<Grid item container xs={12}>
                            <FormControlLabel
                                label={"Mostrar catálogo en línea"}
                                control={
                                    <Switch
                                        checked={activeCollection}
                                        onClick={() => setActiveCollection(!activeCollection)}
                                    />
                                }
                            />
                        </Grid>

                        <Grid item container xs={12}>
                            <FormControlLabel
                                label={"Permitir reservaciones en línea"}
                                control={
                                    <Switch
                                        checked={activeReservations}
                                        onClick={() => setActiveReservations(!activeReservations)}
                                    />
                                }
                            />
                        </Grid>

                        {
                            activeReservations && (
                                <Grid item xs={12}>
                                    <StoreOpeningDays
                                        title={"Horario de reservaciones de la tienda"}
                                        formik={formik}
                                        valuesFieldKey={"reservationDays"}
                                    />
                                </Grid>
                            )
                        }*/}

                        <Grid container item justifyContent={"flex-end"} >
                            <DialogActions>
                                <Button
                                    color="error"
                                    variant={"outlined"}
                                    onClick={() => router.push(`/inventory/owner/store`)}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    type={"submit"}
                                    color={"primary"}
                                    variant={"outlined"}
                                    disabled={!formik.isValid}
                                >
                                    {updateItem ? "Modificar" : "Crear"}
                                </Button>
                            </DialogActions>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </Card>
    )
}

export default StoresForm