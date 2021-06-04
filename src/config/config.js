'use strict';

/* This file provides configuration for the backend.
 * It is read and executed once at runtime by the Node import system.
 *
 * It's a JS file rather than JSON so that you can write comments in it, and it's a JS file rather
 * than TS because it should not be necessary to recompile to install new configuration. This way,
 * a restart is sufficent, even in production.
 *
 * The module which loads this config will deep search for properties suffixed with `_path`, and
 * load the contents of the path specified into the unsuffixed counterpart of the property.
 * Therefore any value property can be included inline, or specified as a path.
 *
 * Since this file is executed, you can write Node code here to load the key material in a way
 * compliant with whatever key management practices your security policy imposes.
 */

module.exports = {
  authn: {
    // Destination page after successful login when not otherwise set
    defaultLandingPage: '/',

    samlSpKey_path: 'sp-key.pem',
    samlSpCert_path: 'sp-cert.pem',
    samlIdpCert_path: 'idp-cert-classe.pem',

    // Switch to this value when testing, then back before committing
    // samlSpUrlPrefix: 'http://localhost:8000/api/authn',
    samlSpUrlPrefix: 'https://dev.classe.wumbo.co.nz/api/authn',

    samlSpExtra: {
      allow_unencrypted_assertion: true,
    },

    ssoUrlLogin: 'https://dev-idp.classe.wumbo.co.nz/saml/sso',
    ssoUrlLogout: 'https://dev-idp.classe.wumbo.co.nz/saml/slo',
    samlIdpExtra: {},

    /* The authentication system expects a number of attributes in the login assertion response
     * from the IdP: 'upi', 'firstName', 'lastName', 'email', 'numericId'.
     * Use this property to remap those names to the actual names in the IdP login response.
     * If you need to map to name_id, which is not an attribute, refer to it as if it were an
     * attribute called '__name_id'.
     */
    //samlUserAttributeNameMap: { numericId: 'studentId' },

    // Users must complete logging in within this long after starting to.
    // Extremely large values are inappropriate as this value also defines the period of the
    // Authentication Request Ticket Watchdog, which prevents OOM-based DOS attacks.
    loginRoundTripTimeoutMs: 15 * 60 * 1000,
  },
  initialDatabase: {
    markerCoordinators: {
      burkhard: {
        firstName: 'Burkhard',
        lastName: 'Wuensche',
        email: 'burkhard@cs.auckland.ac.nz',
        upi: 'bwen001',
      },
    },
    courseCoordinators: {
      asma: {
        firstName: 'Asma',
        lastName: 'Shakil',
        email: 'asma@auckland.ac.nz',
        upi: 'asha001',
        coursesByName: ['cs399'],
      },
      isaac: {
        firstName: 'Isaac',
        lastName: 'Kabel',
        email: 'ikab470@aucklanduni.ac.nz',
        upi: 'ikab470',
        coursesByName: ['cs399', 'cs101'],
      },
    },
    markers: {
      songyan: {
        firstName: 'Songyan',
        lastName: 'Teng',
        email: 'sten187@aucklanduni.ac.nz',
        upi: 'sten187',
        studentID: '883789472',
        dateOfBirth: '2000-01-01',
        applicationsByName: ['songyan_01'],
      },
      darren: {
        firstName: 'Darren',
        lastName: 'Chen',
        email: 'cche795@aucklanduni.ac.nz',
        upi: 'cche795',
        studentID: '809097908',
        dateOfBirth: '2000-02-02',
        applicationsByName: ['darren_01'],
      },
      jim: {
        firstName: 'Jim',
        lastName: 'Park',
        email: 'jpar914@aucklanduni.ac.nz',
        upi: 'jpar914',
        studentID: '5615303',
        dateOfBirth: '2000-03-03',
        applicationsByName: [],
      },
    },
    users: {},
    courses: {
      cs399: {
        courseName: 'COMPSCI 399',
        enrolmentEstimate: 50,
        enrolmentFinal: 100,
        expectedWorkload: 50,
        preferredMarkerCount: 2,
        semesters: 2,
        year: 2021,
        applicationClosingDate: '2021-01-01',
        courseInfoDeadline: '2021-01-01',
        markerAssignmentDeadline: '2021-01-01',
        markerPrefDeadline: '2021-01-01',
        isPublished: 1,
        otherNotes: 'Give good grades!',
      },
      cs101: {
        courseName: 'COMPSCI 101',
        enrolmentEstimate: 300,
        enrolmentFinal: 500,
        expectedWorkload: 80,
        preferredMarkerCount: 10,
        semesters: 2,
        year: 2021,
        applicationClosingDate: '2022-01-01',
        courseInfoDeadline: '2021-01-01',
        markerAssignmentDeadline: '2021-01-01',
        markerPrefDeadline: '2021-01-01',
        isPublished: 1,
        otherNotes: '',
      },
      cs130: {
        courseName: 'COMPSCI 130',
        enrolmentEstimate: 300,
        enrolmentFinal: 0,
        expectedWorkload: 80,
        preferredMarkerCount: 8,
        semesters: 4,
        year: 2021,
        applicationClosingDate: '2020-07-01',
        courseInfoDeadline: '2021-03-01',
        markerAssignmentDeadline: '2021-07-20',
        markerPrefDeadline: '2021-07-10',
        isPublished: 1,
        otherNotes: '',
      },
    },
    applications: {
      songyan_01: {
        year: 2021,
        availability: 0b010,
        curriculumVitae: Buffer.from('%PDF-1.7\r\n'),
        academicRecord: Buffer.from('%PDF-1.7\r\n'),
        areaOfStudy: 'Computer Science',
        enrolmentStatus: 'Bachelors',
        workEligible: 1,
        inAuckland: 1,
        availabilityConstraint: '',
        relevantExperience: '',
        declaration: 1,
        coursesByName: ['cs399', 'cs101'],
      },
      darren_01: {
        year: 2022,
        availability: 0b010,
        curriculumVitae: Buffer.from('%PDF-1.7\r\n'),
        academicRecord: Buffer.from('%PDF-1.7\r\n'),
        areaOfStudy: 'Other',
        enrolmentStatus: 'Bachelors',
        workEligible: 1,
        inAuckland: 1,
        availabilityConstraint: 'Holiday in June',
        relevantExperience: 'Marked 130 in Sem 2019',
        declaration: 1,
        coursesByName: ['cs399', 'cs101'],
      },
    },
  },
};
