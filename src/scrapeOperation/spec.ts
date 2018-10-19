import * as test from 'tape';
import { mergeResponses } from './index';

const deficiency = {
	activity_date: 'this is a string',
    standard_number_description: 'this is a string',
    activity_type: 'this is a string',
    standard_risk_level: 'this is a string',
    corrected_at_inspection: true,
    corrected_date: 'this is a string',
    date_correction_verified: 'this is a string',
    technical_assistance_given: null,
    narrative: 'this is a string',
};

const facility = {
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
    is_main_branch: true,
    open_foster_homes: 873652,
    open_branch_offices: 873652,
    num_admin_penalties: 3,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

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
    num_admin_penalties: 3,
    corrective_action: true,
    adverse_action: true,
    temporarily_closed: true,
    num_deficiencies_cited: 873652,
};

test('mergeResponses: if both requests were successfull, array of decifiencies should be returned with facility hash merged into each', t => {
	const deficiencyResponse = [
        deficiency,
        deficiency,
        deficiency,
	];

	let result = mergeResponses(deficiencyResponse, facility);
	let expected = [
		operation,
		operation,
		operation,
	];

	t.deepEqual(result, expected);
	t.end();
});
