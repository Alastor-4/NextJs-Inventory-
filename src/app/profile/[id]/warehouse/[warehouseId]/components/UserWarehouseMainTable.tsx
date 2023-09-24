"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress, Collapse,
    Divider,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Toolbar, Tooltip,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {
    Add,
    AddOutlined,
    ArrowLeft, ChevronRightOutlined,
    DeleteOutline,
    Done,
    EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, ShareOutlined, Visibility, VisibilityOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import {useRouter} from "next/navigation";
import dayjs from "dayjs";
import warehouseDepots from "@/app/profile/[id]/warehouse/[warehouseId]/requests/warehouseDepots";
import {Formik} from "formik";
import * as Yup from "yup";
import UpdateValueDialog from "@/components/UpdateValueDialog";
import tableStyles from "@/assets/styles/tableStyles";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function UserWarehouseMainTable(props) {
    const {ownerId, warehouseDetails} = props

    const [data, setData] = React.useState([])
    const [depositByDepartment, setDepositByDepartment] = React.useState([])

    const router = useRouter()

    React.useEffect(() => {
        if (depositByDepartment.length) {
            let allProducts = []

            depositByDepartment.forEach((departmentItem) => {
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
        } else {
            setData([])
        }

    }, [depositByDepartment])

    const initialValues = {
        searchBarValue: "",
        productNewUnitsQuantity: 0,
        productUpdateUnitsQuantity: {
            newTotal: "",
            newRemaining: "",
        },
    }

    const validationSchema = Yup.object({
        searchBarValue: Yup.string(),
        productNewUnitsQuantity: Yup
            .number()
            .typeError("especifique un número entero mayor que cero")
            .integer("especifique un número entero mayor que cero")
            .min(0, "especifique un número entero mayor que cero"),
        updateTotalUnitsQuantity: Yup
            .number()
            .typeError("especifique un número entero mayor que cero")
            .integer("especifique un número entero mayor que cero")
            .min(0, "especifique un número entero mayor que cero")
            .nullable(),
        updateRemainingUnitsQuantity: Yup
            .number()
            .typeError("especifique un número entero mayor que cero")
            .integer("especifique un número entero mayor que cero")
            .min(0, "especifique un número entero mayor que cero")
            .nullable(),
    })

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${ownerId}/warehouse/${warehouseDetails.id}/api`).then((data) => setDepositByDepartment(data.map(item => ({...item, selected: false}))))
    }, [ownerId, warehouseDetails])

    //table selected item
    const [selected, setSelected] = React.useState(null)
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    async function handleRemove() {
        const response = await warehouseDepots.deleteDepot(ownerId, warehouseDetails.id, selected.depots[0].id)
        if (response) {
            setSelected(null)
            const allDepots = await warehouseDepots.allDepots(ownerId, warehouseDetails.id)
            if (allDepots) setDepositByDepartment(allDepots.map(item => ({...item, selected: false})))
        }
    }

    function handleNavigateBack() {
        router.back()
    }

    function handleStoreAssign() {
        router.push(`/profile/${ownerId}/store-assign`)
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
                        Depósitos en almacén
                    </Typography>
                </Box>

                <Box sx={{display: "flex"}}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"}/>
                            : (
                                <>
                                    {
                                        selected && (
                                            <Box sx={{display: "flex"}}>
                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"}/>
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                         sx={{borderRight: "2px solid white", mx: "5px"}}/>
                                            </Box>
                                        )
                                    }

                                    <IconButton color={"inherit"} onClick={handleStoreAssign}>
                                        <ShareOutlined fontSize={"small"}/>
                                    </IconButton>

                                    <Link href={`/profile/${ownerId}/warehouse/${warehouseDetails.id}/create`}>
                                        <IconButton color={"inherit"}>
                                            <AddOutlined/>
                                        </IconButton>
                                    </Link>
                                </>
                            )
                    }
                </Box>
            </Toolbar>
        </AppBar>
    )

    function handleSelectFilter(index: number) {
        let filters = [...depositByDepartment]
        filters[index].selected = !filters[index].selected

        setDepositByDepartment(filters)
    }

    const DepartmentsFilter = ({formik}) => (
        <Card variant={"outlined"} sx={{padding: "15px"}}>
            <Grid container rowSpacing={2}>
                <Grid item>
                    <Typography variant={"subtitle2"}>
                        Seleccione departamentos para encontrar el producto que busca
                    </Typography>
                </Grid>
                <Grid container item columnSpacing={2}>
                    {
                        depositByDepartment.map((item, index) => (
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

    const [displayNewUnitsForm, setDisplayNewUnitsForm] = React.useState(false)
    const [displayUpdateUnitsForm, setDisplayUpdateUnitsForm] = React.useState(false)

    const NewUnitsQuantityForm = ({formik}) => {
        async function handleNewUnitsAdd() {
            const updatedDepot = await warehouseDepots.increaseUnitsDepot(
                {
                    ownerId,
                    warehouseId: warehouseDetails.id,
                    depotId: selected.depots[0].id,
                    newUnits: formik.values.productNewUnitsQuantity
                }
            )

            if (updatedDepot?.data?.id) {
                const newDepots = [...depositByDepartment]

                for (const departmentItem of depositByDepartment) {
                    const departmentIndex = newDepots.indexOf(departmentItem)

                    const updatedIndex = departmentItem.products.findIndex(productItem => productItem.depots[0].id === updatedDepot.data.id)
                    if (updatedIndex > -1) {
                        newDepots[departmentIndex].products[updatedIndex].depots[0].product_total_units = updatedDepot.data.product_total_units
                        newDepots[departmentIndex].products[updatedIndex].depots[0].product_total_remaining_units = updatedDepot.data.product_total_remaining_units

                        setDepositByDepartment(newDepots)

                        break
                    }
                }

                setDisplayNewUnitsForm(false)
            }
        }

        return (
            <Card variant={"outlined"} sx={{width: 1, padding: "15px"}}>
                <Grid container item spacing={2}>
                    <Grid item>
                        <TextField
                            name={"productNewUnitsQuantity"}
                            label="Nuevas unidades"
                            size={"small"}
                            {...formik.getFieldProps("productNewUnitsQuantity")}
                            error={formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity}
                            helperText={(formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity) && formik.errors.productNewUnitsQuantity}
                        />
                    </Grid>

                    <Grid item>
                        <IconButton color={"primary"} onClick={handleNewUnitsAdd}>
                            <Done/>
                        </IconButton>
                    </Grid>
                </Grid>
            </Card>
        )
    }

    const UpdateUnitsQuantityForm = ({formik}) => {
        async function handleUpdateUnits() {
            const updatedDepot = await warehouseDepots.updateUnitsDepot(
                {
                    ownerId,
                    warehouseId: warehouseDetails.id,
                    depotId: selected.depots[0].id,
                    productTotalUnits: formik.values.updateTotalUnitsQuantity,
                    productTotalRemainingUnits: formik.values.updateRemainingUnitsQuantity,
                }
            )

            if (updatedDepot?.data?.id) {
                const newDepots = [...depositByDepartment]

                for (const departmentItem of depositByDepartment) {
                    const departmentIndex = newDepots.indexOf(departmentItem)

                    const updatedIndex = departmentItem.products.findIndex(productItem => productItem.depots[0].id === updatedDepot.data.id)
                    if (updatedIndex > -1) {
                        newDepots[departmentIndex].products[updatedIndex].depots[0].product_total_units = updatedDepot.data.product_total_units
                        newDepots[departmentIndex].products[updatedIndex].depots[0].product_total_remaining_units = updatedDepot.data.product_total_remaining_units

                        setDepositByDepartment(newDepots)

                        break
                    }
                }

                setDisplayUpdateUnitsForm(false)
            }
        }

        return (
            <Card variant={"outlined"} sx={{width: 1, padding: "15px"}}>
                <Grid container item spacing={2}>
                    <Grid item>
                        <TextField
                            name={"updateTotalUnitsQuantity"}
                            label="Total de unidades"
                            size={"small"}
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
                            {...formik.getFieldProps("updateRemainingUnitsQuantity")}
                            error={formik.errors.updateRemainingUnitsQuantity && formik.touched.updateRemainingUnitsQuantity}
                            helperText={(formik.errors.updateRemainingUnitsQuantity && formik.touched.updateRemainingUnitsQuantity) && formik.errors.updateRemainingUnitsQuantity}
                        />
                    </Grid>

                    <Grid item>
                        <IconButton color={"primary"} onClick={handleUpdateUnits}>
                            <Done/>
                        </IconButton>
                    </Grid>
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

    const [openImageDialog, setOpenImagesDialog] = React.useState(false)
    const [dialogImages, setDialogImages] = React.useState([])

    function handleOpenImagesDialog(images) {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    const [storesDepotDistribution, setStoresDepotDistribution] = React.useState(null)
    async function handleLoadStoresDistribution(depot) {
        const response = await warehouseDepots.depotStoreDistribution(ownerId, warehouseDetails.id, depot.id)
        if (response) {
            const newDepositByDepartment = [...depositByDepartment]
            depositByDepartment.forEach((departmentItem, departmentIndex) => {
                const productIndex = departmentItem.products.findIndex(productItem => productItem.depots[0].id === depot.id)
                if (productIndex > -1) {
                    newDepositByDepartment[departmentIndex].products[productIndex].storesDistribution = response

                    //break loop
                }
            })

            setDepositByDepartment(newDepositByDepartment)
        }
    }

    //expand description
    const [expandIndex, setExpandIndex] = React.useState(null)

    const TableContent = ({formik}) => {
        function handleOpenNewUnitsForm(e, row) {
            e.stopPropagation()

            if (!selected || (selected?.id !== row.id)) {
                setSelected(row)
            }

            setDisplayNewUnitsForm(true)
        }

        function handleOpenUpdateUnitsForm(e, row) {
            e.stopPropagation()

            if (!selected || (selected?.id !== row.id)) {
                setSelected(row)
            }

            formik.setFieldValue("updateTotalUnitsQuantity", row.depots[0].product_total_units)
            formik.setFieldValue("updateRemainingUnitsQuantity", row.depots[0].product_total_remaining_units)

            setDisplayUpdateUnitsForm(true)
        }

        function handleExpand(e, rowIndex) {
            e.stopPropagation()

            if (rowIndex === expandIndex)
                return setExpandIndex(null)

            return setExpandIndex(rowIndex)
        }

        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item?.description?.toUpperCase()?.includes(formik.values.searchBarValue.toUpperCase())).map(
                    (row, index) => (
                        <React.Fragment key={row.id}>
                            <TableRow
                                hover
                                tabIndex={-1}
                                selected={selected && (row.id === selected.id)}
                                onClick={() => handleSelectItem(row)}
                                sx={tableStyles.row}
                            >
                                <TableCell>
                                    <Checkbox size={"small"} checked={selected && (row.id === selected.id)}/>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        {row.name} <br/>
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
                                    {row.departments?.name ?? "-"}
                                </TableCell>
                                <TableCell>
                                    {row.depots[0].product_total_units ?? "-"} de {row.depots[0].product_total_remaining_units ?? "-"}

                                    <IconButton
                                        color={"inherit"}
                                        onClick={(e) => handleOpenNewUnitsForm(e, row)}
                                        sx={{ml: "10px"}}
                                    >
                                        <Add fontSize={"small"}/>
                                    </IconButton>

                                    <IconButton
                                        color={"inherit"}
                                        onClick={(e) => handleOpenUpdateUnitsForm(e, row)}
                                        sx={{ml: "5px"}}
                                    >
                                        <EditOutlined fontSize={"small"}/>
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    {dayjs(row.depots[0].created_at).format("DD/MM/YYYY HH:MM")}

                                    <Box sx={tableStyles.actionColumn}>
                                        <Tooltip title={"Details"}>
                                            <IconButton
                                                size={"small"}
                                                sx={{m: "3px"}}
                                                onClick={(e) => handleExpand(e, index)}
                                            >
                                                {
                                                    expandIndex === index
                                                        ? <ExpandLessOutlined/>
                                                        : <ExpandMoreOutlined/>
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell style={{ padding: 0 }} colSpan={5}>
                                    <Collapse in={ expandIndex === index } timeout="auto" unmountOnExit>
                                        <Grid container spacing={1} sx={{padding: "8px 26px"}}>
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
                                                <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>Características:</Grid>
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
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio de compra:</Grid>
                                                <Grid item xs={true}>{row.buy_price ?? "-"}</Grid>
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

                                                                    <VisibilityOutlined fontSize={"small"} sx={{ml: "5px"}}/>
                                                                </Box>
                                                            ) : "no"
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{fontWeight: 600}}>Creación:</Grid>
                                                <Grid item xs={true}>
                                                    {`${dayjs(row.depots[0].created_at).format("DD/MM/YYYY HH:MM")} por ${row.depots[0].inserted_by_id}`}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{fontWeight: 600}}>Unidades restantes de total:</Grid>
                                                <Grid item xs={true}>
                                                    {row.depots[0].product_total_units ?? "-"} de {row.depots[0].product_total_remaining_units ?? "-"}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"}>
                                                    {
                                                        row.storesDistribution ? (
                                                            <Box sx={{display: "inline-flex", fontWeight: 600}}>Distribución del producto</Box>
                                                        ) : (
                                                            <Box
                                                                sx={{cursor: "pointer", display: "flex", alignItems: "center", color: "blue"}}
                                                                onClick={() => handleLoadStoresDistribution(row.depots[0])}
                                                            >
                                                                Ver distribución del producto
                                                                <ShareOutlined fontSize={"small"} sx={{ml: "5px"}}/>
                                                            </Box>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>

                                            {
                                                row.storesDistribution && (
                                                    row.storesDistribution.map(item => (
                                                        <Grid container item spacing={1} xs={12} key={item.id}>
                                                            <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                                                <ChevronRightOutlined fontSize={"small"}/>
                                                                {item.name}:
                                                            </Grid>
                                                            <Grid item xs={true}>
                                                                {
                                                                    item.store_depots.length > 0
                                                                        ? `Total (${item.store_depots[0].product_units}) - Restantes (${item.store_depots[0].product_remaining_units})`
                                                                        : "no asignado"
                                                                }
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
                ))}
            </TableBody>
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
                        <UpdateValueDialog
                            dialogTitle={"Agregar nuevos productos a este depósito"}
                            open={displayNewUnitsForm}
                            setOpen={setDisplayNewUnitsForm}
                        >
                            <NewUnitsQuantityForm formik={formik}/>
                        </UpdateValueDialog>

                        <UpdateValueDialog
                            dialogTitle={"Establezca las nuevas cantidades"}
                            open={displayUpdateUnitsForm}
                            setOpen={setDisplayUpdateUnitsForm}
                        >
                            <UpdateUnitsQuantityForm formik={formik}/>
                        </UpdateValueDialog>

                        <ImagesDisplayDialog
                            dialogTitle={"Imágenes del producto"}
                            open={openImageDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

                        <CustomToolbar/>

                        <CardContent>
                            <Grid container rowSpacing={3}>
                                {
                                    depositByDepartment.length > 0 && (
                                        <Grid item xs={12}>
                                            <DepartmentsFilter formik={formik}/>
                                        </Grid>
                                    )
                                }

                                {
                                    data?.length > 0
                                        ? (
                                            <Grid item xs={12}>
                                                <Table sx={{width: "100%"}} size={"small"}>
                                                    <TableHeader/>

                                                    <TableContent formik={formik}/>
                                                </Table>
                                            </Grid>
                                        ) : (
                                            <TableNoData/>
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