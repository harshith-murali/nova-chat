import React from 'react'
import { requireUnauth } from '@/modules/authentication/actions'
const AuthLayout = async({
    children
}: {children: React.ReactNode}) => {
    await requireUnauth()
    return (
        <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center">
            {children}
        </div>
    )
}

export default AuthLayout