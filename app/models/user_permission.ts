import { PrismaClient } from '@prisma/client'
import { PERMISSION } from './permission'
import { ROLE_HR } from './role'

const prisma = new PrismaClient()

export const root_permission = Object.values(PERMISSION).map( permission => permission)

export const admin_permission = [
    PERMISSION.ADD_DRIVER,
    PERMISSION.READ_DRIVER,
    PERMISSION.EDIT_DRIVER,
    PERMISSION.BLOCK_DRIVER,
    PERMISSION.READ_SESSION,
    PERMISSION.LOGOUT_SESSION,
]

export const driver_permission = [
    PERMISSION.ADD_TARGET,
    PERMISSION.EDIT_TARGET,
    PERMISSION.REMOVE_TARGET
]


export const right_permission = (role : ROLE_HR) : PERMISSION[] => {
    switch (role){
        case ROLE_HR.ROOT:
            return root_permission
        case ROLE_HR.ADMIN:
            return admin_permission
        case ROLE_HR.DRIVER:
            return driver_permission
        default:
            throw new Error("Incorrect role asking")
    }
}

export const UserPermissionModel = prisma.user_permission;