#!/bin/bash

echo "Running post build..."

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