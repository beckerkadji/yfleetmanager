import { PrismaClient, Prisma } from '@prisma/client'
import {roleModel, USER_ROLE} from "../app/models/role";
import { UserModel} from "../app/models/user";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient()
import dotenv from "dotenv";
import { permitionModel } from '../app/models/permission';
import { UserPermissionModel, root_permission } from '../app/models/user_permission';
import {CITY_LIST, CityModel} from '../app/models/city';
import {Driver_TYPE, DriverTypeModel} from '../app/models/driver_type';
import {GRADE_TYPE, GradeModel} from '../app/models/grade';
import {CURRENCY_HR, CURRENCY_LIST, CurrencyModel} from "../app/models/currency";
import {CarColorModel, COLOR_LIST} from "../app/models/carcolor";
import {carModel} from "../app/models/carmodel";
import {VEHICLE_TYPE_LIST, VehicleTypeModel} from "../app/models/vehicle_type";
import VehicleType from "../app/types/vehicleType";
import {VEHICLE_CONTRACT_TYPE_LIST, VehicleContractTypeModel} from "../app/models/vehicle_contract_type";
dotenv.config()


//Currency data for seeding
const currency_data = (Object.keys(CURRENCY_LIST) as Array<keyof typeof CURRENCY_HR>)
    .filter(key => isNaN(Number(key)))
    .map(code => ({
        name: CURRENCY_HR[code],
        country_code: code.toLowerCase()
    }));

//Vehicle type data for seeding
const vehicle_type_data:  Prisma.VehicleTypeCreateInput[] = Object.keys(VEHICLE_TYPE_LIST)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))

//Vehicle contract type data for seeding
const vehicle_contract_type_data:  Prisma.VehicleContractTypeCreateInput[] = Object.keys(VEHICLE_CONTRACT_TYPE_LIST)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))

//Role data for seeding
const role_data: Prisma.RoleCreateInput[] = Object.keys(USER_ROLE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name}))

//color data for seeding
const color_data: Prisma.carColorCreateInput[] = Object.keys(COLOR_LIST)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))

//City data for seeding
const city_seeding: Prisma.CityCreateInput[] = Object.keys(CITY_LIST)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))

//DriverType data for seeding
const driverType_data: Prisma.DriverTypeCreateInput[] = Object.keys(Driver_TYPE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))

//Grade data for seeding
const grade_data: Prisma.GradeCreateInput[] = Object.keys(GRADE_TYPE)
    .filter(x => !(parseInt(x) >= 0))
    .map(name => ({name: name.toLowerCase()}))
    
async function main() {

    console.log("Start seeding ...")

    for (const c of currency_data) {
        // Vérifier si la devise existe déjà
        const existingCurrency = await CurrencyModel.findUnique({
            where: {
                country_code: c.country_code // ou 'name', selon le critère d'unicité
            }
        });
        // Si la devise n'existe pas, l'insérer
        if (!existingCurrency) {
            console.log("Seeding currency:", c.name);
            const currency = await CurrencyModel.create({ data: c });
            console.log(`Currency created with id ${currency.id}`);
        } else {
            console.log(`Currency already exists: ${c.name}`);
        }
    }

    for(const u of role_data){
        // Vérifier si le rôle existe déjà
        const existingRole = await roleModel.findUnique({
            where: {
                name: u.name // Assurez-vous que 'name' est le champ d'unicité dans votre modèle
            }
        });
        // Si le rôle n'existe pas, l'insérer
        if (!existingRole) {
            console.log("Seeding role:", u.name);
            const role = await roleModel.create({ data: u });
            console.log(`Role created with id ${role.id}`);
        } else {
            console.log(`Role already exists:  ${u.name}`);
        }
    }

    for(const vt of vehicle_type_data){
        const existingVehicleType = await VehicleTypeModel.findUnique({
            where: {
                name: vt.name
            }
        });
        if (!existingVehicleType) {
            console.log("Seeding vehicle type:", vt.name);
            const vehicle_type = await VehicleTypeModel.create({ data: vt });
            console.log(`Vehicle type created with id ${vehicle_type.id}`);
        } else {
            console.log(`Vehicle type already exists:  ${vt.name}`);
        }
    }

    for(const vct of vehicle_contract_type_data){
        const existingVehicleContractType = await VehicleContractTypeModel.findUnique({
            where: {
                name: vct.name
            }
        });
        if (!existingVehicleContractType) {
            console.log("Seeding vehicle contract type:", vct.name);
            const vehicle_contract_type = await VehicleContractTypeModel.create({ data: vct });
            console.log(`Vehicle contract type created with id ${vehicle_contract_type.id}`);
        } else {
            console.log(`Vehicle contract type already exists:  ${vct.name}`);
        }
    }

    for(const co of color_data){
        // Vérifier si la couleur existe déjà
        const existingColor = await CarColorModel.findUnique({
            where: {
                name: co.name // Assurez-vous que 'name' est le champ d'unicité dans votre modèle
            }
        });
        // Si la couleur n'existe pas, l'insérer
        if (!existingColor) {
            console.log("Seeding Color:", co.name);
            const color = await CarColorModel.create({ data: co });
            console.log(`Color created with id ${color.id}`);
        } else {
            console.log(`Color already exists:  ${co.name}`);
        }
    }

    for(const c of city_seeding){

        const existingCity = await CityModel.findUnique({
            where: {
                name: c.name // Assurez-vous que 'name' est le champ d'unicité dans votre modèle
            }
        });
        if (!existingCity) {
            console.log("Seeding city:", c.name);
            const city = await CityModel.create({ data: c });
            console.log(`City created with id ${city.id}`);
        } else {
            console.log(`City already exists:  ${c.name}`);
        }
    }

    for(const g of grade_data){
        const existingGrade = await GradeModel.findUnique({
            where: {
                name: g.name // Assurez-vous que 'name' est le champ d'unicité dans votre modèle
            }
        });
        if (!existingGrade) {
            console.log("Seeding grade:", g.name);
            const grade = await GradeModel.create({ data: g });
            console.log(`Grade created with id ${grade.id}`);
        } else {
            console.log(`Grage already exists:  ${g.name}`);
        }
    }

    for(const dt of driverType_data){
        const existingDriverType = await DriverTypeModel.findUnique({
            where: {
                name: dt.name // Assurez-vous que 'name' est le champ d'unicité dans votre modèle
            }
        });
        if (!existingDriverType) {
            console.log("Driver type:", dt.name);
            const grade = await DriverTypeModel.create({ data: dt });
            console.log(`Driver type created with id ${grade.id}`);
        } else {
            console.log(`Driver type already exists:  ${dt.name}`);
        }
    }

    console.log(`Start Permission seeding ...`);

    // Récupérer les permissions existantes
    const existingPermissions = await permitionModel.findMany({
        select: { name: true }
    });
    const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

    // Filtrer les permissions à insérer
    const permissionsToSeed = root_permission.filter(p => !existingPermissionNames.has(p));

    // Insérer les nouvelles permissions
    if (permissionsToSeed.length > 0) {
        await permitionModel.createMany({
            data: permissionsToSeed.map(name => ({ name }))
        });
        console.log(`${permissionsToSeed.length} permissions seeded with success!`);
    } else {
        console.log('No new permissions to seed.');
    }

    if (
        (process.env.ROOT_EMAIL && process.env.ROOT_EMAIL !== '') &&
        (process.env.ROOT_PHONE && process.env.ROOT_FIRST_NAME !== '') &&
        (process.env.ROOT_PHONE && process.env.ROOT_LAST_NAME !== '') &&
        (process.env.ROOT_PHONE && process.env.ROOT_PHONE !== '') &&
        (process.env.ROOT_PASSWORD && process.env.ROOT_PASSWORD !== '')) {

        console.log(`Start User seeding ...`)
        const findUserRoot = await UserModel.findUnique({
            where : {
                email: process.env.ROOT_EMAIL
            }
        })
        if (findUserRoot){
            console.log(`User root already exist: ${findUserRoot.id}`)

            console.log(`Start User Permission seeding ...`);

            // Récupérer les permissions existantes de l'utilisateur root
            const existingUserPermissions = await UserPermissionModel.findMany({
                where: { user_id: findUserRoot.id },
                select: { permission_id: true }
            });
            const existingUserPermissionIds = new Set(existingUserPermissions.map(up => up.permission_id));

            // Filtrer les permissions à insérer pour l'utilisateur root
            const permissionsToSeed = root_permission.filter(pid => !existingUserPermissionIds.has(pid));

            // Insérer les nouvelles permissions pour l'utilisateur root
            if (permissionsToSeed.length > 0) {
                await UserPermissionModel.createMany({
                    data: permissionsToSeed.map(permission_id => ({
                        permission_id,
                        user_id: findUserRoot.id
                    }))
                });
                console.log(`${permissionsToSeed.length} user permissions seeded with success!`);
            } else {
                console.log('No new user permissions to seed for root.');
            }
        }else{
            const user = await UserModel.create({
                data : {
                    first_name : process.env.FIRST_NAME,
                    last_name : process.env.LAST_NAME,
                    email: process.env.ROOT_EMAIL,
                    phone: process.env.ROOT_PHONE,
                    verified_at : new Date(),
                    password : bcrypt.hashSync(process.env.ROOT_PASSWORD,10),
                    role : {connect : {id : USER_ROLE.ROOT}},
                }
            })
            console.log(`Created user with id: ${user.id}`)

            console.log(`Start User Permission seeding ...`)
            await UserPermissionModel.createMany({data : root_permission.map(itm => ({permission_id : itm, user_id : user.id}))})
            console.log(`Seeding finished.`)
        }

    } else {
        throw new Error('Vérifiez que les variables d\'environements ROOT_EMAIL ROOT_PASSWORD ROOT_PHONE ROOT_FIRST_NAME et ROOT_LAST_NAME sont définies.');
    }

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })