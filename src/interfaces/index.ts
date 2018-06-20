// this is what the parseArguments model returns
export interface Payload {
	start: number;
	finish?: number;
};

export interface ParsedArguments {
	isSuccessful: boolean;
	payload: Payload;
};

// range of IDs for the scraper to explore
export interface IDRange {
	start: number;
	finish: number;
}

// columns for the facility details page
export interface FacilityHash {
	operation_id: number;
	operation_number: string;
    operation_type: string;
    operation_name: string;
    location_address: string;
    phone: string;
    county: string;
    website: string;
    email: string;
    programs_provided: string;
    type_of_issuance: string;
    issuance_date: string;
    open_foster_homes: number;
    open_branch_offices: number;
    corrective_action: boolean;
    adverse_action: boolean;
    temporarily_closed: boolean;
    num_deficiencies_cited: number;
}

// columns from the operation deficiencies page
export interface DeficiencyHash {
	activity_date: string;
    activity_id: number;
    standard_number_description: string;
    activity_type: string;
    standard_risk_level: string;
    corrected_at_inspection: boolean;
    corrected_date: string;
    date_correction_verified: string;
    narrative: string;
}

// a row of operation data to be pushed to the DB. This is the ultimate output
export interface OperationHash extends FacilityHash, DeficiencyHash {}
