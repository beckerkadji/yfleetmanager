import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum USER_ROLE {
    ROOT = 1,
    ADMIN = 2,
    AGENT = 3,
    DRIVER = 4
}

export enum ROLE_HR {
    ROOT = "root",
    ADMIN = "admin",
    AGENT = "agent",
    DRIVER = "driver",
}

export const roleModel = prisma.role;