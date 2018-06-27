import * as test      from 'tape';
import * as _         from 'lodash';
import * as puppeteer from 'puppeteer';

import batchRequestsAndManageResponses, { flattenArray, removeEmpties } from './index';

const operation = {
	activity_date: 'this is a string',
    activity_id: 999,
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
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

test('batchRequestsAndManageResponses: End to end test of 13 Ids batched in groups of 5', async t => {
    const browser = await puppeteer.launch();
    
    const response = await batchRequestsAndManageResponses(_.range(94080, 94093), 10, browser);

    console.log(response);

    let lenResult = response.length;
    let lenExpected = 50;
    t.equal(lenResult, lenExpected);

    let hashResult = response[response.length - 1];
    let hashExpected = { 
        activity_date: '1/20/2016',
        activity_id: 1307780819,
        standard_number_description: '745.625(a)(7) - Initial background checks submitted - At the time you become aware of anyone requiring a background check under 745.615',
        activity_type: 'Monitoring Inspections',
        standard_risk_level: 'High',
        corrected_at_inspection: false,
        corrected_date: '1/22/2016',
        date_correction_verified: '2/4/2016',
        technical_assistance_given: true,
        narrative: 'One staff person did not have a FBI background check.',
        operation_id: 94091,
        operation_number: '42-42',
        operation_type: 'Child Placing Agency-Adoption Services',
        operation_name: 'Hope Cottage, Inc.',
        programs_provided: 'Child Placing Agency',
        location_address: '609 TEXAS ST DALLAS, TX 75204',
        phone: '214-526-8721',
        county: 'DALLAS',
        website: 'www.hopecottage.org',
        email: 'adoption@hopecottage.org',
        type_of_issuance: 'Full Permit',
        issuance_date: '5/28/1987',
        open_foster_homes: 31,
        open_branch_offices: 0,
        corrective_action: false,
        adverse_action: false,
        temporarily_closed: false,
        num_deficiencies_cited: 3
    }
    t.deepEqual(hashResult, hashExpected);

    t.end();
    await browser.close();
    process.exit(0);
});
