import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum VEHICLE_STATUS {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    MAINTENANCE = 'maintenance'
}
export const VehicleModel = prisma.vehicle;