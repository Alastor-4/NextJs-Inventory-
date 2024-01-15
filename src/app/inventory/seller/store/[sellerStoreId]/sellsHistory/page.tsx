'use client'

import {
    AppBar, Box, Card, CardContent, FormControl, Grid, IconButton,
    InputLabel, MenuItem, Select, SelectChangeEvent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Toolbar, Tooltip, Typography
} from '@mui/material';
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { storeSellsDetailsProps } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExpandLessOutlined, ExpandMoreOutlined, HelpOutline } from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import SellsMoreDetails from '../components/SellsMoreDetails';
import InfoTooltip from '@/components/InfoTooltip';
import { TableNoData } from '@/components/TableNoData';

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const SellsHistory = () => {
    const params = useParams();
    const router = useRouter();
    const sellerStoreId = +params.sellerStoreId!;

    const [allSells, setAllSells] = useState<storeSellsDetailsProps[] | null>(null);

    const [sellDates, setSellDates] = useState<{ dateSpanish: string, date: string }[] | undefined | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>('Todas las fechas');

    const handleChange = (event: SelectChangeEvent<string>) => {
        if (event.target.value !== 'Todas las fechas') {
            const date = event.target.value;
            const rawDate = new Date(date).toISOString().split('T')[0];
            setSelectedDate(rawDate);
        } else {
            setSelectedDate('Todas las fechas');
        }
    };

    //GET sell dates in spanish format, exclude duplicate and then sorts the array
    useEffect(() => {
        const sellDatesSpanish: { dateSpanish: string, date: string }[] | undefined = allSells?.
            reduce((accumulator: { dateSpanish: string, date: string }[], sell: storeSellsDetailsProps) => {
                const sellDate = new Date(sell.created_at);
                const formattedDate = `${dias[sellDate.getDay()]} ${meses[sellDate.getMonth()]} ${sellDate.getDate()} ${sellDate.getFullYear()}`;
                const isoDate = sellDate.toISOString().split('T')[0];

                // Verify current date if already added
                if (!accumulator.some((item) => item.dateSpanish === formattedDate)) {
                    accumulator.push({ dateSpanish: formattedDate, date: isoDate });
                }

                return accumulator;
            }, []);

        sellDatesSpanish?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setSellDates(sellDatesSpanish);
    }, [allSells]);

    useEffect(() => {
        const loadData = async () => {
            const storeAllSellsDetails: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId, true);
            setAllSells(storeAllSellsDetails);
        }
        loadData();
    }, [sellerStoreId]);

    const handleNavigateBack = () => router.back();

    const [showDetails, setShowDetails] = useState<number>(-1);

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

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
        const headCells = [
            { id: "details", label: "", },
            { id: "total_price", label: "Precio total", },
            { id: "payment_method", label: "Método de pago", },
            { id: "sell_products_quantity", label: "Productos vendidos", },
        ];

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"left"}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        let filteredSells: storeSellsDetailsProps[] | null | undefined = [];
        if (selectedDate !== "Todas las fechas") {
            filteredSells = allSells?.filter(
                (sell: storeSellsDetailsProps) => {
                    const rawDate = new Date(sell.created_at).toISOString().split('T')[0];
                    if (rawDate === selectedDate) return sell
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
                                <TableCell>{sell.total_price}</TableCell>
                                <TableCell>{sell.payment_method}</TableCell>
                                <TableCell>{sell.sell_products.length!}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ padding: 0 }} colSpan={6}>
                                    {showDetails === sell.id && (
                                        <SellsMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_products={sell.sell_products}
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
                    <FormControl>
                        <InputLabel id="fecha-select-label">Seleccionar Fecha</InputLabel>
                        <Select
                            labelId="fecha-select-label"
                            id="fecha-select"
                            value={selectedDate === '' ? "Todas las fechas" : selectedDate}
                            label="Seleccionar Fecha"
                            onChange={handleChange}
                        >
                            <MenuItem key={-1} value={'Todas las fechas'}>
                                {`Todas las fechas`}
                            </MenuItem>
                            {sellDates?.map((date, index) => (
                                <MenuItem key={index} value={date.date}>
                                    {date.dateSpanish}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* <Grid item container xs={12} md={12} justifyContent={"center"} alignItems="center">
                                <Grid item container xs={8} border={"1px solid gray"} borderRadius={"5px"} margin="4px" position="relative" >
                                    <Grid item position="absolute" height="100%" paddingLeft="4px" display="flex" alignItems="center" justifyContent="center" >
                                        <SearchIcon color="action" />
                                    </Grid>
                                    <Grid item width="100%" paddingLeft="35px" >
                                        <InputBase
                                            placeholder="Buscar departamento..."
                                            inputProps={{ 'aria-label': 'search' }}
                                            {...formik.getFieldProps("searchBarValue")}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid> */}
                </Card>
                <Card variant={"outlined"} sx={{ paddingTop: "20px" }}>
                    <Grid container rowSpacing={2}>
                        {
                            allSells?.length! > 0 ?
                                (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                    <Table sx={{ width: "100%" }} size={"small"}>
                                        <TableHeader />
                                        <TableContent />
                                    </Table>
                                </TableContainer>) :
                                <TableNoData hasData={allSells?.length!} />
                        }
                    </Grid>
                </Card>
            </CardContent>
        </Card >
        // <Dialog open={isOpen} fullWidth onClose={handleCloseModal}>
        //     <DialogTitle
        //         display={"flex"}
        //         justifyContent={"space-between"}
        //         alignItems={"center"}
        //         color={"white"}
        //         fontWeight={"400"}
        //         sx={{ bgcolor: '#1976d3' }}
        //     >
        //         {dialogTitle}
        //         <IconButton
        //             edge="start"
        //             color="inherit"
        //             onClick={handleCloseModal}
        //             aria-label="close"
        //         >
        //             <Close />
        //         </IconButton>
        //     </DialogTitle>
        //     <DialogContent dividers >
        //         <Grid item container>
        //             <Grid item xs={12} display={"flex"} alignItems={"center"}>
        //                 <Typography variant='h6'>
        //                     Ventas efectuadas: {todaySellsData.length!}
        //                 </Typography>
        //             </Grid>
        //             <Card variant={"outlined"} sx={{ paddingTop: "20px", marginTop: "10px" }}>
        //                 <Grid container rowSpacing={2}>
        //                     {
        //                         todaySellsData?.length! > 0
        //                             ? <TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
        //                                 <Table sx={{ width: "100%" }} size={"small"}>
        //                                     <TableHeader />
        //                                     <TableContent />
        //                                 </Table>
        //                             </TableContainer> : (
        //                                 <TableNoData hasData={todaySellsData?.length!} />
        //                             )
        //                     }
        //                 </Grid>
        //             </Card>
        //         </Grid>
        //     </DialogContent>
        //     <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
        //         <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
        //     </DialogActions>
        // </Dialog>
    )
    // return (
    //     <>
    //         {allSells?.map((sell) =>
    //             <Grid key={sell.id}>
    //                 <Grid>
    //                     {sell.sell_products[0].store_depots.depots?.products?.name}
    //                 </Grid>
    //                 <Grid>
    //                     Dia: {sell.created_at.toString()}
    //                 </Grid>
    //             </Grid>
    //         )}
    //     </>
    // )
}

export default SellsHistory