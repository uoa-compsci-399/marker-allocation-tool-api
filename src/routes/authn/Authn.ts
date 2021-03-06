import crypto from 'crypto';

import express, { Request, Response } from 'express';
import saml2 from 'saml2-js';

import db from '../../db/DBController';
import { UserRow } from '../../db/DatabaseTypes';

import config from '../../config/ConfigLoader';

// Create service provider
const saml_sp_options = {
  entity_id: config.authn.samlSpUrlPrefix + '/metadata.xml',
  private_key: config.authn.samlSpKey,
  certificate: config.authn.samlSpCert,
  assert_endpoint: config.authn.samlSpUrlPrefix + '/assert',
};
Object.assign(saml_sp_options, config.authn.samlSpExtra);
const saml_sp = new saml2.ServiceProvider(saml_sp_options);

// Create logical identity provider
const saml_idp_options = {
  sso_login_url: config.authn.ssoUrlLogin,
  sso_logout_url: config.authn.ssoUrlLogout,
  certificates: [config.authn.samlIdpCert],
};
Object.assign(saml_idp_options, config.authn.samlIdpExtra);
const saml_idp = new saml2.IdentityProvider(saml_idp_options);

const router = express.Router();

// Endpoint to retrieve metadata
router.get('/metadata.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(saml_sp.create_metadata());
});

// If your security policy requires that the user completes the authentication flow with the same
// parameters as they began it with (user agent, internet address, etc.), use this structure to
// store those parameters for enforcement later.
interface AuthnRequestTicket {
  initiatedTime: number;
  forwardTo: string;
}

// Indexed by SAML request_id
const login_request_tickets: Record<string, AuthnRequestTicket> = {};

setInterval(function AuthnRequestTicketWatchdog() {
  const now = new Date().valueOf();
  Object.keys(login_request_tickets).forEach((request_id) => {
    const ticket_age = now - login_request_tickets[request_id].initiatedTime;
    if (ticket_age > config.authn.loginRoundTripTimeoutMs) {
      delete login_request_tickets[request_id];
    }
  });
}, config.authn.loginRoundTripTimeoutMs);

// Starting point for login
router.get('/login', (req: Request, res: Response) => {
  saml_sp.create_login_request_url(
    saml_idp,
    {},
    (err: Error | null, login_url: string, request_id: string) => {
      if (err != null) {
        console.error(err.message);
        return res.sendStatus(500);
      }

      login_request_tickets[request_id] = {
        initiatedTime: new Date().valueOf(),
        forwardTo: req.query.forwardTo as string,
      };

      res.redirect(login_url);
    }
  );
});

// Assert endpoint for when login completes
router.post('/assert', (req: Request, res: Response) => {
  // saml2-js index.d.ts specifies SAMLRequest: any; not much I can do about that
  /* eslint-disable */
  const options: saml2.PostAssertOptions = { request_body: req.body };
  /* eslint-enable */
  saml_sp.post_assert(
    saml_idp,
    options,
    async (err: Error | null, saml_response: saml2.SAMLAssertResponse) => {
      if (err != null) {
        console.error(err.message);
        return res.sendStatus(500);
      }

      const original_request_id = saml_response.response_header.in_response_to;
      const request_ticket = login_request_tickets[original_request_id];
      let original_request_valid = true;
      if (request_ticket == null) original_request_valid = false;
      if (original_request_valid) {
        const idp_rtt_ms = new Date().valueOf() - request_ticket.initiatedTime;
        original_request_valid = idp_rtt_ms < config.authn.loginRoundTripTimeoutMs;
      }

      if (!original_request_valid) {
        // This is a response for a request we don't know about
        res.status(400);
        res.type('text/plain');
        res.send(`Error: AssertResponse from SAML IdP was not in response to any recent request.`);
        return;
      }

      //let name_id = saml_response.user.name_id;
      //let session_index = saml_response.user.session_index;
      // Explicit logout (IdP notified) requires name_id and session_index.
      // Make columns for them in UserToken if implementing explicit logout.

      const attributes = saml_response.user.attributes || {};
      attributes['__name_id'] = saml_response.user.name_id;

      const userFields: Record<string, string> = {};
      const attributeNameMap = config.authn.samlUserAttributeNameMap as Record<string, string>;

      const missingFields: string[] = [];
      ['upi', 'firstName', 'lastName', 'email', 'numericId'].forEach((field_name) => {
        const field_attr = attributes[attributeNameMap[field_name]];

        if (field_attr == null) {
          missingFields.push(field_name);
          return;
        }

        userFields[field_name] = typeof field_attr != 'string' ? field_attr[0] : field_attr;
      });

      if (missingFields.length > 0) {
        res.status(400);
        res.type('text/plain');
        res.send(
          'Error: AssertResponse from SAML IdP did not include required attribute(s):\n' +
            missingFields
              .map((field_name) => `${attributeNameMap[field_name]} for ${field_name}`)
              .join('\n')
        );
        return;
      }

      let userId = -1;
      userId = await db
        .get('SELECT userID FROM User WHERE upi = ?', [userFields['upi']])
        .then((user: UserRow) => (user ? user.userID : 0));

      if (userId == 0) {
        // This user does not exist; create them
        const sql = 'INSERT INTO User (firstName, lastName, email, upi, role) VALUES (?,?,?,?,?)';

        const params = [
          userFields['firstName'],
          userFields['lastName'],
          userFields['email'],
          userFields['upi'],
          'Marker',
        ];

        userId = await db.run(sql, params).then((id) => id.id);
      }

      if (userId == null || userId == 0) {
        res.status(500);
        res.type('text/plain');
        res.send('Error: failed to create a user');
        return;
      }

      /* Security [minor]: do not create tokenValue using an encoding which may emit RFC 3986
       * section 2.2 Reserved Characters. One such encoding is base64. These characters are
       * percent-encoded when a value is transmitted in a header such as Set-Cookie. A
       * percent-encoded character occupies more bytes on the wire and more entropy. Therefore,
       * such encodings allow a passive evesdropper to infer some information about the content of
       * tokenValue.
       */
      const tokenValue = crypto.randomBytes(32).toString('hex');
      const sql = 'INSERT INTO UserToken (userID, createdAt, value) VALUES (?,?,?)';
      const params = [userId, new Date().toISOString(), tokenValue];

      const result_insertToken = await db.run(sql, params).then(
        () => true,
        (err: Error) => {
          console.error(err.message);
          return false;
        }
      );

      if (!result_insertToken) {
        return res.sendStatus(500);
      }

      let forwardTo: string;
      if (typeof request_ticket.forwardTo == 'string') {
        forwardTo = request_ticket.forwardTo;
      } else {
        forwardTo = config.authn.defaultLandingPage;
      }

      delete login_request_tickets[original_request_id];

      res.cookie('authn_token', tokenValue, { httpOnly: true, secure: true, sameSite: 'lax' });

      res.redirect(forwardTo);
      // Replace redirect above with the following for debugging
      //res.type('text/plain');
      //res.send(require('util').inspect(saml_response));
    }
  );
});

export default router;
