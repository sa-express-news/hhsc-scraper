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

export interface FacilityResponse {
	isSuccessful: boolean;
	payload?: FacilityHash;
}

// columns plucked from the popup on the deficency page
export interface DeficencyPopUpHash {
    technical_assistance_given: boolean;
    narrative: string;
}

// columns from the operation deficiencies page
export interface DeficiencyHash extends DeficencyPopUpHash {
	activity_date: string;
    activity_id: number;
    standard_number_description: string;
    activity_type: string;
    standard_risk_level: string;
    corrected_at_inspection: boolean;
    corrected_date: string;
    date_correction_verified: string;
}

export interface DeficiencyResponse {
	isSuccessful: boolean;
	payload?: Array<DeficiencyHash>;
}

// a row of operation data to be pushed to the DB. This is the ultimate output
export interface OperationHash extends FacilityHash, DeficiencyHash {}

// key map used for building a facilityHash
export interface FacilityHashMapUtils {
	sel: string;
	func: Function;
}

// used for mapping response values through FacilityHashMapUtils to FacilityHash
export interface FacilityHashMap {
	operation_id: FacilityHashMapUtils;
	operation_number: FacilityHashMapUtils;
    operation_type: FacilityHashMapUtils;
    operation_name: FacilityHashMapUtils;
    location_address: FacilityHashMapUtils;
    phone: FacilityHashMapUtils;
    county: FacilityHashMapUtils;
    website: FacilityHashMapUtils;
    email: FacilityHashMapUtils;
    programs_provided: FacilityHashMapUtils;
    type_of_issuance: FacilityHashMapUtils;
    issuance_date: FacilityHashMapUtils;
    open_foster_homes: FacilityHashMapUtils;
    open_branch_offices: FacilityHashMapUtils;
    corrective_action: FacilityHashMapUtils;
    adverse_action: FacilityHashMapUtils;
    temporarily_closed: FacilityHashMapUtils;
    num_deficiencies_cited: FacilityHashMapUtils;
}

// key map used for building DeficencyHash
export interface DeficencyHashMapUtils {
    func: Function;
    cellsIdx?: number;
}

// used for mapping response values through DeficencyHashMapUtils to DeficencyHash
export interface DeficencyHashMap {
    activity_date: DeficencyHashMapUtils;
    activity_id: DeficencyHashMapUtils;
    standard_number_description: DeficencyHashMapUtils;
    activity_type: DeficencyHashMapUtils;
    standard_risk_level: DeficencyHashMapUtils;
    corrected_at_inspection: DeficencyHashMapUtils;
    corrected_date: DeficencyHashMapUtils;
    date_correction_verified: DeficencyHashMapUtils;
    technical_assistance_given: DeficencyHashMapUtils;
    narrative: DeficencyHashMapUtils;
}
