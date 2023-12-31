"use client"

import React, {useState} from "react";
import {
    AppBar, Avatar, AvatarGroup,
    Box,
    Card,
    CardContent,
    Grid,
    IconButton,
    Switch,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import {
    AddOutlined,
    ArrowLeft, CircleOutlined,
    DescriptionOutlined,
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    ShareOutlined,
    SwapHoriz
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import StoreMoreDetails from "./StoreMoreDetails";
import StoreModalPrice from "./Modal/StoreModalPrice"
import StoreEditPrice from "./Modal/StoreEditPrice";
import { storeDetails } from "../request/storeDetails";
import StoreModalDefault from "./Modal/StoreModalDefault";
import TransferUnits from "./Modal/TransferUnits";
import StoreEditUnits from "./Modal/StoreEditUnits";
import ModalAddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/ModalAddProductFromWarehouse";
import AddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/AddProductFromWarehouse";
import { InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import { numberFormat } from "@/utils/generalFunctions";
import stores from "../../../store/requests/stores";
import DepartmentCustomButton from "@/components/DepartmentCustomButton";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";

const fetcher = (url: any) => fetch(url).then((res) => res.json())

export default function StoreMainTable({ userId, storeDetailsId }: { userId?: number, storeDetailsId: number }) {
    const router = useRouter()

    // Guardan datos de bd
    const [data, setData] = React.useState<any>([])
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])
    const [dataStore, setDataStore] = React.useState<any>('')

    // Se usan habilitar modales o detalles
    const [showDetails, setShowDetails] = React.useState<any>('')
    const [activeModalPrice, setActiveModalPrice] = React.useState({ active: false, storeDepot: [] })
    const [activeModalTransferUnits, setActiveModalTransferUnits] = React.useState(false);
    const [activeModalEditUnits, setActiveModalEditUnits] = React.useState(false);
    const [activeAddProductFromWarehouse, setActiveAddProductFromWarehouse] = React.useState(false)

    // Almacena el ind de la row seleccionada
    // modal q la usan:  TransferUnits , StoreEditUnits
    const [selectedRowInd, setSelectedRowInd] = React.useState<any>(null);

    //get initial data
    React.useEffect(() => {
        fetcher(`/inventory/owner/store-details/${storeDetailsId}/api`).then((data) =>
            setAllProductsByDepartment(data.map((item: any) => ({
                ...item,
                selected: false
            }))))
    }, [storeDetailsId])

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
            const datastore = await stores.storeDetails(userId!, storeDetailsId);
            setDataStore(datastore);
        }
        if (dataStore === '') {
            getDataStore()
        }

    }, [dataStore, storeDetailsId, userId, setDataStore])

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
            sell_price: product.sell_price,
            sell_price_unit: product.sell_price_unit,
            seller_profit_quantity: product.seller_profit_quantity,
            price_discount_percentage: product.price_discount_percentage,
            price_discount_quantity: product.price_discount_quantity,
        }
        const response = await storeDetails.update(product.id, data)
        if (response === 200) {
            await loadDates();
        }
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
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Productos {dataStore.name}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    <IconButton color={"inherit"} onClick={() => router.push(`/inventory/owner/store-assign?storeId=${dataStore.id}`)} >
                        <ShareOutlined fontSize={"small"} />
                    </IconButton>
                    <IconButton color={"inherit"} onClick={() => setActiveAddProductFromWarehouse(true)} >
                        <AddOutlined />
                    </IconButton>
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
                label: "Estado",
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

    const loadDates = async () => {
        let newAllProductsByDepartment = await storeDetails.getAllProductsByDepartment(storeDetailsId);

        let selectedDepartment = allProductsByDepartment.filter((element: any) => (element.selected)).map((element: any) => element.id)

        newAllProductsByDepartment = newAllProductsByDepartment.map((element: any) => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductsByDepartment(newAllProductsByDepartment);
    }

    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [dialogImages, setDialogImages] = useState([])

    function handleOpenImagesDialog(images: any) {
        setDialogImages(images)
        setOpenImageDialog(true)
    }

    const TableContent = ({ formik }: { formik: any }) => {
        return (
            <TableBody>
                {data.filter(
                    (item: any) =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (row: any, index: number) => {

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
                                            onClick={(e) => setShowDetails((showDetails !== row.id) ? row.id : '')}
                                        >
                                            <TableCell>
                                                {
                                                    row.images?.length! > 0 && (
                                                        <Box display={"flex"} justifyContent={"center"}>
                                                            <AvatarGroup
                                                                max={2}
                                                                sx={{flexDirection: "row", width: "fit-content"}}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleOpenImagesDialog(row.images!)
                                                                }}
                                                            >
                                                                {row.images.map(
                                                                    (imageItem: any) => <Avatar
                                                                        variant={"rounded"}
                                                                        key={`producto-${imageItem.id}`}
                                                                        alt={`producto-${imageItem.id}`}
                                                                        src={imageItem.fileUrl!}
                                                                        sx={{cursor: "pointer", border: "1px solid lightblue"}}
                                                                    />
                                                                )}
                                                            </AvatarGroup>
                                                        </Box>
                                                    )
                                                }

                                                <Box display={"flex"} justifyContent={"center"}>
                                                    {row.name}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                {row.departments?.name}
                                            </TableCell>

                                            <TableCell>
                                                <Grid container rowSpacing={1}>
                                                    <Grid item xs={12}>
                                                        <div
                                                            onClick={(e: any) => {
                                                                e.stopPropagation()
                                                                setActiveModalPrice({ active: true, storeDepot: { ...row.depots[0].store_depots[0] } })
                                                            }}
                                                        >
                                                            <MoneyInfoTag
                                                                value={displayProductPrice}
                                                                errorColor={!baseProductPrice}
                                                            />
                                                        </div>

                                                        {row.depots[0].store_depots[0]._count.product_offers > 0 && (
                                                            <DescriptionOutlined fontSize={"small"} />
                                                        )}
                                                    </Grid>

                                                    {
                                                        displayPriceDiscount && (
                                                            <Grid item xs={12}>
                                                                <div
                                                                    onClick={(e: any) => {
                                                                        e.stopPropagation()
                                                                        setActiveModalPrice({
                                                                            active: true,
                                                                            storeDepot: {...row.depots[0].store_depots[0]}
                                                                        })
                                                                    }}
                                                                >
                                                                    <InfoTag value={`- ${displayPriceDiscount}`}/>
                                                                </div>
                                                            </Grid>
                                                        )
                                                    }
                                                </Grid>
                                            </TableCell>

                                            <TableCell>
                                                <Grid container rowSpacing={1}>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        {`${row.depots[0].store_depots[0].product_remaining_units} de ${row.depots[0].store_depots[0].product_units} `}
                                                    </Grid>

                                                    <Grid container item xs={12} justifyContent={"center"} flexWrap={"nowrap"}>
                                                        <IconButton
                                                            size={"small"}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setActiveModalTransferUnits(true);
                                                                setSelectedRowInd(index)
                                                            }}>
                                                            <SwapHoriz />
                                                        </IconButton>

                                                        <IconButton
                                                            size={"small"}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setActiveModalEditUnits(true);
                                                                setSelectedRowInd(index)
                                                            }}>
                                                            <EditOutlined/>
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </TableCell>

                                            <TableCell>
                                                <Grid container>
                                                    <Grid container item xs={12} justifyContent={"center"} flexWrap={"nowrap"} sx={{whiteSpace: "nowrap"}}>
                                                        <Typography variant={"button"}>
                                                            {row.depots[0].store_depots[0].is_active
                                                                ? "en venta"
                                                                : "inactivo"
                                                            }
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        <Switch
                                                            size='small'
                                                            checked={row.depots[0].store_depots[0].is_active}
                                                            color={'success'}
                                                            disabled={!baseProductPrice}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                return updateProductActive(row.depots[0].store_depots[0])
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
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
                                            <TableCell style={{ padding: 0 }} colSpan={6}>
                                                {showDetails === row.id && (
                                                    <StoreMoreDetails
                                                        userId={userId}
                                                        details={row.depots[0].store_depots[0]}
                                                        show={(showDetails === row.id)}
                                                        loadDates={loadDates}
                                                        row={row}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                )
                            })}
            </TableBody>
        )
    }

    async function handleSelectFilter(index: number) {
        let filters: any = [...allProductsByDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductsByDepartment(filters)
    }

    const DepartmentsFilter = ({ formik }: { formik: any }) => {
        const [displaySearchBar, setDisplaySearchBar] = React.useState(false)

        return (
            <Card variant={"outlined"} sx={{ padding: "15px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2} flexWrap={"nowrap"} sx={{overflowX: "auto", py: "7px"}}>
                        {
                            allProductsByDepartment.map((item: any, index: number) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <DepartmentCustomButton
                                        title={item.name}
                                        subtitle={`${item.products.length} productos`}
                                        selected={item.selected}
                                        onClick={() => handleSelectFilter(index)}
                                    />
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
                                        <IconButton
                                            onClick={() => setDisplaySearchBar(!displaySearchBar)}
                                            sx={{ ml: "5px" }}
                                        >
                                            {displaySearchBar
                                                ? <ExpandMoreOutlined fontSize={"small"} />
                                                : <ExpandLessOutlined fontSize={"small"} />
                                            }
                                        </IconButton>
                                    </Typography>
                                </Grid>

                                {
                                    displaySearchBar && (
                                        <Grid item xs={12}>
                                            <TextField
                                                name={"handleChangeSearchBarValue"}
                                                placeholder="Buscar producto..."
                                                size={"small"}
                                                fullWidth
                                                {...formik.getFieldProps("searchBarValue")}
                                            />
                                        </Grid>
                                    )
                                }
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

                        <ImagesDisplayDialog
                            open={openImageDialog}
                            setOpen={setOpenImageDialog}
                            images={dialogImages}
                        />

                        <StoreModalPrice
                            dialogTitle={"Editar Precio"}
                            open={activeModalPrice.active}
                            setOpen={setActiveModalPrice}
                        >
                            <StoreEditPrice userId={userId} storeDepot={activeModalPrice.storeDepot} setActiveModalPrice={setActiveModalPrice} loadDates={loadDates} />
                        </StoreModalPrice>

                        <StoreModalDefault
                            dialogTitle={"Modificar unidades"}
                            open={activeModalTransferUnits ? false : activeModalEditUnits}
                            setOpen={setActiveModalEditUnits}
                        >
                            <StoreEditUnits
                                dataRow={data[selectedRowInd]?.depots[0].store_depots[0]}
                                setActiveModalEditUnits={setActiveModalEditUnits}
                                setActiveModalTransferUnits={setActiveModalTransferUnits}
                                loadDates={loadDates}
                                userId={userId}
                            />
                        </StoreModalDefault>

                        <StoreModalDefault
                            dialogTitle={"Transferir unidades"}
                            open={activeModalTransferUnits}
                            setOpen={setActiveModalTransferUnits}
                        >
                            <TransferUnits
                                nameStore={dataStore.name}
                                storeDepot={data[selectedRowInd]?.depots[0].store_depots[0]}
                                productId={data[selectedRowInd]?.depots[0].product_id}
                                setActiveTransferUnits={setActiveModalTransferUnits}
                                loadDates={loadDates}
                                userId={userId}
                            />
                        </StoreModalDefault>

                        <ModalAddProductFromWarehouse
                            dialogTitle={"Agregar productos"}
                            open={activeAddProductFromWarehouse}
                            setOpen={setActiveAddProductFromWarehouse}
                            loadData={loadDates}
                        >
                            <AddProductFromWarehouse userId={userId} dataStore={dataStore} warehouseId={null} />
                        </ModalAddProductFromWarehouse>

                        <CardContent>
                            {
                                allProductsByDepartment.length > 0 && (
                                    <DepartmentsFilter formik={formik} />
                                )
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <TableContainer sx={{width: "100%", overflowX: "auto"}}>
                                            <Table sx={{ width: "100%" }} size={"small"}>
                                                <TableHeader />

                                                <TableContent formik={formik} />
                                            </Table>
                                        </TableContainer>
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