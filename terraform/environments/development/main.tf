terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
  
  backend "s3" {
    # Configure backend with:
    # terraform init -backend-config="bucket=YOUR_BUCKET" \
    #                -backend-config="key=development/terraform.tfstate" \
    #                -backend-config="region=YOUR_REGION"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "development"
      Project     = "iac-dharma"
      ManagedBy   = "terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  
  environment        = "development"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
  cluster_name       = "dharma-dev"
  
  # Cost optimization: single NAT gateway
  enable_nat_gateway = true
  single_nat_gateway = true
  
  enable_vpc_flow_logs = true
  
  tags = {
    CostCenter = "development"
  }
}

# EKS Module
module "eks" {
  source = "../../modules/eks"
  
  cluster_name    = "dharma-dev"
  cluster_version = "1.28"
  
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  
  enable_public_access = true
  public_access_cidrs  = ["0.0.0.0/0"] # Development only - restrict in production
  
  cluster_log_types = ["api", "audit", "authenticator"]
  
  node_groups = {
    general = {
      desired_size   = 2
      min_size       = 1
      max_size       = 4
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      disk_size      = 50
      labels = {
        role = "general"
      }
      taints = []
    }
  }
  
  vpc_cni_version    = "v1.15.0-eksbuild.2"
  coredns_version    = "v1.10.1-eksbuild.4"
  kube_proxy_version = "v1.28.2-eksbuild.2"
  
  enable_ebs_csi_driver   = true
  ebs_csi_driver_version  = "v1.25.0-eksbuild.1"
  
  tags = {
    CostCenter = "development"
  }
}

# RDS Module
module "rds" {
  source = "../../modules/rds"
  
  identifier            = "dharma-dev"
  engine_version        = "15.4"
  instance_class        = "db.t3.medium"
  allocated_storage     = 50
  storage_type          = "gp3"
  storage_encrypted     = true
  
  database_name   = "dharma_dev"
  master_username = "dbadmin"
  port            = 5432
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.database_subnet_ids
  db_subnet_group_name       = module.vpc.database_subnet_group_name
  allowed_security_group_id  = module.eks.node_security_group_id
  
  # Development: single AZ for cost savings
  multi_az = false
  
  backup_retention_period = 3
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  skip_final_snapshot     = true
  deletion_protection     = false
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  
  performance_insights_enabled = true
  
  create_parameter_group  = true
  parameter_group_family  = "postgres15"
  parameters = [
    {
      name         = "shared_preload_libraries"
      value        = "pg_stat_statements"
      apply_method = "pending-reboot"
    },
    {
      name         = "log_min_duration_statement"
      value        = "1000"
      apply_method = "immediate"
    }
  ]
  
  create_cloudwatch_alarms = true
  
  tags = {
    CostCenter = "development"
  }
}

# ElastiCache Module
module "elasticache" {
  source = "../../modules/elasticache"
  
  cluster_id      = "dharma-dev"
  engine_version  = "7.0"
  node_type       = "cache.t3.medium"
  
  # Development: cluster mode disabled, 2 nodes for HA
  cluster_mode_enabled = false
  num_cache_nodes      = 2
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_id  = module.eks.node_security_group_id
  
  automatic_failover_enabled = true
  multi_az_enabled           = false # Cost optimization
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = var.redis_auth_token
  
  snapshot_retention_limit = 3
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "sun:05:00-sun:07:00"
  
  create_parameter_group = true
  parameter_group_family = "redis7"
  parameters = [
    {
      name  = "maxmemory-policy"
      value = "allkeys-lru"
    },
    {
      name  = "timeout"
      value = "300"
    }
  ]
  
  create_cloudwatch_alarms = true
  
  tags = {
    CostCenter = "development"
  }
}
