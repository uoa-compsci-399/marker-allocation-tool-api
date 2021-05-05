import fs from 'fs';
import crypto from 'crypto';

import express, { Request, Response } from 'express';
import saml2, { SAMLAssertResponse, PostAssertOptions } from 'saml2-js';

import db from '../../db/DBController';

import config from '../../config';

// Create service provider
const sp_options = {
  entity_id: config.authn.spUrlPrefix + '/metadata.xml',
  private_key: fs.readFileSync(config.authn.pathSpKey).toString(),
  certificate: fs.readFileSync(config.authn.pathSpCert).toString(),
  assert_endpoint: config.authn.spUrlPrefix + '/assert',
};
Object.assign(sp_options, config.authn.spExtra);
const sp = new saml2.ServiceProvider(sp_options);

// Create identity provider
const idp_options = {
  sso_login_url: config.authn.ssoUrlLogin,
  sso_logout_url: config.authn.ssoUrlLogout,
  certificates: [fs.readFileSync(config.authn.pathIdpCert).toString()],
};
const idp = new saml2.IdentityProvider(idp_options);

const router = express.Router();

// Endpoint to retrieve metadata
router.get('/metadata.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(sp.create_metadata());
});

interface ServerSideRequestInfo {
  forwardTo: string;
}

// Indexed by SAML request_id
const requests: Record<string, ServerSideRequestInfo> = {};

// Starting point for login
router.get('/login', (req: Request, res: Response) => {
  sp.create_login_request_url(
    idp,
    {},
    (err: Error | null, login_url: string, request_id: string) => {
      if (err != null) {
        console.error(err.message);
        return res.sendStatus(500);
      }

      // VULNERABILITY: an attacker can visit this route repeatedly without completing the login flow
      // adding an entry here each time.
      requests[request_id] = {
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
  const options: PostAssertOptions = { request_body: { SAMLRequest: req.body } };
  /* eslint-enable */
  sp.post_assert(idp, options, async (err: Error | null, saml_response: SAMLAssertResponse) => {
    if (err != null) {
      console.error(err.message);
      return res.sendStatus(500);
    }

    const request_id = saml_response.response_header.in_response_to;
    if (requests[request_id] == null) {
      // This is a response for a request we don't know about
      return res.sendStatus(400);
    }

    //let name_id = saml_response.user.name_id;
    //let session_index = saml_response.user.session_index;
    // Explicit logout requires name_id and session_index.
    // Make columns for them in UserToken if implementing explicit logout.

    const attributes = saml_response.user.attributes || {};
    const username_attr = attributes['http://schemas.auth0.com/username'];
    if (username_attr == null) {
      // The IdP didn't tell us who this is
      return res.sendStatus(400);
    }

    let username: string;
    if (typeof username_attr != 'string') {
      username = username_attr[0];
    } else {
      username = username_attr;
    }

    let userId;
    await db.run('SELECT * FROM User WHERE upi = ?', [username]).then(
      (id) => {
        userId = id;
      },
      async () => {
        // This user does not exist; create them
        const sql = 'INSERT INTO User (firstName, lastName, email, role) VALUES (?,?,?,?)';
        // TODO: Correctly get these data
        const params = ['First', 'Last', 'firstlast@email.com', 'Marker'];

        await db.run(sql, params).then(
          (id) => {
            userId = id;
          },
          (err: Error) => {
            console.error(err.message);
          }
        );
      }
    );

    if (userId == null) {
      return res.sendStatus(500);
    }

    const tokenValue = crypto.randomBytes(32).toString('base64');
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

    const forwardTo = requests[request_id].forwardTo || '/';
    delete requests[request_id];

    res.cookie('authn_token', tokenValue, { httpOnly: true });
    res.redirect(forwardTo);
  });
});

export default router;
