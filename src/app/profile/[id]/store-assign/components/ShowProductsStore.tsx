// @ts-nocheck
"use client"

import React, { useEffect, useState } from 'react'
import storeAssign from '@/app/profile/[id]/store-assign/requests/store-assign';
import { TableNoData } from "@/components/TableNoData";
import { useParams } from 'next/navigation';
import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import {
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    RemoveOutlined,
    VisibilityOutlined
} from '@mui/icons-material';
import { Formik } from 'formik';
import ModalStoreAssign from './Modal/ModalStoreAssign';
import ManageQuantity from './Modal/ManageQuantity';
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog';
import AddProductFromWarehouse from '../addProductFromWarehouse/components/AddProductFromWarehouse';
import ModalAddProductFromWarehouse from '../addProductFromWarehouse/components/ModalAddProductFromWarehouse.tsx';

function ShowProductsStore(props: any) {

    const { storeId, nameStore, dataStore, nameWarehouse, warehouseId } = props;

    const params = useParams()

    const [allProductStore, setAllProductStore] = useState(null);
    const [data, setData] = useState()

    const [activeManageQuantity, setActiveManageQuantity] = useState(false);
    const [showDetails, setShowDetails] = useState();

    const [activeAddProductFromWarehouse, setActiveAddProductFromWarehouse] = useState(false)

    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [dialogImages, setDialogImages] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState();

    useEffect(() => {
        setAllProductStore(null);
    }, [storeId])

    useEffect(() => {
        const data = async () => {
            const result = await storeAssign.allProductsByDepartmentStore(params.id, storeId)
            setAllProductStore(() => result.map(data => ({
                ...data,
                selected: false
            })));
        }

        if (allProductStore === null) {
            data()
        }
    }, [allProductStore, params.id, setAllProductStore, storeId])


    useEffect(() => {
        if (allProductStore !== null) {

            let allProducts = []

            allProductStore.forEach((departmentItem) => {
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

    }, [allProductStore, setData])


    async function handleSelectFilter(index: number) {
        let filters = [...allProductStore]
        filters[index].selected = !filters[index].selected

        setAllProductStore(filters)
    }

    const DepartmentsFilter = ({ formik }) => {
        return (
            <Card variant={"outlined"} sx={{ padding: "15px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                            <IconButton
                                onClick={() => setDisplayFilterSection(!displayFilterSection)}
                                sx={{ ml: "5px" }}
                            >
                                {displayFilterSection
                                    ? <ExpandMoreOutlined fontSize={"small"} />
                                    : <ExpandLessOutlined fontSize={"small"} />
                                }
                            </IconButton>
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2}>
                        {
                            displayFilterSection && allProductStore.map((item, index) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <Button
                                        variant={item.selected ? "contained" : "outlined"}
                                        onClick={() => handleSelectFilter(index)}
                                        size={"small"}
                                        sx={{ padding: "5px 0" }}
                                    >
                                        <Grid container>
                                            <Grid item xs={12}>
                                                {item.name}
                                            </Grid>
                                            <Grid item xs={12}>
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
                                        Puede buscar productos por nombre o descripción en los departamentos seleccionados
                                        aquí
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
        searchBarValue: "",
    }


    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "store_units",
                label: "Unidades restantes",
                align: "left"
            },
            {
                id: "remove",
                label: "Retirar al almacén",
                align: "left"
            },
            {
                id: "more_details",
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
    const loadData = async () => {
        let newAllProductStore = await storeAssign.allProductsByDepartmentStore(params.id, storeId);

        let selectedDepartment = allProductStore.filter(element => (element.selected)).map(element => element.id)

        newAllProductStore = newAllProductStore.map(element => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductStore(newAllProductStore);
    }

    const updateDepot = async (addUnits, depot) => {
        depot.product_total_remaining_units += addUnits;
        const result = await storeAssign.updateProductWarehouse(params.id, depot)
        if (result.status === 200) {
            loadData();
        }
    }
    // No borra el elemento de la tabla sino q cambia el valor
    // de product_units a -1 para q no c filtre y asi conservar los datos
    const removeProduct = async (index) => {
        const newProductStoreDepots = data[index].depots[0].store_depots[0];
        const updateData = {
            id: newProductStoreDepots.id,
            storeId: newProductStoreDepots.store_id,
            depotId: newProductStoreDepots.depot_id,
            product_units: -1,
            product_remaining_units: 0,
            sell_price: newProductStoreDepots.sell_price,
            sell_price_units: newProductStoreDepots.sell_price_units,
            price_discount_percentage: newProductStoreDepots.price_discount_percentage,
            price_discount_quantity: newProductStoreDepots.price_discount_quantity,
            seller_profit_percentage: newProductStoreDepots.seller_profit_percentage,
            seller_profit_quantity: newProductStoreDepots.seller_profit_quantity,
            is_active: newProductStoreDepots.is_active,
        }

        const result = await storeAssign.updateProductStore(params.id, updateData)

        if (result === 200) {
            await updateDepot(data[index].depots[0].store_depots[0].product_remaining_units, data[index].depots[0]);
        }
    }

    function handleOpenImagesDialog(images) {
        setDialogImages(images)
        setOpenImageDialog(true)
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
                                        key={row.id}
                                        hover
                                        tabIndex={-1}
                                    >
                                        <TableCell>
                                            {row.name}
                                            <br />
                                            {
                                                row.description && (
                                                    <small>
                                                        {` ${row.description}`}
                                                    </small>
                                                )
                                            }
                                        </TableCell>

                                        <TableCell>
                                            <Grid container columnSpacing={1}>
                                                <Grid item >
                                                    {row.depots[0].store_depots[0].product_remaining_units}
                                                </Grid>

                                                <Grid item>
                                                    <IconButton sx={{ padding: 0 }} size='small' onClick={() => {
                                                        setActiveManageQuantity(true)
                                                        setSelectedProduct(row)
                                                    }}
                                                    >
                                                        <EditOutlined fontSize="small" color='primary' />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell >
                                            <IconButton color={"primary"} onClick={() => removeProduct(index)}>
                                                <RemoveOutlined />
                                            </IconButton>
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
                                                <Collapse in={showDetails === index} timeout="auto" unmountOnExit>
                                                    <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                                        <Grid item xs={12}>

                                                            <Typography variant="subtitle1" gutterBottom component="div">
                                                                Detalles:
                                                            </Typography>
                                                        </Grid>


                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Nombre:</Grid>
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
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                            <Grid item xs={true}>
                                                                {row.departments.name}
                                                            </Grid>
                                                        </Grid>


                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                            <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
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
                                                                    )
                                                                    ) : "-"
                                                                }
                                                            </Grid>
                                                        </Grid>


                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Imágenes:</Grid>
                                                            <Grid item xs={true}>
                                                                {
                                                                    row.images.length > 0
                                                                        ? (
                                                                            <Box
                                                                                sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue" }}
                                                                                onClick={() => handleOpenImagesDialog(row.images)}
                                                                            >
                                                                                {row.images.length}

                                                                                <VisibilityOutlined fontSize={"small"}
                                                                                    sx={{ ml: "5px" }} />
                                                                            </Box>
                                                                        ) : "no"
                                                                }
                                                            </Grid>
                                                        </Grid>


                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades en tienda:</Grid>
                                                            <Grid item xs={true}>
                                                                {row.depots[0].store_depots[0].product_remaining_units}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Total histórico de unidades ingresadas:</Grid>
                                                            <Grid item xs={true}>
                                                                {row.depots[0].store_depots[0].product_units}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>{`Unidades en almacén (${nameWarehouse}):`}</Grid>
                                                            <Grid item xs={true}>
                                                                {row.depots[0].product_total_remaining_units}
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Collapse>
                                            )
                                            }
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
            </TableBody>
        )
    }

    const [displayFilterSection, setDisplayFilterSection] = React.useState(true)

    return (
        <div>
            <Formik
                initialValues={initialValues}
                onSubmit={() => {

                }}
            >
                {
                    (formik) => (
                        <Card variant={"outlined"}>
                            <ModalStoreAssign
                                dialogTitle={"Administrar la cantidad del producto"}
                                open={activeManageQuantity}
                                setOpen={setActiveManageQuantity}
                            >
                                <ManageQuantity
                                    nameStore={nameStore}
                                    nameWarehouse={nameWarehouse}
                                    productDetails={selectedProduct}
                                    updateDepot={updateDepot}
                                    setActiveManageQuantity={setActiveManageQuantity}
                                />
                            </ModalStoreAssign>

                            <ModalAddProductFromWarehouse
                                dialogTitle={"Agregar productos"}
                                open={activeAddProductFromWarehouse}
                                setOpen={setActiveAddProductFromWarehouse}
                                loadData={loadData}
                            >
                                <AddProductFromWarehouse dataStore={dataStore} warehouseId={warehouseId} />
                            </ModalAddProductFromWarehouse>

                            <ImagesDisplayDialog
                                dialogTitle={"Imágenes del producto"}
                                open={openImageDialog}
                                setOpen={setOpenImageDialog}
                                images={dialogImages}
                            />

                            <CardContent>
                                <Grid container rowSpacing={2}>
                                    <Grid container item xs={12} justifyContent={"space-between"}>
                                        <Typography variant={"subtitle1"}>Productos en tienda</Typography>
                                        <Button size={"small"} variant={"contained"} onClick={() => setActiveAddProductFromWarehouse(true)}>
                                            Agregar nuevo
                                        </Button>
                                    </Grid>

                                    {
                                        Array.isArray(allProductStore) && allProductStore.length > 0 && (
                                            <Grid item xs={12}>
                                                <DepartmentsFilter formik={formik} />
                                            </Grid>
                                        )
                                    }

                                    <Grid item xs={12}>
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
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )
                }
            </Formik>
        </div>
    )
}

export default ShowProductsStore
