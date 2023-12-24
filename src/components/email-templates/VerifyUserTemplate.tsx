import React from "react";

export default function VerifyUserTemplate({link}: {link: string}) {
    return (
        <div>
            <h1>Visite el siguiente link para verificar su correo</h1>

            <p>{link}</p>
        </div>
    )
}