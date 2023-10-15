"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, CircularProgress, Collapse,
    Divider, Grid,
    IconButton, Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, TextField,
    Toolbar,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {
    AddOutlined,
    ArrowLeft, ChevronRightOutlined,
    DeleteOutline,
    EditOutlined, SellOutlined,
    ShareOutlined,
    VisibilityOutlined
} from "@mui/icons-material";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import products from "@/app/profile/[id]/product/requests/products";
import * as Yup from "yup";
import {Formik, useFormik} from "formik";
import dayjs from "dayjs";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {InfoTag, MoneyInfoTag} from "@/components/InfoTags";
import {numberFormat} from "@/utils/generalFunctions";
import sellerStoreProduct from "@/app/profile/[id]/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreActionsMain({userId, storeId}) {
    const router = useRouter()

    const [data, setData] = React.useState(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${userId}/seller/store/${storeId}/product/api`).then((data) => setAllProductsByDepartment(data.map(item => ({
            ...item,
            selected: false
        }))))
    }, [userId, storeId])

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

    function handleNavigateBack() {
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"}/>
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
                        Productos en tienda
                    </Typography>
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
                id: "department",
                label: "Departamento",
                align: "left"
            },
            {
                id: "characteristics",
                label: "Características",
                align: "left"
            },
            {
                id: "units",
                label: "Disponibles",
                align: "left"
            },
            {
                id: "price",
                label: "Precio",
                align: "left"
            },
            {
                id: "status",
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

    //expand description
    const [expandIndex, setExpandIndex] = React.useState(null)
    function handleExpandRow(index) {
        if (expandIndex === index) {
            setExpandIndex(null)
        } else {
            setExpandIndex(index)
        }
    }

    const [openImageDialog, setOpenImagesDialog] = React.useState(false)
    const [dialogImages, setDialogImages] = React.useState([])

    function handleOpenImagesDialog(images) {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    async function handleToggleIsActive(e, storeDepotId) {
        e.stopPropagation()

        const updatedDepot = await sellerStoreProduct.toggleIsActive(userId, storeId, storeDepotId)

        const newDepartments = [...allProductsByDepartment]
        for (const allProductsByDepartmentElement of allProductsByDepartment) {
            const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

            const productIndex = allProductsByDepartmentElement.products.findIndex(item => item.depots[0].store_depots[0].id === storeDepotId)
            if (productIndex > -1) {
                newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].is_active = updatedDepot.is_active
            }
        }

        setAllProductsByDepartment(newDepartments)
    }

    const TableContent = ({formik}) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item.description.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                    (row) => {
                        const baseProductPrice = row.depots[0].store_depots[0].sell_price === "0"
                            ? null
                            : numberFormat(row.depots[0].store_depots[0].sell_price)

                        const priceDiscountQuantity = baseProductPrice
                            ? row.depots[0].store_depots[0].price_discount_percentage
                                ? row.depots[0].store_depots[0].price_discount_percentage *  baseProductPrice / 100
                                : row.depots[0].store_depots[0].price_discount_quantity
                            : null

                        const finalProductPrice = priceDiscountQuantity
                            ? ( baseProductPrice - priceDiscountQuantity )
                            : baseProductPrice

                        const sellerProfitQuantity = finalProductPrice
                            ? row.depots[0].store_depots[0].seller_profit_percentage
                                ? row.depots[0].store_depots[0].seller_profit_percentage * finalProductPrice / 100
                                : row.depots[0].store_depots[0].seller_profit_quantity
                            : null

                        const displayProductPrice = finalProductPrice
                            ? `${numberFormat(finalProductPrice) + " " + row.depots[0].store_depots[0].sell_price_unit}`
                            : "sin precio"

                        const displayPriceDiscount = baseProductPrice
                            ? row.depots[0].store_depots[0].price_discount_percentage
                                ? numberFormat(row.depots[0].store_depots[0].price_discount_percentage) + " %"
                                : row.depots[0].store_depots[0].price_discount_quantity
                                    ? numberFormat(row.depots[0].store_depots[0].price_discount_quantity) + " " + row.depots[0].store_depots[0].sell_price_unit
                                    : null
                            : null

                        return (
                            <React.Fragment key={row.id}>
                                <TableRow
                                    hover
                                    tabIndex={-1}
                                    selected={row.id === expandIndex}
                                    onClick={() => handleExpandRow(row.id)}
                                >
                                    <TableCell>
                                        {row.name} <br/>
                                        {
                                            row.description && (
                                                <small>
                                                    {` ${row.description.slice(0, 20)}`}
                                                </small>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {row?.departments?.name ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {row.characteristics.length > 0
                                            ? row.characteristics.map(item => (
                                                    <Grid
                                                        key={item.id}
                                                        sx={{
                                                            display: "inline-flex",
                                                            margin: "3px",
                                                            backgroundColor: "rgba(170, 170, 170, 0.8)",
                                                            padding: "2px 4px",
                                                            borderRadius: "5px 2px 2px 2px",
                                                            border: "1px solid rgba(130, 130, 130)",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        <Grid container item alignItems={"center"} sx={{marginRight: "3px"}}>
                                                            <Typography variant={"caption"}
                                                                        sx={{color: "white", fontWeight: "600"}}>
                                                                {item.name.toUpperCase()}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid container item alignItems={"center"}
                                                              sx={{color: "rgba(16,27,44,0.8)"}}>
                                                            {item.value}
                                                        </Grid>
                                                    </Grid>
                                                )
                                            ) : "-"
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {row.depots[0].store_depots[0].product_remaining_units}
                                    </TableCell>
                                    <TableCell>
                                        <MoneyInfoTag value={displayProductPrice} errorColor={!baseProductPrice}/> <br/>
                                        {
                                            displayPriceDiscount && <InfoTag value={`- ${displayPriceDiscount}`}/>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Grid container columnSpacing={1}>
                                            <Grid container item xs={8}>
                                                <Grid item xs={12}>
                                                    {row.depots[0].store_depots[0].is_active ? "activo" : "inactivo"}
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Switch
                                                        size={"small"}
                                                        color={"success"}
                                                        checked={row.depots[0].store_depots[0].is_active}
                                                        onClick={(e) => handleToggleIsActive(e, row.depots[0].store_depots[0].id)}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Grid container item xs={4}>
                                                <IconButton color={"primary"}>
                                                    <SellOutlined fontSize={"small"}/>
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell style={{padding: 0}} colSpan={6}>
                                        <Collapse in={expandIndex === row.id} timeout="auto" unmountOnExit>
                                            <Grid container spacing={1} sx={{padding: "8px 26px"}}>
                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Acciones:</Grid>
                                                    <Grid item xs={"auto"}>
                                                        <Button size={"small"} color={"primary"} variant={"outlined"}>Vender</Button>
                                                    </Grid>
                                                    <Grid item xs={"auto"}>
                                                        <Button size={"small"} variant={"outlined"}>Transferir</Button>
                                                    </Grid>
                                                    <Grid item xs={"auto"}>
                                                        <Button size={"small"} variant={"outlined"}>Reservaciones</Button>
                                                    </Grid>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" gutterBottom component="div">
                                                        Detalles:
                                                    </Typography>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Producto:</Grid>
                                                    <Grid item xs={true}>
                                                        {row.name}
                                                        {
                                                            row.description && (
                                                                <small>
                                                                    {` ${row.description}`}
                                                                </small>
                                                            )
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Departamento:</Grid>
                                                    <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Disponibles:</Grid>
                                                    <Grid item xs={true}>
                                                        {row.depots[0].store_depots[0].product_remaining_units}
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"}
                                                          sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>Características:</Grid>
                                                    <Grid item xs={true} sx={{display: "flex", alignItems: "center"}}>
                                                        {row.characteristics.length > 0
                                                            ? row.characteristics.map(item => (
                                                                    <Grid
                                                                        key={item.id}
                                                                        sx={{
                                                                            display: "inline-flex",
                                                                            margin: "3px",
                                                                            backgroundColor: "rgba(170, 170, 170, 0.8)",
                                                                            padding: "2px 4px",
                                                                            borderRadius: "5px 2px 2px 2px",
                                                                            border: "1px solid rgba(130, 130, 130)",
                                                                            fontSize: 14,
                                                                        }}
                                                                    >
                                                                        <Grid container item alignItems={"center"}
                                                                              sx={{marginRight: "3px"}}>
                                                                            <Typography variant={"caption"}
                                                                                        sx={{color: "white", fontWeight: "600"}}>
                                                                                {item.name.toUpperCase()}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid container item alignItems={"center"}
                                                                              sx={{color: "rgba(16,27,44,0.8)"}}>
                                                                            {item.value}
                                                                        </Grid>
                                                                    </Grid>
                                                                )
                                                            ) : "-"
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Imágenes:</Grid>
                                                    <Grid item xs={true}>
                                                        {
                                                            row.images.length > 0
                                                                ? (
                                                                    <Box
                                                                        sx={{cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue"}}
                                                                        onClick={() => handleOpenImagesDialog(row.images)}
                                                                    >
                                                                        {row.images.length}

                                                                        <VisibilityOutlined fontSize={"small"}
                                                                                            sx={{ml: "5px"}}/>
                                                                    </Box>
                                                                ) : "no"
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio base:</Grid>
                                                    <Grid item xs={true}>
                                                        {
                                                            baseProductPrice
                                                                ? baseProductPrice + " " + row.depots[0].store_depots[0].sell_price_unit
                                                                : "sin precio"
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio:</Grid>
                                                    <Grid item xs={true}>
                                                        <MoneyInfoTag
                                                            value={displayProductPrice}
                                                            errorColor={!baseProductPrice}
                                                        />
                                                        {
                                                            priceDiscountQuantity && (
                                                                <InfoTag value={`- ${displayPriceDiscount} descuento`}/>
                                                            )
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Distribución:</Grid>
                                                    <Grid item xs={true}>
                                                        {
                                                            (baseProductPrice && sellerProfitQuantity)
                                                                ? `Dueño: ${numberFormat(finalProductPrice - sellerProfitQuantity)} | Vendedor: ${numberFormat(sellerProfitQuantity)}`
                                                                : "-"
                                                        }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{fontWeight: 600}}>Ofertas:</Grid>
                                                    <Grid item xs={true}>
                                                        {row.depots[0].store_depots[0].offer_notes ?? "-"}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        )
                    })}
            </TableBody>
        )
    }

    async function handleSelectFilter(index: number) {
        let filters = [...allProductsByDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductsByDepartment(filters)
    }

    const DepartmentsFilter = ({formik}) => {
        return (
            <Card variant={"outlined"} sx={{padding: "15px"}}>
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
                        <ImagesDisplayDialog
                            dialogTitle={"Imágenes del producto"}
                            open={openImageDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

                        <CustomToolbar/>

                        <CardContent>
                            {
                                allProductsByDepartment.length > 0 && (
                                    <DepartmentsFilter formik={formik}/>
                                )
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <Table sx={{width: "100%"}} size={"small"}>
                                            <TableHeader/>

                                            <TableContent formik={formik}/>
                                        </Table>
                                    ) : (
                                        <TableNoData/>
                                    )
                            }
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}