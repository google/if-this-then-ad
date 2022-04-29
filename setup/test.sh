#!/bin/bash

# Set Project ID
echo "Setting Project ID: ${GOOGLE_CLOUD_PROJECT}"
gcloud config set project ${GOOGLE_CLOUD_PROJECT}

# Enable Identity-Aware Proxy API
echo "Enabling API: Identity-Aware Proxy..."
gcloud services enable iap.googleapis.com --no-user-output-enabled

# Enable Cloud Logging API
echo "Enabling API: Cloud Logging..."
gcloud services enable logging.googleapis.com --no-user-output-enabled

# Enable Firestore API
echo "Enabling API: Firestore..."
gcloud services enable firestore.googleapis.com --no-user-output-enabled

# Enable Cloud Run API
echo "Enabling API: Cloud Run..."
gcloud services enable run.googleapis.com --no-user-output-enabled

# Enable DV360 API
echo "Enabling API: DV360..."
gcloud services enable displayvideo.googleapis.com --no-user-output-enabled

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Build OAuth Callback URL
OAUTH_CALLBACK_URL=${SERVICE_URL}/api/auth/oauthcallback

# Update environment variables
echo "Updating environment variables..."
gcloud run services update ${K_SERVICE} --no-user-output-enabled  --update-env-vars PROJECT_ID=${GOOGLE_CLOUD_PROJECT},SESSION_SECRET=${SESSION_SECRET},OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

echo "Add the following URL to your OAuth Client ID's 'Authorized JavaScript origins':" ${SERVICE_URL}
echo "Add the following URL to your OAuth Client ID's 'Authorized redirect URIs':" ${OAUTH_CALLBACK_URL}