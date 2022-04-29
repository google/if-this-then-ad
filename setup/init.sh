#!/bin/bash

APP_NAME='If This Then Ad'
SERVICE_NAME='if-this-then-ad'
SERVICE_IMAGE='eu.gcr.io/gnd-kimambo/iftta/iftta-service:latest'
PROJECT_ID=$(gcloud config list --format 'value(core.project)' 2>/dev/null)
DEFAULT_REGION="europe-west3"
CLIENT_ID=
CLIENT_SECRET=

# Get Region
read -p "Enter Region [${DEFAULT_REGION}]: " REGION
REGION=${REGION:-$DEFAULT_REGION}

# Get OAuth Client ID
while [[ ${CLIENT_ID} = "" ]]; do
  read -p "Enter CLient ID (required): " CLIENT_ID
done

# Get OAuth Client Secret
while [[ ${CLIENT_SECRET} = "" ]]; do
  read -p "Enter Client Secret (required): " CLIENT_SECRET
done

# Display new line to separate input from output
echo

# Set region
echo "Setting region to:" ${REGION}"..."
gcloud config set run/region ${REGION} --no-user-output-enabled

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

# Create App Engine if not exists
echo "Checking for App Engine..."

gcloud app describe --no-user-output-enabled -q --verbosity="none"
RESULT=$?

if [ $RESULT != 0 ]; then
  echo "Creating App Engine..."
  gcloud app create --region ${REGION}
fi

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Deploy with Cloud Run if not exists
SERVICE=$(gcloud run services list --filter="SERVICE:'${SERVICE_NAME}'" --format="json" --verbosity="error")

if [[ "${SERVICE}" == "[]" ]]; then
  echo "Deploying Service..."
  gcloud run deploy ${SERVICE_NAME} --image ${SERVICE_IMAGE} --allow-unauthenticated --no-user-output-enabled --set-env-vars=PROJECT_ID=${PROJECT_ID},GOOGLE_CLIENT_ID=${CLIENT_ID},GOOGLE_CLIENT_SECRET=${CLIENT_SECRET},SESSION_SECRET=${SESSION_SECRET},OAUTH_CALLBACK_URL='',LOG_LEVEL='INFO',NODE_ENV='production',PORT=8080

  # Get Cloud Run URL
  CLOUD_RUN_URL=$(gcloud run services describe ${SERVICE_NAME} --format 'value(status.url)')

  # Build OAuth Callback URL
  OAUTH_CALLBACK_URL=${CLOUD_RUN_URL}/api/auth/oauthcallback

  # Update OAuth Callback URL environment variable
  echo "Updating OAuth Callback URL..."
  gcloud run services update ${SERVICE_NAME} --no-user-output-enabled  --update-env-vars OAUTH_CALLBACK_URL=${OAUTH_CALLBACK_URL}

  echo "Add the following URL to your OAuth Client ID's 'Authorized JavaScript origins':" ${CLOUD_RUN_URL}
  echo "Add the following URL to your OAuth Client ID's 'Authorized redirect URIs':" ${OAUTH_CALLBACK_URL}
fi

echo "All Done."