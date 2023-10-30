"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, ShareOutlined, SwapHoriz } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { Formik } from "formik";
import stores from "@/app/profile/[id]/store/requests/stores"
import StoreMoreDetails from "./StoreMoreDetails";
import StoreModalPrice from "./Modal/StoreModalPrice"
import StoreEditPrice from "./Modal/StoreEditPrice";
import { storeDetails } from "../request/storeDetails";
import StoreModalDefault from "./Modal/StoreModalDefault";
import TransferUnits from "./Modal/TransferUnits";
//import StoreAddUnits from "./Modal/StoreAddUnits";

const fetcher = (url: any) => fetch(url).then((res) => res.json())


export default function StoreMainTable() {
    const params = useParams()
    const router = useRouter()

    // Guardan datos de bd
    const [data, setData] = React.useState<any>(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])
    const [dataStore, setDataStore] = React.useState<any>('')

    // Se usan habilitar modales o detalles
    const [showDetails, setShowDetails] = React.useState<any>('')
    const [activeModalPrice, setActiveModalPrice] = React.useState({ active: false, storeDepot: [] })
    const [activeModalTransferUnits, setActiveModalTransferUnits] = React.useState(false);

    // Almacena los datos de la row q hacen falta para los modal
    // modal q la usan:  TransferUnits
    const [selectedRowData, setSelectedRowData] = React.useState<any>(null);

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/store-details/${params.storeDetailsId}/api`).then((data) =>
            setAllProductsByDepartment(data.map((item: any) => ({
                ...item,
                selected: false
            }))))
    }, [params.id, params.storeDetailsId])

    React.useEffect(() => {
        if (allProductsByDepartment.length) {
            let allProducts: any = []

            allProductsByDepartment.forEach((departmentItem: any) => {
                if (departmentItem.selected) {
                    allProducts = [...allProducts, ...departmentItem.products]
                }
            })

            allProducts.sort((a: any, b: any) => {
                if (a.name < b.name)
                    return -1

                if (a.name > a.name)
                    return 1

                return 0
            })

            setData(allProducts)
        }

    }, [allProductsByDepartment])

    //Get Store name
    React.useEffect(() => {
        const getDataStore = async () => {
            const newdataStore = await stores.storeDetails(params.id, params.storeDetailsId);
            setDataStore(newdataStore);
        }
        if (dataStore === '') {
            getDataStore()
        }

    }, [dataStore, setDataStore])

    function handleNavigateBack() {
        router.back()
    }
    // active - noActive
    const updateProductActive = async (product: any) => {
        const data = {
            id: product.id,
            store_id: product.store_id,
            depot_id: product.depot_id,
            product_units: product.product_units,
            product_remaining_units: product.product_remaining_units,
            seller_profit_percentage: product.seller_profit_percentage,
            is_active: !product.is_active,
            offer_notes: product.offer_notes,
            sell_price: product.sell_price,
            sell_price_unit: product.sell_price_unit,
            seller_profit_quantity: product.seller_profit_quantity,
            price_discount_percentage: product.price_discount_percentage,
            price_discount_quantity: product.price_discount_quantity,
        }
        const response = await storeDetails.update(params.id, product.id, data)
        if (response === 200) {
            loadDates();
        }
    }


    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {dataStore.name}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"} />
                            : (
                                <>

                                    <IconButton color={"inherit"} onClick={() => router.push(`/profile/${params.id}/store-assign?storeId=${dataStore.id}`)} >
                                        <ShareOutlined fontSize={"small"} />
                                    </IconButton>

                                </>
                            )
                    }
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "departaments",
                label: "Departamento",
                align: "left"
            },
            {
                id: "buy_Price",
                label: "Precio",
                align: "left"
            },
            {
                id: "units",
                label: "Unidades",
                align: "left"
            },
            {
                id: "Active",
                label: "Disponible",
                align: "left"
            },
            {
                id: "details",
                label: "",
                align: "left"
            },


        ]

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"left"}
                            padding={'normal'}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const showPrice = (priceProductStore: any, discountQuantity: any, discountPorcentage: any, currency: any) => {
        let pricePorcentage = (discountPorcentage !== null) ? (discountPorcentage * priceProductStore / 100).toFixed(2) : null;

        let price = discountQuantity ?? pricePorcentage ?? priceProductStore;

        return <>
            <Typography display={"inline"} >
                {`${price} `}
                <small>{` ${currency}  `}</small>
                <small>
                    {pricePorcentage || discountQuantity
                        ? <s>{`  ${priceProductStore} ${currency}  `}</s>
                        : ""
                    }

                </small>

            </Typography>

        </>
    }

    const loadDates = async () => {
        let newAllProductsbyDepartment = await storeDetails.getAllProductsByDepartament(params.id, params.storeDetailsId);

        let selectedDepartment = allProductsByDepartment.filter((element: any) => (element.selected)).map((element: any) => element.id)

        newAllProductsbyDepartment = newAllProductsbyDepartment.map((element: any) => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductsByDepartment(newAllProductsbyDepartment);
    }

    const TableContent = ({ formik }: { formik: any }) => {
        return (
            <TableBody>
                {data.filter(
                    (item: any) =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (row: any, index: number) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                    >
                                        <TableCell>

                                            <div>
                                                <Grid item container >
                                                    <Grid>
                                                        {row.name}
                                                    </Grid>

                                                </Grid>
                                                {
                                                    row.description && (
                                                        <small>
                                                            {` ${row.description.slice(0, 20)}`}
                                                        </small>
                                                    )
                                                }
                                            </div>

                                        </TableCell>
                                        <TableCell>
                                            {row.departments?.name}
                                        </TableCell>
                                        <TableCell>

                                            {
                                                showPrice(
                                                    row.depots[0].store_depots[0].sell_price,
                                                    row.depots[0].store_depots[0].price_discount_quantity,
                                                    row.depots[0].store_depots[0].price_discount_percentage,
                                                    row.depots[0].store_depots[0].sell_price_unit
                                                )

                                            }

                                            <IconButton size="small" color="primary"
                                                onClick={() => setActiveModalPrice({ active: true, storeDepot: { ...row.depots[0].store_depots[0] } })}>
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </TableCell>

                                        <TableCell>
                                            <Grid container columnSpacing={1}>

                                                <Grid item>
                                                    {`${row.depots[0].store_depots[0].product_remaining_units} de ${row.depots[0].store_depots[0].product_units} `}
                                                </Grid>

                                                <Grid item>
                                                    <IconButton sx={{ padding: 0 }} size="small" color="primary"
                                                        onClick={() => {
                                                            setActiveModalTransferUnits(true);
                                                            setSelectedRowData(row.depots[0])
                                                        }}>
                                                        <SwapHoriz fontSize="small" />
                                                    </IconButton>
                                                </Grid>

                                                <Grid item>
                                                    <IconButton sx={{ padding: 0 }} size="small" color="primary"
                                                        onClick={() => setActiveModalPrice({ active: true, storeDepot: row.depots[0].store_depots[0] })}>
                                                        <EditOutlined fontSize="small" />
                                                    </IconButton>
                                                </Grid>

                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            <Switch
                                                size='small'
                                                checked={row.depots[0].store_depots[0].is_active}
                                                color={'success'}
                                                onChange={() => updateProductActive(row.depots[0].store_depots[0])}
                                            />
                                        </TableCell>

                                        <TableCell style={{ padding: 0 }} colSpan={5}>
                                            <Tooltip title={"Details"}>
                                                <IconButton
                                                    size={"small"}
                                                    sx={{ m: "3px" }}
                                                    onClick={(e) => setShowDetails((showDetails !== row.id) ? row.id : '')}
                                                >
                                                    {


                                                        (showDetails !== row.id)
                                                            ? <ExpandMoreOutlined />
                                                            : <ExpandLessOutlined />
                                                    }
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>


                                    </TableRow>

                                    <TableRow >

                                        <TableCell style={{ padding: 0 }} colSpan={5}>

                                            {showDetails === row.id && (
                                                <StoreMoreDetails
                                                    userId={params.id}
                                                    details={row.depots[0].store_depots[0]}
                                                    show={(showDetails === row.id)}
                                                    loadDates={loadDates}
                                                    row={row}
                                                />
                                            )
                                            }
                                        </TableCell>

                                    </TableRow>
                                </React.Fragment>
                            ))}
            </TableBody>
        )
    }

    async function handleSelectFilter(index: number) {
        let filters: any = [...allProductsByDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductsByDepartment(filters)
    }

    const DepartmentsFilter = ({ formik }: { formik: any }) => {
        return (
            <Card variant={"outlined"} sx={{ padding: "15px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2}>
                        {
                            allProductsByDepartment.map((item: any, index: number) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <Button variant={item.selected ? "contained" : "outlined"} onClick={() => handleSelectFilter(index)}>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                {item.name}
                                            </Grid>
                                            <Grid container item xs={12} justifyContent={"center"}>
                                                <Typography variant={"caption"}>
                                                    {item.products.length} productos
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Button>
                                </Grid>
                            ))
                        }
                    </Grid>

                    {
                        data?.length > 0 && (
                            <Grid container item rowSpacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant={"subtitle2"}>
                                        Puede buscar productos por nombre o descripción en los departamentos seleccionados aquí
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name={"handleChangeSearchBarValue"}
                                        placeholder="Buscar producto..."
                                        size={"small"}
                                        fullWidth
                                        {...formik.getFieldProps("searchBarValue")}
                                    />
                                </Grid>
                            </Grid>
                        )
                    }
                </Grid>

            </Card>
        )
    }

    const initialValues = {
        searchBarValue: ""
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={() => {

            }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <CustomToolbar />

                        <>

                            <StoreModalPrice
                                dialogTitle={"Editar Precio"}
                                open={activeModalPrice.active}
                                setOpen={setActiveModalPrice}
                            >
                                <StoreEditPrice userId={params.id} storeDepot={activeModalPrice.storeDepot} setActiveModalPrice={setActiveModalPrice} loadDates={loadDates} />
                            </StoreModalPrice>

                            <StoreModalDefault
                                dialogTitle={"Transferir unidades"}
                                open={activeModalTransferUnits}
                                setOpen={setActiveModalTransferUnits}
                            >
                                <TransferUnits 
                                nameStore={ dataStore.name } 
                                storeDepot={ selectedRowData?.store_depots[0] }  
                                productId={ selectedRowData?.product_id }
                                setActiveTransferUnits ={ setActiveModalTransferUnits }  
                                loadDates = {loadDates}
                                />
                            </StoreModalDefault>
                        </>

                        <CardContent>
                            {
                                allProductsByDepartment.length > 0 && (
                                    <DepartmentsFilter formik={formik} />
                                )
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />

                                            <TableContent formik={formik} />


                                        </Table>
                                    ) : (
                                        <TableNoData />
                                    )
                            }
                        </CardContent>
                    </Card>

                )
            }
        </Formik>
    )

}