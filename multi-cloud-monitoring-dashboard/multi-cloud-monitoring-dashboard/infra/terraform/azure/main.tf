resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "East US"
}

resource "azurerm_storage_account" "example" {
  name                     = "examplestoracc"
  resource_group_name      = azurerm_resource_group.example.name
  location                 = azurerm_resource_group.example.location
  account_tier            = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "example" {
  name                = "example-app-service-plan"
  location           = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  sku {
    tier     = "Basic"
    size     = "B1"
  }
}

resource "azurerm_app_service" "example" {
  name                = "example-app-service"
  location           = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  app_service_plan_id = azurerm_app_service_plan.example.id

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE" = azurerm_storage_account.example.primary_blob_endpoint
  }
}