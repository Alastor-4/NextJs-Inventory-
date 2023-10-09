"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, CircularProgress,
    Collapse,
    Divider, Fade, Grid,
    IconButton,
    Modal,
    Switch,
    Tab,
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
import { AddOutlined, ArrowLeft, EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, ShareOutlined } from "@mui/icons-material";
import Link from "next/link";
import { useParams , useRouter } from "next/navigation";
import { Formik } from "formik";
import stores from "@/app/profile/[id]/store/requests/stores"
import StoreMoreDetails from "./StoreMoreDetails";
import StoreModalPrice from "./Modal/StoreModalPrice"
import StoreEditPrice from "./Modal/StoreEditPrice";
import { storeDetails } from "../request/storeDetails";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreMainTable() {
    const params = useParams()
    const router = useRouter()

    const [data, setData] = React.useState(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])
    const [storeName, setStoreName] = React.useState('')

    const [showDetails, setShowDetails] = React.useState('')
    const [activeModalPrice, setActiveModalPrice] = React.useState({ active: false, storeDepot: [] })
    //const [productActive, setProductActive] = React.useState(null)


    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/store-details/${params.storeDetailsId}/api`).then((data) =>
            setAllProductsByDepartment(data.map(item => ({
                ...item,
                selected: false
            }))))
    }, [params.id, params.storeDetailsId])

    React.useEffect(() => {
        if (allProductsByDepartment.length) {
            let allProducts = []

            allProductsByDepartment.forEach((departmentItem) => {
                if (departmentItem.selected) {
                    allProducts = [...allProducts, ...departmentItem.products]
                }
            })

            allProducts.sort((a, b) => {
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
        const dataStore = async () => {
            const newStoreName = await stores.storeDetails(params.id, params.storeDetailsId);
            setStoreName(newStoreName.name);
        }
        if (storeName === '') {
            dataStore()
        }

    }, [storeName, setStoreName])

    function handleNavigateBack() {
        router.back()
    }
    // active - noActive
    const updateProductActive = async (product) => {
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
                        {storeName}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"} />
                            : (
                                <>
                                     
                                     
                                    <IconButton color={"inherit"} >
                                      <ShareOutlined fontSize={"small"}/>
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

    const showPrice = (priceProductStore, discountQuantity, discountPorcentage, currency) => {
        let pricePorcentage = (discountPorcentage !== null) ? discountPorcentage * priceProductStore / 100 : null;

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

        let selectedDepartment = allProductsByDepartment.filter(element => (element.selected)).map(element => element.id)

        newAllProductsbyDepartment = newAllProductsbyDepartment.map(element => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductsByDepartment(newAllProductsbyDepartment);
    }

    const TableContent = ({ formik }) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (row, index) => (
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
                                                onClick={() => setActiveModalPrice({ active: true, storeDepot: row.depots[0].store_depots[0] })}>
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            {`${row.depots[0].store_depots[0].product_remaining_units} de ${row.depots[0].store_depots[0].product_units} `}
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
                                                    onClick={(e) => setShowDetails((showDetails !== index) ? index : '')}
                                                >
                                                    {


                                                        (showDetails !== index)
                                                            ? <ExpandMoreOutlined />
                                                            : <ExpandLessOutlined />
                                                    }
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>


                                    </TableRow>

                                    <TableRow >

                                        <TableCell style={{ padding: 0 }} colSpan={5}>

                                            {showDetails === index && (
                                                <StoreMoreDetails
                                                    userId={params.id}
                                                    details={row.depots[0].store_depots[0]}
                                                    show={(showDetails === index)}
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
        let filters = [...allProductsByDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductsByDepartment(filters)
    }

    const DepartmentsFilter = ({ formik }) => {
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
                            allProductsByDepartment.map((item, index) => (
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