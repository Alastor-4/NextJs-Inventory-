import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import { userWithRole } from '@/types/interfaces';
import { getServerSession } from 'next-auth';
import Account from './components/Account';
import { prisma } from '@/db';
import React from 'react';

const AccountPage = async () => {
    const session = await getServerSession(nextAuthOptions);
    const user: userWithRole | null = await prisma.users.findUnique({ where: { id: session?.user.id }, include: { roles: true } });
    return <Account user={user} />
}

export default AccountPage