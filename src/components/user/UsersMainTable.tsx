"use client"

import React from "react";
import {
    AppBar,
    Badge,
    Box,
    Card,
    CardContent,
    Checkbox, Chip,
    CircularProgress,
    Divider,
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
import {TableNoData} from "@/components/TableNoData";
import {AddOutlined, DeleteOutline, EditOutlined, PersonOutlined} from "@mui/icons-material";
import roles from "@/requests/roles"
import Link from "next/link";
import {useRouter} from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function UsersMainTable() {
    const [data, setData] = React.useState(null)

    const router = useRouter()

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher("/user/api").then((data) => setData(data))
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
        const response = await roles.delete(selected.id)
        if (response) {
            const updatedRoles = await roles.allRoles()
            if (updatedRoles) setData(updatedRoles)
        }
    }

    async function handleUpdate() {
        await router.push(`/role/update/${selected.id}`)
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        Listado de roles
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
                id: "username",
                label: "Usuario",
                align: "left"
            },
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "mail",
                label: "Correo",
                align: "left"
            },
            {
                id: "phone",
                label: "Teléfono",
                align: "left"
            },
            {
                id: "is_active",
                label: "Activo",
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
        function getColorByRole(roleName) {
            switch (roleName) {
                case "admin":
                    return "primary"

                case "store_owner":
                    return "secondary"

                case "store_keeper":
                    return "error"

                case "store_seller":
                    return "success"

                default:
                    return "disabled"
            }
        }


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
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)}/>
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`Usuario ${row.is_active ? 'activo' : 'inactivo'} (${row.roles.name})`}>
                                <Badge
                                    color={row.is_active === true ? "success" : "error"}
                                    variant={"dot"}
                                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                                >
                                    <PersonOutlined fontSize={"small"} color={getColorByRole(row.roles.name)}/>
                                </Badge>
                            </Tooltip>
                            {` ${row.username}`}
                        </TableCell>
                        <TableCell>
                            {row.name}
                        </TableCell>
                        <TableCell>
                            {row.mail}
                        </TableCell>
                        <TableCell>
                            {row.phone}
                        </TableCell>
                        <TableCell>
                            <Chip
                                variant="outlined"
                                size="small"
                                color={row.is_verified ? "success" : "error"}
                                label={row.is_verified ? "Si" : "No"}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <CustomToolbar/>

            <CardContent>
                {
                    data?.length > 0
                        ? (
                            <Table sx={{width: "100%"}} size={"small"}>
                                <TableHeader/>

                                <TableContent/>
                            </Table>
                        ) : (
                            <TableNoData/>
                        )
                }
            </CardContent>
        </Card>
    )
}