import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum Driver_TYPE {
    PRINCIPAL = 1,
    INTERIMAIRE = 2,
}

export enum Driver_TYPE_HR {
    PRINCIPAL = "principal",
    INTERIMAIRE = "interimaire",
}

export const DriverTypeModel = prisma.driverType ;