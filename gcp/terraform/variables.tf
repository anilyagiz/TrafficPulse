# TrafficPulse GCP Terraform Variables

# ============================================
# GCP Configuration
# ============================================

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run deployment"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
}

# ============================================
# Cloud Run Configuration
# ============================================

variable "min_instances" {
  description = "Minimum number of Cloud Run instances (0 for scale-to-zero)"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "memory" {
  description = "Memory limit for Cloud Run container"
  type        = string
  default     = "512Mi"
}

variable "cpu" {
  description = "CPU limit for Cloud Run container"
  type        = string
  default     = "1000m"
}

variable "concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 80
}

variable "timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

# ============================================
# Application Configuration
# ============================================

variable "contract_id" {
  description = "Stellar smart contract ID"
  type        = string
  sensitive   = true
}

variable "soroban_rpc_url" {
  description = "Soroban RPC endpoint URL"
  type        = string
  default     = "https://soroban-testnet.stellar.org"
}

variable "app_url" {
  description = "Application base URL for SEO and redirects"
  type        = string
  default     = ""
}

# ============================================
# Monitoring & Alerting
# ============================================

variable "enable_uptime_check" {
  description = "Enable uptime monitoring"
  type        = bool
  default     = true
}

variable "enable_alerting" {
  description = "Enable alert policies"
  type        = bool
  default     = true
}

variable "alert_notification_channels" {
  description = "List of notification channel IDs for alerts"
  type        = list(string)
  default     = []
}

# ============================================
# Networking (Optional)
# ============================================

variable "enable_vpc" {
  description = "Enable VPC connectivity for Cloud Run"
  type        = bool
  default     = false
}

variable "vpc_connector_name" {
  description = "Name of VPC access connector"
  type        = string
  default     = ""
}

# ============================================
# Cost Management
# ============================================

variable "cost_budget_amount" {
  description = "Monthly cost budget in USD"
  type        = number
  default     = 100
}

variable "enable_cost_alerts" {
  description = "Enable cost budget alerts"
  type        = bool
  default     = true
}

# ============================================
# Tags and Labels
# ============================================

variable "additional_labels" {
  description = "Additional labels to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "team" {
  description = "Team responsible for this infrastructure"
  type        = string
  default     = "platform"
}
