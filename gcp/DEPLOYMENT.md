# TrafficPulse GCP Deployment Guide

Complete guide for deploying TrafficPulse to Google Cloud Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Cloud Build)](#quick-start-cloud-build)
3. [Terraform Infrastructure](#terraform-infrastructure)
4. [Manual Deployment](#manual-deployment)
5. [User Simulation](#user-simulation)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Cost Estimation](#cost-estimation)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
gcloud init

# Install Terraform (macOS)
brew install terraform

# Install Terraform (Windows - Chocolatey)
choco install terraform

# Verify installations
gcloud --version
terraform --version
docker --version
```

### GCP Setup

```bash
# 1. Create or select a GCP project
export PROJECT_ID="your-project-id"
gcloud projects create $PROJECT_ID --name="TrafficPulse"

# 2. Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  containerregistry.googleapis.com \
  artifactregistry.googleapis.com \
  --project $PROJECT_ID

# 3. Set project
gcloud config set project $PROJECT_ID

# 4. Authenticate for Docker
gcloud auth configure-docker
```

---

## Quick Start (Cloud Build)

Fastest way to deploy using Cloud Build CI/CD.

### Step 1: Configure Build Variables

```bash
# Set deployment variables
export _REGION="us-central1"
export _CONTRACT_ID="CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC"
export _SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
```

### Step 2: Create Secrets in Secret Manager

```bash
# Create secret for app URL
gcloud secrets create trafficpulse-secrets \
  --replication-policy="automatic" \
  --project $PROJECT_ID

# Add secret versions
echo -n "https://trafficpulse-$REGION-$PROJECT_ID.uc.r.appspot.com" | \
  gcloud secrets versions create trafficpulse-secrets \
  --data-file=- \
  --key="app-url"

echo -n "$_CONTRACT_ID" | \
  gcloud secrets versions create trafficpulse-secrets \
  --data-file=- \
  --key="contract-id"

echo -n "$_SOROBAN_RPC_URL" | \
  gcloud secrets versions create trafficpulse-secrets \
  --data-file=- \
  --key="soroban-rpc-url"
```

### Step 3: Submit Build

```bash
gcloud builds submit \
  --config gcp/cloudbuild.yaml \
  --substitutions=_REGION=$_REGION,_CONTRACT_ID=$_CONTRACT_ID,_SOROBAN_RPC_URL=$_SOROBAN_RPC_URL \
  --project $PROJECT_ID
```

### Step 4: Verify Deployment

```bash
# Get service URL
gcloud run services describe trafficpulse \
  --region $_REGION \
  --format 'value(status.url)'

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=trafficpulse" \
  --limit 20 --format="table(timestamp,textPayload)"
```

---

## Terraform Infrastructure

For production deployments with infrastructure-as-code.

### Step 1: Configure Terraform

```bash
cd gcp/terraform

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
project_id      = "$PROJECT_ID"
region          = "us-central1"
environment     = "production"
min_instances   = 1
max_instances   = 10
contract_id     = "CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC"
soroban_rpc_url = "https://soroban-testnet.stellar.org"
app_url         = "https://trafficpulse.us-central1-$PROJECT_ID.uc.r.appspot.com"
EOF
```

### Step 2: Initialize and Plan

```bash
terraform init

terraform plan -out=tfplan
```

### Step 3: Apply Infrastructure

```bash
terraform apply tfplan
```

### Step 4: Review Outputs

```bash
terraform output
```

---

## Manual Deployment

Deploy directly to Cloud Run without CI/CD.

### Step 1: Build Docker Image

```bash
cd app
docker build -t gcr.io/$PROJECT_ID/trafficpulse:latest .
```

### Step 2: Push to Container Registry

```bash
docker push gcr.io/$PROJECT_ID/trafficpulse:latest
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy trafficpulse \
  --image gcr.io/$PROJECT_ID/trafficpulse:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --concurrency 80 \
  --timeout 300 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=3001" \
  --set-secrets "NEXT_PUBLIC_CONTRACT_ID=trafficpulse-secrets:contract-id,NEXT_PUBLIC_SOROBAN_RPC_URL=trafficpulse-secrets:soroban-rpc-url,NEXT_PUBLIC_APP_URL=trafficpulse-secrets:app-url"
```

---

## User Simulation

Simulate real user traffic for load testing.

### Step 1: Setup Simulation Environment

```bash
cd scripts

# Install Python dependencies
pip install -r requirements.txt

# Or use setup script
./setup-simulation.sh  # Unix
./setup-simulation.bat # Windows
```

### Step 2: Configure Simulation

```bash
# Create .env.simulation
cat > .env.simulation <<EOF
SIM_USERS=25
SIM_DURATION=30
SIM_BET_MIN=50
SIM_BET_MAX=500
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC
LOG_LEVEL=INFO
EOF
```

### Step 3: Run Simulation

```bash
# Basic simulation
python simulate-users.py

# Advanced options
python simulate-users.py \
  --users 50 \
  --duration 60 \
  --bet-min 100 \
  --bet-max 1000 \
  --output metrics.json

# With specific user type distribution
python simulate-users.py \
  --casual-ratio 0.6 \
  --regular-ratio 0.25 \
  --whale-ratio 0.10 \
  --sniper-ratio 0.05
```

### Step 4: Monitor During Simulation

```bash
# Real-time logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=trafficpulse" \
  --format="table(timestamp,textPayload)" --follow

# View metrics
gcloud monitoring metrics-descriptors list --filter="metric.type=run.googleapis.com/request_count"
```

---

## Monitoring & Alerting

### Cloud Console Dashboards

1. **Cloud Run Metrics**
   - Request count
   - Response latency (P50, P95, P99)
   - Error rate
   - Instance count

2. **Custom Dashboard**
   ```bash
   # Create dashboard via Terraform or Console
   # See gcp/terraform/main.tf for alert policies
   ```

### Alert Policies

Pre-configured alerts:
- **High Error Rate**: >5% errors for 5 minutes
- **High Latency**: P95 >2s for 5 minutes
- **Uptime Check**: Failed checks for 2 minutes

### Configure Notifications

```bash
# Create notification channel (email)
gcloud alpha monitoring channels create \
  --display-name="TrafficPulse Team" \
  --type=email \
  --channel-labels=email_address=team@example.com

# Add channel to alert policies
# Update terraform.tfvars with channel ID
```

---

## Cost Estimation

### Monthly Cost Breakdown

| Component | Configuration | Estimated Cost |
|-----------|--------------|----------------|
| Cloud Run (min) | 1 instance, 1 CPU, 512Mi | ~$25/month |
| Cloud Run (requests) | 1M requests | ~$0.40 |
| Secret Manager | 1 secret | ~$0.06/month |
| Cloud Monitoring | Uptime + alerts | ~$0.50/month |
| Network Egress | 1 GB | ~$0.12 |
| **Total (base)** | | **~$26/month** |

### Cost Optimization Tips

1. **Scale to Zero**: Set `min_instances=0` for dev/staging
2. **Right-size Resources**: Monitor actual CPU/memory usage
3. **Use Committed Use Discounts**: For predictable workloads
4. **Set Budget Alerts**:
   ```bash
   gcloud billing budgets create \
     --billing-account=YOUR_BILLING_ACCOUNT \
     --display-name="TrafficPulse Budget" \
     --amount=100USD \
     --threshold-rule=percent=50 \
     --threshold-rule=percent=75 \
     --threshold-rule=percent=90 \
     --notification-email=team@example.com
   ```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

```bash
# Check build logs
gcloud builds list --limit 1 --format="value(id)" | \
  xargs -I {} gcloud builds log {}

# Verify Dockerfile
docker build -t test -f app/Dockerfile app
```

#### 2. Deployment Fails

```bash
# Check service status
gcloud run services describe trafficpulse --region us-central1

# View revision logs
gcloud run revisions logs tail trafficpulse-001 --region us-central1
```

#### 3. Health Check Fails

```bash
# Test endpoint
curl -v https://trafficpulse.us-central1-$PROJECT_ID.uc.r.appspot.com

# Check environment variables
gcloud run services describe trafficpulse \
  --region us-central1 \
  --format="yaml(spec.template.spec.containers.env)"
```

#### 4. Secret Access Denied

```bash
# Verify service account has access
gcloud secrets add-iam-policy-binding trafficpulse-secrets \
  --member="serviceAccount:trafficpulse-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

#### 5. High Latency

```bash
# Check instance count
gcloud run instances list --service trafficpulse --region us-central1

# Scale up min instances
gcloud run services update trafficpulse \
  --region us-central1 \
  --min-instances=2
```

### Useful Commands

```bash
# Stream logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=trafficpulse" \
  --format="table(timestamp,textPayload)" --follow

# List revisions
gcloud run revisions list --service trafficpulse --region us-central1

# Get IAM policy
gcloud run services get-iam-policy trafficpulse --region us-central1

# Rollback to previous revision
gcloud run services update-traffic trafficpulse \
  --region us-central1 \
  --to-revisions=trafficpulse-002=100

# Delete service
gcloud run services delete trafficpulse --region us-central1
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/anilyagiz/TrafficPulse/issues
- Documentation: https://github.com/anilyagiz/TrafficPulse/docs
