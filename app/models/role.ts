import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum USER_ROLE {
    ROOT = 1,
    OWNER = 2,
    ADMIN = 3,
    AGENT = 4,
    DRIVER = 5
}

export enum ROLE_HR {
    ROOT = "root",
    OWNER = "owner",
    ADMIN = "admin",
    AGENT = "agent",
    DRIVER = "driver",
}

export const roleModel = prisma.role;