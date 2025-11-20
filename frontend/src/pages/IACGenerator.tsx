import { useState, useEffect } from 'react';
import { Code, Download, FileText, CheckCircle, Play, Settings, Copy } from 'lucide-react';
import { useLocation } from 'react-router-dom';
// import Editor from '@monaco-editor/react'; // Will use later for advanced editing
import Badge from '../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import Progress from '../components/ui/Progress';
// import Button from '../components/ui/Button'; // Using button directly
// import api from '../lib/api'; // Not needed yet
import toast from 'react-hot-toast';

interface IACTemplate {
  id: string;
  name: string;
  provider: string;
  description: string;
  resources: number;
  status: 'draft' | 'validated' | 'deployed';
}

const IACGenerator = () => {
  const [templates, setTemplates] = useState<IACTemplate[]>([
    {
      id: '1',
      name: 'AWS VPC with Public Subnets',
      provider: 'aws',
      description: 'Production-ready VPC with 3 availability zones',
      resources: 15,
      status: 'validated',
    },
    {
      id: '2',
      name: 'Kubernetes Cluster (EKS)',
      provider: 'aws',
      description: 'Managed Kubernetes with auto-scaling node groups',
      resources: 24,
      status: 'validated',
    },
    {
      id: '3',
      name: 'Azure App Service + SQL',
      provider: 'azure',
      description: 'Web app with managed database',
      resources: 12,
      status: 'draft',
    },
    {
      id: '4',
      name: 'AWS Lambda + API Gateway',
      provider: 'aws',
      description: 'Serverless API with Lambda functions',
      resources: 18,
      status: 'validated',
    },
    {
      id: '5',
      name: 'AWS RDS Multi-AZ + Read Replicas',
      provider: 'aws',
      description: 'High-availability PostgreSQL database',
      resources: 10,
      status: 'validated',
    },
    {
      id: '6',
      name: 'AWS S3 + CloudFront CDN',
      provider: 'aws',
      description: 'Static website with global CDN',
      resources: 8,
      status: 'validated',
    },
    {
      id: '7',
      name: 'GCP Compute + Load Balancer',
      provider: 'gcp',
      description: 'Auto-scaling compute instances with global LB',
      resources: 14,
      status: 'draft',
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<IACTemplate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [codeFormat, setCodeFormat] = useState<'terraform' | 'cloudformation'>('terraform');
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [detailsTemplate, setDetailsTemplate] = useState<IACTemplate | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    provider: 'inhouse',
    description: '',
    resources: 0,
    status: 'draft' as const,
    code: '',
  });
  const [customTemplateCode, setCustomTemplateCode] = useState<Record<string, string>>({});

  const location = useLocation();

  // Advanced editing features - to be implemented
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedCode, setEditedCode] = useState<string>('');
  // const [validationErrors, setValidationErrors] = useState<string[]>([]);
  // const [showPreview, setShowPreview] = useState(false);

  // Handle incoming template data from AI Designer
  useEffect(() => {
    const state = location.state as { createTemplate?: boolean; templateData?: { name: string; description: string; resources: number; code: string } } | null;
    if (state?.createTemplate && state?.templateData) {
      setNewTemplate({
        name: state.templateData.name || '',
        provider: 'inhouse',
        description: state.templateData.description || '',
        resources: state.templateData.resources || 0,
        status: 'draft',
        code: state.templateData.code || '',
      });
      setShowCreateTemplate(true);
      toast.success('Template data loaded from AI Designer!');
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const generateTerraformCode = (template: IACTemplate): string => {
    if (template.id === '1') {
      return `# AWS VPC with Public Subnets
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "main-vpc"
    Environment = "production"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-\${count.index + 1}"
    Type = "public"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}`;
    } else if (template.id === '2') {
      return `# EKS Cluster Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "eks-cluster"
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version  = "1.27"

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy
  ]

  tags = {
    Name = var.cluster_name
  }
}

# Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "\${var.cluster_name}-nodes"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.node_policy
  ]

  tags = {
    Name = "\${var.cluster_name}-nodes"
  }
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  name = "\${var.cluster_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

# IAM Role for Node Group
resource "aws_iam_role" "node" {
  name = "\${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  value = aws_eks_cluster.main.name
}`;
    } else if (template.id === '3') {
      return `# Azure App Service + SQL Database
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  default = "East US"
}

variable "resource_group_name" {
  default = "app-rg"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "app-service-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"
}

# App Service
resource "azurerm_linux_web_app" "main" {
  name                = "mywebapp-\${random_id.suffix.hex}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
  }

  app_settings = {
    "DATABASE_URL" = azurerm_mssql_database.main.id
  }
}

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "sqlserver-\${random_id.suffix.hex}"
  location                     = azurerm_resource_group.main.location
  resource_group_name          = azurerm_resource_group.main.name
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = random_password.sql_password.result
}

# SQL Database
resource "azurerm_mssql_database" "main" {
  name      = "appdb"
  server_id = azurerm_mssql_server.main.id
  sku_name  = "Basic"
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "random_password" "sql_password" {
  length  = 16
  special = true
}

output "app_url" {
  value = azurerm_linux_web_app.main.default_hostname
}`;
    } else if (template.id === '4') {
      return `# AWS Lambda + API Gateway
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

# Lambda Execution Role
resource "aws_iam_role" "lambda" {
  name = "lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function
resource "aws_lambda_function" "api" {
  filename      = "lambda.zip"
  function_name = "api-handler"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      ENVIRONMENT = "production"
    }
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "serverless-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api.invoke_arn
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/\${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "\${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_stage.prod.invoke_url
}`;
    } else if (template.id === '5') {
      return `# AWS RDS Multi-AZ + Read Replicas
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "Main DB subnet group"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Master Instance
resource "aws_db_instance" "master" {
  identifier           = "postgres-master"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "appdb"
  username = "dbadmin"
  password = var.db_password

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "PostgreSQL Master"
  }
}

# Read Replica 1
resource "aws_db_instance" "replica1" {
  identifier          = "postgres-replica-1"
  replicate_source_db = aws_db_instance.master.identifier
  instance_class      = "db.t3.medium"
  publicly_accessible = false

  tags = {
    Name = "PostgreSQL Read Replica 1"
  }
}

# Read Replica 2
resource "aws_db_instance" "replica2" {
  identifier          = "postgres-replica-2"
  replicate_source_db = aws_db_instance.master.identifier
  instance_class      = "db.t3.medium"
  publicly_accessible = false

  tags = {
    Name = "PostgreSQL Read Replica 2"
  }
}

output "master_endpoint" {
  value = aws_db_instance.master.endpoint
}

output "replica1_endpoint" {
  value = aws_db_instance.replica1.endpoint
}

output "replica2_endpoint" {
  value = aws_db_instance.replica2.endpoint
}`;
    } else if (template.id === '6') {
      return `# AWS S3 + CloudFront CDN
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "domain_name" {
  default = "example.com"
}

# S3 Bucket
resource "aws_s3_bucket" "website" {
  bucket = "\${var.domain_name}-static-assets"
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for \${var.domain_name}"
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AllowCloudFrontAccess"
      Effect = "Allow"
      Principal = {
        AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
      }
      Action   = "s3:GetObject"
      Resource = "\${aws_s3_bucket.website.arn}/*"
    }]
  })
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id   = "S3-\${aws_s3_bucket.website.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-\${aws_s3_bucket.website.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "\${var.domain_name} CDN"
  }
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "s3_bucket" {
  value = aws_s3_bucket.website.id
}`;
    } else if (template.id === '7') {
      return `# GCP Compute + Load Balancer
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
}

variable "region" {
  default = "us-central1"
}

# Instance Template
resource "google_compute_instance_template" "default" {
  name_prefix  = "web-template-"
  machine_type = "e2-medium"

  disk {
    source_image = "debian-cloud/debian-11"
    auto_delete  = true
    boot         = true
  }

  network_interface {
    network = "default"
    access_config {
      // Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
  EOF

  tags = ["http-server"]

  lifecycle {
    create_before_destroy = true
  }
}

# Instance Group Manager
resource "google_compute_region_instance_group_manager" "default" {
  name               = "web-igm"
  region             = var.region
  base_instance_name = "web"

  version {
    instance_template = google_compute_instance_template.default.id
  }

  target_size = 3

  auto_healing_policies {
    health_check      = google_compute_health_check.default.id
    initial_delay_sec = 300
  }
}

# Health Check
resource "google_compute_health_check" "default" {
  name = "web-health-check"

  http_health_check {
    port = 80
  }
}

# Backend Service
resource "google_compute_backend_service" "default" {
  name          = "web-backend"
  health_checks = [google_compute_health_check.default.id]

  backend {
    group = google_compute_region_instance_group_manager.default.instance_group
  }
}

# URL Map
resource "google_compute_url_map" "default" {
  name            = "web-url-map"
  default_service = google_compute_backend_service.default.id
}

# HTTP Proxy
resource "google_compute_target_http_proxy" "default" {
  name    = "web-http-proxy"
  url_map = google_compute_url_map.default.id
}

# Forwarding Rule
resource "google_compute_global_forwarding_rule" "default" {
  name       = "web-forwarding-rule"
  target     = google_compute_target_http_proxy.default.id
  port_range = "80"
}

output "load_balancer_ip" {
  value = google_compute_global_forwarding_rule.default.ip_address
}`;
    }
    
    // Check if it's a custom template
    if (customTemplateCode[template.id]) {
      return customTemplateCode[template.id];
    }
    
    // Default return for unmatched template IDs
    return `# Template not found
# Please select a valid template to generate infrastructure code.`;
  };

  const handleGenerate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    setGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setGeneratedCode(generateTerraformCode(template));
          setSelectedTemplate(template);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // API call would go here
      // await api.post('/iac/generate', { templateId });
    } catch (error) {
      console.error('Generation failed:', error);
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleTemplateDoubleClick = (template: IACTemplate) => {
    setDetailsTemplate(template);
    setShowTemplateDetails(true);
  };

  const getTemplateDetails = (template: IACTemplate) => {
    const detailsMap: Record<string, {
      estimatedCost: string;
      deploymentTime: string;
      resources: string[];
      useCases: string[];
      prerequisites: string[];
    }> = {
      '1': {
        estimatedCost: '$50-100/month',
        deploymentTime: '5-10 minutes',
        resources: [
          'VPC with CIDR 10.0.0.0/16',
          '3 Public Subnets across 3 AZs',
          'Internet Gateway',
          'Route Tables and Associations',
          'Network ACLs',
        ],
        useCases: ['Web applications', 'Multi-tier architectures', 'Production workloads'],
        prerequisites: ['AWS Account', 'Terraform installed', 'AWS CLI configured'],
      },
      '2': {
        estimatedCost: '$150-300/month',
        deploymentTime: '15-20 minutes',
        resources: [
          'EKS Cluster (v1.27)',
          'Managed Node Group (2-10 nodes)',
          'IAM Roles and Policies',
          't3.medium instances',
          'VPC and Networking',
        ],
        useCases: ['Microservices', 'Container orchestration', 'Cloud-native applications'],
        prerequisites: ['AWS Account', 'kubectl installed', 'IAM permissions'],
      },
      '3': {
        estimatedCost: '$80-150/month',
        deploymentTime: '10-15 minutes',
        resources: [
          'Azure Resource Group',
          'App Service Plan (P1v2)',
          'Linux Web App',
          'SQL Server',
          'SQL Database (Basic tier)',
        ],
        useCases: ['Web applications', 'REST APIs', 'Database-backed apps'],
        prerequisites: ['Azure Account', 'Terraform installed', 'Azure CLI'],
      },
      '4': {
        estimatedCost: '$5-20/month',
        deploymentTime: '5-8 minutes',
        resources: [
          'Lambda Function (Node.js 18.x)',
          'IAM Execution Role',
          'API Gateway HTTP API (v2)',
          'Lambda Integration',
          'Default Route and Stage',
        ],
        useCases: ['Serverless APIs', 'Event-driven processing', 'Microservices'],
        prerequisites: ['AWS Account', 'Lambda deployment package'],
      },
      '5': {
        estimatedCost: '$200-400/month',
        deploymentTime: '20-30 minutes',
        resources: [
          'PostgreSQL 15.3 Master (Multi-AZ)',
          '2 Read Replicas',
          'DB Subnet Groups',
          'Security Groups',
          'CloudWatch Logs',
          'Automated Backups',
        ],
        useCases: ['High-availability databases', 'Read-heavy workloads', 'Production data'],
        prerequisites: ['VPC with private subnets', 'Database credentials'],
      },
      '6': {
        estimatedCost: '$10-50/month',
        deploymentTime: '10-15 minutes',
        resources: [
          'S3 Bucket with Versioning',
          'CloudFront Distribution',
          'Origin Access Identity',
          'Bucket Policy',
          'HTTPS Redirect',
          'Compression Enabled',
        ],
        useCases: ['Static websites', 'SPAs', 'Global content delivery'],
        prerequisites: ['Website files', 'Domain name (optional)'],
      },
      '7': {
        estimatedCost: '$100-200/month',
        deploymentTime: '10-15 minutes',
        resources: [
          'Instance Template (e2-medium)',
          'Managed Instance Group',
          'Auto-healing Policy',
          'Health Checks',
          'Backend Service',
          'Global Load Balancer',
        ],
        useCases: ['Web applications', 'Auto-scaling services', 'High availability'],
        prerequisites: ['GCP Account', 'Project ID', 'gcloud CLI'],
      },
    };

    return detailsMap[template.id] || {};
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description || !newTemplate.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newId = String(templates.length + 1);
    const newTemplateData: IACTemplate = {
      id: newId,
      name: newTemplate.name,
      provider: 'inhouse',
      description: newTemplate.description,
      resources: newTemplate.resources,
      status: 'draft',
    };

    // Store the custom code
    setCustomTemplateCode({
      ...customTemplateCode,
      [newId]: newTemplate.code,
    });

    // Add to templates array using setTemplates
    setTemplates([...templates, newTemplateData]);
    
    // Reset form
    setNewTemplate({
      name: '',
      provider: 'inhouse',
      description: '',
      resources: 0,
      status: 'draft',
      code: '',
    });
    
    setShowCreateTemplate(false);
    toast.success('Custom template created successfully!');
  };

  const handleDownloadCode = () => {
    const filename = codeFormat === 'terraform' ? 'main.tf' : 'template.yaml';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Advanced editing functions - to be implemented later with Monaco editor
  /*
  const handleValidateCode = () => {
    const code = isEditing ? editedCode : generatedCode;
    const errors: string[] = [];
    
    // Basic validation
    if (!code.includes('terraform {') && !code.includes('provider ')) {
      errors.push('Missing provider configuration');
    }
    
    if (!code.includes('resource ')) {
      errors.push('No resources defined');
    }
    
    // Check for common issues
    if (code.includes('${') && !code.includes('\\${')) {
      errors.push('Unescaped template variables detected');
    }
    
    if (errors.length === 0) {
      setValidationErrors([]);
      toast.success('Code validation passed!');
    } else {
      setValidationErrors(errors);
      toast.error(`Found ${errors.length} validation errors`);
    }
  };

  const handleSaveEdits = () => {
    setGeneratedCode(editedCode);
    setIsEditing(false);
    toast.success('Changes saved!');
  };

  const handleResetEdits = () => {
    setEditedCode(generatedCode);
    setIsEditing(false);
    toast('Changes discarded', { icon: 'ℹ️' });
  };
  */

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'validated':
        return 'success';
      case 'deployed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws':
        return 'text-orange-600 dark:text-orange-400';
      case 'azure':
        return 'text-blue-600 dark:text-blue-400';
      case 'gcp':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Infrastructure as Code Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate, validate, and deploy infrastructure code
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Code className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">24</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Validated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">18</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Deployed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
            </div>
            <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">347</p>
            </div>
            <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Alert */}
      {generating && (
        <Alert variant="info" title="Generating Infrastructure Code">
          <div className="mt-2">
            <Progress value={generationProgress} variant="default" showLabel />
          </div>
        </Alert>
      )}

      {/* Templates Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs defaultValue="all">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 flex justify-end">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="aws">AWS</TabsTrigger>
              <TabsTrigger value="azure">Azure</TabsTrigger>
              <TabsTrigger value="gcp">GCP</TabsTrigger>
              <TabsTrigger value="inhouse">In-House</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <div className="p-6">
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                    onDoubleClick={() => handleTemplateDoubleClick(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          <Badge variant={getStatusVariant(template.status)}>
                            {template.status}
                          </Badge>
                          <span className={`text-sm font-medium uppercase ${getProviderColor(template.provider)}`}>
                            {template.provider}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{template.resources} resources</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Download template
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerate(template.id);
                          }}
                          disabled={generating}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="aws">
            <div className="p-6">
              <div className="space-y-4">
                {templates
                  .filter((t) => t.provider === 'aws')
                  .map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onDoubleClick={() => handleTemplateDoubleClick(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <Badge variant={getStatusVariant(template.status)}>
                              {template.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{template.resources} resources</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download template
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate(template.id);
                            }}
                            disabled={generating}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="azure">
            <div className="p-6">
              <div className="space-y-4">
                {templates
                  .filter((t) => t.provider === 'azure')
                  .map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onDoubleClick={() => handleTemplateDoubleClick(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <Badge variant={getStatusVariant(template.status)}>
                              {template.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{template.resources} resources</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download template
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate(template.id);
                            }}
                            disabled={generating}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gcp">
            <div className="p-6">
              <div className="space-y-4">
                {templates
                  .filter((t) => t.provider === 'gcp')
                  .map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onDoubleClick={() => handleTemplateDoubleClick(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <Badge variant={getStatusVariant(template.status)}>
                              {template.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{template.resources} resources</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download template
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate(template.id);
                            }}
                            disabled={generating}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inhouse">
            <div className="p-6">
              <div className="space-y-4">
                {templates
                  .filter((t) => t.provider === 'inhouse')
                  .map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                      onDoubleClick={() => handleTemplateDoubleClick(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <Badge variant={getStatusVariant(template.status)}>
                              {template.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{template.resources} resources</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download template
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerate(template.id);
                            }}
                            disabled={generating}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {templates.filter((t) => t.provider === 'inhouse').length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No In-House Templates Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Create custom templates for your organization's specific needs
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCreateTemplate(true)}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Create Custom Template
                    </button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Custom Template Modal */}
      {showCreateTemplate && (
        <Modal
          isOpen={showCreateTemplate}
          onClose={() => {
            setShowCreateTemplate(false);
            setNewTemplate({
              name: '',
              provider: 'inhouse',
              description: '',
              resources: 0,
              status: 'draft',
              code: '',
            });
          }}
          title="Create Custom Template"
          size="xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="e.g., Custom Microservices Stack"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Describe what this template does and when to use it"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Resources
              </label>
              <input
                type="number"
                value={newTemplate.resources}
                onChange={(e) => setNewTemplate({ ...newTemplate, resources: parseInt(e.target.value) || 0 })}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Terraform Code *
              </label>
              <textarea
                value={newTemplate.code}
                onChange={(e) => setNewTemplate({ ...newTemplate, code: e.target.value })}
                placeholder="Enter your Terraform configuration code here..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Paste your Terraform configuration. This will be used to generate infrastructure code.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => {
                  setShowCreateTemplate(false);
                  setNewTemplate({
                    name: '',
                    provider: 'inhouse',
                    description: '',
                    resources: 0,
                    status: 'draft',
                    code: '',
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.description || !newTemplate.code}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Information Modal (Double-click) */}
      {showTemplateDetails && detailsTemplate && (
        <Modal
          isOpen={showTemplateDetails}
          onClose={() => {
            setShowTemplateDetails(false);
            setDetailsTemplate(null);
          }}
          title={`${detailsTemplate.name} - Details`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Badge variant="default">{detailsTemplate.provider.toUpperCase()}</Badge>
              <Badge variant={getStatusVariant(detailsTemplate.status)}>
                {detailsTemplate.status}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{detailsTemplate.description}</p>
            </div>

            {/* Cost & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Cost</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {getTemplateDetails(detailsTemplate).estimatedCost || 'N/A'}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Deployment Time</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {getTemplateDetails(detailsTemplate).deploymentTime || 'N/A'}
                </p>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Resources Included</h4>
              <ul className="space-y-2">
                {getTemplateDetails(detailsTemplate).resources?.map((resource: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Common Use Cases</h4>
              <div className="flex flex-wrap gap-2">
                {getTemplateDetails(detailsTemplate).useCases?.map((useCase: string, index: number) => (
                  <Badge key={index} variant="default" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {useCase}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Prerequisites</h4>
              <ul className="space-y-2">
                {getTemplateDetails(detailsTemplate).prerequisites?.map((prereq: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500">•</span>
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  setShowTemplateDetails(false);
                  setDetailsTemplate(null);
                  handleGenerate(detailsTemplate.id);
                }}
                disabled={generating}
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Infrastructure Code
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && generatedCode && (
        <Modal
          isOpen={!!selectedTemplate}
          onClose={() => {
            setSelectedTemplate(null);
            setGeneratedCode('');
          }}
          title={selectedTemplate.name}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default">{selectedTemplate.provider.toUpperCase()}</Badge>
                <Badge variant={getStatusVariant(selectedTemplate.status)}>
                  {selectedTemplate.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  className="btn btn-primary btn-sm flex items-center gap-2"
                  onClick={handleDownloadCode}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {selectedTemplate.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Format:</span>
                <select
                  value={codeFormat}
                  onChange={(e) => setCodeFormat(e.target.value as 'terraform' | 'cloudformation')}
                  className="input input-sm"
                >
                  <option value="terraform">Terraform (.tf)</option>
                  <option value="cloudformation">CloudFormation (.yaml)</option>
                </select>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm text-gray-100">
                <code>{generatedCode}</code>
              </pre>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{selectedTemplate.resources} resources configured</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default IACGenerator;
