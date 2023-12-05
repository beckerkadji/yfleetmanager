import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum VEHICLE_TYPE_LIST {
    VOITURE = 1,
    MOTO = 2,
}

export enum VEHICLE_HR {
    VOITURE = "voiture",
    MOTO = "moto",
}

export const VehicleTypeModel = prisma.vehicleType;