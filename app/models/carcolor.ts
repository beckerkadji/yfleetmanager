import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum COLOR_LIST {
    ORANGE = 1,
    NOIR = 2,
    BLANC = 3,
    BLEU = 4,
    ROUGE = 5,
    JAUNE = 6,
    MARON = 7
}

export enum COLOR_HR {
    ORANGE = "orange",
    NOIR = "noir",
    BLANC = "blanc",
    BLEU = "bleu",
    ROUGE = "rouge",
    JAUNE = "jaune",
    MARRON = "maron"
}
export const CarColorModel = prisma.carColor;