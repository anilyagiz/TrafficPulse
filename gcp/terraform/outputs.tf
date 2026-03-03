# TrafficPulse GCP Terraform Outputs

output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.trafficpulse.uri
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.trafficpulse.name
}

output "service_location" {
  description = "Cloud Run service location"
  value       = google_cloud_run_v2_service.trafficpulse.location
}

output "service_account_email" {
  description = "Service account email"
  value       = google_service_account.trafficpulse_sa.email
}

output "secret_manager_secret_id" {
  description = "Secret Manager secret ID"
  value       = google_secret_manager_secret.trafficpulse_secrets.secret_id
}

output "uptime_check_id" {
  description = "Uptime check configuration ID"
  value       = google_monitoring_uptime_check_config.trafficpulse.id
}

output "alert_policy_error_rate_id" {
  description = "High error rate alert policy ID"
  value       = google_monitoring_alert_policy.high_error_rate.id
}

output "alert_policy_latency_id" {
  description = "High latency alert policy ID"
  value       = google_monitoring_alert_policy.high_latency.id
}

output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP region"
  value       = var.region
}

output "deployment_info" {
  description = "Complete deployment information"
  value = {
    service_url       = google_cloud_run_v2_service.trafficpulse.uri
    service_name      = google_cloud_run_v2_service.trafficpulse.name
    location          = google_cloud_run_v2_service.trafficpulse.location
    min_instances     = var.min_instances
    max_instances     = var.max_instances
    memory            = var.memory
    cpu               = var.cpu
    concurrency       = var.concurrency
    timeout           = var.timeout
    secret_id         = google_secret_manager_secret.trafficpulse_secrets.secret_id
    service_account   = google_service_account.trafficpulse_sa.email
    uptime_check_id   = google_monitoring_uptime_check_config.trafficpulse.id
    error_alert_id    = google_monitoring_alert_policy.high_error_rate.id
    latency_alert_id  = google_monitoring_alert_policy.high_latency.id
  }
}

output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown"
  value = {
    cloud_run_compute = "${format("%.2f", var.min_instances * 24 * 30 * 0.0000025 * parseint(replace(var.cpu, "m", ""), 10) / 1000 * parseint(replace(var.memory, "Mi", ""), 10) / 128)} USD (minimum instances)"
    cloud_run_requests = "~0.40 USD per million requests"
    secret_manager = "~0.06 USD per month"
    monitoring = "~0.50 USD per month (uptime checks + alerts)"
    networking = "~0.12 USD per GB egress"
    total_estimate = "${format("%.2f", var.min_instances * 24 * 30 * 0.0000025 * parseint(replace(var.cpu, "m", ""), 10) / 1000 * parseint(replace(var.memory, "Mi", ""), 10) / 128 + 0.50 + 0.06)} USD base + usage"
  }
}

output "next_steps" {
  description = "Next steps after deployment"
  value = <<EOT
===========================================
TrafficPulse GCP Deployment Complete!
===========================================

Service URL: ${google_cloud_run_v2_service.trafficpulse.uri}

Next Steps:
1. Update DNS records to point to the service URL
2. Configure SSL certificate (if using custom domain)
3. Add notification channels to alert policies
4. Set up Cloud Build trigger for CI/CD
5. Monitor service in Cloud Console

Commands:
- View logs: gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=trafficpulse" --limit 50
- Check metrics: gcloud monitoring dashboards list --filter="displayName:TrafficPulse"
- Update secrets: gcloud secrets versions create trafficpulse-secrets --data-file=secrets.json

===========================================
EOT
}
