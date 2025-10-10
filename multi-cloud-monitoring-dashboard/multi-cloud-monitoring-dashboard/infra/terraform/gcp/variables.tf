variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "instance_type" {
  description = "The type of GCP instance"
  type        = string
  default     = "n1-standard-1"
}

variable "network_name" {
  description = "The name of the GCP network"
  type        = string
  default     = "default"
}

variable "subnetwork_name" {
  description = "The name of the GCP subnetwork"
  type        = string
  default     = "default"
}