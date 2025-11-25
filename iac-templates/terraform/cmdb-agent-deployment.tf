# Terraform Configuration for CMDB Agent Deployment
# Deploys agents across infrastructure with automatic registration

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Variables
variable "cmdb_server_url" {
  description = "CMDB server URL for agent registration"
  type        = string
  default     = "https://cmdb.example.com"
}

variable "cmdb_api_key" {
  description = "API key for CMDB authentication"
  type        = string
  sensitive   = true
}

variable "agent_version" {
  description = "CMDB agent version to deploy"
  type        = string
  default     = "1.0.0"
}

variable "auto_update_enabled" {
  description = "Enable automatic agent updates"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "regions" {
  description = "Regions to deploy agents"
  type        = list(string)
  default     = ["us-east-1", "us-west-2", "eu-west-1"]
}

# AWS EC2 Instances with CMDB Agent
resource "aws_instance" "cmdb_monitored" {
  for_each = toset(var.regions)
  
  provider      = aws.region[each.key]
  ami           = data.aws_ami.ubuntu[each.key].id
  instance_type = "t3.medium"
  
  tags = {
    Name        = "cmdb-monitored-${each.key}"
    Environment = var.environment
    CMDBManaged = "true"
    AgentVersion = var.agent_version
  }
  
  # User data script to install CMDB agent
  user_data = templatefile("${path.module}/scripts/install-agent.sh", {
    cmdb_server_url    = var.cmdb_server_url
    cmdb_api_key       = var.cmdb_api_key
    agent_version      = var.agent_version
    auto_update        = var.auto_update_enabled
    environment        = var.environment
    collection_interval = 300000
  })
  
  # Security group for agent communication
  vpc_security_group_ids = [aws_security_group.cmdb_agent[each.key].id]
  
  # IAM role for CloudWatch and SSM
  iam_instance_profile = aws_iam_instance_profile.cmdb_agent.name
  
  lifecycle {
    create_before_destroy = true
    ignore_changes        = [user_data]
  }
}

# Security Group for CMDB Agent
resource "aws_security_group" "cmdb_agent" {
  for_each = toset(var.regions)
  
  provider    = aws.region[each.key]
  name        = "cmdb-agent-${each.key}"
  description = "Security group for CMDB agent communication"
  
  # Outbound to CMDB server
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS to CMDB server"
  }
  
  # Outbound for updates
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP for package updates"
  }
  
  tags = {
    Name = "cmdb-agent-${each.key}"
  }
}

# IAM Role for CMDB Agent
resource "aws_iam_role" "cmdb_agent" {
  name = "cmdb-agent-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for CMDB Agent
resource "aws_iam_role_policy" "cmdb_agent" {
  name = "cmdb-agent-policy"
  role = aws_iam_role.cmdb_agent.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeVolumes",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeTags"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:UpdateInstanceInformation",
          "ssm:GetParameter"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "cmdb_agent" {
  name = "cmdb-agent-profile"
  role = aws_iam_role.cmdb_agent.name
}

# Azure VM with CMDB Agent
resource "azurerm_linux_virtual_machine" "cmdb_monitored" {
  for_each = toset(["eastus", "westus2", "westeurope"])
  
  name                = "cmdb-vm-${each.key}"
  resource_group_name = azurerm_resource_group.cmdb[each.key].name
  location            = each.key
  size                = "Standard_B2s"
  
  admin_username = "cmdbadmin"
  
  admin_ssh_key {
    username   = "cmdbadmin"
    public_key = file("~/.ssh/id_rsa.pub")
  }
  
  network_interface_ids = [
    azurerm_network_interface.cmdb[each.key].id
  ]
  
  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
  
  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
  
  # Custom data to install agent
  custom_data = base64encode(templatefile("${path.module}/scripts/install-agent.sh", {
    cmdb_server_url    = var.cmdb_server_url
    cmdb_api_key       = var.cmdb_api_key
    agent_version      = var.agent_version
    auto_update        = var.auto_update_enabled
    environment        = var.environment
    collection_interval = 300000
  }))
  
  tags = {
    Environment  = var.environment
    CMDBManaged  = "true"
    AgentVersion = var.agent_version
  }
}

# GCP Compute Instance with CMDB Agent
resource "google_compute_instance" "cmdb_monitored" {
  for_each = toset(["us-central1-a", "us-west1-a", "europe-west1-b"])
  
  name         = "cmdb-instance-${each.key}"
  machine_type = "e2-medium"
  zone         = each.key
  
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2004-lts"
    }
  }
  
  network_interface {
    network = "default"
    access_config {
      // Ephemeral IP
    }
  }
  
  metadata_startup_script = templatefile("${path.module}/scripts/install-agent.sh", {
    cmdb_server_url    = var.cmdb_server_url
    cmdb_api_key       = var.cmdb_api_key
    agent_version      = var.agent_version
    auto_update        = var.auto_update_enabled
    environment        = var.environment
    collection_interval = 300000
  })
  
  service_account {
    scopes = ["cloud-platform"]
  }
  
  labels = {
    environment  = var.environment
    cmdb_managed = "true"
    agent_version = replace(var.agent_version, ".", "-")
  }
}

# Kubernetes Deployment with CMDB Agent DaemonSet
resource "kubernetes_daemonset" "cmdb_agent" {
  metadata {
    name      = "cmdb-agent"
    namespace = kubernetes_namespace.monitoring.metadata[0].name
    
    labels = {
      app     = "cmdb-agent"
      version = var.agent_version
    }
  }
  
  spec {
    selector {
      match_labels = {
        app = "cmdb-agent"
      }
    }
    
    template {
      metadata {
        labels = {
          app     = "cmdb-agent"
          version = var.agent_version
        }
      }
      
      spec {
        host_network = true
        host_pid     = true
        
        container {
          name  = "cmdb-agent"
          image = "cmdb/agent:${var.agent_version}"
          
          env {
            name  = "CMDB_SERVER_URL"
            value = var.cmdb_server_url
          }
          
          env {
            name = "CMDB_API_KEY"
            value_from {
              secret_key_ref {
                name = "cmdb-credentials"
                key  = "api-key"
              }
            }
          }
          
          env {
            name  = "AUTO_UPDATE"
            value = tostring(var.auto_update_enabled)
          }
          
          env {
            name  = "AGENT_ENVIRONMENT"
            value = var.environment
          }
          
          env {
            name = "NODE_NAME"
            value_from {
              field_ref {
                field_path = "spec.nodeName"
              }
            }
          }
          
          volume_mount {
            name       = "host-root"
            mount_path = "/host"
            read_only  = true
          }
          
          volume_mount {
            name       = "docker-sock"
            mount_path = "/var/run/docker.sock"
          }
          
          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
          
          security_context {
            privileged = true
          }
        }
        
        volume {
          name = "host-root"
          host_path {
            path = "/"
          }
        }
        
        volume {
          name = "docker-sock"
          host_path {
            path = "/var/run/docker.sock"
          }
        }
        
        toleration {
          effect = "NoSchedule"
          key    = "node-role.kubernetes.io/master"
        }
      }
    }
  }
}

# Outputs
output "aws_instance_ids" {
  description = "AWS instance IDs with CMDB agent"
  value       = { for k, v in aws_instance.cmdb_monitored : k => v.id }
}

output "azure_vm_ids" {
  description = "Azure VM IDs with CMDB agent"
  value       = { for k, v in azurerm_linux_virtual_machine.cmdb_monitored : k => v.id }
}

output "gcp_instance_names" {
  description = "GCP instance names with CMDB agent"
  value       = { for k, v in google_compute_instance.cmdb_monitored : k => v.name }
}

output "agent_endpoints" {
  description = "CMDB agent health check endpoints"
  value = {
    aws   = { for k, v in aws_instance.cmdb_monitored : k => "http://${v.public_ip}:3000/health" }
    azure = { for k, v in azurerm_linux_virtual_machine.cmdb_monitored : k => "http://${v.public_ip_address}:3000/health" }
    gcp   = { for k, v in google_compute_instance.cmdb_monitored : k => "http://${v.network_interface[0].access_config[0].nat_ip}:3000/health" }
  }
  sensitive = true
}
