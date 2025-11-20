variable "cluster_id" {
  description = "Identifier for the ElastiCache cluster"
  type        = string
}

variable "description" {
  description = "Description of the replication group"
  type        = string
  default     = "Managed by Terraform"
}

variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "port" {
  description = "Port number for Redis"
  type        = number
  default     = 6379
}

variable "node_type" {
  description = "Instance class for cache nodes"
  type        = string
  default     = "cache.t3.medium"
}

variable "cluster_mode_enabled" {
  description = "Enable cluster mode (sharding)"
  type        = bool
  default     = false
}

variable "num_cache_nodes" {
  description = "Number of cache nodes (cluster mode disabled)"
  type        = number
  default     = 2
}

variable "num_node_groups" {
  description = "Number of node groups (shards) for cluster mode"
  type        = number
  default     = 2
}

variable "replicas_per_node_group" {
  description = "Number of replica nodes per shard"
  type        = number
  default     = 1
}

variable "vpc_id" {
  description = "VPC ID where ElastiCache will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for ElastiCache"
  type        = list(string)
}

variable "subnet_group_name" {
  description = "Existing subnet group name (leave empty to create new)"
  type        = string
  default     = ""
}

variable "allowed_security_group_id" {
  description = "Security group ID allowed to access ElastiCache"
  type        = string
}

variable "automatic_failover_enabled" {
  description = "Enable automatic failover (requires >= 2 nodes)"
  type        = bool
  default     = true
}

variable "multi_az_enabled" {
  description = "Enable Multi-AZ (requires automatic failover and >= 2 nodes)"
  type        = bool
  default     = true
}

variable "at_rest_encryption_enabled" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption at rest"
  type        = string
  default     = ""
}

variable "transit_encryption_enabled" {
  description = "Enable encryption in transit (TLS)"
  type        = bool
  default     = true
}

variable "auth_token_enabled" {
  description = "Enable Redis AUTH token"
  type        = bool
  default     = true
}

variable "auth_token" {
  description = "AUTH token for Redis (must be 16-128 characters). Leave empty to disable auth."
  type        = string
  default     = ""
  sensitive   = true
}

variable "snapshot_retention_limit" {
  description = "Number of days to retain snapshots"
  type        = number
  default     = 5
}

variable "snapshot_window" {
  description = "Daily time range for snapshots"
  type        = string
  default     = "03:00-05:00"
}

variable "maintenance_window" {
  description = "Weekly time range for maintenance"
  type        = string
  default     = "sun:05:00-sun:07:00"
}

variable "notification_topic_arn" {
  description = "SNS topic ARN for ElastiCache notifications"
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
  default     = "redis7"
}

variable "parameters" {
  description = "Redis parameters"
  type = list(object({
    name  = string
    value = string
  }))
  default = [
    {
      name  = "maxmemory-policy"
      value = "allkeys-lru"
    },
    {
      name  = "timeout"
      value = "300"
    }
  ]
}

variable "slow_log_destination" {
  description = "CloudWatch log group or Kinesis Firehose stream for slow logs"
  type        = string
  default     = ""
}

variable "slow_log_destination_type" {
  description = "Destination type for slow logs (cloudwatch-logs or kinesis-firehose)"
  type        = string
  default     = "cloudwatch-logs"
}

variable "engine_log_destination" {
  description = "CloudWatch log group or Kinesis Firehose stream for engine logs"
  type        = string
  default     = ""
}

variable "engine_log_destination_type" {
  description = "Destination type for engine logs (cloudwatch-logs or kinesis-firehose)"
  type        = string
  default     = "cloudwatch-logs"
}

variable "log_format" {
  description = "Log format (text or json)"
  type        = string
  default     = "json"
}

variable "create_cloudwatch_alarms" {
  description = "Create CloudWatch alarms for ElastiCache"
  type        = bool
  default     = true
}

variable "alarm_actions" {
  description = "List of ARNs for alarm actions (SNS topics)"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
