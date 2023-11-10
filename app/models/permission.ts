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

    //AGENT Management
    READ_AGENT = "read_agent",
    ADD_AGENT = "add_agent",


    // Driver Management
    READ_DRIVER = "read_driver",
    ADD_DRIVER = "add_driver",
    EDIT_DRIVER = "edit_driver",
    DELETE_DRIVER = "delete_driver",
    BLOCK_DRIVER = "block_driver",


    //vehicle Management
    READ_VEHICLE = "read_vehicle",
    ADD_VEHICLE = "add_vehicle",
    EDIT_VEHICLE = "edit_vehicle",
    DELETE_VEHICLE = "delete_vehicle",
    DESACTIVATE_VEHICLE = "desactivate_vehicle",

    //Passation Management
    PASSATION_MANAGE = "passation_manage",

    //planing Management
    PLANNING_MANAGE = "planning_manage",
    EDIT_PLANNING_DRIVER = "edit_planning_driver",

    //entretien management
    ENTRETIEN_MANAGE = "entretien_manage",

    //comptability management
    COMPTABILITY_MANAGE = "comptability_manage",



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