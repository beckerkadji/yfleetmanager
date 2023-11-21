import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum CURRENCY_LIST {
    CMR = 1,
    COD = 2,
    CIV = 3
}

export enum CURRENCY_HR {
    CMR = "CFA (XAF)",
    COD = "CDF",
    CIV = "CFA (XOF)",
}

export const CurrencyModel = prisma.currency;