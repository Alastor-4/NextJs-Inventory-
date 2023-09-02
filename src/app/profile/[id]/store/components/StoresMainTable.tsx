"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Checkbox, CircularProgress,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined } from "@mui/icons-material";
import stores from "@/app/profile/[id]/store/requests/stores";
import { useParams, useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoresMainTable() {
    const [data, setData] = React.useState(null)

    const params = useParams()
    const router = useRouter()

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/store/api`).then((data) => setData(data))
    }, [])

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
                id: "description",
                label: "Descripción",
                align: "left"
            },
            {
                id: "slogan",
                label: "Slogan",
                align: "left"
            },
            {
                id: "address",
                label: "Dirección",
                align: "left"
            },
            {
                id: "seller",
                label: "Vendedor(a)",
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
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)} />
                        </TableCell>

                        <TableCell>
                            {row.name}
                        </TableCell>

                        <TableCell>
                            {(row.description !== '') ? row.description : '-'}
                        </TableCell>

                        <TableCell>
                            {(row.slogan !== '') ? row.slogan : '-'}
                        </TableCell>

                        <TableCell>
                            {(row.address !== '') ? row.address : '-'}
                        </TableCell>

                        <TableCell>
                            {row.seller_user ? `${row.seller_user.name} (${row.seller_user.username})` : "-"}
                        </TableCell>
                    </TableRow>
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