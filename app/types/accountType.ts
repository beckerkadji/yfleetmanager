import {defaultRegion} from "./defaults/region.type";
import {defaultFisrtName} from "./defaults/firstName.type";
import {defaultLastName} from "./defaults/lastName.type";
import {defaultEmail} from "./defaults/email.types";
import {defaultPhone} from "./defaults/phone.type";

namespace AccountType {
    interface Region {
        name: defaultRegion,
        zone: string
    }

    export interface verifyOwnerAccount {
        email: defaultEmail
    }
    interface ownerAccount {
        first_name : defaultFisrtName,
        last_name ?: defaultLastName,
        email : defaultEmail,
        phone: defaultPhone,
    }
    export interface accountCreateFields {
        regions : Region[],
        owner : ownerAccount
    }
}
export default AccountType;