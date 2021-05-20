#!/bin/sh

# Make the openssl req work on MINGW (eg git bash) on Windows
# https://github.com/openssl/openssl/issues/8795
# https://github.com/git-for-windows/git/issues/577#issuecomment-166118846
export MSYS_NO_PATHCONV=1

# Generate a secp384r1 keypair into sp-key.pem and self-sign a certificate into sp-cert.pem
# The cert and pub key are included into the virtual file /api/authn/metadata.xml for the IdP
openssl req -x509 \
-newkey ec \
-pkeyopt ec_paramgen_curve:secp384r1 \
-days 3650 -nodes \
-keyout sp-key.pem \
-out sp-cert.pem \
-subj '/C=NZ/ST=Auckland/L=Auckland/O=University of Auckland/OU=Information Technology Services/CN=Classe Marker Allocation Tool SAML2.0 SP'
