'use client'

import {
    AppBar, Box, Card, CardContent, Grid, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Toolbar, Tooltip, Typography
} from '@mui/material';
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { ArrowLeft, ExpandLessOutlined, ExpandMoreOutlined, HelpOutline } from '@mui/icons-material';
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import formatPaymentMethods from '@/utils/getFormattedPaymentMethod';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import calcSellProductsUnits from '@/utils/calcSellProductsUnits';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import calcReturnedQuantity from '@/utils/calcReturnedQuantity';
import SellsMoreDetails from '../components/SellsMoreDetails';
import { storeSellsDetailsProps } from '@/types/interfaces';
import { TableNoData } from '@/components/TableNoData';
import InfoTooltip from '@/components/InfoTooltip';
import React, { useEffect, useState } from 'react';
import { esES } from '@mui/x-date-pickers/locales'
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale("es");

const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

const SellsHistory = () => {
    const params = useParams();
    const router = useRouter();
    const sellerStoreId = +params.sellerStoreId!;

    const [allSells, setAllSells] = useState<storeSellsDetailsProps[] | null>(null);
    const [sellDates, setSellDates] = useState<string[] | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>();

    const handleChange = (value: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {
        if (value === null) { setSelectedDate(undefined); return }
        const date = value as Dayjs;
        const selectedDate = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`
        setSelectedDate(selectedDate);
    };

    //GET sell dates in spanish format, exclude duplicate and then sorts the array
    useEffect(() => {
        const sellDatesFormatted: string[] | undefined = allSells?.
            reduce((accumulator: string[], sell: storeSellsDetailsProps) => {
                const sellDate = new Date(sell.created_at);
                const isoDate = sellDate.toISOString().split('T')[0];

                // Verify current date if already added
                if (!accumulator.some((item) => item === isoDate)) {
                    accumulator.push(isoDate);
                }
                return accumulator;
            }, []);
        setSellDates(sellDatesFormatted!);
    }, [allSells]);

    useEffect(() => {
        const loadData = async () => {
            const storeAllSellsDetails: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId, true);
            setAllSells(storeAllSellsDetails);
        }
        loadData();
    }, [sellerStoreId]);

    const refreshData = async () => {
        const storeAllSellsDetails: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId, true);
        setAllSells(storeAllSellsDetails);
    }

    const handleNavigateBack = () => router.back();

    const [showDetails, setShowDetails] = useState<number>(-1);

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    const hasSell = (date: Dayjs): boolean => {
        const dateToCompare: string = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`;
        if (sellDates) {
            return !sellDates?.includes(dateToCompare);
        }
        return true;
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            color: "white",
                        }}
                    >
                        Historial de ventas
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        return (
            <TableHead>
                <TableRow>
                    <TableCell id='details' />
                    <TableCell align='center' sx={{ whiteSpace: "nowrap" }} id='total_price_payment_method'>Importe total</TableCell>
                    <TableCell align='center' id='sell_products_quantity'>Productos</TableCell>
                    <TableCell align='center' id='units'>Unidades</TableCell>
                    <TableCell align='center' id='sell_units_returned_quantity'>Devoluciones</TableCell>
                    <TableCell align='center' id='created_at'>Registrado</TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        let filteredSells: storeSellsDetailsProps[] | null | undefined = [];
        if (selectedDate) {
            filteredSells = allSells?.filter(
                (sell: storeSellsDetailsProps) => {
                    const splitDate = (date: Date | string) => {
                        if (date instanceof Date) {
                            return new Date(date).toISOString().split('T')[0];
                        } else {
                            const normalizeDate = new Date(date);
                            if (isNaN(normalizeDate.getTime())) {
                                return '';
                            } else {
                                return normalizeDate.toISOString().split('T')[0];
                            }
                        }
                    };
                    if (splitDate(sell.created_at) === splitDate(selectedDate)) return sell
                });
        } else {
            filteredSells = allSells;
        }
        return (
            <TableBody>
                {filteredSells?.map(
                    (sell: storeSellsDetailsProps) => (
                        <React.Fragment key={sell.id}>
                            <TableRow
                                key={sell.id}
                                hover
                                tabIndex={-1}
                            >
                                <TableCell>
                                    <Tooltip title={"Detalles"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={() => setShowDetails((showDetails !== sell.id) ? sell.id : -1)}
                                        >
                                            {
                                                (showDetails !== sell.id)
                                                    ? <ExpandMoreOutlined />
                                                    : <ExpandLessOutlined />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                {sell.sell_payment_methods.length > 0 ?
                                    <TableCell align='center' >{formatPaymentMethods(sell.sell_payment_methods!)}</TableCell>
                                    : <TableCell align='center'>{sell.total_price} <br /> {sell.payment_method}</TableCell>
                                }
                                <TableCell align='center'>{sell.sell_products.length! !== 1 ? sell.sell_products.length! : sell.sell_products[0].store_depots.depots?.products?.name}</TableCell>
                                <TableCell align='center'>{`${calcSellProductsUnits(sell)}`}</TableCell>
                                <TableCell align='center'>{`${calcReturnedQuantity(sell)}`}</TableCell>
                                <TableCell align='center'>{dayjs(sell.created_at).format('MMM D, YYYY')} <br /> {dayjs(sell.created_at).format('h:mm A')}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                    {showDetails === sell.id && (
                                        <SellsMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_products={sell.sell_products}
                                            sell={sell}
                                            history
                                            refreshData={refreshData}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <CustomToolbar />
            <CardContent>
                <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                    <Grid item container alignItems="center" justifyContent="center" sx={{ marginTop: "-10px" }}>
                        <Grid container item xs={"auto"} alignItems={"center"} >
                            <Typography variant="subtitle1" sx={{ fontWeight: "400" }}>Búsqueda avanzada</Typography>
                        </Grid>
                        <Grid container item xs={"auto"} alignItems={"center"}>
                            <InfoTooltip
                                isOpenTooltip={isOpenTooltip}
                                handleTooltipClose={handleTooltipClose}
                                message={"Puede buscar por fecha de venta"}
                            >
                                <IconButton onClick={handleTooltipOpen}>
                                    <HelpOutline />
                                </IconButton>
                            </InfoTooltip>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} mx={"40px"}>
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                            adapterLocale='es'>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    disabled={sellDates?.length! > 0 ? false : true}
                                    slotProps={{ field: { clearable: true }, toolbar: { hidden: true } }}
                                    label="Seleccione una fecha" disableFuture shouldDisableDate={hasSell} onChange={handleChange} />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Grid>
                </Card>
                <Card variant={"outlined"} sx={{ paddingTop: "20px", mx: "-5px" }}>
                    <Grid container rowSpacing={2}>
                        {
                            allSells?.length! > 0 && selectedDate ?
                                (allSells?.filter(
                                    (sell: storeSellsDetailsProps) => {
                                        const splitDate = (date: Date | string) => {
                                            if (date instanceof Date) {
                                                return new Date(date).toISOString().split('T')[0];
                                            } else {
                                                const normalizeDate = new Date(date);
                                                if (isNaN(normalizeDate.getTime())) {
                                                    return '';
                                                } else {
                                                    return normalizeDate.toISOString().split('T')[0];
                                                }
                                            }
                                        };
                                        if (splitDate(sell.created_at) === splitDate(selectedDate!)) return sell
                                    }).length! > 0) ?
                                    (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer>) :
                                    <TableNoData searchCoincidence />
                                : allSells?.length! > 0 ?
                                    (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer>)
                                    :
                                    <TableNoData hasData={allSells?.length!} />
                        }
                    </Grid>
                </Card>
            </CardContent>
        </Card >
    )
}

export default SellsHistory