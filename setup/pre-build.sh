#!/bin/bash

echo "Running pre build..."

# Set Project ID
echo "Setting Project ID: ${GOOGLE_CLOUD_PROJECT}"
gcloud config set project ${GOOGLE_CLOUD_PROJECT}

# Generate session secret
SESSION_SECRET=$(openssl rand -hex 32)

echo "Deploying Service..."
gcloud run deploy ${K_SERVICE} --region=${GOOGLE_CLOUD_REGION} --source . --image ${IMAGE_URL} --allow-unauthenticated --no-user-output-enabled --set-env-vars=PROJECT_ID=${GOOGLE_CLOUD_PROJECT},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET},SESSION_SECRET=${SESSION_SECRET},OAUTH_CALLBACK_URL='',LOG_LEVEL='INFO',NODE_ENV='production',PORT=8080