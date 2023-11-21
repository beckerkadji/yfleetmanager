import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum CITY_LIST {
    DOUALA = 1,
    KINSHASA = 2,
    YAOUNDE = 3
}

export enum CITY_HR {
    DOUALA = "douala",
    KINSHASA = "kinshasa",
    YAOUNDE = "yaounde",
}

export const CityModel = prisma.city ;