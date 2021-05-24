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
    samlSpUrlPrefix: 'http://localhost:8000/api/authn',
    // samlSpUrlPrefix: 'https://dev.classe.wumbo.co.nz/api/authn',

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
};
