const userProfileStyles = {
    leftFlex: {
        display: "flex",
        fontWeight: "600",
        justifyContent: "flex-end",
        width: 1/3
    },

    rightFlex: {
        display: "flex",
        width: 2/3
    },

    cardButton: {
        padding: "7px",
        width: 1,
        boxSizing: "border-box",

        "&:hover": {
            boxShadow: 4,
            border: "1px solid black"
        },
    },


}

export default userProfileStyles