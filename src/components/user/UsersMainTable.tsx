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
import {
    AddOutlined,
    DeleteOutline,
    Done,
    EditOutlined, PauseOutlined,
    PersonOutlined, StartOutlined, StopOutlined,
    ThumbsUpDownOutlined, TurnedIn, TurnedInNot
} from "@mui/icons-material";
import users from "@/requests/users"
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
        const response = await users.delete(selected.id)
        if (response) {
            const updatedUsers = await users.allUsers()
            if (updatedUsers) setData(updatedUsers)
        }
    }

    async function handleVerify() {
        const response = await users.verifyUser(selected.id)
        if (response) {
            let newData = [...data]
            const updatedItemIndex = newData.findIndex(item => item.id === response.id)
            newData[updatedItemIndex].is_verified = !newData[updatedItemIndex].is_verified
            setData(newData)
            setSelected(null)
        }
    }

    async function handleToggleActive() {
        const isActive = !selected.is_active
        const response = await users.toggleActivateUser(selected.id, isActive)
        if (response) {
            let newData = [...data]
            const updatedItemIndex = newData.findIndex(item => item.id === response.id)
            newData[updatedItemIndex].is_active = !newData[updatedItemIndex].is_active
            setData(newData)
            setSelected(null)
        }
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
                                                {
                                                    !selected.is_verified
                                                    && (
                                                        <IconButton color={"inherit"} onClick={handleVerify}>
                                                            <Done fontSize={"small"}/>
                                                        </IconButton>
                                                    )
                                                }

                                                <IconButton color={"inherit"} onClick={handleToggleActive}>
                                                    {
                                                        selected.is_active
                                                            ?  <PauseOutlined fontSize={"small"}/>
                                                            :  <StartOutlined fontSize={"small"}/>
                                                    }
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                         sx={{borderRight: "2px solid white", mx: "5px"}}/>

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"}/>
                                                </IconButton>
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
                        selected={selected && (row.id === selected.id)}
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
                            {
                                row.is_verified
                                    ? (<Box sx={{
                                        display: "inline-flex",
                                        p: "3px",
                                        my: "8px"
                                    }}>
                                        {row.username}
                                    </Box>)
                                    : (<Tooltip title={"Usuario no verificado"}>
                                        <Box sx={{
                                            display: "inline-flex",
                                            p: "3px",
                                            my: "8px",
                                            background: "red",
                                            color: "white",
                                            borderRadius: "3px"
                                        }}>
                                            {row.username}
                                        </Box>
                                    </Tooltip>)
                            }
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