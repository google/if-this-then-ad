#!/bin/bash

echo "Running post create..."

SERVICE_IMAGE='eu.gcr.io/gnd-kimambo/iftta/iftta-service:latest'

# Set Project ID
echo "Setting Project ID: ${GOOGLE_CLOUD_PROJECT}"
gcloud config set project ${GOOGLE_CLOUD_PROJECT}

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

echo "Deploying Service..."
gcloud run deploy ${K_SERVICE} --region=${GOOGLE_CLOUD_REGION} --image ${SERVICE_IMAGE} --allow-unauthenticated --no-user-output-enabled --set-env-vars=PROJECT_ID=${GOOGLE_CLOUD_PROJECT},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET},SESSION_SECRET=${SESSION_SECRET},OAUTH_CALLBACK_URL='',LOG_LEVEL='INFO',NODE_ENV='production',PORT=8080

# Get Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe ${K_SERVICE} --format 'value(status.url)')

# Build OAuth Callback URL
OAUTH_CALLBACK_URL=${CLOUD_RUN_URL}/api/auth/oauthcallback

# Update environment variables
echo "Updating environment variables..."
gcloud run services update ${K_SERVICE} --no-user-output-enabled  --update-env-vars OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

echo "Add the following URL to your OAuth Client ID's 'Authorized JavaScript origins':" ${SERVICE_URL}
echo "Add the following URL to your OAuth Client ID's 'Authorized redirect URIs':" ${OAUTH_CALLBACK_URL}