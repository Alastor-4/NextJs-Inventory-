"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    MenuItem,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {
    ArrowLeft,
    CancelOutlined,
    ChevronRightOutlined,
    DescriptionOutlined,
    Done,
    EditOutlined,
    FilterAltOutlined,
    KeyboardArrowDown,
    KeyboardArrowRight,
    SearchOutlined,
    SellOutlined,
    VisibilityOutlined
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import * as Yup from "yup";
import {Formik} from "formik";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {InfoTag, MoneyInfoTag} from "@/components/InfoTags";
import {notifySuccess, notifyWarning, numberFormat} from "@/utils/generalFunctions";
import sellerStoreProduct from "@/app/profile/[id]/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";
import UpdateValueDialog from "@/components/UpdateValueDialog";

export default function StoreActionsMain({userId, storeId}: { userId: string, storeId: string }) {
    const router = useRouter()

    const [data, setData] = React.useState<null | any[]>(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState<any[]>([])

    //get initial data
    React.useEffect(() => {
        async function loadInitialData(userId: string, storeId: string) {
            const response = await sellerStoreProduct.allProductByDepartments(userId, storeId)
            if (response) {
                setAllProductsByDepartment(response.map((item: any) => ({
                    ...item,
                    selected: false
                })))
            }
        }

        if (userId && storeId) {
            loadInitialData(userId, storeId)
        }
    }, [userId, storeId])

    React.useEffect(() => {
        if (allProductsByDepartment.length) {
            let allProducts: any[] = []

            allProductsByDepartment.forEach((departmentItem: any) => {
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

            // @ts-ignore
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
                id: "price",
                label: "Precio",
                align: "left"
            },
            {
                id: "status",
                label: "Disponibles",
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
    const [expandIndex, setExpandIndex] = React.useState<null | number>(null)

    function handleExpandRow(index: number) {
        if (expandIndex === index) {
            setExpandIndex(null)
        } else {
            setExpandIndex(index)
        }
    }

    const [openImageDialog, setOpenImagesDialog] = React.useState(false)
    const [dialogImages, setDialogImages] = React.useState<any[]>([])

    function handleOpenImagesDialog(images: any[]) {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    async function handleToggleIsActive(e: any, storeDepotId: number) {
        e.stopPropagation()

        const updatedDepot = await sellerStoreProduct.toggleIsActiveStoreDepot(userId, storeId, storeDepotId)

        if (updatedDepot) {
            const newDepartments = [...allProductsByDepartment]
            for (const allProductsByDepartmentElement of allProductsByDepartment) {
                const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

                const productIndex = allProductsByDepartmentElement.products.findIndex((item: any) => item.depots[0].store_depots[0].id === storeDepotId)
                if (productIndex > -1) {
                    newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].is_active = updatedDepot.is_active
                }
            }

            setAllProductsByDepartment(newDepartments)

            if (updatedDepot.is_active) {
                notifySuccess("Producto en venta ahora")
            } else {
                notifyWarning("Producto quitado de la venta")
            }
        }
    }

    async function handleSellProduct(e: any, storeDepotId: number) {
        e.stopPropagation()

        const updatedDepot = await sellerStoreProduct.sellStoreDepotDefault(userId, storeId, storeDepotId)

        if (updatedDepot) {
            const newDepartments = [...allProductsByDepartment]
            for (const allProductsByDepartmentElement of allProductsByDepartment) {
                const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

                const productIndex = allProductsByDepartmentElement.products.findIndex((item: any) => item.depots[0].store_depots[0].id === storeDepotId)
                if (productIndex > -1) {
                    newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].product_remaining_units = updatedDepot.product_remaining_units
                }
            }

            setAllProductsByDepartment(newDepartments)

            notifySuccess("Nueva venta del producto creada")
        }
    }

    const TableContent = ({formik}: { formik: any }) => {
        const {
            searchBarValue,
            enVentaFilter,
            inactivoFilter,
            retiradoFilter,
            sinPrecioFilter,
            conDescuentoFilter,
            conOfertasFilter,
            sinDisponibilidadFilter,
            disponibilidad10Filter,
            disponibilidad20Filter
        } = formik.values

        return (
            <TableBody>
                {data?.filter(
                    item =>
                        (!searchBarValue || (searchBarValue && (item.name.toUpperCase().includes(searchBarValue.toUpperCase()) || item.description.toUpperCase().includes(searchBarValue.toUpperCase())))) &&
                        (!enVentaFilter || (enVentaFilter && item.depots[0].store_depots[0].is_active)) &&
                        (!inactivoFilter || (inactivoFilter && !item.depots[0].store_depots[0].is_active)) &&
                        (!retiradoFilter || (retiradoFilter && item.depots[0].store_depots[0].product_remaining_units === -1)) &&
                        (!sinPrecioFilter || (sinPrecioFilter && item.depots[0].store_depots[0].sell_price === "0")) &&
                        (!conDescuentoFilter || (conDescuentoFilter && (item.depots[0].store_depots[0].price_discount_percentage || item.depots[0].store_depots[0].price_discount_quantity))) &&
                        (!conOfertasFilter || (conOfertasFilter && item.depots[0].store_depots[0].offer_notes)) &&
                        (!sinDisponibilidadFilter || (sinDisponibilidadFilter && item.depots[0].store_depots[0].product_remaining_units === 0)) &&
                        (!disponibilidad10Filter || (disponibilidad10Filter && item.depots[0].store_depots[0].product_remaining_units < 10)) &&
                        (!disponibilidad20Filter || (disponibilidad20Filter && item.depots[0].store_depots[0].product_remaining_units < 20))
                )
                    .map(
                        (row) => {
                            const baseProductPrice = row.depots[0].store_depots[0].sell_price === "0"
                                ? null
                                : numberFormat(row.depots[0].store_depots[0].sell_price)

                            const priceDiscountQuantity = baseProductPrice
                                ? row.depots[0].store_depots[0].price_discount_percentage
                                    ? row.depots[0].store_depots[0].price_discount_percentage * parseFloat(String(baseProductPrice)) / 100
                                    : row.depots[0].store_depots[0].price_discount_quantity
                                : null

                            const finalProductPrice = baseProductPrice && priceDiscountQuantity
                                ? (parseFloat(String(baseProductPrice)) - priceDiscountQuantity)
                                : baseProductPrice

                            const sellerProfitQuantity = finalProductPrice
                                ? row.depots[0].store_depots[0].seller_profit_percentage
                                    ? row.depots[0].store_depots[0].seller_profit_percentage * finalProductPrice / 100
                                    : row.depots[0].store_depots[0].seller_profit_quantity
                                : null

                            const displayProductPrice = finalProductPrice
                                ? `${numberFormat(String(finalProductPrice)) + " " + row.depots[0].store_depots[0].sell_price_unit}`
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
                                            <MoneyInfoTag value={displayProductPrice} errorColor={!baseProductPrice}/>
                                            {row.depots[0].store_depots[0].offer_notes && (
                                                <DescriptionOutlined fontSize={"small"}/>
                                            )}
                                            <br/>
                                            {
                                                displayPriceDiscount && <InfoTag value={`- ${displayPriceDiscount}`}/>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Grid container columnSpacing={1}>
                                                <Grid container item xs={2} alignItems={"center"}>
                                                    <Box
                                                        sx={
                                                            {
                                                                display: "inline-flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                padding: "2px 4px",
                                                                color: "darkblue",
                                                                backgroundColor: "lightgrey",
                                                                borderRadius: "6px",
                                                                border: "1px solid black",
                                                                fontSize: "18px"
                                                            }
                                                        }>
                                                        {row.depots[0].store_depots[0].product_remaining_units}
                                                    </Box>
                                                </Grid>
                                                <Grid
                                                    container
                                                    item
                                                    xs={8}
                                                >
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        <Typography variant={"button"}>
                                                            {row.depots[0].store_depots[0].is_active
                                                                ? "en venta"
                                                                : "inactivo"
                                                            }
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        <Switch
                                                            size={"small"}
                                                            color={"success"}
                                                            disabled={!baseProductPrice}
                                                            checked={row.depots[0].store_depots[0].is_active}
                                                            onClick={(e) => handleToggleIsActive(e, row.depots[0].store_depots[0].id)}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                {
                                                    row.depots[0].store_depots[0].is_active &&
                                                    !!row.depots[0].store_depots[0].product_remaining_units && (
                                                        <Grid container item xs={2}>
                                                            <IconButton
                                                                color={"primary"}
                                                                onClick={(e) => handleSellProduct(e, row.depots[0].store_depots[0].id)}
                                                            >
                                                                <SellOutlined fontSize={"small"}/>
                                                            </IconButton>
                                                        </Grid>
                                                    )
                                                }
                                            </Grid>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell style={{padding: 0}} colSpan={6}>
                                            <Collapse in={expandIndex === row.id} timeout="auto" unmountOnExit>
                                                <Grid container spacing={1} sx={{padding: "8px 26px"}}>
                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Acciones:</Grid>
                                                        {
                                                            row.depots[0].store_depots[0].is_active &&
                                                            !!row.depots[0].store_depots[0].product_remaining_units && (
                                                                <Grid item xs={"auto"}>
                                                                    <Button
                                                                        size={"small"}
                                                                        color={"primary"}
                                                                        variant={"outlined"}
                                                                        onClick={() => handleOpenSellProduct(row, formik)}
                                                                    >
                                                                        Vender
                                                                    </Button>
                                                                </Grid>
                                                            )
                                                        }

                                                        <Grid item xs={"auto"}>
                                                            <Button
                                                                size={"small"}
                                                                variant={"outlined"}
                                                            >
                                                                Transferir
                                                            </Button>
                                                        </Grid>
                                                        <Grid item xs={"auto"}>
                                                            <Button
                                                                size={"small"}
                                                                variant={"outlined"}
                                                            >
                                                                Reservaciones
                                                            </Button>
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
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Departamento:</Grid>
                                                        <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Disponibles:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.depots[0].store_depots[0].product_remaining_units}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{
                                                                  fontWeight: 600,
                                                                  display: "flex",
                                                                  alignItems: "center"
                                                              }}>Características:</Grid>
                                                        <Grid item xs={true}
                                                              sx={{display: "flex", alignItems: "center"}}>
                                                            {row.characteristics.length > 0
                                                                ? row.characteristics.map((item: any) => (
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
                                                                                            sx={{
                                                                                                color: "white",
                                                                                                fontWeight: "600"
                                                                                            }}>
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
                                                                            sx={{
                                                                                cursor: "pointer",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                color: "blue"
                                                                            }}
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
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio
                                                            base:</Grid>
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
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Distribución:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                (baseProductPrice && sellerProfitQuantity && finalProductPrice)
                                                                    ? `Dueño: ${numberFormat(String(finalProductPrice - sellerProfitQuantity))} | Vendedor: ${numberFormat(sellerProfitQuantity)}`
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

    const initialValues = {
        searchBarValue: "",
        enVentaFilter: false,
        inactivoFilter: false,
        retiradoFilter: false,
        sinPrecioFilter: false,
        conDescuentoFilter: false,
        conOfertasFilter: false,
        sinDisponibilidadFilter: false,
        disponibilidad10Filter: false,
        disponibilidad20Filter: false,

        productSell: {
            maxUnitsQuantity: "1",
            unitsQuantity: "1",
            unitBuyPrice: "",
            totalPrice: "",
            paymentMethod: "Efectivo CUP",
        }
    }

    const validationSchema = Yup.object({
        productSell: Yup.object({
            maxUnitsQuantity: Yup.number(),
            unitsQuantity: Yup
                .number()
                .required("especifíque cantidad")
                .min(1, "cantidad mayor que 0")
                .max(Yup.ref("maxUnitsQuantity"), "cantidad superior a la cantidad disponible"),
            unitBuyPrice: Yup.number(),
            totalPrice: Yup.number(),
            paymentMethod: Yup.string(),
        })
    })

    const DepartmentsFilter = ({formik}: any) => {
        const {
            searchBarValue,
            enVentaFilter,
            inactivoFilter,
            retiradoFilter,
            sinPrecioFilter,
            conDescuentoFilter,
            conOfertasFilter,
            sinDisponibilidadFilter,
            disponibilidad10Filter,
            disponibilidad20Filter
        } = formik.values

        const [displayFilterSection, setDisplayFilterSection] = React.useState(false)

        return (
            <Card variant={"outlined"} sx={{padding: "10px"}}>
                <Grid container>
                    <Grid item container sx={{backgroundColor: "lightgray", padding: "10px 15px 15px 15px"}}>
                        <Grid item xs={12}>
                            <Typography variant={"subtitle1"}>
                                Seleccione departamentos para encontrar el producto deseado
                            </Typography>
                        </Grid>
                        <Grid container item columnSpacing={2} sx={{mt: "8px"}}>
                            {
                                allProductsByDepartment.map((item, index) => (
                                    <Grid key={item.id} item xs={"auto"}>
                                        <Button variant={item.selected ? "contained" : "outlined"}
                                                onClick={() => handleSelectFilter(index)}>
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
                    </Grid>

                    {
                        data && data.length > 0 && (
                            <Grid container item rowSpacing={2} sx={{mt: "5px", p: "15px"}}>
                                <Grid item xs={12}>
                                    <Typography variant={"subtitle1"} sx={{display: "flex", alignItems: "center"}}>
                                        Para los productos en los departamentos seleccionados

                                        <IconButton onClick={() => setDisplayFilterSection(!displayFilterSection)}>
                                            {displayFilterSection ? <KeyboardArrowDown fontSize={"small"}/> :
                                                <KeyboardArrowRight fontSize={"small"}/>}
                                        </IconButton>

                                        <FilterAltOutlined fontSize={"small"} sx={{ml: "15px"}}/>
                                        {(!!searchBarValue && 1) + (enVentaFilter && 1) + (inactivoFilter && 1) + (retiradoFilter && 1) + (sinPrecioFilter && 1) + (conDescuentoFilter && 1) + (conOfertasFilter && 1) + (sinDisponibilidadFilter && 1) + (disponibilidad10Filter && 1) + (disponibilidad20Filter && 1)}
                                    </Typography>
                                </Grid>

                                {
                                    displayFilterSection && (
                                        <>
                                            <Grid container item rowSpacing={1}>
                                                <Grid item xs={12}>
                                                    <Typography variant={"subtitle2"}
                                                                sx={{display: "flex", alignItems: "center"}}>
                                                        <ChevronRightOutlined/> Puede filtrar aquellos con una característica
                                                        común
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"en venta"}
                                                        sx={enVentaFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={enVentaFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("enVentaFilter", !enVentaFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"inactivo"}
                                                        sx={inactivoFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={inactivoFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("inactivoFilter", !inactivoFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"retirado"}
                                                        sx={retiradoFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={retiradoFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("retiradoFilter", !retiradoFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"sin precio"}
                                                        sx={sinPrecioFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={sinPrecioFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("sinPrecioFilter", !sinPrecioFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"con descuento"}
                                                        sx={conDescuentoFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={conDescuentoFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("conDescuentoFilter", !conDescuentoFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"con ofertas"}
                                                        sx={conOfertasFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={conOfertasFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("conOfertasFilter", !conOfertasFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"sin disponibilidad"}
                                                        sx={sinDisponibilidadFilter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={sinDisponibilidadFilter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("sinDisponibilidadFilter", !sinDisponibilidadFilter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"disponibilidad < 10"}
                                                        sx={disponibilidad10Filter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={disponibilidad10Filter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("disponibilidad10Filter", !disponibilidad10Filter)}
                                                    />
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={"disponibilidad < 20"}
                                                        sx={disponibilidad20Filter ? {
                                                            mx: "5px",
                                                            border: "2px solid",
                                                            backgroundColor: "lightgray"
                                                        } : {mx: "5px"}}
                                                        size={"small"}
                                                        color={disponibilidad20Filter ? "primary" : "default"}
                                                        onClick={() => formik.setFieldValue("disponibilidad20Filter", !disponibilidad20Filter)}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Grid container item rowSpacing={1}>
                                                <Grid item xs={12}>
                                                    <Typography variant={"subtitle2"}
                                                                sx={{display: "flex", alignItems: "center"}}>
                                                        <ChevronRightOutlined/> Puede buscar productos por nombre o descripción
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        name={"handleChangeSearchBarValue"}
                                                        placeholder="Buscar producto..."
                                                        size={"small"}
                                                        fullWidth
                                                        InputProps={{startAdornment: <SearchOutlined sx={{color: "gray"}}/>}}
                                                        {...formik.getFieldProps("searchBarValue")}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </>
                                    )
                                }
                            </Grid>
                        )
                    }
                </Grid>

            </Card>
        )
    }

    const [displayProductSellForm, setDisplayProductSellForm] = React.useState<boolean>(false)
    const [selectedProductSellRow, setSelectedProductSellRow] = React.useState<any>(null)
    function handleOpenSellProduct(row: any, formik: any) {
        formik.setFieldValue("productSell.maxUnitsQuantity", row.depots[0].store_depots[0].product_remaining_units)

        setSelectedProductSellRow(row)
        setDisplayProductSellForm(true)
    }

    const ProductSellForm = ({formik, selectedRow, closeForm}: {formik: any, selectedRow: any, closeForm: any}) => {
        async function productsSell() {
            let data = {
                userId,
                sellerStoreId: storeId,
                storeDepotId: selectedRow.depots[0].store_depots[0].id,
                unitsQuantity: formik.values.productSell.unitsQuantity,
                unitBuyPrice: selectedRow.depots[0].store_depots[0].sell_price,
                totalPrice: selectedRow.depots[0].store_depots[0].sell_price * formik.values.productSell.unitsQuantity,
                paymentMethod: formik.values.productSell.paymentMethod,
            }

            if (formik.values.productSell.unitBuyPrice && formik.values.productSell.totalPrice) {
                data.unitBuyPrice = formik.values.productSell.unitBuyPrice
                data.totalPrice = formik.values.productSell.totalPrice
            }

            const updatedDepot = await sellerStoreProduct.sellStoreDepotManual(data)

            if (updatedDepot) {
                const newDepartments = [...allProductsByDepartment]
                for (const allProductsByDepartmentElement of allProductsByDepartment) {
                    const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

                    const productIndex = allProductsByDepartmentElement.products.findIndex((item: any) => item.depots[0].store_depots[0].id === selectedRow.depots[0].store_depots[0].id)
                    if (productIndex > -1) {
                        newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].product_remaining_units = updatedDepot.product_remaining_units
                    }
                }

                setAllProductsByDepartment(newDepartments)
            }

            formik.resetForm()
            closeForm()
        }

        const paymentMethods = ["Efectivo CUP", "Transferencia CUP", "Efectivo USD", "Transferencia MLC", "Otro"]

        const [displayEditPrices, setDisplayEditPrices] = React.useState(false)

        function handleCancelEditPrices () {
            formik.setFieldValue("productSell.unitBuyPrice", "")
            formik.setFieldValue("productSell.totalPrice", "")

            setDisplayEditPrices(false)
        }

        return (
            <Card variant={"outlined"} sx={{width: 1, padding: "15px"}}>
                <Grid container item spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            name={"unitsQuantity"}
                            label="Cantidad"
                            size={"small"}
                            type={"number"}
                            fullWidth
                            {...formik.getFieldProps("productSell.unitsQuantity")}
                            error={formik.errors.productSell?.unitsQuantity && formik.touched.productSell?.unitsQuantity}
                            helperText={(formik.errors.productSell?.unitsQuantity && formik.touched.productSell?.unitsQuantity) && formik.errors.productSell.unitsQuantity}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            name={"paymentMethod"}
                            label="Método de pago"
                            size={"small"}
                            fullWidth
                            select
                            {...formik.getFieldProps("productSell.paymentMethod")}
                            error={formik.errors.productSell?.paymentMethod && formik.touched.productSell?.paymentMethod}
                            helperText={(formik.errors.productSell?.paymentMethod && formik.touched.productSell?.paymentMethod) && formik.errors.productSell.paymentMethod}
                        >
                            {
                                paymentMethods.map(item => (<MenuItem value={item} key={item}>{item}</MenuItem>))
                            }
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <Card variant={"outlined"} sx={{padding: "8px"}}>
                            <Grid container columnSpacing={2}>
                                {
                                    displayEditPrices
                                        ? (
                                            <>
                                                <Grid container item xs={8} rowSpacing={2}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            name={"unitBuyPrice"}
                                                            label="Precio por unidad"
                                                            size={"small"}
                                                            fullWidth
                                                            {...formik.getFieldProps("productSell.unitBuyPrice")}
                                                            error={formik.errors.productSell?.unitBuyPrice && formik.touched.productSell?.unitBuyPrice}
                                                            helperText={(formik.errors.productSell?.unitBuyPrice && formik.touched.productSell?.unitBuyPrice) && formik.errors.productSell.unitBuyPrice}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <TextField
                                                            name={"totalPrice"}
                                                            label="Precio total"
                                                            size={"small"}
                                                            fullWidth
                                                            {...formik.getFieldProps("productSell.totalPrice")}
                                                            error={formik.errors.productSell?.totalPrice && formik.touched.productSell?.totalPrice}
                                                            helperText={(formik.errors.productSell?.totalPrice && formik.touched.productSell?.totalPrice) && formik.errors.productSell.totalPrice}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Grid container item xs={4} justifyContent={"center"} alignItems={"center"}>
                                                    <IconButton onClick={handleCancelEditPrices}>
                                                        <CancelOutlined/>
                                                    </IconButton>
                                                </Grid>
                                            </>
                                        ) : (
                                            <>
                                                <Grid container item xs={8} rowSpacing={2}>
                                                    <Grid item xs={12}>
                                                        Precio por unidad: {selectedRow.depots[0].store_depots[0].sell_price + " " + selectedRow.depots[0].store_depots[0].sell_price_unit}
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        Precio total: {
                                                        !formik.errors.productSell?.unitsQuantity
                                                            ? numberFormat(String(formik.values.productSell.unitsQuantity * selectedRow.depots[0].store_depots[0].sell_price)) + " " + selectedRow.depots[0].store_depots[0].sell_price_unit
                                                            : "-"
                                                    }
                                                    </Grid>
                                                </Grid>

                                                <Grid container item xs={4} justifyContent={"center"} alignItems={"center"}>
                                                    <IconButton onClick={() => setDisplayEditPrices(true)}>
                                                        <EditOutlined/>
                                                    </IconButton>
                                                </Grid>
                                            </>
                                        )
                                }

                            </Grid>
                        </Card>
                    </Grid>

                    <Grid container item justifyContent={"flex-end"}>
                        <IconButton color={"primary"} disabled={!!formik.errors.productSell} onClick={productsSell}>
                            <Done/>
                        </IconButton>
                    </Grid>
                </Grid>
            </Card>
        )
    }


    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
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

                        <UpdateValueDialog
                            dialogTitle={`Vender producto "${selectedProductSellRow?.name ?? ''}"`}
                            open={displayProductSellForm}
                            setOpen={setDisplayProductSellForm}
                        >
                            <ProductSellForm
                                formik={formik}
                                selectedRow={selectedProductSellRow}
                                closeForm={() => setDisplayProductSellForm(false)}
                            />
                        </UpdateValueDialog>

                        <CustomToolbar/>

                        <CardContent>
                            {
                                allProductsByDepartment.length > 0 && (
                                    <DepartmentsFilter formik={formik}/>
                                )
                            }

                            {
                                data && data.length > 0
                                    ? (
                                        <Table sx={{width: "100%", mt: "20px"}} size={"small"}>
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