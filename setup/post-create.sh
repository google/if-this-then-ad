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

# Enable App Engine API
echo "Enabling API: App Engine..."
gcloud services enable appengine.googleapis.com --no-user-output-enabled

# Enable DV360 API
echo "Enabling API: DV360..."
gcloud services enable displayvideo.googleapis.com --no-user-output-enabled

# Enable Google Maps API (for the UI location autocompletion)
echo "Enabling API: Google Maps..."
gcloud services enable places-backend.googleapis.com --no-user-output-enabled

# Enable Cloud Scheduler API
echo "Enabling API: Cloud Scheduler..."
gcloud services enable cloudscheduler.googleapis.com --no-user-output-enabled

# Create App Engine if not exists
echo "Checking for App Engine..."

gcloud app describe --no-user-output-enabled -q --verbosity="none"
RESULT=$?

if [ $RESULT != 0 ]; then
  echo "Creating App Engine..."
  gcloud app create --region ${GOOGLE_CLOUD_REGION}
fi

# Create Firestore in Native Mode
gcloud firestore databases create --region ${GOOGLE_CLOUD_REGION} --no-user-output-enabled -q --verbosity="none"

# Create Cloud Scheduler Job
gcloud scheduler jobs create http iftta-rules-run --schedule="*/15 * * * *" --http-method=GET --uri="${SERVICE_URL}/api/rules/run"

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Build OAuth Callback URL
OAUTH_CALLBACK_URL=${SERVICE_URL}/api/auth/oauthcallback

# Update environment variables
echo "Updating environment variables..."
gcloud run services update ${K_SERVICE} --region=${GOOGLE_CLOUD_REGION} --no-user-output-enabled  --update-env-vars PROJECT_ID=${GOOGLE_CLOUD_PROJECT},SESSION_SECRET=${SESSION_SECRET},OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

echo "### Important manual steps ###"
echo "Go to https://console.cloud.google.com/apis/credentials"
echo "Add the following URL to your OAuth Client ID's 'Authorized JavaScript origins':" ${SERVICE_URL}
echo "Add the following URL to your OAuth Client ID's 'Authorized redirect URIs':" ${OAUTH_CALLBACK_URL}
