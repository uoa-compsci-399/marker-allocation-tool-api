export interface CoreConfiguration {
  port?: number;
}

export interface AuthnConfiguration {
  samlSpKey: string;
  samlSpCert: string;
  samlIdpCert: string;

  samlSpKey_path?: string;
  samlSpCert_path?: string;
  samlIdpCert_path?: string;

  samlSpUrlPrefix: string;
  samlSpExtra?: Record<string, any>;

  ssoUrlLogin: string;
  ssoUrlLogout: string;
  samlIdpExtra?: Record<string, any>;
}

export interface Configuration {
  core?: CoreConfiguration;
  authn: AuthnConfiguration;
}
