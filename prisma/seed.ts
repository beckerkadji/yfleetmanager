import { PrismaClient, Prisma } from '@prisma/client'
import {roleModel, USER_ROLE} from "../app/models/role";
import {AUTHUSER, UserModel} from "../app/models/user";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient()
import dotenv from "dotenv";
import { permitionModel } from '../app/models/permission';
import { UserPermissionModel, root_permission } from '../app/models/user_permission';
import { CITY_LIST, cityModel } from '../app/models/city';
import { Driver_TYPE, driverTypeModel } from '../app/models/driver_type';
import { GRADE_TYPE, gradeModel } from '../app/models/grade';
dotenv.config()

//Role data for seeding
const role_data: Prisma.RoleCreateInput[] = Object.keys(USER_ROLE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name}))

//City data for seeding
const city_seeding: Prisma.CityCreateInput[] = Object.keys(CITY_LIST)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name}))

//DriverType data for seeding
const driverType_data: Prisma.DriverTypeCreateInput[] = Object.keys(Driver_TYPE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name}))

//Grade data for seeding
const grade_data: Prisma.GradeCreateInput[] = Object.keys(GRADE_TYPE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name}))
    
async function main() {

    console.log("Start seeding ...")

    for(const u of role_data){
        console.log("Role seeding...")
        const role = await roleModel.create({data: u})
        console.log(`Role created with id ${role.id}`)
    }

    for(const u of city_seeding){
      console.log("City seeding...")
      const city = await cityModel.create({data: u})
      console.log(`City created with id ${city.id}`)
    }

    for(const u of grade_data){
      console.log("grade seeding...")
      const grade = await gradeModel.create({data: u})
      console.log(`grade created with id ${grade.id}`)
    }

    for(const u of driverType_data){
      console.log("driver type seeding...")
      const driverType = await driverTypeModel.create({data: u})
      console.log(`driver Type created with id ${driverType.id}`)
    }

    console.log(`Start User seeding ...`)
    const user = await UserModel.create({
        data : {
            first_name : "admin",
            last_name : "root",
            email: "kadjibecker@gmail.com",
            phone: "+237696809088",
            verified_at : new Date(),
            password : bcrypt.hashSync('password',10),
            role : {connect : {id : USER_ROLE.ROOT}},
        }
    })
    console.log(`Created user with id: ${user.id}`)

    console.log(`Start Permission seeding ...`)
    await permitionModel.createMany({data : root_permission.map(itm => ({name : itm}))})
    console.log(`Permission seeded with success!`)
  
    console.log(`Start User Permission seeding ...`)
    await UserPermissionModel.createMany({data : root_permission.map(itm => ({permission_id : itm, user_id : user.id}))})
    console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })