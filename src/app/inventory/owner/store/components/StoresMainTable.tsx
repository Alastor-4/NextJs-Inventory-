"use client"

import React from "react";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
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
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import {
    AddOutlined,
    ArrowLeft,
    AutoStories,
    ChevronRightOutlined,
    DeleteOutline,
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    ShoppingCartOutlined,
    StorefrontOutlined
} from "@mui/icons-material";

import { useRouter } from "next/navigation";
import { daysMap } from "@/utils/generalFunctions";
import dayjs from "dayjs";
import stores from "../requests/stores";

export default function StoresMainTable({ userId }: { userId: number }) {

    const [data, setData] = React.useState<any>(null)
    const [showDetails, setShowDetails] = React.useState(false)

    const router = useRouter()

    //get initial data
    React.useEffect(() => {
        const getData = async () => {
            const newData = await stores.allUserStores(userId);
            setData(newData);
        }
        if (data === null) {
            getData();
        }
    }, [userId, data])

    //table selected item
    const [selected, setSelected] = React.useState<any>(null)

    const handleSelectItem = (item: any) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    async function handleRemove() {
        const response = await stores.delete(userId, selected.id)
        if (response) {
            const updatedStores = await stores.allUserStores(userId)
            if (updatedStores) setData(updatedStores)
            setSelected(null);
        }
    }

    function handleUpdate() {
        router.push(`/inventory/owner/store/update/${selected.id}`)
    }
    function handleCreate() {
        router.push(`/inventory/owner/store/create`)
    }
    function handleNavigateBack() {
        router.push(`/inventory`)
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
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Tiendas
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selected && (
                            <Box sx={{ display: "flex" }}>
                                <IconButton
                                    color={"inherit"}
                                    onClick={() => router.push(`/inventory/owner/store-details/${selected.id}`)}
                                >
                                    <StorefrontOutlined fontSize={"small"} />
                                </IconButton>

                                <Divider orientation="vertical" variant="middle" flexItem
                                         sx={{ borderRight: "2px solid white", mx: "5px" }} />

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
                label: "Vendedor",
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
                    />
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
                {data.map((row: any, index: any) => (
                    <React.Fragment key={row.id}>
                        <TableRow
                            key={row.id}
                            hover
                            tabIndex={-1}
                            onClick={() => setShowDetails((showDetails !== index) ? index : '')}
                        >
                            <TableCell>
                                <Checkbox
                                    size={"small"}
                                    checked={selected && (row.id === selected.id)}
                                    onClick={() => handleSelectItem(row)}
                                />
                            </TableCell>

                            <TableCell>
                                {row.name}
                            </TableCell>

                            <TableCell>
                                {(row.slogan !== '') ? row.slogan : '-'}
                            </TableCell>

                            <TableCell>
                                <Grid container columnSpacing={1}>
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
                                {row.seller_user ? row.seller_user.name.split(" ")[0] : "-"}
                            </TableCell>

                            <TableCell style={{ padding: 0 }} colSpan={5}>
                                <Tooltip title={"Details"}>
                                    <IconButton
                                        size={"small"}
                                        sx={{ m: "3px" }}
                                        onClick={() => setShowDetails((showDetails !== index) ? index : '')}
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
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                <Grid item xs={true}>
                                                    {row.description === "" ? '-' : row.description}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Slogan:</Grid>
                                                <Grid item xs={true}>
                                                    {row.slogan === "" ? '-' : row.slogan}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Dirección:</Grid>
                                                <Grid item xs={true}>
                                                    {row.address === "" ? '-' : row.address}
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
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Ganacia del vendedor por
                                                    defecto:</Grid>
                                                <Grid item xs={true}>
                                                    {
                                                        (row.fixed_seller_profit_percentage !== null)
                                                            ? `${row.fixed_seller_profit_percentage} %`
                                                            : `${row.fixed_seller_profit_quantity} CUP`
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Catálogo en línea:</Grid>
                                                <Grid item xs={true}>
                                                    <Grid container columnSpacing={1}>
                                                        <Grid
                                                            item> {`Servicio ${row.online_catalog ? "activo" : "inactivo"}  `}</Grid>
                                                        <Grid item>
                                                            <Tooltip title={"Catálogo"}>
                                                                <AutoStories
                                                                    color={row.online_catalog ? "primary" : "disabled"}
                                                                    fontSize="small" />
                                                            </Tooltip>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Reservaciones en
                                                    línea:</Grid>
                                                <Grid item xs={true}>
                                                    <Grid container columnSpacing={1}>
                                                        <Grid
                                                            item>{`Servicio ${row.online_reservation ? "activo" : "inactivo"}`}</Grid>
                                                        <Grid item>
                                                            <Tooltip title={"Reservaciones"}>
                                                                <ShoppingCartOutlined
                                                                    color={row.online_reservation ? "primary" : "disabled"}
                                                                    fontSize="small" />
                                                            </Tooltip>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid container item rowSpacing={1} xs={12}>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Horario de
                                                        apertura:</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {
                                                        row.store_open_days.length ? (
                                                            row.store_open_days.map((openItem: any) => (
                                                                <Grid container item spacing={1} xs={12}
                                                                    key={openItem.id}>
                                                                    <Grid item xs={"auto"} sx={{
                                                                        fontWeight: 600,
                                                                        display: "flex",
                                                                        alignItems: "center"
                                                                    }}>
                                                                        <ChevronRightOutlined fontSize={"small"} />
                                                                        {/*@ts-ignore*/}
                                                                        {daysMap[openItem.week_day_number]}:
                                                                    </Grid>
                                                                    <Grid item xs={true}>
                                                                        De {openItem?.day_start_time ? dayjs(openItem.day_start_time).format("hh:mm A") : "-"} a {openItem?.day_end_time ? dayjs(openItem.day_end_time).format("hh:mm A") : "-"}
                                                                    </Grid>
                                                                </Grid>
                                                            ))
                                                        ) : "no especificado"
                                                    }
                                                </Grid>
                                            </Grid>

                                            {
                                                row.online_reservation && (
                                                    <Grid container item rowSpacing={1} xs={12}>
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Horario de
                                                                reservaciones:</Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            {
                                                                row.store_reservation_days.length ? (
                                                                    row.store_reservation_days.map((openItem: any) => (
                                                                        <Grid container item spacing={1} xs={12}
                                                                            key={openItem.id}>
                                                                            <Grid item xs={"auto"} sx={{
                                                                                fontWeight: 600,
                                                                                display: "flex",
                                                                                alignItems: "center"
                                                                            }}>
                                                                                <ChevronRightOutlined fontSize={"small"} />
                                                                                {/*@ts-ignore*/}
                                                                                {daysMap[openItem.week_day_number]}:
                                                                            </Grid>
                                                                            <Grid item xs={true}>
                                                                                De {openItem?.day_start_time ? dayjs(openItem.day_start_time).format("hh:mm A") : "-"} a {openItem?.day_end_time ? dayjs(openItem.day_end_time).format("hh:mm A") : "-"}
                                                                            </Grid>
                                                                        </Grid>
                                                                    ))
                                                                ) : "no especificado"
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                )
                                            }

                                            <Grid item xs={12}>
                                                <Button
                                                    variant={"outlined"}
                                                    color={"info"}
                                                    onClick={() => router.push(`/inventory/owner/store-details/${row.id}`)}
                                                >
                                                    Administrar productos
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                )}
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
                            <TableContainer sx={{width: "100%", overflowX: "auto"}}>
                                <Table sx={{ width: "100%" }} size={"small"}>
                                    <TableHeader />

                                    <TableContent />
                                </Table>
                            </TableContainer>

                        ) : (
                            <TableNoData />
                        )
                }
            </CardContent>
        </Card>
    )
}