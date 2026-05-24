"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const currentUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session){
        return null
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id
        },
        select : {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt : true ,
            updatedAt : true,
            
        }
    },
)
    return user
}

export const requireAuth = async () => {
    const user = await currentUser()
    if (!user) {
        redirect("/sign-in")
    }
    return user
}

export const requireUnauth = async () => {
    const user = await currentUser()
    if (user) {
        redirect("/")
    }
    return null
}

