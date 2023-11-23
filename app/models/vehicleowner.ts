import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const VehicleOwnerModel = prisma.vehicleOwner;