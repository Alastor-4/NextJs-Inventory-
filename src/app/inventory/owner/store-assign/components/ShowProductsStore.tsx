"use client"

import {
    Avatar, AvatarGroup, Button, Card, CardContent, Collapse,
    Grid, IconButton, InputBase, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Typography
} from '@mui/material';
import ModalAddProductFromWarehouse from '../addProductFromWarehouse/components/ModalAddProductFromWarehouse';
import { EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, FilterAlt, HelpOutline, RemoveOutlined, } from '@mui/icons-material';
import { ShowProductsStoreProps, allProductsByDepartmentProps, productsProps } from '@/types/interfaces';
import AddProductFromWarehouse from '../addProductFromWarehouse/components/AddProductFromWarehouse';
import FilterProductsByDepartmentsModal from '@/components/modals/FilterProductsByDepartmentsModal';
import { transactionToStore, transactionToWarehouse } from '@/utils/generalFunctions';
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog';
import { characteristics, depots, images } from '@prisma/client';
import ModalStoreAssign from './Modal/ModalStoreAssign';
import { TableNoData } from "@/components/TableNoData";
import ManageQuantity from './Modal/ManageQuantity';
import SearchIcon from '@mui/icons-material/Search';
import InfoTooltip from '@/components/InfoTooltip';
import storeAssign from '../requests/store-assign';
import React, { useEffect, useState } from 'react'
import { AxiosResponse } from 'axios';
import { Formik } from 'formik';

const ShowProductsStore = ({ dataStore, dataWarehouse, userId }: ShowProductsStoreProps) => {
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<allProductsByDepartmentProps[] | null>(null);

    const [activeManageQuantity, setActiveManageQuantity] = useState(false);
    const [showDetails, setShowDetails] = useState<number>(-1);

    const [activeAddProductFromWarehouse, setActiveAddProductFromWarehouse] = useState<boolean>(false);

    const [openImagesDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images);
        setOpenImagesDialog(true);
    }

    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const toggleModalFilter = () => setIsFilterModalOpen(!isFilterModalOpen);


    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    useEffect(() => {
        setAllProductsByDepartment(null);
    }, [dataStore?.id]);

    //GET initial products data
    useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await storeAssign.allProductsByDepartmentStore(dataStore?.id);
            if (newAllProductsByDepartment) {
                setAllProductsByDepartment(newAllProductsByDepartment?.map((productsByDepartments: allProductsByDepartmentProps) => ({
                    ...productsByDepartments,
                    selected: false
                })));
                setSelectedProduct(null);
            }
        }
        getAllProductsByDepartment();
    }, [dataStore?.id]);

    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];
            let bool = false;
            if (selectedDepartments) {
                for (const department of selectedDepartments!) if (department.selected === true) bool = true;
            }
            allProductsByDepartment?.forEach((productsByDepartments) => {
                if (!selectedDepartments || selectedDepartments?.length! === 0 || !bool) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
                if (selectedDepartments?.length! > 0 && bool) {
                    if (productsByDepartments.selected) {
                        allProducts = [...allProducts, ...productsByDepartments.products!];
                    }
                }
            });

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0
            });

            setDataProducts(allProducts);
        } else {
            setDataProducts(null);
        }
    }, [allProductsByDepartment, selectedDepartments]);

    const loadData = async () => {
        let newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await storeAssign.allProductsByDepartmentStore(dataStore?.id);
        setSelectedDepartments(null)
        if (newAllProductsByDepartment) {
            newAllProductsByDepartment = newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => ({
                ...productsByDepartments,
                selected: (selectedDepartments?.includes(productsByDepartments))
            }))
            setAllProductsByDepartment(newAllProductsByDepartment);
        }
    }

    //Objetivo: crea un registro en la bd de cada transaccion q se hace
    // direction es true si las unidades transferidas se le suamn al almacen
    //           es false en caso contrario  
    const recordTransaction = async (direction: boolean, transferredUnits: number) => {
        const data = {
            store_depot_id: selectedProduct!.depots![0].store_depots![0].id,
            units_transferred_quantity: transferredUnits,
            transfer_direction: direction ? transactionToWarehouse : transactionToStore
        }
        const response = await storeAssign.createTransaction(data);

        return response ? true : false;
    }

    const updateDepot = async (addUnits: number, depot: depots) => {
        depot.product_total_remaining_units! += addUnits;
        const result: boolean | AxiosResponse = await storeAssign.updateProductWarehouse(depot);
        if (!result) return;
        if (result.status === 200) {

            const correctTransaction = await recordTransaction(addUnits > 0 ? true : false, Math.abs(addUnits));

            if (correctTransaction) loadData();
        }
    }
    // No borra el elemento de la tabla sino q cambia el valor
    // de product_units a -1 para q no c filtre y asi conservar los datos
    const removeProduct = async (index: number) => {
        if (!dataProducts) return;
        const newProduct = dataProducts[index];
        setSelectedProduct(newProduct);
        const newProductStoreDepots = newProduct.depots![0].store_depots![0];
        const updateData = {
            id: newProductStoreDepots.id,
            storeId: newProductStoreDepots.store_id,
            depotId: newProductStoreDepots.depot_id,
            product_units: -1,
            product_remaining_units: 0,
            sell_price: newProductStoreDepots.sell_price,
            sell_price_unit: newProductStoreDepots.sell_price_unit,
            price_discount_percentage: newProductStoreDepots.price_discount_percentage,
            price_discount_quantity: newProductStoreDepots.price_discount_quantity,
            seller_profit_percentage: newProductStoreDepots.seller_profit_percentage,
            seller_profit_quantity: newProductStoreDepots.seller_profit_quantity,
            is_active: newProductStoreDepots.is_active,
        }

        const result: boolean | AxiosResponse = await storeAssign.updateProductStore(updateData);
        if (!result) return;

        if (result.status === 200) {
            await updateDepot(dataProducts[index].depots![0].store_depots![0].product_remaining_units!, dataProducts[index].depots![0]);
        }
    }

    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
            },
            {
                id: "store_units",
                label: "Unidades restantes",
            },
            {
                id: "remove",
                label: "Retirar al almacén",
            },
            {
                id: "more_details",
                label: "",
            },
        ];

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

    const TableContent = ({ formik }: any) => {
        return (
            <TableBody>
                {dataProducts?.filter(
                    (product: productsProps) =>
                        product.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (product: productsProps, index: number) => (
                                <React.Fragment key={product.id}>
                                    <TableRow
                                        key={product.id}
                                        hover
                                        tabIndex={-1}
                                        onClick={() => setShowDetails((showDetails !== index) ? index : -1)}
                                    >
                                        <TableCell>
                                            <Grid container>
                                                {
                                                    product.images?.length! > 0 && (
                                                        <Grid container item xs={12} justifyContent={"center"}>
                                                            <AvatarGroup
                                                                max={3}
                                                                sx={{ flexDirection: "row", width: "fit-content" }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleOpenImagesDialog(product.images!)
                                                                }}
                                                            >
                                                                {product.images!.map(
                                                                    imageItem => <Avatar
                                                                        variant={"rounded"}
                                                                        key={`producto-${imageItem.id}`}
                                                                        alt={`producto-${imageItem.id}`}
                                                                        src={imageItem.fileUrl!}
                                                                        sx={{ cursor: "pointer", border: "1px solid lightblue" }}
                                                                    />
                                                                )}
                                                            </AvatarGroup>
                                                        </Grid>
                                                    )
                                                }

                                                <Grid container item xs={12} justifyContent={"center"}>
                                                    {product.name}
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            <Grid container columnSpacing={1}>
                                                <Grid item >
                                                    {product.depots![0].store_depots![0].product_remaining_units}
                                                </Grid>

                                                <Grid item>
                                                    <IconButton
                                                        sx={{ padding: 0 }}
                                                        size='small'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveManageQuantity(true);
                                                            setSelectedProduct(product);
                                                        }}
                                                    >
                                                        <EditOutlined fontSize="small" color='primary' />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell >
                                            <IconButton color={"primary"} onClick={(e) => {
                                                e.stopPropagation();
                                                removeProduct(index);
                                            }}>
                                                <RemoveOutlined />
                                            </IconButton>
                                        </TableCell>

                                        <TableCell style={{ padding: 0 }} colSpan={5}>
                                            <Tooltip title={"Detalles"}>
                                                <IconButton
                                                    size={"small"}
                                                    sx={{ m: "3px" }}
                                                    onClick={() => setShowDetails((showDetails !== index) ? index : -1)}
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
                                                                {product.name}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                            <Grid item xs={true}>
                                                                {product.description ?? "-"}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                            <Grid item xs={true}>
                                                                {product.departments?.name}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                            <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                                {product.characteristics?.length! > 0
                                                                    ? product.characteristics?.map((characteristics: characteristics) => (
                                                                        <Grid
                                                                            key={characteristics.id}
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
                                                                                    {characteristics.name?.toUpperCase()}
                                                                                </Typography>
                                                                            </Grid>
                                                                            <Grid container item alignItems={"center"}
                                                                                sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                                {characteristics.value}
                                                                            </Grid>
                                                                        </Grid>
                                                                    )
                                                                    ) : "-"
                                                                }
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades en tienda:</Grid>
                                                            <Grid item xs={true}>
                                                                {product.depots![0].store_depots![0].product_remaining_units}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Total de unidades ingresadas:</Grid>
                                                            <Grid item xs={true}>
                                                                {product.depots![0].store_depots![0].product_units}
                                                            </Grid>
                                                        </Grid>

                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades en almacén</Grid>
                                                            <Grid item xs={true}>
                                                                {product.depots![0].product_total_remaining_units}
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

    return (
        <Formik
            initialValues={{ searchBarValue: "" }}
            onSubmit={() => { }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <FilterProductsByDepartmentsModal
                            allProductsByDepartment={allProductsByDepartment!}
                            setSelectedDepartments={setSelectedDepartments}
                            isFilterModalOpen={isFilterModalOpen}
                            toggleModalFilter={toggleModalFilter}
                        />
                        <ModalStoreAssign
                            dialogTitle={"Administrar cantidad del producto"}
                            open={activeManageQuantity}
                            setOpen={setActiveManageQuantity}
                        >
                            <ManageQuantity
                                userId={userId!}
                                nameStore={dataStore?.name!}
                                nameWarehouse={dataWarehouse?.name!}
                                productDetails={selectedProduct!}
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
                            <AddProductFromWarehouse dataStore={dataStore} warehouseId={dataWarehouse?.id} />
                        </ModalAddProductFromWarehouse>

                        <ImagesDisplayDialog
                            open={openImagesDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

                        <CardContent>
                            <Grid container item xs={12} justifyContent={"space-between"}>
                                <Grid item xs={6} md={10}>
                                    <Typography variant={"subtitle1"}>Productos en tienda</Typography>
                                </Grid>
                                <Grid item xs={6} md={2}>
                                    <Button size={"small"} variant={"contained"} onClick={() => setActiveAddProductFromWarehouse(true)}>
                                        Agregar nuevo
                                    </Button>
                                </Grid>
                            </Grid>
                            <Card variant={"outlined"} sx={{ padding: "10px", marginY: "10px" }}>
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
                                                    placeholder="Buscar depósito..."
                                                    inputProps={{ 'aria-label': 'search' }}
                                                    {...formik.getFieldProps("searchBarValue")}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={"auto"} md={4} justifyContent={"center"}>
                                        <Button size="small" color="primary" onClick={toggleModalFilter} startIcon={<FilterAlt />} variant="outlined">Filtrar</Button>
                                    </Grid>
                                </Grid>
                            </Card>
                            <Card variant={"outlined"} sx={{ paddingTop: "20px" }}>
                                <Grid container rowSpacing={2}>
                                    {
                                        dataProducts?.length! > 0
                                            ? (dataProducts?.filter(
                                                (product: productsProps) =>
                                                    product?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                                                    product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).length! > 0 ?
                                                (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                                    <Table sx={{ width: "100%" }} size={"small"}>
                                                        <TableHeader />
                                                        <TableContent formik={formik} />
                                                    </Table>
                                                </TableContainer>) : <TableNoData searchCoincidence />
                                            ) : (
                                                <TableNoData hasData={dataStore?.store_depots?.length!} />
                                                // hasData={depotsInWarehouses}
                                            )
                                    }
                                </Grid>
                            </Card>
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}

export default ShowProductsStore