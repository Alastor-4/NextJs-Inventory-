"use client"

import {
    Avatar, AvatarGroup, Button, Card, CardContent, Collapse,
    Grid, IconButton, InputBase, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography
} from '@mui/material';
import ModalAddProductFromWarehouse from '../addProductFromWarehouse/components/ModalAddProductFromWarehouse';
import {
    AddOutlined,
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    FilterAlt,
    HelpOutline,
    RemoveOutlined,
} from '@mui/icons-material';
import { ShowProductsStoreProps, allProductsByDepartmentProps, productsProps } from '@/types/interfaces';
import AddProductFromWarehouse from '../addProductFromWarehouse/components/AddProductFromWarehouse';
import FilterProductsByDepartmentsModal from '@/components/modals/FilterProductsByDepartmentsModal';
import { transactionToStore, transactionToWarehouse } from '@/utils/generalFunctions';
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog';
import { characteristics, depots, images } from '@prisma/client';
import ModalStoreAssign from './Modal/ModalStoreAssign';
import { TableNoData } from "@/components/TableNoData";
import SearchIcon from '@mui/icons-material/Search';
import InfoTooltip from '@/components/InfoTooltip';
import storeAssign from '../requests/store-assign';
import React, { useEffect, useState } from 'react'
import { grey } from '@mui/material/colors';
import { AxiosResponse } from 'axios';
import { Formik } from 'formik';

const ShowProductsStore = ({ dataStore, dataWarehouse, userId }: ShowProductsStoreProps) => {
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
    const [depotsInStore, setDepotsInStore] = useState<number | null>(dataStore?.store_depots?.length!);
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
    const toggleModalFilter = () => {
        if (!dataProducts) return;
        setIsFilterModalOpen(!isFilterModalOpen);
    }

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
    }, [dataStore?.id, dataStore]);

    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];

            allProductsByDepartment.forEach((productsByDepartments) => {
                //when there are no filters applied all departments are returned
                if (!filtersApplied || productsByDepartments.selected) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
            });

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        } else {
            setDepotsInStore(null);
            setDataProducts(null);
        }
    }, [allProductsByDepartment, filtersApplied]);

    const loadData = async () => {
        let newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await storeAssign.allProductsByDepartmentStore(dataStore?.id);
        if (newAllProductsByDepartment) {
            newAllProductsByDepartment = newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => {
                //search if current department was selected in previous data to keep selection

                let oldDepartmentSelected = false

                const oldDepartmentIndex = allProductsByDepartment?.findIndex((productsByDepartmentItem: allProductsByDepartmentProps) => productsByDepartmentItem.id === productsByDepartments.id)
                if (oldDepartmentIndex! > -1 && allProductsByDepartment![oldDepartmentIndex!].selected) {
                    oldDepartmentSelected = true
                }

                return (
                    {
                        ...productsByDepartments,
                        selected: oldDepartmentSelected
                    }
                )
            })

            setAllProductsByDepartment(newAllProductsByDepartment);
        }
    }

    //Objetivo: crea un registro en la bd de cada transaccion q se hace
    // direction es true si las unidades transferidas se le suamn al almacen
    //           es false en caso contrario  
    const recordTransaction = async (direction: boolean, transferredUnits: number, product?: productsProps) => {
        const data = {
            store_depot_id: product ? product!.depots![0].store_depots![0].id : selectedProduct!.depots![0].store_depots![0].id,
            units_transferred_quantity: transferredUnits,
            transfer_direction: direction ? transactionToWarehouse : transactionToStore
        }
        const response = await storeAssign.createTransaction(data);

        return response ? true : false;
    }

    const updateDepot = async (addUnits: number, depot: depots, product?: productsProps) => {
        depot.product_total_remaining_units! += addUnits;
        const result: boolean | AxiosResponse = await storeAssign.updateProductWarehouse(depot);
        if (!result) return;
        if (result.status === 200) {

            const correctTransaction = await recordTransaction(addUnits > 0 ? true : false, Math.abs(addUnits), product);

            if (correctTransaction) loadData();
        }
    }
    // No borra el elemento de la tabla sino q cambia el valor
    // de product_units a -1 para q no c filtre y asi conservar los datos
    const removeProduct = async (index: number) => {
        if (!dataProducts) return;
        const newProduct = dataProducts[index];
        const newProductStoreDepots = newProduct.depots![0].store_depots![0];
        const updateData = { ...newProductStoreDepots, product_units: -1 }

        const result: boolean | AxiosResponse = await storeAssign.updateProductStore(updateData);
        if (!result) return;

        if (result.status === 200) {
            await updateDepot(dataProducts[index].depots![0].store_depots![0].product_remaining_units!, dataProducts[index].depots![0], newProduct);
        }
    }

    const TableHeader = () => {
        const headCells = [
            {
                id: "more_details",
                label: "",
                padding: "checkbox"
            },
            {
                id: "name",
                label: "Nombre",
            },
            {
                id: "store_units",
                label: "Unidades",
            },
            {
                id: "remove",
                label: "Retirar",
            },
        ];

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            // @ts-ignore
                            padding={headCell.padding ? headCell.padding : "normal"}
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
                                        <TableCell style={{ padding: 0 }}>
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
                                        </TableCell>

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
                                            <IconButton color={"warning"} onClick={(e) => {
                                                e.stopPropagation();
                                                removeProduct(index);
                                            }}>
                                                <RemoveOutlined />
                                            </IconButton>
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
                        {
                            isFilterModalOpen && allProductsByDepartment?.length && (
                                <FilterProductsByDepartmentsModal
                                    allProductsByDepartment={allProductsByDepartment!}
                                    setAllProductsByDepartment={setAllProductsByDepartment}
                                    setFiltersApplied={setFiltersApplied}
                                    isFilterModalOpen={isFilterModalOpen}
                                    toggleModalFilter={toggleModalFilter}
                                />
                            )
                        }

                        {selectedProduct && <ModalStoreAssign
                            dialogTitle={"Trasladar productos"}
                            open={activeManageQuantity}
                            setOpen={setActiveManageQuantity}
                            nameStore={dataStore?.name!}
                            nameWarehouse={dataWarehouse?.name!}
                            productDetails={selectedProduct!}
                            updateDepot={updateDepot}
                            setActiveManageQuantity={setActiveManageQuantity}
                        />}

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

                        <CardContent sx={{ padding: "7px" }}>
                            <Grid container item xs={12} justifyContent={"space-between"}>
                                <Grid item xs={8} md={10}>
                                    <Typography variant={"subtitle1"}>Productos en tienda</Typography>
                                </Grid>
                                <Grid item xs={4} md={2}>
                                    <Button
                                        size={"small"}
                                        variant={"contained"}
                                        startIcon={<AddOutlined fontSize={"small"} />}
                                        onClick={() => setActiveAddProductFromWarehouse(true)}
                                    >
                                        Nuevo
                                    </Button>
                                </Grid>
                            </Grid>
                            <Card variant={"outlined"} sx={{ padding: "10px", mt: "10px", mb: "20px" }}>
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
                                            }} onClick={toggleModalFilter} startIcon={<FilterAlt />} variant="outlined">Filtrar</Button>
                                    </Grid>
                                </Grid>
                            </Card>
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
                                            <TableNoData hasData={depotsInStore!} />
                                        )
                                }
                            </Grid>
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}

export default ShowProductsStore