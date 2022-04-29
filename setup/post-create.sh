#!/bin/bash

echo "Running post create..."

# Set Project ID
echo "Setting Project ID: ${GOOGLE_CLOUD_PROJECT}"
gcloud config set project ${GOOGLE_CLOUD_PROJECT}

# Build OAuth Callback URL
OAUTH_CALLBACK_URL=${SERVICE_URL}/api/auth/oauthcallback

# Update environment variables
echo "Updating environment variables..."
gcloud run services update ${K_SERVICE} --no-user-output-enabled  --update-env-vars OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

echo "Add the following URL to your OAuth Client ID's 'Authorized JavaScript origins':" ${SERVICE_URL}
echo "Add the following URL to your OAuth Client ID's 'Authorized redirect URIs':" ${OAUTH_CALLBACK_URL}