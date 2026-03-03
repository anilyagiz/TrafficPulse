# TrafficPulse GCP Infrastructure
# Terraform configuration for production deployment

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    # Bucket for Terraform state
    # bucket = "trafficpulse-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ============================================
# Service Account
# ============================================

resource "google_service_account" "trafficpulse_sa" {
  account_id   = "trafficpulse-sa"
  display_name = "TrafficPulse Cloud Run Service Account"
  description  = "Service account for TrafficPulse Cloud Run deployment"
}

# Grant necessary permissions
resource "google_project_iam_member" "trafficpulse_sa_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.trafficpulse_sa.email}"
}

resource "google_project_iam_member" "trafficpulse_sa_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.trafficpulse_sa.email}"
}

resource "google_project_iam_member" "trafficpulse_sa_secretaccess" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.trafficpulse_sa.email}"
}

# ============================================
# Cloud Run Service
# ============================================

resource "google_cloud_run_v2_service" "trafficpulse" {
  name     = "trafficpulse"
  location = var.region
  
  # Ingress configuration
  ingress = "INGRESS_TRAFFIC_ALL"
  
  # Template configuration
  template {
    # Container configuration
    containers {
      image = "gcr.io/${var.project_id}/trafficpulse:latest"
      
      ports {
        name           = "http1"
        container_port = 3001
      }
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      
      # Environment variables
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      
      env {
        name  = "PORT"
        value = "3001"
      }
      
      # Secrets from Secret Manager
      env {
        name = "NEXT_PUBLIC_CONTRACT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.trafficpulse_secrets.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "NEXT_PUBLIC_SOROBAN_RPC_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.trafficpulse_secrets.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "NEXT_PUBLIC_APP_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.trafficpulse_secrets.secret_id
            version = "latest"
          }
        }
      }
    }
    
    # Scaling configuration
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    
    # Traffic configuration
    max_instance_request_concurrency = 80
    timeout                          = "300s"
    
    # Service account
    service_account = google_service_account.trafficpulse_sa.email
    
    # VPC configuration (optional)
    # vpc_access {
    #   connector = google_vpc_access_connector.trafficpulse.id
    #   egress    = "PRIVATE_RANGES_ONLY"
    # }
  }
  
  # Traffic routing
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  
  # Binary authorization (optional)
  # binary_authorization {
  #   use_default = false
  #   breakglass_justification = "Emergency deployment"
  # }
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public_access" {
  project  = var.project_id
  location = google_cloud_run_v2_service.trafficpulse.location
  service  = google_cloud_run_v2_service.trafficpulse.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ============================================
# Secret Manager
# ============================================

resource "google_secret_manager_secret" "trafficpulse_secrets" {
  secret_id = "trafficpulse-secrets"
  
  replication {
    auto {}
  }
  
  labels = {
    app         = "trafficpulse"
    environment = "production"
  }
}

# Contract ID secret version
resource "google_secret_manager_secret_version" "contract_id" {
  secret      = google_secret_manager_secret.trafficpulse_secrets.id
  secret_data = var.contract_id
}

# Soroban RPC URL secret version
resource "google_secret_manager_secret_version" "soroban_rpc_url" {
  secret      = google_secret_manager_secret.trafficpulse_secrets.id
  secret_data = var.soroban_rpc_url
}

# App URL secret version
resource "google_secret_manager_secret_version" "app_url" {
  secret      = google_secret_manager_secret.trafficpulse_secrets.id
  secret_data = var.app_url
}

# ============================================
# Cloud Monitoring & Alerting
# ============================================

# Uptime check
resource "google_monitoring_uptime_check_config" "trafficpulse" {
  display_name = "TrafficPulse Uptime Check"
  timeout      = "10s"
  period       = "60s"
  
  http_check {
    path           = "/"
    port           = 443
    use_ssl        = true
    validate_ssl   = true
    request_method = "GET"
  }
  
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = google_cloud_run_v2_service.trafficpulse.uri
    }
  }
}

# Alert policy for high error rate
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "TrafficPulse High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error Rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"trafficpulse\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code!=\"200\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }
  
  notification_channels = []  # Add notification channel IDs here
  
  documentation {
    content   = "TrafficPulse is experiencing a high error rate (>5%). Check Cloud Run logs and metrics."
    mime_type = "text/markdown"
  }
}

# Alert policy for high latency
resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "TrafficPulse High Latency"
  combiner     = "OR"
  
  conditions {
    display_name = "P95 Latency > 2s"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"trafficpulse\" AND metric.type=\"run.googleapis.com/request_latencies\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 2000
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_95"
      }
    }
  }
  
  notification_channels = []  # Add notification channel IDs here
  
  documentation {
    content   = "TrafficPulse is experiencing high latency (P95 > 2s). Consider scaling or optimizing."
    mime_type = "text/markdown"
  }
}

# ============================================
# Cloud Logging Sink (optional)
# ============================================

# resource "google_logging_project_sink" "trafficpulse_logs" {
#   name        = "trafficpulse-logs-sink"
#   destination = "bigquery.googleapis.com/projects/${var.project_id}/datasets/trafficpulse_logs"
#   filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"trafficpulse\""
#   
#   bigquery_options {
#     use_partitioned_tables = true
#   }
# }

# ============================================
# Outputs
# ============================================

output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.trafficpulse.uri
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.trafficpulse.name
}

output "service_account_email" {
  description = "Service account email"
  value       = google_service_account.trafficpulse_sa.email
}

output "secret_manager_secret_id" {
  description = "Secret Manager secret ID"
  value       = google_secret_manager_secret.trafficpulse_secrets.secret_id
}
