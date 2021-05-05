export default {
  authn: {
    spUrlPrefix: 'https://dev.classe.wumbo.co.nz/api/authn',
    pathSpKey: 'sp-key.pem',
    pathSpCert: 'sp-cert.pem',
    pathIdpCert: 'idp-cert-auth0.pem',
    ssoUrlLogin:
      'https://mock-uoa-idp-for-classe.au.auth0.com/samlp/ydyrEwoCwuk8l7Yw1MhwcTkcoBQl0XJx',
    ssoUrlLogout:
      'https://mock-uoa-idp-for-classe.au.auth0.com/samlp/ydyrEwoCwuk8l7Yw1MhwcTkcoBQl0XJx/logout',
    spExtra: {
      allow_unencrypted_assertion: true,
    },
  },
};
