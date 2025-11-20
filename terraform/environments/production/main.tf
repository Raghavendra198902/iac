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
    #                -backend-config="key=production/terraform.tfstate" \
    #                -backend-config="region=YOUR_REGION"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "production"
      Project     = "iac-dharma"
      ManagedBy   = "terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  
  environment        = "production"
  vpc_cidr           = "10.1.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
  cluster_name       = "dharma-prod"
  
  # Production: NAT gateway per AZ for high availability
  enable_nat_gateway = true
  single_nat_gateway = false
  
  enable_vpc_flow_logs = true
  
  tags = {
    CostCenter = "production"
    Compliance = "required"
  }
}

# EKS Module
module "eks" {
  source = "../../modules/eks"
  
  cluster_name    = "dharma-prod"
  cluster_version = "1.28"
  
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  
  # Production: restrict public access
  enable_public_access = true
  public_access_cidrs  = var.allowed_public_cidrs
  
  cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  
  # Production: multiple node groups with different roles
  node_groups = {
    application = {
      desired_size   = 3
      min_size       = 3
      max_size       = 10
      instance_types = ["m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      disk_size      = 100
      labels = {
        role = "application"
      }
      taints = []
    }
    
    batch = {
      desired_size   = 2
      min_size       = 0
      max_size       = 20
      instance_types = ["c5.2xlarge"]
      capacity_type  = "SPOT"
      disk_size      = 100
      labels = {
        role = "batch"
      }
      taints = [
        {
          key    = "workload"
          value  = "batch"
          effect = "NoSchedule"
        }
      ]
    }
  }
  
  vpc_cni_version    = "v1.15.0-eksbuild.2"
  coredns_version    = "v1.10.1-eksbuild.4"
  kube_proxy_version = "v1.28.2-eksbuild.2"
  
  enable_ebs_csi_driver   = true
  ebs_csi_driver_version  = "v1.25.0-eksbuild.1"
  
  tags = {
    CostCenter = "production"
    Compliance = "required"
  }
}

# RDS Module
module "rds" {
  source = "../../modules/rds"
  
  identifier            = "dharma-prod"
  engine_version        = "15.4"
  instance_class        = "db.r6g.xlarge"
  allocated_storage     = 500
  storage_type          = "gp3"
  iops                  = 3000
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn
  
  database_name   = "dharma_prod"
  master_username = "dbadmin"
  port            = 5432
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.database_subnet_ids
  db_subnet_group_name       = module.vpc.database_subnet_group_name
  allowed_security_group_id  = module.eks.node_security_group_id
  
  # Production: Multi-AZ for high availability
  multi_az = true
  
  backup_retention_period = 30
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"
  skip_final_snapshot     = false
  deletion_protection     = true
  
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval             = 60
  
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  performance_insights_kms_key_id       = var.kms_key_arn
  
  create_parameter_group  = true
  parameter_group_family  = "postgres15"
  parameters = [
    {
      name         = "shared_preload_libraries"
      value        = "pg_stat_statements"
      apply_method = "pending-reboot"
    },
    {
      name         = "log_statement"
      value        = "all"
      apply_method = "immediate"
    },
    {
      name         = "log_min_duration_statement"
      value        = "500"
      apply_method = "immediate"
    },
    {
      name         = "log_connections"
      value        = "1"
      apply_method = "immediate"
    },
    {
      name         = "log_disconnections"
      value        = "1"
      apply_method = "immediate"
    }
  ]
  
  create_cloudwatch_alarms = true
  alarm_actions            = var.sns_topic_arns
  
  tags = {
    CostCenter = "production"
    Compliance = "required"
  }
}

# ElastiCache Module
module "elasticache" {
  source = "../../modules/elasticache"
  
  cluster_id      = "dharma-prod"
  engine_version  = "7.0"
  node_type       = "cache.r6g.xlarge"
  
  # Production: cluster mode enabled with sharding
  cluster_mode_enabled    = true
  num_node_groups         = 3
  replicas_per_node_group = 2
  
  vpc_id                     = module.vpc.vpc_id
  subnet_ids                 = module.vpc.private_subnet_ids
  allowed_security_group_id  = module.eks.node_security_group_id
  
  automatic_failover_enabled = true
  multi_az_enabled           = true
  
  at_rest_encryption_enabled = true
  kms_key_id                 = var.kms_key_arn
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = var.redis_auth_token
  
  snapshot_retention_limit = 7
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "sun:05:00-sun:07:00"
  
  notification_topic_arn = var.sns_topic_arns[0]
  
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
    },
    {
      name  = "tcp-keepalive"
      value = "300"
    }
  ]
  
  slow_log_destination      = aws_cloudwatch_log_group.redis_slow_log.name
  slow_log_destination_type = "cloudwatch-logs"
  engine_log_destination    = aws_cloudwatch_log_group.redis_engine_log.name
  engine_log_destination_type = "cloudwatch-logs"
  log_format                = "json"
  
  create_cloudwatch_alarms = true
  alarm_actions            = var.sns_topic_arns
  
  tags = {
    CostCenter = "production"
    Compliance = "required"
  }
}

# CloudWatch Log Groups for Redis
resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/aws/elasticache/dharma-prod/slow-log"
  retention_in_days = 7
  kms_key_id        = var.kms_key_arn
  
  tags = {
    Environment = "production"
    CostCenter  = "production"
  }
}

resource "aws_cloudwatch_log_group" "redis_engine_log" {
  name              = "/aws/elasticache/dharma-prod/engine-log"
  retention_in_days = 7
  kms_key_id        = var.kms_key_arn
  
  tags = {
    Environment = "production"
    CostCenter  = "production"
  }
}
