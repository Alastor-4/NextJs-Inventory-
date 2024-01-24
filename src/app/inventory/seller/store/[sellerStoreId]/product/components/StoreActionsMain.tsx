"use client"

import React from "react";
import {
    AppBar,
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Collapse,
    Divider,
    FormHelperText,
    Grid,
    IconButton,
    InputBase,
    MenuItem,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import {
    ArrowLeft,
    DescriptionOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    FilterAlt,
    FilterAltOff,
    FilterAltOutlined,
    ForwardToInbox,
    HelpOutline,
    KeyboardArrowDown,
    KeyboardArrowRight,
    KeyboardArrowUp,
    SellOutlined,
} from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { Formik } from "formik";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { CustomTooltip, InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import {
    computeDepotPricePerUnit,
    notifyError,
    notifySuccess,
    notifyWarning,
    numberFormat
} from "@/utils/generalFunctions";
import sellerStoreProduct from "@/app/inventory/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";
import UpdateValueDialog from "@/components/UpdateValueDialog";
import { storeDetails } from "@/app/inventory/owner/store-details/[storeDetailsId]/request/storeDetails";
import ModalTransfer from "./transferBetweenStores/components/ModalTransfer";
import TransferBetweenStores from "./transferBetweenStores/components/TransferBetweenStores";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import InfoTooltip from "@/components/InfoTooltip";
import { images } from "@prisma/client";
import { grey } from "@mui/material/colors";

export default function StoreActionsMain({ userId, storeId }: { userId: number, storeId: string }) {
    const router = useRouter()

    const [data, setData] = React.useState<null | any[]>(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState<any>([])

    //Create Modal handler
    const [isFilterModalOpen, setIsFilterModalOpen] = React.useState<boolean>(false);

    const toggleModalFilter = () => {
        if (!data) return;
        setIsFilterModalOpen(!isFilterModalOpen);
    }

    const [isOpenTooltip, setIsOpenTooltip] = React.useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    const [filtersApplied, setFiltersApplied] = React.useState<boolean>(false);
    const [activeModalTransfer, setActiveModalTransfer] = React.useState(false)
    const [productSelectedForTransfer, setProductSelectedForTransfer] = React.useState<null | any>(null)

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
            loadInitialData(String(userId), storeId)
        }
    }, [userId, storeId])

    React.useEffect(() => {
        if (allProductsByDepartment.length) {
            let allProducts: any[] = []

            allProductsByDepartment.forEach((productsByDepartments: any) => {
                //when there are no filters applied all departments are returned
                if (!filtersApplied || productsByDepartments.selected) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
            });

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

    }, [allProductsByDepartment, filtersApplied])

    function handleNavigateBack() {
        router.back()
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
                        Productos en tienda
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            { id: "name", label: "Nombre", },
            { id: "department", label: "Departamento", },
            { id: "price", label: "Precio", },
            { id: "status", label: "Disponibles", },
            { id: "activate_sale", label: "Estado", },
            { id: "sale_of_a_product", label: "", },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        align={"left"}
                        padding={'checkbox'}
                    />

                    {headCells.map((headCell: any) => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            padding={"normal"}
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

    //selected products
    const [selected, setSelected] = React.useState<any[]>([])

    const cancelChecked = (badItem: any) => {
        const newSelected = selected.filter((item: any) => item.id !== badItem)
        setSelected(newSelected)
    }

    const [openImageDialog, setOpenImagesDialog] = React.useState(false)
    const [dialogImages, setDialogImages] = React.useState<any[]>([])

    function handleOpenImagesDialog(images: any[]) {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    async function handleToggleIsActive(e: any, badItem: number, storeDepotId: number) {
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
                cancelChecked(badItem)
                notifyWarning("Producto quitado de la venta")
            }
        }
    }

    async function handleSellProduct(e: any, storeDepotId: number, badItem: number) {
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

            if (updatedDepot.product_remaining_units === 0) cancelChecked(badItem)

            notifySuccess("Vendida una unidad del producto")
        }
    }

    function handleSelectItem(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: any) {
        e.stopPropagation()

        let newSelected = [...selected]
        const rowIndex = selected.findIndex(item => item.id === row.id)

        if (rowIndex > -1) {
            newSelected.splice(rowIndex, 1)
        } else {
            newSelected.push(row)
        }

        setSelected(newSelected)
    }

    const handleClickTransfer = (row: any) => {
        setActiveModalTransfer(true)
        setProductSelectedForTransfer(row)
    }

    const TableContent = ({ formik }: { formik: any }) => {
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

        const handleToggleOffer = async (offerId: number, storeDepotId: number) => {
            const response = await storeDetails.toggleProductOffers(storeId, offerId)

            if (response) {
                const newDepartments = [...allProductsByDepartment]
                for (const allProductsByDepartmentElement of allProductsByDepartment) {
                    const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

                    const productIndex = allProductsByDepartmentElement.products.findIndex((item: any) => item.depots[0].store_depots[0].id === storeDepotId)
                    if (productIndex > -1) {
                        const offers = allProductsByDepartment[departmentIndex].products[productIndex].depots[0].store_depots[0].product_offers

                        const offerIndex = offers.findIndex((item: any) => item.id === response.id)
                        if (offerIndex > -1) {
                            newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].product_offers[offerIndex] = response
                        }
                    }
                }

                setAllProductsByDepartment(newDepartments)

                response.is_active
                    ? notifySuccess("Oferta habilitada nuevamente")
                    : notifyWarning("La oferta ha sido deshabilitada y no se está aplicando")
            } else {
                notifyError("No se ha podido cambiar el estado a la oferta")
            }
        }

        const OfferItem = ({ item, index, currency, depotId }: { item: any, index: number, currency: string, depotId: number }) => (
            <Grid container item xs={12}>
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
                >
                    <Grid container item xs={12} justifyContent={"space-between"}>
                        <Checkbox
                            size={"small"}
                            color={item.is_active ? "success" : "default"}
                            checked={item.is_active}
                            onClick={async (e) => {
                                return await handleToggleOffer(item.id, depotId)
                            }}
                        />
                    </Grid>

                    <Grid
                        container
                        item
                        xs={12}
                        sx={{ color: "rgba(16,27,44,0.8)", textWrap: "pretty" }}>
                        {
                            item.compare_function === '='
                                ? `${index + 1}. Cuando compren ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                                : `${index + 1}. Cuando compren más de ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                        }
                    </Grid>
                </Grid>
            </Grid>
        )

        function productHasActiveOffer(offers: any[]) {
            return offers.some((item: any) => item.is_active)
        }

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
                        (!conOfertasFilter || (conOfertasFilter && item.depots[0].store_depots[0].product_offers.length > 0)) &&
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
                                        selected={!!selected.find((item: any) => item.id === row.id)}
                                        onClick={() => handleExpandRow(row.id)}
                                    >
                                        <TableCell sx={{ padding: 0 }}>
                                            <Checkbox
                                                size='small'
                                                checked={!!selected.find((item: any) => item.id === row.id)}
                                                disabled={!row.depots[0].store_depots[0].is_active ||
                                                    !row.depots[0].store_depots[0].product_remaining_units}
                                                onClick={(e) => handleSelectItem(e, row)}
                                            />

                                            <IconButton size={"small"}>
                                                {
                                                    (expandIndex !== row.id)
                                                        ? <ExpandMoreOutlined/>
                                                        : <ExpandLessOutlined/>
                                                }
                                            </IconButton>
                                        </TableCell>

                                        <TableCell>
                                            {
                                                row.images?.length! > 0 && (
                                                    <Box display={"flex"} justifyContent={"center"}>
                                                        <AvatarGroup
                                                            max={2}
                                                            sx={{ flexDirection: "row", width: "fit-content" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleOpenImagesDialog(row.images!)
                                                            }}
                                                        >
                                                            {row?.images?.map(
                                                                (imageItem: images) => <Avatar
                                                                    variant={"rounded"}
                                                                    key={`producto-${imageItem.id}`}
                                                                    alt={`producto-${imageItem.id}`}
                                                                    src={imageItem.fileUrl!}
                                                                    sx={{ cursor: "pointer", border: "1px solid lightblue" }}
                                                                />
                                                            )}
                                                        </AvatarGroup>
                                                    </Box>
                                                )
                                            }
                                            <Box display={"flex"} justifyContent={"center"}>{row.name}</Box>
                                        </TableCell>
                                        <TableCell align="center">{row?.departments?.name ?? "-"}</TableCell>
                                        <TableCell>
                                            <Grid container rowSpacing={1}>
                                                <Grid container item xs={12} flexWrap={"nowrap"} alignItems={"center"}>
                                                    <MoneyInfoTag
                                                        value={displayProductPrice}
                                                        errorColor={!baseProductPrice}
                                                    />
                                                    {
                                                        !!row?.depots![0].store_depots![0].product_offers?.length &&
                                                        productHasActiveOffer(row?.depots![0].store_depots![0].product_offers) && (
                                                            <CustomTooltip tooltipText={"Ofertas activas"}>
                                                                <DescriptionOutlined fontSize={"small"} />
                                                            </CustomTooltip>
                                                        )
                                                    }
                                                </Grid>
                                                {
                                                    displayPriceDiscount && (
                                                        <Grid item xs={12}>
                                                            <InfoTag
                                                                value={`- ${displayPriceDiscount}`}
                                                                tooltipText={row?.depots![0].store_depots![0].discount_description}
                                                            />
                                                        </Grid>
                                                    )
                                                }
                                            </Grid>
                                        </TableCell>
                                        <TableCell align="center">
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
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                                            <Grid container >
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
                                                        onClick={(e) => handleToggleIsActive(e, row.id, row.depots[0].store_depots[0].id)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            {
                                                row.depots[0].store_depots[0].is_active &&
                                                !!row.depots[0].store_depots[0].product_remaining_units && (
                                                    <Grid container>
                                                        <IconButton
                                                            color={"primary"}
                                                            onClick={(e) => handleSellProduct(e, row.depots[0].store_depots[0].id, row.id)}
                                                        >
                                                            <SellOutlined fontSize={"small"} />
                                                        </IconButton>
                                                    </Grid>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell style={{ padding: 0 }} colSpan={6}>
                                            <Collapse in={expandIndex === row.id} timeout="auto" unmountOnExit>
                                                <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div">
                                                            Detalles:
                                                        </Typography>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.name}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.description ? row.description : "-"}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                        <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                        <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
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
                                                                        <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                                                                            <Typography variant={"caption"}
                                                                                sx={{ color: "white", fontWeight: "600" }}>
                                                                                {item.name.toUpperCase()}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid container item alignItems={"center"}
                                                                            sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                            {item.value}
                                                                        </Grid>
                                                                    </Grid>
                                                                )) : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio
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
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio:</Grid>
                                                        <Grid item xs={true}>
                                                            <MoneyInfoTag
                                                                value={displayProductPrice}
                                                                errorColor={!baseProductPrice}
                                                            />
                                                            {
                                                                priceDiscountQuantity && (
                                                                    <InfoTag value={`- ${displayPriceDiscount} descuento`} />
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    {
                                                        row?.depots![0].store_depots![0].discount_description && (
                                                            <Grid container item spacing={1} xs={12}>
                                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Razón de la rebaja:</Grid>
                                                                <Grid item xs={true}>
                                                                    {row?.depots![0].store_depots![0].discount_description}
                                                                </Grid>
                                                            </Grid>
                                                        )
                                                    }

                                                    <Grid container item columnSpacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Salario del vendedor:</Grid>
                                                        <Grid item container xs={true}>
                                                            {
                                                                row?.depots![0].store_depots![0].seller_profit_percentage
                                                                    ? `${row?.depots![0].store_depots![0].seller_profit_percentage} %`
                                                                    : `${row?.depots![0].store_depots![0].seller_profit_quantity} CUP`
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                            sx={{ fontWeight: 600 }}>Distribución:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                (baseProductPrice && sellerProfitQuantity && finalProductPrice)
                                                                    ? `Dueño: ${numberFormat(String(finalProductPrice - sellerProfitQuantity))} | Vendedor: ${numberFormat(sellerProfitQuantity)}`
                                                                    : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item container xs={"auto"} sx={{ fontWeight: 600 }} alignItems={"center"}>Unidades restantes:</Grid>
                                                        <Grid item container xs={true} alignItems={"center"}>
                                                            {row.depots[0].store_depots[0].product_remaining_units}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={12} sx={{ fontWeight: 600 }}>Ofertas:</Grid>
                                                        <Grid container item xs={12} rowSpacing={1}>
                                                            {row.depots[0].store_depots[0].product_offers.map((item: any, index: number) => (
                                                                <OfferItem
                                                                    item={item}
                                                                    index={index}
                                                                    currency={row.depots[0].store_depots[0].sell_price_unit}
                                                                    depotId={row.depots[0].store_depots[0].id}
                                                                    key={item.id}
                                                                />
                                                            ))}
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
    const paymentMethods = ["Efectivo CUP", "Transferencia CUP", "Otro"]

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
            products: [
                {
                    maxUnitsQuantity: "1",
                    unitsQuantity: "1",
                }
            ],
            totalPrice: "",
            paymentMethod: "",
        }
    }

    const validationSchema = Yup.object({
        productSell: Yup.object({
            products: Yup.array().of(Yup.object({
                maxUnitsQuantity: Yup.number().integer().typeError("Debe ser un número"),
                unitsQuantity: Yup
                    .number().integer().typeError("Debe ser un número")
                    .required("Requerido")
                    .min(1, "Al menos 1")
                    .max(Yup.ref("maxUnitsQuantity"), "Cantidad superior a la cantidad disponible"),
            })).required(),
            paymentMethod: Yup.string().required("especifíque método"),
        })
    })


    const [displayProductSellForm, setDisplayProductSellForm] = React.useState<boolean>(false)
    function handleOpenSellProduct(formik: any) {
        let productsData: any = []
        selected.forEach(item => {
            const storeDepot = item.depots[0].store_depots[0]

            productsData.push({
                maxUnitsQuantity: storeDepot.product_remaining_units,
                unitsQuantity: 1,
            })
        })

        formik.setFieldValue("productSell.products", productsData)
        formik.setFieldValue("productSell.paymentMethod", paymentMethods[0])

        setDisplayProductSellForm(true)
    }

    const ProductSellForm = ({ formik, closeForm }: { formik: any, closeForm: any }) => {
        async function productsSell() {
            let sellProduct: any[] = []

            formik.values.productSell.products.forEach((item: any, index: number) => {
                const storeDepot = selected[index].depots[0].store_depots[0]

                sellProduct.push({
                    storeDepotId: storeDepot.id,
                    unitsQuantity: item.unitsQuantity,
                    price: computeDepotPricePerUnit(storeDepot, item.unitsQuantity) * item.unitsQuantity
                })
            })

            const totalPrice = sellProduct.reduce((accumulate, current) => accumulate + current.price, 0)

            const sell = { paymentMethod: formik.values.productSell.paymentMethod, totalPrice: totalPrice }

            const sellItemResponse = await sellerStoreProduct.sellStoreDepotManual(
                {
                    userId,
                    sellerStoreId: storeId,
                    sellData: sell,
                    sellProductsData: sellProduct,
                }
            )

            if (sellItemResponse) {
                const newDepartments = [...allProductsByDepartment]

                sellProduct.forEach(sellProductItem => {
                    for (const allProductsByDepartmentElement of allProductsByDepartment) {
                        const departmentIndex = allProductsByDepartment.indexOf(allProductsByDepartmentElement)

                        const productIndex = allProductsByDepartmentElement.products.findIndex((item: any) => item.depots[0].store_depots[0].id === sellProductItem.storeDepotId)
                        if (productIndex > -1) {
                            newDepartments[departmentIndex].products[productIndex].depots[0].store_depots[0].product_remaining_units
                                = allProductsByDepartment[departmentIndex].products[productIndex].depots[0].store_depots[0].product_remaining_units - sellProductItem.unitsQuantity
                        }
                    }
                })

                setAllProductsByDepartment(newDepartments)

                notifySuccess("La venta ha sido registrada")
            }
            formik.resetForm()
            closeForm()
            setSelected([])
        }

        function getTotals() {
            let totalProducts = 0
            let totalPrice = 0

            formik.values.productSell.products.forEach((item: any, index: number) => {
                totalProducts += item.unitsQuantity

                const storeDepot = selected[index].depots[0].store_depots[0]

                const pricePerUnit = computeDepotPricePerUnit(storeDepot, item.unitsQuantity)

                totalPrice += (pricePerUnit * item.unitsQuantity)
            })

            return { totalProducts, totalPrice }
        }
        return (
            <Grid container item spacing={3}>
                <Grid container item xs={12} rowSpacing={2}>
                    {
                        formik.values.productSell.products.map((item: any, index: number) => {
                            const storeDepot = selected[index].depots[0].store_depots[0]

                            const pricePerUnit = computeDepotPricePerUnit(storeDepot, item.unitsQuantity)

                            return (
                                <Grid container item xs={12} key={selected[index].id} alignItems={'center'}>
                                    <Grid container item xs={12} flexWrap={"nowrap"} sx={{overflowX: "auto"}}>
                                        <Grid container item xs={"auto"} justifyContent={"center"}>
                                            <KeyboardArrowRight fontSize={"small"}/>
                                        </Grid>

                                        <Grid item xs={true}>
                                            {selected[index].name + " "}
                                            <small>{selected[index].description}</small>
                                        </Grid>
                                    </Grid>

                                    <Grid container item xs={12} columnSpacing={2}>
                                        <Grid item xs={"auto"}>
                                            <TextField
                                                name={"unitsQuantity"}
                                                variant={"standard"}
                                                size={"small"}
                                                type={"number"}
                                                sx={{ width: "60px" }}
                                                {...formik.getFieldProps(`productSell.products.${index}.unitsQuantity`)}
                                                error={formik.errors.productSell?.products[index]?.unitsQuantity && formik.touched.productSell?.products[index]?.unitsQuantity}
                                            />
                                        </Grid>

                                        <Grid container item xs={true} alignItems={"center"}>
                                           <Divider sx={{width: 1}}/>
                                        </Grid>

                                        <Grid container item xs={"auto"} alignItems={"center"}>
                                            Precio: {numberFormat(String(pricePerUnit * (item.unitsQuantity === '' ? 0 : item.unitsQuantity)))}
                                        </Grid>
                                    </Grid>

                                    {
                                        formik.errors.productSell?.products[index]?.unitsQuantity && formik.touched.productSell?.products[index]?.unitsQuantity && (
                                            <Grid item xs={12}>
                                                <FormHelperText sx={{color: "#d32f2f"}}>
                                                    {formik.errors.productSell?.products[index]?.unitsQuantity}
                                                </FormHelperText>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            )
                        })
                    }

                    <Grid item xs={12}>
                        <Divider />
                    </Grid>

                    <Grid container item xs={12}>
                        <Grid item xs={"auto"}>
                            Total {getTotals().totalProducts}
                        </Grid>

                        <Grid container item xs={true} justifyContent={"flex-end"}>
                            Precio: {numberFormat(String(getTotals().totalPrice))}
                        </Grid>
                    </Grid>
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

                <Grid container item justifyContent={"flex-end"}>
                    <Button color={"primary"} disabled={!!formik.errors.productSell} onClick={productsSell}>
                        Vender
                    </Button>
                </Grid>
            </Grid>
        )
    }

    const loadData = async () => {
        let selectedDepartment = new Map();

        allProductsByDepartment.forEach((element: any) => {
            if (element.selected) selectedDepartment.set(element.id, true)
        })

        const newAllProductByDepartments = await sellerStoreProduct.allProductByDepartments(userId, storeId)

        if (newAllProductByDepartments) {
            setAllProductsByDepartment(
                newAllProductByDepartments.map((item: any) => ({
                    ...item,
                    selected: selectedDepartment.has(item.id) ? true : false
                })))
        }

        setActiveModalTransfer(false)

    }

    const DepartmentsFilter = ({ formik }: any) => {
        const {
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

        //styles chip
        const selectedChip = {
            border: "2px solid",
            backgroundColor: "lightgray"
        }
        const chipNotSelected = {
            m: "1px"
        }

        const [displayFilterSection, setDisplayFilterSection] = React.useState(false)

        return (
            <Card variant={"outlined"} sx={{ padding: "5px" }}>
                {
                    data && data.length > 0 && (
                        <Grid container item rowSpacing={2} >
                            <Grid item xs={12}>
                                <Typography variant={"subtitle2"} sx={{ display: "flex", alignItems: "center" }}>
                                    Filtrar sobre los departamentos seleccionados.

                                    <IconButton onClick={() => setDisplayFilterSection(!displayFilterSection)}>
                                        {displayFilterSection ? <KeyboardArrowDown fontSize={"small"} /> :
                                            <KeyboardArrowUp fontSize={"small"} />}
                                    </IconButton>

                                    <FilterAltOutlined fontSize={"small"} sx={{ ml: "15px" }} />
                                    {(enVentaFilter && 1) + (inactivoFilter && 1) + (retiradoFilter && 1) + (sinPrecioFilter && 1) + (conDescuentoFilter && 1) + (conOfertasFilter && 1) + (sinDisponibilidadFilter && 1) + (disponibilidad10Filter && 1) + (disponibilidad20Filter && 1)}
                                </Typography>
                            </Grid>

                            {
                                displayFilterSection && (
                                    <Grid item container rowSpacing={1}>
                                        <Grid container item xs={12} md={"auto"} columnSpacing={1} flexWrap={"nowrap"} overflow={"auto"}>
                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"en venta"}
                                                    sx={enVentaFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={enVentaFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("enVentaFilter", !enVentaFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"con descuento"}
                                                    sx={conDescuentoFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={conDescuentoFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("conDescuentoFilter", !conDescuentoFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"disponibilidad < 20"}
                                                    sx={disponibilidad20Filter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={disponibilidad20Filter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("disponibilidad20Filter", !disponibilidad20Filter)}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Grid container item xs={12} md={"auto"} columnSpacing={1} flexWrap={"nowrap"} overflow={"auto"}>
                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"con ofertas"}
                                                    sx={conOfertasFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={conOfertasFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("conOfertasFilter", !conOfertasFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"sin precio"}
                                                    sx={sinPrecioFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={sinPrecioFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("sinPrecioFilter", !sinPrecioFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"disponibilidad < 10"}
                                                    sx={disponibilidad10Filter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={disponibilidad10Filter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("disponibilidad10Filter", !disponibilidad10Filter)}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Grid container item xs={12} md={"auto"} columnSpacing={1} flexWrap={"nowrap"} overflow={"auto"}>
                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"sin disponibilidad"}
                                                    sx={sinDisponibilidadFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={sinDisponibilidadFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("sinDisponibilidadFilter", !sinDisponibilidadFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"inactivo"}
                                                    sx={inactivoFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={inactivoFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("inactivoFilter", !inactivoFilter)}
                                                />
                                            </Grid>

                                            <Grid item>
                                                <Chip
                                                    variant={"outlined"}
                                                    label={"retirado"}
                                                    sx={retiradoFilter ? selectedChip : chipNotSelected}
                                                    size={"small"}
                                                    color={retiradoFilter ? "primary" : "default"}
                                                    onClick={() => formik.setFieldValue("retiradoFilter", !retiradoFilter)}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )
                            }
                        </Grid>
                    )
                }

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
                        <>
                            {isFilterModalOpen && (allProductsByDepartment.length! > 0) && <FilterProductsByDepartmentsModal
                                allProductsByDepartment={allProductsByDepartment!}
                                setAllProductsByDepartment={setAllProductsByDepartment}
                                setFiltersApplied={setFiltersApplied}
                                isFilterModalOpen={isFilterModalOpen}
                                toggleModalFilter={toggleModalFilter}
                            />}

                            <ImagesDisplayDialog
                                open={openImageDialog}
                                setOpen={setOpenImagesDialog}
                                images={dialogImages}
                            />

                            <UpdateValueDialog
                                dialogTitle={"Vender productos"}
                                open={displayProductSellForm}
                                setOpen={setDisplayProductSellForm}
                                fullScreen
                            >
                                {
                                    displayProductSellForm && (
                                        <ProductSellForm
                                            formik={formik}
                                            closeForm={() => setDisplayProductSellForm(false)}
                                        />
                                    )
                                }

                            </UpdateValueDialog>

                            <ModalTransfer
                                open={activeModalTransfer}
                                setOpen={setActiveModalTransfer}
                                dialogTitle="Transferir a tienda"
                            >
                                {
                                    activeModalTransfer &&
                                    <TransferBetweenStores
                                        storeId={storeId}
                                        storeDepot={productSelectedForTransfer.depots[0].store_depots[0]}
                                        badItem={productSelectedForTransfer.id}
                                        cancelChecked={cancelChecked}
                                        loadData={loadData}
                                    />

                                }
                            </ModalTransfer>
                        </>

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
                                            message={"Puede buscar por nombre y descripción ó filtrar por departamentos"}
                                        >
                                            <IconButton onClick={handleTooltipOpen}>
                                                <HelpOutline />
                                            </IconButton>
                                        </InfoTooltip>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={true} md={8}>
                                        <Grid item container xs={12} border={"1px solid gray"} borderRadius={"5px"} margin="4px" position="relative" >
                                            <Grid item position="absolute" height="100%" paddingLeft="4px" display="flex" alignItems="center" justifyContent="center" >
                                                <SearchIcon color="action" />
                                            </Grid>
                                            <Grid item width="100%" paddingLeft="35px" >
                                                <InputBase
                                                    placeholder="Buscar producto..."
                                                    inputProps={{ 'aria-label': 'search' }}
                                                    {...formik.getFieldProps("searchBarValue")}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={"auto"} md={4} justifyContent={"center"}>
                                        <Button size="small"
                                            sx={{
                                                color: grey[600],
                                                borderColor: grey[600],
                                                '&:hover': {
                                                    borderColor: grey[800],
                                                    backgroundColor: grey[200],
                                                },
                                            }}
                                            onClick={toggleModalFilter} startIcon={<FilterAlt />} variant="outlined">Filtrar</Button>
                                    </Grid>
                                </Grid>
                            </Card>

                            <DepartmentsFilter formik={formik} />

                            {
                                data && data.length > 0
                                    ? (
                                        <>
                                            {
                                                selected.length > 0 && (
                                                    <Grid container justifyContent={"space-between"} mt={"15px"}>
                                                        <Button
                                                            size={"small"}
                                                            color={"primary"}
                                                            variant={"outlined"}
                                                            onClick={() => handleOpenSellProduct(formik)}
                                                            startIcon={<SellOutlined fontSize={"small"} />}
                                                        >
                                                            Vender {selected.length}
                                                        </Button>

                                                        {
                                                            selected.length === 1 && (
                                                                <Button
                                                                    size={"small"}
                                                                    variant={"outlined"}
                                                                    startIcon={<ForwardToInbox color="secondary" />}
                                                                    onClick={() => handleClickTransfer(selected[0])}
                                                                >
                                                                    Transferir
                                                                </Button>
                                                            )
                                                        }

                                                        <IconButton
                                                            size={"small"}
                                                            color="error"
                                                            onClick={() => setSelected([])}
                                                        >
                                                            <FilterAltOff fontSize={"small"} />
                                                        </IconButton>
                                                    </Grid>
                                                )
                                            }

                                            <TableContainer sx={{ width: "100%", maxHeight: "500px", mt: "20px" }}>
                                                <Table sx={{ width: "100%" }} size={"small"}>
                                                    <TableHeader />
                                                    <TableContent formik={formik} />
                                                </Table>
                                            </TableContainer>
                                        </>
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