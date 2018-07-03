import * as test  from 'tape';
import * as _     from 'lodash';

import mergeDataToMaster       from './index';
import AttemptedIDsHandler     from '../AttemptedIDsHandler';

test('mergeDataToMaster should return array of unque OperationHashes', t => {
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
        operation_id: 873652,
        open_foster_homes: 873652,
        open_branch_offices: 873652,
        corrective_action: true,
        adverse_action: true,
        temporarily_closed: true,
        num_deficiencies_cited: 873652,
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
        uniq_id: 3,
        activity_date: 'this is a string',
        standard_number_description: 'this is a string',
        activity_type: 'this is a string',
        standard_risk_level: 'this is a string',
        corrected_at_inspection: true,
        corrected_date: 'this is a string',
        date_correction_verified: 'this is a string',
        technical_assistance_given: null,
        narrative: 'this is a string',
        operation_id: 87365222,
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
        uniq_id: 4,
        activity_date: 'this is a strizing',
        standard_number_description: 'this is a string',
        activity_type: 'this is a string',
        standard_risk_level: 'this is a string',
        corrected_at_inspection: true,
        corrected_date: 'this is a string',
        date_correction_verified: 'this is a string',
        technical_assistance_given: null,
        narrative: 'this is a string',
        operation_id: 873652,
        open_foster_homes: 873652,
        open_branch_offices: 873652,
        corrective_action: true,
        adverse_action: true,
        temporarily_closed: true,
        num_deficiencies_cited: 873652,
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

     const attemptedIDs = {
        last_successful: 90000,
        last_attempted: 94079,
        total_from_last_scrape: 46,
        total_in_database: 300,
        facility_scraped_deficencies_rejected: [85000, 86500],
        facility_timeout_or_alert_page: [87555],
    };
    const attemptedIDsHandler = new AttemptedIDsHandler(attemptedIDs, _.range(94080, 94093))

    let result = mergeDataToMaster([operation3, operation4], [operation1, operation2], attemptedIDsHandler);
    let expected = [operation1, operation2, operation3];
    t.deepEqual(result, expected);

    t.end();
});
