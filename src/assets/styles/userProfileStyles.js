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
        width: "200px",

        "&:hover": {
            boxShadow: 4,
            border: "1px solid black"
        },

        "> a": {
            textDecoration: "none"
        }
    },


}

export default userProfileStyles