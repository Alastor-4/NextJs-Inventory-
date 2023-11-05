"use client"
import React, { useEffect, useState } from 'react'
import storeAssign from '@/app/profile/[id]/store-assign/requests/store-assign'
import { TableNoData } from "@/components/TableNoData";
import { Box, Button, Card, CardContent, Collapse, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { Formik } from 'formik'
import { AddOutlined, ExpandLessOutlined, ExpandMoreOutlined, VisibilityOutlined } from '@mui/icons-material';
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog';


function ShowProductsWarehouse(props: any) {
    const { storeId, warehouseId, defaultPercentage, defaultQuantity } = props

    const params = useParams();

    const [allProductByWarehouseDepartment, setAllProductByWarehouseDepartment] = useState<any>(null);
    const [data, setData] = useState<any>();

    const [showDetails, setShowDetails] = useState<any>(false)

    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [dialogImages, setDialogImages] = useState([]);

    useEffect(() => {
        setAllProductByWarehouseDepartment(null)
    }, [storeId, warehouseId])

    useEffect(() => {
        const data = async () => {
            const result = await storeAssign.allProductByDepartmentWarehouse(params.id, storeId, warehouseId)
            setAllProductByWarehouseDepartment(() => result.map((data: Object) => ({
                ...data,
                selected: false
            })))
        }

        if (allProductByWarehouseDepartment === null)
            data()

    }, [allProductByWarehouseDepartment, params.id, storeId, warehouseId])

    useEffect(() => {
        if (allProductByWarehouseDepartment !== null) {

            let allProducts: any = []

            allProductByWarehouseDepartment.forEach((departmentItem: any) => {
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


    }, [allProductByWarehouseDepartment])

    async function handleSelectFilter(index: number) {
        let filters = [...allProductByWarehouseDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductByWarehouseDepartment(filters)
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
                            allProductByWarehouseDepartment.map((item: any, index: number) => (
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
                id: "productTotalRemainingUnits",
                label: "Unidades restantes",
                align: "left"
            },
            {
                id: "add",
                label: "Agregar a tienda",
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


    const loadDates = async () => {
        let newAllProductByDepartmentWarehouse = await storeAssign.allProductByDepartmentWarehouse(params.id, storeId, warehouseId);

        let selectedDepartment = allProductByWarehouseDepartment.filter((element: any) => (element.selected)).map((element: any) => element.id)

        newAllProductByDepartmentWarehouse = newAllProductByDepartmentWarehouse.map((element: any) => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductByWarehouseDepartment(newAllProductByDepartmentWarehouse);
    }


    // Se Agrega a los Depositos de la Tienda y da la orden de eliminar
    const addStoreDepot = async (row: any) => {
        let productStoreDepot = row.depots[0].store_depots[0]
        let response;

        if (productStoreDepot?.product_units) {

            productStoreDepot.product_units = 0;
            productStoreDepot.is_active = true;

            response = await storeAssign.UpdateProductStore(params.id, productStoreDepot);

        } else {
            const data = {
                storeId: parseInt(storeId),
                depotId: parseInt(row.depots[0].id),
                product_units: 0,
                product_remaining_units: 0,
                sell_price: row.buy_price ?? 0,
                sell_price_units: "CUP",
                price_discount_percentage: null,
                price_discount_quantity: null,
                seller_profit_percentage: defaultPercentage ?? null,
                seller_profit_quantity: defaultQuantity ?? null,
                is_active: true,
                offer_notes: null,
            }

            response = await storeAssign.postProductToStoreDepot(params.id, data);
        }

        if (response === 200) {
            //removeProduct(row.departments.id, row.id);
            loadDates()
        } else {
            //ToDo: catch validation errors
        }

    }

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
                            (row: any, index: number) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        key={row.id}
                                        hover
                                        tabIndex={-1}
                                    >
                                        <TableCell>
                                            {row.name}
                                        </TableCell>
                                        <TableCell>
                                            {row?.departments?.name ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            {row.depots[0].product_total_remaining_units}
                                        </TableCell>

                                        <TableCell>
                                            <IconButton color={"primary"} onClick={() => addStoreDepot(row)} >
                                                <AddOutlined />
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
                                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades restantes en el almacén</Grid>
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

    return (
        <>
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
                                setOpen={setOpenImageDialog}
                                images={dialogImages}
                            />


                            <CardContent>
                                {
                                    Array.isArray(allProductByWarehouseDepartment) &&
                                    allProductByWarehouseDepartment.length > 0 && (
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
        </>
    )
}

export default ShowProductsWarehouse
