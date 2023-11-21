import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum CURRENCY_LIST {
    FCFA = 1,
    KINSHASA = 2,
    YAOUNDE = 3
}

export enum CURRENCY_HR {
    DOUALA = "douala",
    KINSHASA = "kinshasa",
    YAOUNDE = "yaounde",
}

export const CurrencyModel = prisma.currency;