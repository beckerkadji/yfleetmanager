import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export const RegionModel = prisma.region;