"use client"

import { useRouter } from 'next/navigation';
import React from 'react';

const MyAccount = ({ user }: any) => {
    const router = useRouter();
    return (<>
        <button onClick={() => { router.back() }}>Atras</button>
        <code>{JSON.stringify(user)}</code>
    </>
    )
}

export default MyAccount