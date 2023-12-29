"use client"

import React, { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import {
    Add,
    AddOutlined,
    ArrowLeft,
    ChevronRightOutlined,
    DeleteOutline,
    Done,
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    ShareOutlined,
    VisibilityOutlined,
} from "@mui/icons-material";
import { characteristics, departments, depots, images, store_depots, warehouses } from "@prisma/client";
import DepartmentCustomButton from "@/components/DepartmentCustomButton";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import UpdateValueDialog from "@/components/UpdateValueDialog";
import warehouseDepots from "../requests/warehouseDepots";
import { handleKeyDown } from "@/utils/handleKeyDown";
import tableStyles from "@/assets/styles/tableStyles";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { Formik } from "formik";
import Link from "next/link";
import * as Yup from "yup";
import dayjs from "dayjs";
import ModalAddProduct from "./ModalAddProduct";
import UserWarehouseForm from "./UserWarehouseForm";

interface UserWarehouseMainTableProps {
    ownerId?: number;
    warehouseDetails?: warehouses | null;
}

interface productsProps {
    id: number;
    department_id: number | null;
    owner_id: number | null;
    name: string | null;
    description: string | null;
    buy_price: number | null;
    created_at: Date;
    depots?: depots[];
    departments?: departments;
    images?: images[];
    characteristics?: characteristics[];
    storesDistribution?: {
        id: number;
        owner_id: number | null;
        name: string | null;
        description: string | null;
        slogan: string | null;
        address: string | null;
        seller_user_id: number | null;
        created_at: Date;
        online_reservation: boolean | null;
        online_catalog: boolean | null;
        auto_open_time: boolean | null;
        auto_reservation_time: boolean | null;
        fixed_seller_profit_percentage: number | null;
        fixed_seller_profit_quantity: number | null;
        fixed_seller_profit_unit: string | null;
        store_depots?: store_depots[];
    }[];
}

export default function UserWarehouseMainTable({ ownerId, warehouseDetails }: UserWarehouseMainTableProps) {

    const router = useRouter();

    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [depositsByDepartment, setDepositsByDepartment] = useState<(departments & { products?: productsProps[], selected?: boolean })[] | null>(null);

    const [activeModalAddProduct, setActiveModalAddProduct] = useState(false)

    const [forceRender, setForceRender] = useState(true)
    //GET initial products data
    useEffect(() => {
        const getDepositsByDepartament = async () => {
            const newDepositsByDepartment: (departments & { products?: productsProps[], selected?: boolean })[] = await warehouseDepots.allDepots(ownerId!, warehouseDetails?.id!);
            setDepositsByDepartment(newDepositsByDepartment?.map((departments: (departments & { products?: productsProps[], selected?: boolean })) => (
                {
                    ...departments,
                    selected: false
                })));
            setForceRender(false)
        }
        if (forceRender) {
            getDepositsByDepartament();
        }
    }, [ownerId, warehouseDetails, forceRender]);

    useEffect(() => {
        if (depositsByDepartment?.length) {
            let allProducts: productsProps[] = [];

            depositsByDepartment.forEach((departmentItem) => {
                if (departmentItem.selected) {
                    allProducts = [...allProducts, ...departmentItem.products!]
                }
            });

            allProducts.sort((a, b) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0
            });

            setDataProducts(allProducts);
        } else {
            setDataProducts(null);
        }
    }, [depositsByDepartment]);


    const initialValues = {
        searchBarValue: "",
        productNewUnitsQuantity: 0,
        productUpdateUnitsQuantity: {
            newTotal: "",
            newRemaining: "",
        },
        productStoreDepotDistribution: {
            warehouseQuantity: "",
            storeQuantity: "",
            moveFromWarehouseToStoreQuantity: "",
            moveFromStoreToWarehouseQuantity: "",
        },
    }

    const validationSchema = Yup.object({
        searchBarValue: Yup.string(),
        productNewUnitsQuantity: Yup.number().min(0, "Tiene que ser mayor que cero"),
        updateTotalUnitsQuantity: Yup.number().min(0, "Tiene que ser mayor que cero").nullable(),
        updateRemainingUnitsQuantity: Yup.number().min(0, "Tiene que ser mayor que cero").nullable(),
        productStoreDepotDistribution: Yup.object({
            warehouseQuantity: Yup.number().integer(),
            storeQuantity: Yup.number().integer().nullable(),
            moveFromWarehouseToStoreQuantity: Yup
                .number()
                .max(Yup.ref("warehouseQuantity"), "No existe esa cantidad en el almacén"),
            moveFromStoreToWarehouseQuantity: Yup
                .number()
                .max(Yup.ref("storeQuantity"), "No existe esa cantidad en la tienda")
        })
    })

    //ToDo: use global isLoading
    const isLoading = false

    //SELECT product in table
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);
    const handleSelectProduct = (product: productsProps) => {
        if (selectedProduct && (selectedProduct?.id === product.id)) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    }

    const refreshAfterAction = async () => {
        const newDepositsByDepartment: (departments & { products?: productsProps[], selected?: boolean })[] = await warehouseDepots.allDepots(ownerId!, warehouseDetails?.id!);
        setDepositsByDepartment(newDepositsByDepartment?.map((departments: (departments & { products?: productsProps[], selected?: boolean })) => (
            {
                ...departments,
                selected: false
            })));
        setSelectedProduct(null);
    }

    const handleRemove = async () => {
        const response = await warehouseDepots.deleteDepot(ownerId, warehouseDetails?.id, selectedProduct?.depots![0].id);
        if (response) await refreshAfterAction();
    };

    const handleNavigateBack = () => router.push('/inventory');

    const handleStoreAssign = () => {
        router.push(`/inventory/owner/store-assign?warehouseId=${warehouseDetails?.id}`)
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
                            // letterSpacing: ".1rem",
                            color: "white",
                        }}
                    >
                        Depósitos en almacén
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"} />
                            : (
                                <>
                                    {
                                        selectedProduct && (
                                            <Box sx={{ display: "flex" }}>
                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"} />
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                                            </Box>
                                        )
                                    }

                                    <IconButton color={"inherit"} onClick={handleStoreAssign}>
                                        <ShareOutlined fontSize={"small"} />
                                    </IconButton>

                                    <IconButton color={"inherit"} sx={{ color: 'white' }} onClick={() => setActiveModalAddProduct(true)} >
                                        <AddOutlined />
                                    </IconButton>
                                </>
                            )
                    }
                </Box>
            </Toolbar>
        </AppBar >
    )

    function handleSelectFilter(index: number) {
        let filters = [...depositsByDepartment!];
        filters[index].selected = !filters[index].selected;

        setDepositsByDepartment(filters);
    }

    const DepartmentsFilter = ({ formik }: any) => (
        <Card variant={"outlined"} sx={{ padding: "15px" }}>
            <Grid container rowSpacing={2}>
                <Grid item>
                    <Typography variant={"subtitle2"}>
                        Seleccione departamentos para encontrar el producto que busca
                    </Typography>
                </Grid>
                <Grid container item spacing={2} flexWrap={"nowrap"} sx={{ overflowX: "auto", py: "7px" }}>
                    {
                        depositsByDepartment?.map((deposits, index) => (
                            <Grid key={deposits.id} item xs={"auto"}>
                                <DepartmentCustomButton
                                    title={deposits.name!}
                                    subtitle={deposits.products?.length === 1 ? `${deposits.products.length!}` + " producto" : `${deposits.products?.length!}` + " productos"}
                                    selected={deposits.selected!}
                                    onClick={() => handleSelectFilter(index)}
                                />
                            </Grid>
                        ))
                    }
                </Grid>

                {
                    dataProducts?.length! > 0 && (
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

    const [displayUpdateDepotQuantityForm, setDisplayUpdateDepotQuantityForm] = useState<boolean>(false);
    const [storeDepotUpdateIndex, setStoreDepotUpdateIndex] = useState<number | null>(null);
    const [displayUpdateUnitsForm, setDisplayUpdateUnitsForm] = useState<boolean>(false);
    const [displayNewUnitsForm, setDisplayNewUnitsForm] = useState<boolean>(false);
    const [storeDepotUpdateName, setStoreDepotUpdateName] = useState<string>("");

    const afterUpdateDepot = (updatedDepot: AxiosResponse) => {
        const newDepots = [...depositsByDepartment!];

        for (const departmentItem of depositsByDepartment!) {
            const departmentIndex = newDepots.indexOf(departmentItem);

            const updatedIndex = departmentItem.products?.findIndex(productItem => productItem.depots![0].id === updatedDepot.data.id)
            if (updatedIndex! > -1) {
                newDepots[departmentIndex].products![updatedIndex!].depots![0].product_total_units = updatedDepot.data.product_total_units;
                newDepots[departmentIndex].products![updatedIndex!].depots![0].product_total_remaining_units = updatedDepot.data.product_total_remaining_units;

                setDepositsByDepartment(newDepots);
                break;
            }
        }
    }

    const NewUnitsQuantityForm = ({ formik }: any) => {
        async function handleNewUnitsAdd() {
            const updatedDepot: AxiosResponse | boolean = await warehouseDepots.increaseUnitsDepot(
                {
                    ownerId,
                    warehouseId: warehouseDetails?.id!,
                    depotId: selectedProduct?.depots![0].id!,
                    newUnits: formik.values.productNewUnitsQuantity
                }
            )

            if (!updatedDepot) return;

            if (updatedDepot?.data?.id) {
                afterUpdateDepot(updatedDepot);
                setDisplayNewUnitsForm(false);
            }
        }

        return (
            <Card variant={"outlined"} sx={{ width: 1, padding: "15px" }}>
                <Grid container item spacing={2}>
                    <Grid item>
                        <TextField
                            name={"productNewUnitsQuantity"}
                            label="Nuevas unidades"
                            size={"small"}
                            onKeyDown={handleKeyDown}
                            {...formik.getFieldProps("productNewUnitsQuantity")}
                            error={formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity}
                            helperText={(formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity) && formik.errors.productNewUnitsQuantity}
                        />
                    </Grid>

                    <Grid item>
                        <IconButton color={"primary"} onClick={handleNewUnitsAdd}>
                            <Done />
                        </IconButton>
                    </Grid>
                </Grid>
            </Card>
        )
    }

    const UpdateUnitsQuantityForm = ({ formik }: any) => {
        async function handleUpdateUnits() {
            const updatedDepot = await warehouseDepots.updateUnitsDepot(
                {
                    ownerId,
                    warehouseId: warehouseDetails?.id!,
                    depotId: selectedProduct?.depots![0].id,
                    productTotalUnits: formik.values.updateTotalUnitsQuantity,
                    productTotalRemainingUnits: formik.values.updateRemainingUnitsQuantity,
                }
            )

            if (!updatedDepot) return;

            if (updatedDepot?.data?.id) {
                afterUpdateDepot(updatedDepot);
                setDisplayUpdateUnitsForm(false);
            }
        }

        return (
            <Card variant={"outlined"} sx={{ width: 1, padding: "15px" }}>
                <Grid container item spacing={2}>
                    <Grid item>
                        <TextField
                            name={"updateTotalUnitsQuantity"}
                            label="Total de unidades"
                            size={"small"}
                            onKeyDown={handleKeyDown}
                            {...formik.getFieldProps("updateTotalUnitsQuantity")}
                            error={formik.errors.updateTotalUnitsQuantity && formik.touched.updateTotalUnitsQuantity}
                            helperText={(formik.errors.updateTotalUnitsQuantity && formik.touched.updateTotalUnitsQuantity) && formik.errors.updateTotalUnitsQuantity}
                        />
                    </Grid>

                    <Grid item>
                        <TextField
                            name={"updateRemainingUnitsQuantity"}
                            label="Unidades restantes"
                            size={"small"}
                            onKeyDown={handleKeyDown}
                            {...formik.getFieldProps("updateRemainingUnitsQuantity")}
                            error={formik.errors.updateRemainingUnitsQuantity && formik.touched.updateRemainingUnitsQuantity}
                            helperText={(formik.errors.updateRemainingUnitsQuantity && formik.touched.updateRemainingUnitsQuantity) && formik.errors.updateRemainingUnitsQuantity}
                        />
                    </Grid>

                    <Grid item>
                        <IconButton color={"primary"} onClick={handleUpdateUnits}>
                            <Done />
                        </IconButton>
                    </Grid>
                </Grid>
            </Card>
        )
    }

    const UpdateStoreDepotQuantityForm = ({ formik }: any) => {
        const { warehouseQuantity, storeQuantity, moveQuantity } = formik.values.productStoreDepotDistribution;

        function updateLocalData(updatedDepot: depots, updatedStoreDepot: store_depots) {
            const newDepots = [...depositsByDepartment!];

            for (const departmentItem of depositsByDepartment!) {
                const departmentProducts = departmentItem.products;
                const departmentIndex = newDepots.indexOf(departmentItem);

                //find updatedDepot
                const updatedIndex = departmentProducts?.findIndex(productItem => productItem.depots![0].id === updatedDepot.id);
                if (updatedIndex! > -1) {
                    //update depot data
                    departmentProducts![updatedIndex!].depots![0].product_total_remaining_units = updatedDepot.product_total_remaining_units;
                    //find updated store_depot
                    const updatedStoreDepotIndex = departmentProducts![updatedIndex!].storesDistribution?.
                        findIndex(storeItem => storeItem.id === updatedStoreDepot.store_id);

                    if (updatedStoreDepotIndex! > - 1) {
                        newDepots[departmentIndex].products![updatedIndex!].storesDistribution![updatedStoreDepotIndex!].store_depots![0] = updatedStoreDepot;
                    }

                    setDepositsByDepartment(newDepots);

                    break
                }
            }
        }

        async function handleMoveToStore() {
            const updateResponse = await warehouseDepots.sendDepotFromWarehouseToStore(
                {
                    userId: ownerId,
                    warehouseId: warehouseDetails?.id,
                    depotId: selectedProduct?.depots![0].id,
                    storeDepotId: selectedProduct?.storesDistribution![storeDepotUpdateIndex!]?.store_depots![0]?.id ?? null,
                    storeId: selectedProduct?.storesDistribution![storeDepotUpdateIndex!].id,
                    moveUnitQuantity: formik.values.productStoreDepotDistribution.moveFromWarehouseToStoreQuantity,
                }
            )

            if (updateResponse?.updatedDepot && updateResponse?.updatedStoreDepot) {
                updateLocalData(updateResponse.updatedDepot, updateResponse.updatedStoreDepot)

                formik.resetForm();

                setDisplayUpdateDepotQuantityForm(false);
            }
        }


        async function handleMoveToWarehouse() {
            const updateResponse = await warehouseDepots.sendDepotFromStoreToWarehouse(
                {
                    userId: ownerId,
                    warehouseId: warehouseDetails?.id,
                    depotId: selectedProduct?.depots![0].id,
                    storeDepotId: selectedProduct?.storesDistribution![storeDepotUpdateIndex!].store_depots![0].id,
                    moveUnitQuantity: formik.values.productStoreDepotDistribution.moveFromStoreToWarehouseQuantity,
                }
            );

            if (updateResponse?.updatedDepot && updateResponse?.updatedStoreDepot) {
                updateLocalData(updateResponse.updatedDepot, updateResponse.updatedStoreDepot)

                formik.resetForm();

                setDisplayUpdateDepotQuantityForm(false);
            }
        }

        return (
            <Card variant={"outlined"} sx={{ width: 1, padding: "15px" }}>
                <Grid container item direction="column" spacing={2}>
                    <Grid item xs={12}>
                        Mover de almacén hacia tienda: {warehouseQuantity} disponibles
                    </Grid>
                    <Grid item container alignItems="center" xs={12} md={8}>
                        <Grid item xs={10} md={6}>
                            <TextField
                                name={"productStoreDepotDistribution"}
                                label={"Enviar a tienda"}
                                color={"primary"}
                                type={"number"}
                                size={"small"}
                                onKeyDown={handleKeyDown}
                                {...formik.getFieldProps("productStoreDepotDistribution.moveFromWarehouseToStoreQuantity")}
                                error={
                                    formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity &&
                                    formik.touched.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity
                                }
                                helperText={
                                    (
                                        formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity &&
                                        formik.touched.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity
                                    ) && formik.errors.productStoreDepotDistribution.moveFromWarehouseToStoreQuantity
                                }
                            />
                        </Grid>
                        <Grid item xs={2} md={6}>
                            <IconButton
                                color={"primary"}
                                onClick={handleMoveToStore}
                                sx={{ ml: "10px" }}
                                disabled={!!formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity}
                            >
                                <Done />
                            </IconButton>
                        </Grid>
                    </Grid>
                    {
                        !!storeQuantity && (
                            <>
                                <Grid item xs={12}>
                                    <Divider flexItem sx={{ width: 1 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    Retirar de tienda hacia el almacén: {storeQuantity} disponibles
                                </Grid>

                                <Grid item container alignItems="center" xs={12} md={8}>
                                    <Grid item xs={10} md={6}>
                                        <TextField
                                            name={"productStoreDepotDistribution"}
                                            label={"Retirar de tienda"}
                                            color={"secondary"}
                                            type={"number"}
                                            size={"small"}
                                            onKeyDown={handleKeyDown}
                                            {...formik.getFieldProps("productStoreDepotDistribution.moveFromStoreToWarehouseQuantity")}
                                            error={
                                                formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity &&
                                                formik.touched.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity
                                            }
                                            helperText={
                                                (
                                                    formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity &&
                                                    formik.touched.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity
                                                ) && formik.errors.productStoreDepotDistribution.moveFromStoreToWarehouseQuantity
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={2} md={6}>
                                        <IconButton
                                            color={"secondary"}
                                            onClick={handleMoveToWarehouse}
                                            sx={{ ml: "10px" }}
                                            disabled={!!formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity}
                                        >
                                            <Done />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            </Card>
        )
    }

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
                id: "units",
                label: "Unidades",
                align: "left"
            },
            {
                id: "created_at",
                label: "Creación",
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
                    <TableCell
                        key={"checkbox"}
                        align={"left"}
                        padding={'checkbox'}
                    >

                    </TableCell>
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

    const [openImageDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    function handleOpenImagesDialog(images: images[]) {
        setDialogImages(images);
        setOpenImagesDialog(true);
    }

    async function handleLoadStoresDistribution(depot: depots) {
        const response = await warehouseDepots.depotStoreDistribution(ownerId!, warehouseDetails?.id!, depot.id!)
        if (response) {
            const newdepositsByDepartment = [...depositsByDepartment!];
            depositsByDepartment?.forEach((departmentItem, departmentIndex) => {
                const productIndex = departmentItem.products?.findIndex(productItem => productItem.depots![0].id === depot.id)
                if (productIndex! > -1) {
                    newdepositsByDepartment[departmentIndex].products![productIndex!].storesDistribution = response;

                    //ToDo: break loop
                }
            })

            setDepositsByDepartment(newdepositsByDepartment);
        }
    }

    //expand description
    const [expandIndex, setExpandIndex] = useState<number | null>(null);

    const TableContent = ({ formik }: any) => {
        function handleOpenNewUnitsForm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps) {
            event.stopPropagation();

            if (!selectedProduct || (selectedProduct?.id !== product.id)) {
                setSelectedProduct(product);
            }

            setDisplayNewUnitsForm(true);
        }

        function handleOpenUpdateUnitsForm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps) {
            event.stopPropagation();

            if (!selectedProduct || (selectedProduct?.id !== product.id)) {
                setSelectedProduct(product);
            }

            formik.setFieldValue("updateTotalUnitsQuantity", product.depots![0].product_total_units)
            formik.setFieldValue("updateRemainingUnitsQuantity", product.depots![0].product_total_remaining_units)

            setDisplayUpdateUnitsForm(true)
        }

        function handleOpenUpdateStoreDepotForm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps, storeIndex: number, storeName: string) {
            event.stopPropagation();

            if (!selectedProduct || (selectedProduct?.id !== product.id)) {
                setSelectedProduct(product)
            }

            formik.setFieldValue(
                "productStoreDepotDistribution.warehouseQuantity",
                product.depots![0].product_total_remaining_units
            )
            formik.setFieldValue(
                "productStoreDepotDistribution.storeQuantity",
                product.storesDistribution![storeIndex]?.store_depots![0]?.product_remaining_units ?? null
            )

            setStoreDepotUpdateIndex(storeIndex)
            setStoreDepotUpdateName(storeName)
            setDisplayUpdateDepotQuantityForm(true)
        }
        function handleExpand(event: React.MouseEvent<HTMLButtonElement | HTMLTableCellElement, MouseEvent>, rowIndex: number) {
            event.stopPropagation();

            if (rowIndex === expandIndex) return setExpandIndex(null);

            return setExpandIndex(rowIndex);
        }

        return (
            <TableBody>
                {dataProducts?.filter(
                    products =>
                        products?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        products?.description?.toUpperCase()?.includes(formik.values.searchBarValue.toUpperCase())).map(
                            (product, index) => (
                                <React.Fragment key={product.id}>
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        selected={!!selectedProduct && (product.id === selectedProduct.id)}
                                        sx={tableStyles.row}
                                    >
                                        <TableCell>
                                            <Checkbox size={"small"} onClick={() => handleSelectProduct(product)} checked={!!selectedProduct && (product.id === selectedProduct.id)} />
                                        </TableCell>
                                        <TableCell onClick={(event) => handleExpand(event, index)}>
                                            <div>
                                                {product.name} <br />
                                                {
                                                    !!product.description && (
                                                        <small>
                                                            {`${product.description.slice(0, 20)}`}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(event) => handleExpand(event, index)}>{product.departments?.name ?? "-"}</TableCell>
                                        <TableCell>
                                            <Grid container direction="column" alignItems="flex-start">
                                                <Grid item sx={{ marginLeft: "10px" }}>
                                                    {product.depots![0].product_total_remaining_units ?? "-"} de {product.depots![0].product_total_units ?? "-"}
                                                </Grid>
                                                <Grid item display="flex" alignItems="flex-start">
                                                    <IconButton
                                                        color={"inherit"}
                                                        onClick={(event) => handleOpenNewUnitsForm(event, product)}
                                                    >
                                                        <Add fontSize={"small"} />
                                                    </IconButton>
                                                    <IconButton
                                                        color={"inherit"}
                                                        onClick={(event) => handleOpenUpdateUnitsForm(event, product)}
                                                    >
                                                        <EditOutlined fontSize={"small"} />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                        <TableCell onClick={(event) => handleExpand(event, index)}>
                                            {dayjs(product.depots![0].created_at).format("DD/MM/YYYY HH:MM")}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={"Details"}>
                                                <IconButton
                                                    size={"small"}
                                                    onClick={(event) => handleExpand(event, index)}
                                                >
                                                    {
                                                        expandIndex === index
                                                            ? <ExpandLessOutlined />
                                                            : <ExpandMoreOutlined />
                                                    }
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell style={{ padding: 0 }} colSpan={5}>
                                            <Collapse in={expandIndex === index} timeout="auto" unmountOnExit>
                                                <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div">
                                                            Detalles:
                                                        </Typography>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                                        <Grid item xs={true}>{product.name}</Grid>
                                                    </Grid>
                                                    {!!product.description &&
                                                        <Grid container item spacing={1} xs={12}>
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                            <Grid item xs={true}>
                                                                {product.description}
                                                            </Grid>
                                                        </Grid>
                                                    }

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                        <Grid item xs={true}>{product.departments?.name ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                            sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                        <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                            {product.characteristics?.length! > 0
                                                                ? product.characteristics?.map(characteristic => (
                                                                    <Grid
                                                                        key={characteristic.id}
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
                                                                            sx={{ marginRight: "3px" }}>
                                                                            <Typography variant={"caption"}
                                                                                sx={{ color: "white", fontWeight: "600" }}>
                                                                                {characteristic.name?.toUpperCase()}
                                                                            </Typography>
                                                                        </Grid>
                                                                        <Grid container item alignItems={"center"}
                                                                            sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                            {characteristic.value}
                                                                        </Grid>
                                                                    </Grid>
                                                                )
                                                                ) : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio de compra:</Grid>
                                                        <Grid item xs={true}>{product.buy_price ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Imágenes:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                product.images?.length! > 0
                                                                    ? (
                                                                        <Box
                                                                            sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue" }}
                                                                            onClick={() => handleOpenImagesDialog(product.images!)}
                                                                        >
                                                                            {product.images?.length!}
                                                                            <VisibilityOutlined fontSize={"small"}
                                                                                sx={{ ml: "5px" }} />
                                                                        </Box>
                                                                    ) : "no"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Creación:</Grid>
                                                        <Grid item xs={true}>
                                                            {`${dayjs(product.depots![0].created_at).format("DD/MM/YYYY HH:MM")} por ${product.depots![0].inserted_by_id}`}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades restantes de
                                                            total:</Grid>
                                                        <Grid item xs={true}>
                                                            {product.depots![0].product_total_remaining_units ?? "-"} de {product.depots![0].product_total_units ?? "-"}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}>
                                                            {
                                                                product.storesDistribution ? (
                                                                    <Box sx={{ display: "inline-flex", fontWeight: 600 }}>Distribución
                                                                        del producto</Box>
                                                                ) : (
                                                                    <Box
                                                                        sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "blue" }}
                                                                        onClick={() => handleLoadStoresDistribution(product.depots![0])}
                                                                    >
                                                                        Ver distribución del producto
                                                                        <ShareOutlined fontSize={"small"} sx={{ ml: "5px" }} />
                                                                    </Box>
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    {
                                                        product.storesDistribution && (
                                                            product.storesDistribution.map((store, storeIndex) => (
                                                                <Grid container item spacing={1} xs={12} key={store.id}>
                                                                    <Grid item xs={"auto"}
                                                                        sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                                                        <ChevronRightOutlined fontSize={"small"} />
                                                                        {store.name}:
                                                                    </Grid>
                                                                    <Grid item xs={true}>
                                                                        {
                                                                            store.store_depots?.length! > 0
                                                                                ? `Total ${store.store_depots![0].product_units} | ${store.store_depots![0].product_remaining_units} Restantes`
                                                                                : "no asignado"
                                                                        }

                                                                        <IconButton
                                                                            size={"small"}
                                                                            sx={{ ml: "10px" }}
                                                                            onClick={
                                                                                (e) => handleOpenUpdateStoreDepotForm(e, product, storeIndex, store.name!)
                                                                            }>
                                                                            <EditOutlined fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            ))
                                                        )
                                                    }
                                                </Grid>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                }
            </TableBody >
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

                        <ModalAddProduct
                            open={activeModalAddProduct}
                            setOpen={setActiveModalAddProduct}
                            dialogTitle="Nuevo Depósito"
                            setForceRender={setForceRender}
                        >
                            <UserWarehouseForm
                                ownerId={ownerId}
                                warehouseId={warehouseDetails?.id}
                            />
                        </ModalAddProduct>

                        <UpdateValueDialog
                            dialogTitle={"Agregar nuevos productos a este depósito"}
                            open={displayNewUnitsForm}
                            setOpen={setDisplayNewUnitsForm}
                            formik={formik}
                        >
                            <NewUnitsQuantityForm formik={formik} />
                        </UpdateValueDialog>

                        <UpdateValueDialog
                            dialogTitle={"Establezca las nuevas cantidades"}
                            open={displayUpdateUnitsForm}
                            setOpen={setDisplayUpdateUnitsForm}
                        >
                            <UpdateUnitsQuantityForm formik={formik} />
                        </UpdateValueDialog>

                        <UpdateValueDialog
                            dialogTitle={"Redistribuir productos en " + storeDepotUpdateName}
                            open={displayUpdateDepotQuantityForm}
                            setOpen={setDisplayUpdateDepotQuantityForm}
                            formik={formik}
                        >
                            <UpdateStoreDepotQuantityForm formik={formik} />
                        </UpdateValueDialog>

                        <ImagesDisplayDialog
                            dialogTitle={"Imágenes del producto"}
                            open={openImageDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

                        <CustomToolbar />

                        <CardContent>
                            <Grid container rowSpacing={3}>
                                {
                                    depositsByDepartment?.length! > 0 && (
                                        <Grid item xs={12}>
                                            <DepartmentsFilter formik={formik} />
                                        </Grid>
                                    )
                                }

                                {
                                    dataProducts?.length! > 0
                                        ? (
                                            <Grid item xs={12}>
                                                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                                    <Table sx={{ width: "100%" }} size={"small"}>
                                                        <TableHeader />
                                                        <TableContent formik={formik} />
                                                    </Table>
                                                </TableContainer>
                                            </Grid>
                                        ) : (
                                            <TableNoData />
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