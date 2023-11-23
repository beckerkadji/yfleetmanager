declare namespace VehicleType {
    export interface vehicleCreateFields {
        brand_id : string,
        model_id: string,
        chassis_number : string,
        color_id: string,
        gps_number?: string,
        registration_number: string,
        insurance_subscription_at: Date,
        circulation_at : Date,
        entry_fleet_at: Date,
        contract_type: string,
        mileage: string,
        daily_recipe: string,
        currency_id: string,
        vehicle_owner_id: string,
        region_id: string
    }
    export interface brandCreate {
        name: string
    }

    export interface modelCreateField {
        brand_id: number
        name: string
    }

    export interface vehicleOwnerCreateField{
        first_name: string
        last_name: string
        cni_number: string
        driver_licence_number: string
    }
}
export default VehicleType

