const tableStyles = {
    row: {
        "&>td:last-child": {
            position: "relative"
        }
    },
    actionColumn: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        paddingLeft: "25px",
        paddingRight: "20px",

        position: "absolute",
        zIndex: 1,
        right: 0,
        top: 0
    },
}

export default tableStyles