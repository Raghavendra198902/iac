variable "identifier" {
  description = "Identifier for the RDS instance"
  type        = string
}

variable "engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "instance_class" {
  description = "Instance class for RDS"
  type        = string
  default     = "db.t3.medium"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "Storage type (gp2, gp3, io1)"
  type        = string
  default     = "gp3"
}

variable "iops" {
  description = "IOPS for io1 or gp3 storage type"
  type        = number
  default     = null
}

variable "storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
  default     = ""
}

variable "database_name" {
  description = "Name of the default database"
  type        = string
  default     = "dharma"
}

variable "master_username" {
  description = "Master username for the database"
  type        = string
  default     = "dbadmin"
}

variable "port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "vpc_id" {
  description = "VPC ID where RDS will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for RDS"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "Existing DB subnet group name (leave empty to create new)"
  type        = string
  default     = ""
}

variable "allowed_security_group_id" {
  description = "Security group ID allowed to access RDS"
  type        = string
}

variable "publicly_accessible" {
  description = "Allow public access to RDS"
  type        = bool
  default     = false
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "mon:04:00-mon:05:00"
}

variable "delete_automated_backups" {
  description = "Delete automated backups on instance deletion"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = false
}

variable "enabled_cloudwatch_logs_exports" {
  description = "List of log types to export to CloudWatch"
  type        = list(string)
  default     = ["postgresql", "upgrade"]
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds (0, 1, 5, 10, 15, 30, 60)"
  type        = number
  default     = 60
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "performance_insights_retention_period" {
  description = "Performance Insights retention period in days"
  type        = number
  default     = 7
}

variable "performance_insights_kms_key_id" {
  description = "KMS key ID for Performance Insights encryption"
  type        = string
  default     = ""
}

variable "auto_minor_version_upgrade" {
  description = "Enable automatic minor version upgrades"
  type        = bool
  default     = true
}

variable "apply_immediately" {
  description = "Apply changes immediately"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "iam_database_authentication_enabled" {
  description = "Enable IAM database authentication"
  type        = bool
  default     = true
}

variable "create_parameter_group" {
  description = "Create custom parameter group"
  type        = bool
  default     = true
}

variable "parameter_group_name" {
  description = "Existing parameter group name (if create_parameter_group is false)"
  type        = string
  default     = ""
}

variable "parameter_group_family" {
  description = "Parameter group family"
  type        = string
  default     = "postgres15"
}

variable "parameters" {
  description = "Database parameters"
  type = list(object({
    name         = string
    value        = string
    apply_method = string
  }))
  default = [
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
      value        = "1000"
      apply_method = "immediate"
    }
  ]
}

variable "create_option_group" {
  description = "Create custom option group"
  type        = bool
  default     = false
}

variable "option_group_name" {
  description = "Existing option group name (if create_option_group is false)"
  type        = string
  default     = ""
}

variable "major_engine_version" {
  description = "Major engine version for option group"
  type        = string
  default     = "15"
}

variable "recovery_window_in_days" {
  description = "Recovery window for secrets in days"
  type        = number
  default     = 7
}

variable "create_cloudwatch_alarms" {
  description = "Create CloudWatch alarms for RDS"
  type        = bool
  default     = true
}

variable "alarm_actions" {
  description = "List of ARNs for alarm actions (SNS topics)"
  type        = list(string)
  default     = []
}

variable "database_connections_threshold" {
  description = "Threshold for database connections alarm"
  type        = number
  default     = 100
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
