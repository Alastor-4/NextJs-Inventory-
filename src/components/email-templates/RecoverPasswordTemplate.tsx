import * as React from "react";

interface RecoverPasswordTemplateProps {
    link: string;
}

export const RecoverPasswordTemplate: React.FC<Readonly<RecoverPasswordTemplateProps>> = ({ link }) => (
    <div>
        <h1>Visite el siguiente link para restablecer su contraseña</h1>

        <p>{link}</p>
    </div>
)