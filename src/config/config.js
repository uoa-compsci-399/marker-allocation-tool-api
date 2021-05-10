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
    samlSpKey_path: 'sp-key.pem',
    samlSpCert_path: 'sp-cert.pem',
    samlIdpCert_path: 'idp-cert-auth0.pem',

    samlSpUrlPrefix: 'https://dev.classe.wumbo.co.nz/api/authn',
    samlSpExtra: {
      allow_unencrypted_assertion: true,
    },

    ssoUrlLogin:
      'https://mock-uoa-idp-for-classe.au.auth0.com/samlp/ydyrEwoCwuk8l7Yw1MhwcTkcoBQl0XJx',
    ssoUrlLogout:
      'https://mock-uoa-idp-for-classe.au.auth0.com/samlp/ydyrEwoCwuk8l7Yw1MhwcTkcoBQl0XJx/logout',
    samlIdpExtra: {},
  },
};
