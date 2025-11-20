# Azure Virtual Network Terraform Module
# Implements hub-spoke or standalone VNet with subnets

variable "tenant_name" {
  description = "Tenant name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, test, prod)"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "vnet_name" {
  description = "Virtual Network name"
  type        = string
}

variable "address_space" {
  description = "VNet address space"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnets" {
  description = "Map of subnet configurations"
  type = map(object({
    address_prefixes = list(string)
    service_endpoints = optional(list(string))
    delegations = optional(list(object({
      name = string
      service_delegation = object({
        name    = string
        actions = list(string)
      })
    })))
  }))
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.tenant_name}-${var.environment}-${var.vnet_name}-rg"
  location = var.location
  tags     = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "IAC-Dharma"
  })
}

# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "${var.tenant_name}-${var.environment}-${var.vnet_name}-vnet"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = var.address_space
  
  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "IAC-Dharma"
  })
}

# Subnets
resource "azurerm_subnet" "subnets" {
  for_each             = var.subnets
  name                 = "${var.tenant_name}-${var.environment}-${each.key}-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = each.value.address_prefixes
  service_endpoints    = each.value.service_endpoints

  dynamic "delegation" {
    for_each = each.value.delegations != null ? each.value.delegations : []
    content {
      name = delegation.value.name
      service_delegation {
        name    = delegation.value.service_delegation.name
        actions = delegation.value.service_delegation.actions
      }
    }
  }
}

# Network Security Groups
resource "azurerm_network_security_group" "nsg" {
  for_each            = var.subnets
  name                = "${var.tenant_name}-${var.environment}-${each.key}-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  
  tags = merge(var.tags, {
    Environment = var.environment
    ManagedBy   = "IAC-Dharma"
  })
}

# Associate NSGs with Subnets
resource "azurerm_subnet_network_security_group_association" "nsg_association" {
  for_each                  = var.subnets
  subnet_id                 = azurerm_subnet.subnets[each.key].id
  network_security_group_id = azurerm_network_security_group.nsg[each.key].id
}

# Outputs
output "vnet_id" {
  description = "Virtual Network ID"
  value       = azurerm_virtual_network.vnet.id
}

output "vnet_name" {
  description = "Virtual Network name"
  value       = azurerm_virtual_network.vnet.name
}

output "subnet_ids" {
  description = "Map of subnet IDs"
  value       = { for k, v in azurerm_subnet.subnets : k => v.id }
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.rg.name
}
