// this is what the parseArguments model returns
export interface ParsedArgumentsPayload {
    start?: number;
    finish?: number;
    specific?: Array<number>;
    scope?: number;
    throttle?: number;
    batchidx?: number;
};

export interface ParsedArguments {
    isSuccessful: boolean;
    payload: ParsedArgumentsPayload;
};

// used to group attempts made and those failed for suspicious reasons
export interface AttemptedIDs {
    last_successful: number;
    last_attempted: number;
    total_from_last_scrape: number;
    total_in_database: number;
    facility_scraped_deficencies_rejected: Array<number>;
    facility_timeout_or_alert_page: Array<number>;
}

// AttemptedIDHandler interface
export interface AttemptedIDHandlerInstance {
    newAttempt: Function;
    newSuccess: Function;
    rejectedFacility: Function;
    rejectedDeficency: Function;
    setScrapeTotal: Function;
    setDBTotal: Function;
    ejectHash: Function;
}

// API query interfaces
export interface OperationPaths {
    dataset: string;
    sqlQuery: string;
}

export interface IDsPaths {
    dataset: string;
    file: string;
}

// range of IDs for the scraper to explore
export interface IDRange {
    range: Array<number>;
    throttle: number; 
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
    num_admin_penalties: number;
    is_main_branch: boolean;
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

// a row of operation data
export interface OperationHash extends FacilityHash, DeficiencyHash {}

// what will be pushed to the DB. This is the ultimate output
export interface UniqOperationHash extends OperationHash {
    uniq_id: number;
}

// key map used for building a facilityHash
export interface FacilityHashMapUtils {
    sel: string;
    func: Function;
}

export interface NumPenaltiesUtils {
    sel: Array<string>;
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
    is_main_branch: FacilityHashMapUtils;
    open_foster_homes: FacilityHashMapUtils;
    open_branch_offices: FacilityHashMapUtils;
    num_admin_penalties: NumPenaltiesUtils;
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
    standard_number_description: DeficencyHashMapUtils;
    activity_type: DeficencyHashMapUtils;
    standard_risk_level: DeficencyHashMapUtils;
    corrected_at_inspection: DeficencyHashMapUtils;
    corrected_date: DeficencyHashMapUtils;
    date_correction_verified: DeficencyHashMapUtils;
    technical_assistance_given: DeficencyHashMapUtils;
    narrative: DeficencyHashMapUtils;
}

// to push to server
export interface APIConfig {
    filename: string;
    dir: string;
    ext: string;
    contentType: string;
}
