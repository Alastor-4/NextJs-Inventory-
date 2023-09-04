"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, CircularProgress,
    Divider, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {AddOutlined, ArrowLeft, DeleteOutline, EditOutlined} from "@mui/icons-material";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import products from "@/app/profile/[id]/product/requests/products";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ProductsMainTable() {
    const [data, setData] = React.useState(null)

    const params = useParams()
    const router = useRouter()

    const [departmentsFilter, setDepartmentsFilter] = React.useState([])

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/product/api`).then((data) => setData(data))
        fetcher(`/profile/${params.id}/product/api2`).then((data) => setDepartmentsFilter(data.map(item => ({
            ...item,
            selected: false
        }))))
    }, [params.id])

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
        const response = await products.delete(params.id, selected.id)
        if (response) {
            //ToDo: remove product images from uploadthing
            setSelected(null)

            const filters = departmentsFilter.filter(item => item.selected).map(item => item.id)
            const updatedProducts = await products.allUserProducts(params.id, filters.join(","))
            if (updatedProducts) {
                setData(updatedProducts)

                const newDepartments = await products.allUserProductDepartments(params.id)
                if (newDepartments)
                    setDepartmentsFilter(
                        newDepartments.map(
                            (item: { id: any; }) => ({...item, selected: filters.includes(item.id)})
                        )
                    )
            }
        }
    }

    async function handleUpdate() {
        await router.push(`/profile/${params.id}/product/update/${selected.id}`)
    }

    function handleNavigateBack() {
        router.back()
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
                        Productos del usuario
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
                                                <IconButton color={"inherit"} onClick={handleUpdate}>
                                                    <EditOutlined fontSize={"small"}/>
                                                </IconButton>

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"}/>
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                         sx={{borderRight: "2px solid white", mx: "5px"}}/>
                                            </Box>
                                        )
                                    }

                                    <Link href={`/profile/${params.id}/product/create`}>
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

    const TableContent = () => {
        return (
            <TableBody>
                {data.map(row => (
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
                                            <Grid container item alignItems={"center"} sx={{marginRight: "3px"}}>
                                                <Typography variant={"caption"} sx={{color: "white", fontWeight: "600"}}>
                                                    {item.name.toUpperCase()}
                                                </Typography>
                                            </Grid>
                                            <Grid container item alignItems={"center"} sx={{color: "rgba(16,27,44,0.8)"}}>
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

    async function applyFilters() {
        const filters = departmentsFilter.filter(item => item.selected).map(item => item.id).join(",")
        const newProducts = await products.allUserProducts(params.id, filters)
        if (newProducts) {
            setData(newProducts)
            setSelected(null)
        }
    }

    async function handleSelectFilter(index: number) {
        let filters = [...departmentsFilter]
        filters[index].selected = !filters[index].selected

        setDepartmentsFilter(filters)

        await applyFilters()
    }

    const DepartmentsFilter = () => (
        <Card variant={"outlined"} sx={{padding: "15px"}}>
            <Grid container columnSpacing={2}>
                {
                    departmentsFilter.map((item, index) => (
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
        </Card>
    )

    return (
        <Card variant={"outlined"}>
            <CustomToolbar/>

            <CardContent>
                {
                    data?.length > 0
                        ? (
                            <>
                                <DepartmentsFilter/>

                                <Table sx={{width: "100%"}} size={"small"}>
                                    <TableHeader/>

                                    <TableContent/>
                                </Table>
                            </>
                        ) : (
                            <TableNoData/>
                        )
                }
            </CardContent>
        </Card>
    )
}