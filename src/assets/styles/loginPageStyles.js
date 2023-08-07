const loginPageStyles = {
    container: {
        minHeight: "calc(100vh)",
        width: "calc(100vw)",
        backgroundColor: "#798fa1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "8px",
        boxSizing: "border-box",
    },

    card: {
        width:
            {
                xm: "calc(100vw)",
                sm: "calc(90vw)",
                md: "calc(80vw)",
                lg: "calc(70vw)",
                xl: "calc(60vw)",
            }
    },

    cardContainer: {
        display: 'flex',
    },

    leftColumnContainer: {
        display: "flex",
        backgroundColor: "#23395d",
        color: "white",
        pl: 3,
        pr: 3,
        pb: 4,
        width: {xs: 1, sm: 1, md: 1/2, lg: 1/2, xl: 1/2},
    },

    rightColumnContainer: {
        display: "flex",
        p: 2,
        width: {xs: 1, sm: 1, md: 1/2, lg: 1/2, xl: 1/2},
    }
}

export default loginPageStyles