import { LogicalDatabaseImage } from './LogicalTypes';

export interface CoreConfiguration {
  port?: number;
}

export interface AuthnConfiguration {
  defaultLandingPage: string;

  samlSpKey: string;
  samlSpCert: string;
  samlIdpCert: string;

  samlSpKey_path?: string;
  samlSpCert_path?: string;
  samlIdpCert_path?: string;

  samlSpUrlPrefix: string;
  samlSpExtra?: Record<string, any>;

  samlUserAttributeNameMap: {
    upi?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    numericId?: string;
  };

  loginRoundTripTimeoutMs: number;

  ssoUrlLogin: string;
  ssoUrlLogout: string;
  samlIdpExtra?: Record<string, any>;
}

export interface Configuration {
  core?: CoreConfiguration;
  authn: AuthnConfiguration;
  initialDatabase?: LogicalDatabaseImage;
}
