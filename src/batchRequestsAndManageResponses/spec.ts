import * as test      from 'tape';
import * as _         from 'lodash';
import * as puppeteer from 'puppeteer';

import batchRequestsAndManageResponses, { flattenArray, removeEmpties }    from './index';
import { addIDs }                                                          from '../addUniqueID';
import { removeDuplicates }                                                from '../mergeDataToMaster';
import createLogger                                                        from '../logger';
import AttemptedIDsHandler                                                 from '../AttemptedIDsHandler';

const operation = {
    activity_date: 'this is a string',
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
    is_main_branch: true,
    open_branch_offices: 873652,
    num_admin_penalties: 1,
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
    const logger = createLogger();

    const attemptedIDs = {
        last_successful: 90000,
        last_attempted: 94079,
        total_from_last_scrape: 46,
        total_in_database: 300,
        facility_scraped_deficencies_rejected: [85000, 86500],
        facility_timeout_or_alert_page: [87555],
    };
    const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, _.range(94080, 94093));
    
    const operationsRaw = await batchRequestsAndManageResponses(_.range(94080, 94093), 10, browser, attemptedIDsHandler, logger);
    const operations = removeDuplicates(addIDs(operationsRaw, 0));

    let lenResult = operations.length;
    let lenExpected = 32;
    t.equal(lenResult, lenExpected);

    let strResult = operations[operations.length - 1].narrative;
    let strExpected = 'A child dismantled an alarm, opened a door, and harmed a child. The caregivers were unaware of this activity.'
    t.equal(strResult, strExpected);

    t.end();
    await browser.close();
});
