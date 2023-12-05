import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum VEHICLE_CONTRACT_TYPE_LIST {
    LEASING = 1,
}

export enum VEHICLE_HR {
    LEASING = "véhicule propre en leasing",
}

export const VehicleContractTypeModel = prisma.vehicleContractType;