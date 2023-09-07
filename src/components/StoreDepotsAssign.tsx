import {
    Button,
    Card,
    CardContent,
    Checkbox,
    Grid, MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import {Formik} from "formik";
import {TableNoData} from "@/components/TableNoData";
import * as Yup from "yup";

export default function StoreDepotsAssign(
    {warehouseListProp, selectedWarehouseIdProp, storeListProp, selectedStoreIdProp}
) {
    //ToDo: get all store_depots for every selected store

    const [selectedWarehouse, setSelectedWarehouse] = React.useState("")
    const [selectedStore, setSelectedStore] = React.useState("")

    //initial make selected a warehouse
    React.useEffect(() => {
        if (selectedWarehouseIdProp !== null) {
            const index = warehouseListProp.find(item => item.id === selectedWarehouseIdProp)
            if (index > -1) {
                setSelectedWarehouse(warehouseListProp[index])
            }
        }
    }, [selectedWarehouseIdProp, warehouseListProp])

    //initial make selected a store
    React.useEffect(() => {
        if (selectedStoreIdProp !== null) {
            const index = storeListProp.find(item => item.id === selectedStoreIdProp)
            if (index > -1) {
                setSelectedStore(storeListProp[index])
            }
        }
    }, [selectedStoreIdProp, storeListProp])

    const [warehouseDepotsByDepartmentOptions, setWarehouseDepotsByDepartmentOptions] = React.useState([])

    //load depots for every selected warehouse
    React.useEffect(() => {
        if (selectedWarehouse) {
            const depots = [] //ToDo: load departments with products including depots, from selected warehouse
            setWarehouseDepotsByDepartmentOptions(depots.map(item => ({...item, selected: false})))
        }
    }, [selectedWarehouse])

    const [data, setData] = React.useState([])

    //update data every time filters change
    React.useEffect(() => {
        if (warehouseDepotsByDepartmentOptions.length) {
            let allDepots = []

            warehouseDepotsByDepartmentOptions.forEach((departmentItem) => {
                if (departmentItem.selected) {
                    allDepots = [...allDepots, ...departmentItem.products]
                }
            })

            allDepots.sort((a, b) => {
                if (a.name < b.name)
                    return -1

                if (a.name > a.name)
                    return 1

                return 0
            })

            setData(allDepots)
        }

    }, [warehouseDepotsByDepartmentOptions])

    const initialValues = {
        selectedWarehouse: selectedWarehouse,
        selectedStore: selectedStore,
        searchBarValue: "",
        selectedDepot: "",
    }

    const validationSchema = Yup.object({
        selectedWarehouse: Yup.object().required("seleccione un almacén"),
        selectedStore: Yup.object().required("seleccione una tienda"),
        searchBarValue: Yup.string(),
        selectedDepot: Yup.object(),
    })

    function handleSelectFilter(index: number) {
        let filters = [...warehouseDepotsByDepartmentOptions]
        filters[index].selected = !filters[index].selected

        setWarehouseDepotsByDepartmentOptions(filters)
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
                        warehouseDepotsByDepartmentOptions.map((item, index) => (
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

    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "description",
                label: "Descripción",
                align: "left"
            },
            {
                id: "department",
                label: "Departamento",
                align: "left"
            },
            {
                id: "characteristics",
                label: "Características",
                align: "left"
            },
            {
                id: "image",
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

    const handleSelectItem = (formik, item) => {
        if (formik.values.selectedDepot?.id === item.id) {
            formik.setFieldValue("selectedDepot", "")
        } else {
            formik.setFieldValue("selectedDepot", item)
        }
    }

    const TableContent = ({formik}) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()).map(
                            row => (
                                <TableRow
                                    key={row.depots.id}
                                    hover
                                    tabIndex={-1}
                                    selected={formik.values.selectedDepot?.depots.id === row.depots.id}
                                    onClick={() => handleSelectItem(formik, row)}
                                >
                                    <TableCell>
                                        <Checkbox size={"small"}
                                                  checked={formik.values.selectedDepot?.depots.id === row.depots.id}/>
                                    </TableCell>
                                    <TableCell>
                                        {row.name}
                                    </TableCell>
                                    <TableCell>
                                        {row.description ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {row?.departments?.name ?? "-"}
                                    </TableCell>
                                    <TableCell>
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
                                                        <Grid container item alignItems={"center"}
                                                              sx={{marginRight: "3px"}}>
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
                                    </TableCell>
                                    <TableCell>
                                        {
                                            row.images.length > 0
                                                ? `${row.images.length} imagen(es)` : "-"
                                        }
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
                        <CardContent>
                            <Grid container>
                                <Grid item xs={12}>
                                    <TextField
                                        name={"selectedWarehouse"}
                                        label="Warehouse"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedWarehouse")}
                                        error={formik.errors.selectedWarehouse && formik.touched.selectedWarehouse}
                                        helperText={(formik.errors.selectedWarehouse && formik.touched.selectedWarehouse) && formik.errors.selectedWarehouse}
                                    >
                                        {
                                            warehouseListProp.map(item => (
                                                <MenuItem key={item.id}
                                                          value={item}>{`${item.name} (${item.description ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name={"selectedStore"}
                                        label="Tienda"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedStore")}
                                        error={formik.errors.selectedStore && formik.touched.selectedStore}
                                        helperText={(formik.errors.selectedStore && formik.touched.selectedStore) && formik.errors.selectedStore}
                                    >
                                        {
                                            storeListProp.map(item => (
                                                <MenuItem key={item.id}
                                                          value={item}>{`${item.name} (${item.description ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>
                            </Grid>

                            {
                                <DepartmentsFilter formik={formik}/>
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <Table sx={{width: "100%"}} size={"small"}>
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