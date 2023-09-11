"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, Grid,
    IconButton, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent,
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
    AddBoxOutlined,
    AddOutlined,
    ArrowLeft,
    CancelOutlined,
    ChangeCircleOutlined,
    DeleteOutline, Done,
    EditOutlined, NotesOutlined, SaveOutlined
} from "@mui/icons-material";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import products from "@/app/profile/[id]/product/requests/products";
import ownerUsers from "@/app/profile/[id]/worker/requests/ownerUsers";
import users from "@/app/user/requests/users";
import dayjs from "dayjs";
import warehouseDepots from "@/app/profile/[id]/warehouse/[warehouseId]/requests/warehouseDepots";
import {Formik} from "formik";
import * as Yup from "yup";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function UserWarehouseMainTable(props) {
    const { ownerId, warehouseDetails } = props

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
        productNewUnitsQuantity: Yup.number().integer().min(0),
        updateTotalUnitsQuantity: Yup.number().integer().min(0).nullable(),
        updateRemainingUnitsQuantity: Yup.number().integer().min(0).nullable(),
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

    async function handleUpdate() {
        await router.push(`/profile/${ownerId}/warehouse/update/${selected.id}`)
    }

    function handleOpenUpdateForm(formik) {
        formik.setFieldValue("updateTotalUnitsQuantity", selected.depots.product_total_units)
        formik.setFieldValue("updateRemainingUnitsQuantity", selected.depots.product_total_remaining_units)
        setDisplayUpdateUnitsForm(true)
    }

    const CustomToolbar = ({formik}) => (
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
                                                <IconButton color={"inherit"} onClick={() => setDisplayNewUnitsForm(true)}>
                                                    <AddBoxOutlined fontSize={"small"}/>
                                                </IconButton>

                                                <IconButton color={"inherit"} onClick={() => handleOpenUpdateForm(formik)}>
                                                    <NotesOutlined fontSize={"small"}/>
                                                </IconButton>

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"}/>
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                         sx={{borderRight: "2px solid white", mx: "5px"}}/>
                                            </Box>
                                        )
                                    }

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

    const [displayNewUnitsForm, setDisplayNewUnitsForm] = React.useState(false)
    const [displayUpdateUnitsForm, setDisplayUpdateUnitsForm] = React.useState(false)

    const NewUnitsQuantityForm = ({formik}) => (
        <Card variant={"outlined"} sx={{width: 1, padding: "15px"}}>
            <Grid container item spacing={2}>
                <Grid item xs={12}>
                    <Typography variant={"subtitle2"}>
                        Agregar nuevos productos a este depósito.
                    </Typography>
                </Grid>

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
                    <IconButton color={"primary"}>
                        <Done/>
                    </IconButton>

                    <IconButton color={"secondary"} onClick={() => setDisplayNewUnitsForm(false)}>
                        <CancelOutlined/>
                    </IconButton>
                </Grid>
            </Grid>
        </Card>
    )

    const UpdateUnitsQuantityForm = ({formik}) => (
        <Card variant={"outlined"} sx={{width: 1, padding: "15px"}}>
            <Grid container item spacing={2}>
                <Grid item xs={12}>
                    <Typography variant={"subtitle2"}>
                        Establezca las nuevas cantidades.
                    </Typography>
                </Grid>
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
                    <IconButton color={"primary"}>
                        <Done/>
                    </IconButton>

                    <IconButton color={"secondary"} onClick={() => setDisplayUpdateUnitsForm(false)}>
                        <CancelOutlined/>
                    </IconButton>
                </Grid>
            </Grid>
        </Card>
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

    const TableContent = ({formik}) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item?.description?.toUpperCase()?.includes(formik.values.searchBarValue.toUpperCase())).map(
                    row => (
                    <TableRow
                        key={row.id}
                        hover
                        tabIndex={-1}
                        selected={selected && (row.id === selected.id)}
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)}/>
                        </TableCell>
                        <TableCell>
                            {row.name}
                            {
                                row.description && (
                                    <small>
                                        {` ${row.description}`}
                                    </small>
                                )
                            }
                        </TableCell>
                        <TableCell>
                            {row.departments?.name ?? "-"}
                        </TableCell>
                        <TableCell>
                            {row.depots[0].product_total_units ?? "-"} de {row.depots[0].product_total_remaining_units ?? "-"}
                        </TableCell>
                        <TableCell>
                            {dayjs(row.depots.created_at).format("DD/MM/YYYY HH:MM")}
                        </TableCell>
                    </TableRow>
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
                        <CustomToolbar formik={formik}/>

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
                                    displayNewUnitsForm && (
                                        <Grid item xs={12}>
                                            <NewUnitsQuantityForm formik={formik}/>
                                        </Grid>
                                    )
                                }

                                {
                                    displayUpdateUnitsForm && (
                                        <Grid item xs={12}>
                                            <UpdateUnitsQuantityForm formik={formik}/>
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