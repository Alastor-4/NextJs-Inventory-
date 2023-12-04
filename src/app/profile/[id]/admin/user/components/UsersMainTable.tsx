// @ts-nocheck
"use client"

import React from "react";
import {
    AppBar,
    Badge,
    Box, Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
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
import {
    ArrowLeft,
    ChangeCircleOutlined,
    DeleteOutline,
    Done,
    PauseOutlined,
    PersonOutlined,
    StartOutlined,
} from "@mui/icons-material";
import users from "../requests/users"
import { useParams, useRouter } from "next/navigation";

export default function UsersMainTable(props) {
    const { roles } = props

    const params = useParams()
    const router = useRouter()

    const [data, setData] = React.useState(null)


    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        const getAllUser = async () => {
            const newData = await users.allUsers(params.id)
            setData(newData)
        }
        if (data === null) {
            getAllUser();
        }
    }, [data, params.id])

    //table selected item
    const [selected, setSelected] = React.useState(null)
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    //change role dialog
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleClickOpenDialog = () => {
        setOpenDialog(true);
    };

    function ChangeRoleDialog(props) {
        const { open, setOpen, selected, setData, setSelected } = props

        const [selectedRole, setSelectedRole] = React.useState<number | string>('');

        const handleChange = (event: SelectChangeEvent<typeof selectedRole>) => {
            setSelectedRole(event.target.value || '');
        };

        const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
            setOpen(false);
        };

        const handleApplyRole = async () => {
            const response = await users.changeRol(selected.id, selectedRole.id)
            if (response) {
                const updatedUser = await users.userDetails(response.id)

                if (updatedUser) {
                    let newData = [...data]
                    const updatedItemIndex = newData.findIndex(item => item.id === updatedUser.id)
                    newData.splice(updatedItemIndex, 1, updatedUser)
                    setData(newData)
                    setSelected(null)
                    setOpen(false)
                }
            }
        }

        return (
            <Dialog open={open} onClose={handleClose}>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <DialogTitle>Cambiar role a "{selected ? selected.username : ""}"</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                            <InputLabel id="dialog-select-label">Rol</InputLabel>
                            <Select
                                labelId="dialog-select-label"
                                id="dialog-select-label"
                                value={selectedRole}
                                onChange={handleChange}
                                input={<OutlinedInput label="Rol" fullWidth />}
                                fullWidth
                            >
                                {
                                    roles.map(item => (
                                        <MenuItem key={item.id} value={item}>{item.name}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button color={"primary"} disabled={!selectedRole} onClick={handleApplyRole}>Cambiar</Button>
                </DialogActions>
            </Dialog>
        );
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
                        Listado de usuarios
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
                                                {
                                                    !selected.is_verified
                                                    && (
                                                        <IconButton color={"inherit"} onClick={handleVerify}>
                                                            <Done fontSize={"small"} />
                                                        </IconButton>
                                                    )
                                                }

                                                <IconButton color={"inherit"} onClick={handleToggleActive}>
                                                    {
                                                        selected.is_active
                                                            ? <PauseOutlined fontSize={"small"} />
                                                            : <StartOutlined fontSize={"small"} />
                                                    }
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />

                                                <IconButton color={"inherit"} onClick={handleClickOpenDialog}>
                                                    <ChangeCircleOutlined fontSize={"small"} />
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"} />
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
            {
                id: "role_id",
                label: "Role",
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
                    return "info"
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
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)} />
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`Usuario ${row.is_active ? 'activo' : 'inactivo'} (${row.roles?.name ?? "user"})`}>
                                <Badge
                                    color={row.is_active === true ? "success" : "error"}
                                    variant={"dot"}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                >
                                    <PersonOutlined fontSize={"small"} />
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
                        <TableCell>
                            {
                                row.roles ? (
                                    <Chip
                                        size={"small"}
                                        label={row.roles.name}
                                        color={getColorByRole(row.roles.name)}
                                        sx={{ border: "1px solid lightGreen" }}
                                    />
                                ) : "-"
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <>
            <ChangeRoleDialog
                open={openDialog}
                setOpen={setOpenDialog}
                setData={setData}
                selected={selected}
                setSelected={setSelected}
            />
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
        </>
    )
}