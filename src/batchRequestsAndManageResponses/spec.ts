import * as test from 'tape';
import { flattenArray, removeEmpties } from './index';

const operation = {
	activity_date: 'this is a string',
    activity_id: 999,
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    narrative: 'this is a string',
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
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

const operationResponse = [
    [operation, operation, operation],
    [operation, operation, operation, operation, operation],
    [],
    [],
    [],
];

const filteredResponse = [
    [operation, operation, operation],
    [operation, operation, operation, operation, operation],
];

test('removeEmpties: Function should filter out empty arrays from nested arrays in array of arrays', t => {
    let result = removeEmpties(operationResponse);
    let expected = filteredResponse;
    t.deepEqual(result, expected);
    t.end();
});

test('flattenArray: Nested arrays should become single array', t => {
    let result = flattenArray(filteredResponse).length;
    let expected = 8;
    t.equal(result, expected);
    t.end();
});
