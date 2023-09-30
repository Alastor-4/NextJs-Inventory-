"use client"
import React, { useEffect, useState } from 'react'
import storeAssign from '@/app/profile/[id]/store-assign/requests/store-assign'
import { TableNoData } from "@/components/TableNoData";
import { Button, Card, CardContent, Checkbox, Grid, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { Formik } from 'formik'
import { AddOutlined } from '@mui/icons-material';
function showProducts({ storeId, warehouseId }) {
    const params = useParams();

    const [allProductbyWarehouseDepartament, setAllProductbyWarehouseDepartament] = useState(null);
    const [data, setData] = useState();

    useEffect(()=>{
        setAllProductbyWarehouseDepartament(null)
    },[storeId, warehouseId])

    useEffect(() => {
        const Datos = async () => {
            const result = await storeAssign.allProductbyDepartmentWarehouse(params.id, storeId, warehouseId)
            setAllProductbyWarehouseDepartament(() => result.map(data => ({
                ...data,
                selected: false
            })))
        }
        if (allProductbyWarehouseDepartament === null) Datos()

    }, [allProductbyWarehouseDepartament])

    useEffect(() => {
        if (allProductbyWarehouseDepartament !== null) {

            let allProducts = []

            allProductbyWarehouseDepartament.forEach((departmentItem) => {
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

    }, [allProductbyWarehouseDepartament])

    async function handleSelectFilter(index: number) {
        let filters = [...allProductbyWarehouseDepartament]
        filters[index].selected = !filters[index].selected

        setAllProductbyWarehouseDepartament(filters)
    }

    const DepartmentsFilter = ({ formik }) => {
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
                            allProductbyWarehouseDepartament.map((item, index) => (
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
        let newAllProductbyDepartmentWarehouse = await storeAssign.allProductbyDepartmentWarehouse(params.id, storeId, warehouseId);
    
        let selectedDepartment = allProductbyWarehouseDepartament.filter(element => (element.selected)).map( element => element.id)
    
        newAllProductbyDepartmentWarehouse = newAllProductbyDepartmentWarehouse.map(element => ({
          ...element,
          selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductbyWarehouseDepartament(newAllProductbyDepartmentWarehouse);
      }


    // Se Agrega a los Depositos de la Tienda y da la orden de eliminar
    const addStoreDepot = async (row: Object) => {
        const datos = {
            storeId: parseInt(storeId),
            depotId: parseInt(row.depots[0].id),
            productUnits: 0,
            productRemainingUnits: 0,
            sellerProfitPercentage: 0,//Tienes q copiar el porcentage de la tienda
            seller_profit_quantity: 0,
            is_active: true,
            offer_notes: null,
            price_discount_percentage: null,
            price_discount_quantity: null,
            sell_price: row.buy_price,
            sell_price_unit: 'CUP'

        }

        const response = await storeAssign.postProductToStoreDepot(params.id, datos);

        if (response.status === 200) {
            //removeProduct(row.departments.id, row.id);
            loadDates()
        } else {
            //ToDo: catch validation errors
        }

    }

    const TableContent = ({ formik }) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (row, index) => (
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
                                </TableRow>
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


                            <CardContent>
                                {
                                    Array.isArray(allProductbyWarehouseDepartament) &&
                                    allProductbyWarehouseDepartament.length > 0 && (
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

export default showProducts
