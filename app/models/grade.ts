import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum GRADE_TYPE {
    DEBUTANT = 1,
    INTERMEDIAIRE = 2,
    PRO = 3,
    EXPERT = 4,
}

export enum GRADE_HR {
    DEBUTANT = "debutant",
    INTERMEDIAIRE = "intermediaire",
    PRO = "pro",
    EXPERT = "expert"
}

export const GradeModel = prisma.grade;