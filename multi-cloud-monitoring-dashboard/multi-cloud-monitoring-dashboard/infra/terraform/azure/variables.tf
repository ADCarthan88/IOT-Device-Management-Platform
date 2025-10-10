variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
}

variable "storage_account_name" {
  description = "The name of the storage account"
  type        = string
}

variable "app_service_plan_name" {
  description = "The name of the App Service plan"
  type        = string
}

variable "web_app_name" {
  description = "The name of the web application"
  type        = string
}

variable "database_name" {
  description = "The name of the Azure SQL Database"
  type        = string
}

variable "admin_username" {
  description = "The admin username for the database"
  type        = string
}

variable "admin_password" {
  description = "The admin password for the database"
  type        = string
  sensitive   = true
}