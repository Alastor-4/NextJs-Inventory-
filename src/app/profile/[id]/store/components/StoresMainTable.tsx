// @ts-nocheck
"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Checkbox, CircularProgress,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, AutoStories, DeleteOutline, EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, ShoppingBagOutlined, ShoppingCartOutlined } from "@mui/icons-material";
import stores from "@/app/profile/[id]/store/requests/stores";
import { useParams, useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoresMainTable() {
    const [data, setData] = React.useState(null)
    const [showDetails, setShowDetails] = React.useState(false)

    const params = useParams()
    const router = useRouter()

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/store/api`).then((data) => setData(data))
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
        const response = await stores.delete(params.id, selected.id)
        const updatedStores = await stores.allUserStores(params.id)
        if (updatedStores) setData(updatedStores)
        setSelected(null);
    }

    function handleUpdate() {
        router.push(`/profile/${params.id}/store/update/${selected.id}`)
    }
    function handleCreate() {
        router.push(`/profile/${params.id}/store/create`)
    }
    function handleNavigateBack() {
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
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
                        Listado de Tiendas
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"} />
                            : (
                                <>
                                    {
                                        selected && (
                                            <Box sx={{ display: "flex" }}>
                                                <IconButton color={"inherit"} onClick={handleUpdate}>
                                                    <EditOutlined fontSize={"small"} />
                                                </IconButton>

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"} />
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                                            </Box>
                                        )
                                    }


                                    <IconButton color={"inherit"} onClick={handleCreate} >
                                        <AddOutlined />
                                    </IconButton>

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
                id: "slogan",
                label: "Slogan",
                align: "left"
            },
            {
                id: "active_service",
                label: "Servicios",
                align: "left"
            },
            {
                id: "seller",
                label: "Vendedor(a)",
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
    const TableContent = () => {
        return (
            <TableBody>
                {data.map((row, index) => (
                    <React.Fragment key={row.id}>
                        <TableRow
                            key={row.id}
                            hover
                            tabIndex={-1}
                            onClick={() => handleSelectItem(row)}
                        >
                            <TableCell>
                                <Checkbox size={"small"} checked={selected && (row.id === selected.id)} />
                            </TableCell>

                            <TableCell>
                                {row.name}
                                <br />
                                <small>
                                    {(row.description !== '') ? row.description : ''}
                                </small>
                            </TableCell>

                            <TableCell>
                                {(row.slogan !== '') ? row.slogan : '-'}
                            </TableCell>

                            <TableCell>
                                <Grid container columnSpacing={1} >

                                    <Grid item >
                                        <Tooltip title={"Catálogo"} >
                                            <AutoStories
                                                color={row.online_catalog ? "primary" : "disabled"}
                                                fontSize="small" />
                                        </Tooltip>
                                    </Grid>

                                    <Grid item >
                                        <Tooltip title={"Reservaciones"} >
                                            <ShoppingCartOutlined
                                                color={row.online_reservation ? "primary" : "disabled"}
                                                fontSize="small" />
                                        </Tooltip>
                                    </Grid>

                                </Grid>

                            </TableCell>

                            <TableCell>
                                {row.seller_user ? `${row.seller_user.name} (${row.seller_user.username})` : "-"}
                            </TableCell>

                            <TableCell style={{ padding: 0 }} colSpan={5}>
                                <Tooltip title={"Details"}>
                                    <IconButton
                                        size={"small"}
                                        sx={{ m: "3px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDetails((showDetails !== index) ? index : '')
                                        }}
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
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Slogan:</Grid>
                                                <Grid item xs={true}>
                                                    {row.slogan}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Direccion:</Grid>
                                                <Grid item xs={true}>
                                                    {row.address}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>{`Vendedor(a):`}</Grid>
                                                <Grid item xs={true}>
                                                    {
                                                        (row.seller_user)
                                                            ? `${row.seller_user.name} (${row.seller_user.username})`
                                                            : "No hay vendedor asignado"
                                                    }
                                                </Grid>
                                            </Grid>


                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Ganacia del vendedor por defecto:</Grid>
                                                <Grid item xs={true}>
                                                    {
                                                        (row.fixed_seller_profit_percentage)
                                                            ? `${row.fixed_seller_profit_percentage} %`
                                                            : `${row.fixed_seller_profit_quantity} CUP`
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Catálogo en línea:</Grid>
                                                <Grid item xs={true}>
                                                    {

                                                        <Grid container columnSpacing={1}>
                                                            <Grid item > {`Servicio ${row.online_catalog ? "activo" : "inactivo"}  `}</Grid>
                                                            <Grid item>
                                                                <Tooltip title={"Catálogo"} >
                                                                    <AutoStories
                                                                        color={row.online_catalog ? "primary" : "disabled"}
                                                                        fontSize="small" />
                                                                </Tooltip>

                                                            </Grid>

                                                        </Grid>

                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Reservaciones en línea:</Grid>
                                                <Grid item xs={true}>
                                                    {

                                                        <Grid container columnSpacing={1}>
                                                            <Grid item > {`Servicio ${row.online_reservation ? "activo" : "inactivo"}  `}</Grid>
                                                            <Grid item>
                                                                <Tooltip title={"Reservaciones"} >
                                                                    <ShoppingCartOutlined
                                                                        color={row.online_reservation ? "primary" : "disabled"}
                                                                        fontSize="small" />
                                                                </Tooltip>

                                                            </Grid>

                                                        </Grid>

                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={true}>
                                                    <Box
                                                        sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "blue" }}
                                                        onClick={() => router.push(`/profile/${params.id}/store-details/${row.id}`)}
                                                    >
                                                        Administrar Tienda

                                                    </Box>
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
        <Card variant={"outlined"}>
            <CustomToolbar />

            <CardContent>
                {
                    data?.length > 0
                        ? (
                            <Table sx={{ width: "100%" }} size={"small"}>
                                <TableHeader />

                                <TableContent />
                            </Table>
                        ) : (
                            <TableNoData />
                        )
                }
            </CardContent>
        </Card>
    )
}