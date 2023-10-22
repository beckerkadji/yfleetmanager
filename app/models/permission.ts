import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export enum PERMISSION {
    // Root Management
    ALL_PERMISSION = "all_permission",

    // Admin Management
    READ_ADMIN = "read_admin",
    ADD_ADMIN = "add_admin",
    EDIT_ADMIN = "edit_admin",
    DELETE_ADMIN = "delete_admin",
    BLOCK_ADMIN = "block_admin",

    // Driver Management
    READ_DRIVER = "read_driver",
    ADD_DRIVER = "add_driver",
    EDIT_DRIVER = "edit_driver",
    DELETE_DRIVER = "delete_driver",
    BLOCK_DRIVER = "block_driver",

    // Permission Management
    ADD_PERMISSION = "add_permission",
    REMOVE_PERMISSION = "remove_permission",

    // Role Management
    CHANGE_ROLE = "change_role",

    // Session Management
    READ_SESSION = "read_session",
    LOGOUT_SESSION = "logout_session",

    // Manage Target
    ADD_TARGET = "add_target",
    EDIT_TARGET = "edit_target",
    REMOVE_TARGET = "remove_target",

    // Manage Supplement search information
    ADD_SUP_SEARCH = "add_sup_search"
}

export const permitionModel = prisma.permission;