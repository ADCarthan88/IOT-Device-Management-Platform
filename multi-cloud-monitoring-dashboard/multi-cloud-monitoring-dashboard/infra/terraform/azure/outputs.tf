output.tf

output "azure_resource_group_name" {
  value = azurerm_resource_group.example.name
}

output "azure_storage_account_name" {
  value = azurerm_storage_account.example.name
}

output "azure_app_service_url" {
  value = azurerm_app_service.example.default_site_hostname
}