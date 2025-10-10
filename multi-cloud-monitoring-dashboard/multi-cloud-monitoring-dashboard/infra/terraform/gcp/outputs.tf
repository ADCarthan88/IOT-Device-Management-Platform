output.tf

output "project_id" {
  value = google_project.project.project_id
}

output "bucket_name" {
  value = google_storage_bucket.bucket.name
}

output "function_url" {
  value = google_cloudfunctions_function.function.https_trigger_url
}