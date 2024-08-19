#!/bin/bash

# Default values
CN=${1:-localhost}
STOREPASS=${2:-secret}
KEYPASS=${3:-secret}
DAYS=${4:-365}
KEYSIZE=${5:-2048}

# Function to clean up existing assets
cleanup() {
  echo "Cleaning up previously generated assets..."
  if [ -d "keystore" ] || [ -d "jgroups" ] || [ -d "truststore" ]; then
    [ -d "keystore" ] && rm -rf keystore && echo "Removed keystore directory."
    [ -d "jgroups" ] && rm -rf jgroups && echo "Removed jgroups directory."
    [ -d "truststore" ] && rm -rf truststore && echo "Removed truststore directory."
    echo "All existing assets have been cleaned."
  else
    echo "." # No existing assets found to clean.
  fi
}

# Clean up assets from previous executions
cleanup



# Display the parameters being used
echo "Starting the certificate and keystore generation process with the following parameters:"
echo "Common Name (CN): ${CN} (Default: localhost)"
echo "Store Password: ${STOREPASS} (Default: secret)"
echo "Key Password: ${KEYPASS} (Default: secret)"
echo "Certificate Validity (Days): ${DAYS} (Default: 365)"
echo "Key Size: ${KEYSIZE} bits (Default: 2048)"
echo "Proceeding with the operations..."
echo

# Create keystore directory
mkdir -p keystore

# Generate RSA private key and self-signed certificate
openssl req -new -newkey rsa:$KEYSIZE -x509 -keyout keystore/xpaas.key -out keystore/xpaas.crt -days $DAYS -subj "/CN=$CN" -nodes

# Generate a Java keystore with an RSA key pair
keytool -genkeypair -keyalg RSA -keysize $KEYSIZE -dname "CN=$CN" -alias jboss -keystore keystore/keystore.jks -storepass $STOREPASS -keypass $KEYPASS

# Generate a Certificate Signing Request (CSR) for the key pair
keytool -certreq -keyalg rsa -alias jboss -keystore keystore/keystore.jks -file keystore/sso.csr -storepass $STOREPASS

# Sign the CSR with the xpaas CA key to produce the certificate
openssl x509 -req -CA keystore/xpaas.crt -CAkey keystore/xpaas.key -in keystore/sso.csr -out keystore/sso.crt -days $DAYS -CAcreateserial

# Import the CA certificate into the Java keystore
keytool -import -file keystore/xpaas.crt -alias xpaas.ca -keystore keystore/keystore.jks -storepass $STOREPASS -trustcacerts -noprompt

# Import the signed certificate into the Java keystore
keytool -import -file keystore/sso.crt -alias jboss -keystore keystore/keystore.jks -storepass $STOREPASS

# Create jgroups directory
mkdir -p jgroups

# Generate a secret key for JGroups
keytool -genseckey -alias secret-key -storetype JCEKS -keystore jgroups/jgroups.jceks -storepass $STOREPASS -keypass $KEYPASS

# Create truststore directory
mkdir -p truststore

# Import the CA certificate into the truststore
keytool -import -file keystore/xpaas.crt -alias xpaas.ca -keystore truststore/truststore.jks -storepass $STOREPASS -trustcacerts -noprompt

# Completion message
echo "All operations completed successfully."

# Paths to assets
echo "Generated assets are located at:"
echo "Keystore directory: $PWD/keystore"
echo "  - Private Key: $PWD/keystore/xpaas.key"
echo "  - Self-signed Certificate: $PWD/keystore/xpaas.crt"
echo "  - Java Keystore (JKS): $PWD/keystore/keystore.jks"
echo "  - Certificate Signing Request (CSR): $PWD/keystore/sso.csr"
echo "  - Signed Certificate: $PWD/keystore/sso.crt"

echo "JGroups directory: $PWD/jgroups"
echo "  - JGroups Keystore (JCEKS): $PWD/jgroups/jgroups.jceks"

echo "Truststore directory: $PWD/truststore"
echo "  - Truststore (JKS): $PWD/truststore/truststore.jks"

echo "You can use these paths in your Containerfile build."

