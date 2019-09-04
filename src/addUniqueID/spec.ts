import * as test  from 'tape';

import addUniqueID, { getLastID, addIDs } from './index';

const operation1 = {
    uniq_id: 1,
    activity_date: 'this is a string',
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
    narrative: 'this is a string',
    correction: 'this is a string',
    operation_id: 873652,
    operation_number: 'facility string',
    operation_type: 'facility string',
    operation_name: 'facility string',
    location_address: 'facility string',
    phone: 'facility string',
    county: 'facility string',
    website: 'facility string',
    email: 'facility string',
    programs_provided: 'facility string',
    type_of_issuance: 'facility string',
    issuance_date: 'facility string',
    open_foster_homes: 873652,
    open_branch_offices: 873652,
    num_admin_penalties: 0,
    is_main_branch: true,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

const operation2 = {
    uniq_id: 2,
    activity_date: 'this is a strizing',
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
    narrative: 'this is a string',
    correction: 'this is a string',
    operation_id: 873652,
    open_foster_homes: 873652,
    open_branch_offices: 873652,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
    num_admin_penalties: null,
    is_main_branch: true,
    operation_number: 'facility string',
    operation_type: 'facility string',
    operation_name: 'facility string',
    location_address: 'facility string',
    phone: 'facility string',
    county: 'facility string',
    website: 'facility string',
    email: 'facility string',
    programs_provided: 'facility string',
    type_of_issuance: 'facility string',
    issuance_date: 'facility string',
};

const operation3 = {
    activity_date: 'this is a string',
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
    num_admin_penalties: 5,
    narrative: 'this is a string',
    correction: 'this is a string',
    operation_id: 87365222,
    is_main_branch: true,
    operation_number: 'facility string',
    operation_type: 'facility string',
    operation_name: 'facility string',
    location_address: 'facility string',
    phone: 'facility string',
    county: 'facility string',
    website: 'facility string',
    email: 'facility string',
    programs_provided: 'facility string',
    type_of_issuance: 'facility string',
    issuance_date: 'facility string',
    open_foster_homes: 873652,
    open_branch_offices: 873652,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

const operation4 = {
    activity_date: 'this is a stringy',
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
    narrative: 'this is a string',
    correction: 'this is a string',
    operation_id: 87365222,
    num_admin_penalties: 2,
    operation_number: 'facility string',
    operation_type: 'facility string',
    operation_name: 'facility string',
    location_address: 'facility string',
    phone: 'facility string',
    county: 'facility string',
    website: 'facility string',
    email: 'facility string',
    programs_provided: 'facility string',
    type_of_issuance: 'facility string',
    issuance_date: 'facility string',
    open_foster_homes: 873652,
    is_main_branch: true,
    open_branch_offices: 873652,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

test('getLastID should find the highest uniq_id in the existingData', t => {
    let result = getLastID([operation1, operation2]);
    let expected = 2;
    t.equal(result, expected);
    t.end();
});

test('addIDs should add iterable IDs atop the last uniq_id', t => {
    let result = addIDs([operation3, operation4], 2048)[1].uniq_id;
    let expected = 2050;
    t.equal(result, expected);
    t.end();
});

test('addUniqID should return operations with consecutive uniq_ids', t => {
    let result = addUniqueID([operation3, operation4], [operation1, operation2])[1].uniq_id;
    let expected = 4;
    t.equal(result, expected);

    t.end();
});
