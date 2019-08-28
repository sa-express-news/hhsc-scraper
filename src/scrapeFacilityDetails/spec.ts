import * as test from 'tape';

import scrapeFacilityDetails, { 
	getNumDeficiencies,
	getOperationType,
	isTargetFacility,
	getString,
	getAdminPenalties,
	getIsMainBranch,
	getCPANumber,
	getBoolean,
	getPrograms,
	getAddress,
	getDate,
	isCPA,
	isGRO,
} from './index';

import requestFacilityDetailsPage   from '../requestFacilityDetailsPage';
import AttemptedIDsHandler          from '../AttemptedIDsHandler';
import logger                       from '../logger';

test('getKey, getNumDeficiencies and isTargetFacility should check to see if GRO is a valid facility to scrape', async t => {
	const $ 				= await requestFacilityDetailsPage(111812, logger());
	const operationType 	= getOperationType($);
	const numDeficiencies 	= getNumDeficiencies(111812, $);

	let boolResult = isGRO('Happy time:General Residential Operation');
	let boolExpectation = true;
	t.equal(boolResult, boolExpectation);

	boolResult = numDeficiencies > 0;
	t.equal(boolResult, boolExpectation);

	boolResult = isTargetFacility(operationType, numDeficiencies);
	t.equal(boolResult, boolExpectation);

	t.end();
});

test('getKey, getNumDeficiencies and isTargetFacility should check to see if CPA is a valid facility to scrape', async t => {
	const $ 				= await requestFacilityDetailsPage(1229119, logger());
	const operationType 	= getOperationType($);
	const numDeficiencies 	= getNumDeficiencies(1229119, $);

	let boolResult = isCPA('Child Placing Agency-Fizz Books');
	let boolExpectation = true;
	t.equal(boolResult, boolExpectation);

	boolResult = numDeficiencies > 0;
	t.equal(boolResult, boolExpectation);

	boolResult = isTargetFacility(operationType, numDeficiencies);
	t.equal(boolResult, boolExpectation);

	t.end();
});

test('getKey, getNumDeficiencies and isTargetFacility should check to see if invalid operation is a valid facility to scrape', async t => {
	const $ 				= await requestFacilityDetailsPage(111, logger());
	const operationType 	= getOperationType($);
	const numDeficiencies 	= getNumDeficiencies(111, $);

	let boolResult = operationType === 'Unknown';
	let boolExpectation = true;
	t.equal(boolResult, boolExpectation);

	boolResult = Number.isNaN(numDeficiencies);
	t.equal(boolResult, boolExpectation);

	boolResult = !isTargetFacility(operationType, numDeficiencies);
	t.equal(boolResult, boolExpectation);

	t.end();
});

test('test all scraped string data from GRO response', async t => {
	const $ = await requestFacilityDetailsPage(353978, logger());

	let result = getString($, 'font:contains("Operation Number:")');
	let expectation = '894969';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Operation/Caregiver Name:")');
	expectation = 'Carter\'s Kids Residential Treatment Center';
	t.equal(result, expectation);

	result = getAddress($, 'font:contains("Location Address:")');
	expectation = '1203 LARK LN RICHMOND, TX 77469';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Phone Number:")');
	expectation = '281-239-6999';
	t.equal(result, expectation);

	result = getString($, 'font:contains("County:")');
	expectation = 'FORT BEND';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Website Address:")');
	expectation = 'None';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Email Address:")');
	expectation = 'carterskidsrtc@gmail.com';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Type of Issuance:")');
	expectation = 'Full Permit';
	t.equal(result, expectation);

	result = getDate($, 'font:contains("Issuance Date:")');
	expectation = '2/2/2009';
	t.equal(result, expectation);

	result = getPrograms('General Residential Operation', $, 'font:contains("Program Provided:")'),
	expectation = 'Residential Treatment Center';
	t.equal(result, expectation);

	t.end();
});

test('test all scraped number data from GRO response', async t => {
	const $ = await requestFacilityDetailsPage(111812, logger());

	let result = getCPANumber('General Residential Operation', $, 'font:contains("Open Foster Homes:")');
	let expectation = 0;
	t.equal(result, expectation);

	result = getCPANumber('General Residential Operation', $, 'font:contains("Open Branch Offices:")');
	t.equal(result, expectation);

	t.end();
});

test('test all scraped boolean data from GRO response', async t => {
	const $ = await requestFacilityDetailsPage(1252288, logger());

	let result = getBoolean($, 'font:contains("Corrective Action:")');
	let expectation = false;
	t.equal(result, expectation);

	result = getBoolean($, 'font:contains("Adverse Action:")');
	expectation = false;
	t.equal(result, expectation);

	result = getBoolean($, 'font:contains("Temporarily Closed:")');
	expectation = false;
	t.equal(result, expectation);

	t.end();
});

test('test all scraped string data from CPA response', async t => {
	const $ = await requestFacilityDetailsPage(312384, logger());

	let result = getString($, 'font:contains("Operation Number:")');
	let expectation = '870277-3270';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Operation/Caregiver Name:")');
	expectation = 'Have Haven Child Placing Agency';
	t.equal(result, expectation);

	result = getAddress($, 'font:contains("Location Address:")');
	expectation = '6200 SAVOY DR STE 620 HOUSTON, TX 77036';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Phone Number:")');
	expectation = '832-667-8851';
	t.equal(result, expectation);

	result = getString($, 'font:contains("County:")');
	expectation = 'HARRIS';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Website Address:")');
	expectation = 'www.havehaven.org';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Email Address:")');
	expectation = 'emesfin@havehaven.org';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Type of Issuance:")');
	expectation = 'Full Permit';
	t.equal(result, expectation);

	result = getString($, 'font:contains("Issuance Date:")');
	expectation = '2/21/2007';
	t.equal(result, expectation);

	result = getPrograms('Child Placing Agency-Adoption Services', $, 'font:contains("Program Provided:")'),
	expectation = 'Child Placing Agency';
	t.equal(result, expectation);

	t.end();
});

test('test all scraped number data from CPA response', async t => {
	const $ = await requestFacilityDetailsPage(231654, logger());

	let result = getAdminPenalties($, ['font:contains("Number Of Admin")', 'font:contains("Number of Admin")']);
	let expectation = 3;
	t.equal(result, expectation);

	result = getCPANumber('Child Placing Agency-Adoption Services', $, 'font:contains("Open Foster Homes:")');
	expectation = 24;
	t.equal(result, expectation);

	result = getCPANumber('Child Placing Agency-Adoption Services', $, 'font:contains("Open Branch Offices:")');
	expectation = 1;
	t.equal(result, expectation);

	t.end();
});

test('test all scraped boolean data from CPA response', async t => {
	const $ = await requestFacilityDetailsPage(231654, logger());

	let result = getBoolean($, 'font:contains("Corrective Action:")');
	let expectation = false;
	t.equal(result, expectation);

	result = getBoolean($, 'font:contains("Adverse Action:")');
	expectation = false;
	t.equal(result, expectation);

	result = getBoolean($, 'font:contains("Temporarily Closed:")');
	expectation = false;
	t.equal(result, expectation);

	t.end();
});

test('test is branch CPA', async t => {
	const $ = await requestFacilityDetailsPage(137325, logger());

	let result = getIsMainBranch('Child Placing Agency', $, 'font:contains("related to this Branch only")');
	let expectation = false;
	t.equal(result, expectation);

	t.end();
});

test('scrapeFacilityDetails: End to end deepequals test of failed scrape', async t => {
	const attemptedIDs = {
        last_successful: 90000,
        last_attempted: 94079,
        total_from_last_scrape: 46,
		total_in_database: 300,
        facility_scraped_deficencies_rejected: [85000, 86500],
        facility_timeout_or_alert_page: [87555],
    };
    const range = [1,2,3,4,5];
    const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, range);

	let result = await scrapeFacilityDetails(99999999999999999, attemptedIDsHandler, logger())
	let expected = { isSuccessful: false };
	
	t.deepEqual(result, expected);
	t.end();
});

test('scrapeFacilityDetails: End to end deepequals test of successful scrape', async t => {
	const attemptedIDs = {
        last_successful: 90000,
        last_attempted: 94079,
        total_from_last_scrape: 46,
		total_in_database: 300,
        facility_scraped_deficencies_rejected: [85000, 86500],
        facility_timeout_or_alert_page: [87555],
    };
    const range = [1,2,3,4,5];
    const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, range);

	let result = await scrapeFacilityDetails(95732, attemptedIDsHandler, logger())
	let expected = {
		isSuccessful: true,
		payload: { 
			operation_id: 95732,
			operation_number: '66557-209',
			operation_type: 'Child Placing Agency-Adoption Services',
			operation_name: 'TEXAS DEPT OF FPS REG 08',
			programs_provided: 'Child Placing Agency',
			location_address: '3635 SE MILITARY DR SAN ANTONIO, TX 78223',
			phone: '210-337-3214',
			county: 'BEXAR',
			website: 'www.dfps.state.tx.us/Child_Protection/se',
			email: 'None',
			type_of_issuance: 'Certified',
			issuance_date: '8/25/1988',
			open_foster_homes: 0,
			open_branch_offices: 0,
			num_admin_penalties: 0,
			is_main_branch: true,
			corrective_action: false,
			adverse_action: false,
			temporarily_closed: false,
			num_deficiencies_cited: 20,
		}
	};

	t.deepEqual(result, expected);
	t.end();
});
