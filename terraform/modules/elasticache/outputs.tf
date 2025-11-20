output "cluster_id" {
  description = "ElastiCache replication group identifier"
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.cluster_mode[0].id : aws_elasticache_replication_group.main[0].id
}

output "cluster_arn" {
  description = "ARN of the ElastiCache replication group"
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.cluster_mode[0].arn : aws_elasticache_replication_group.main[0].arn
}

output "primary_endpoint_address" {
  description = "Primary endpoint address"
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.cluster_mode[0].configuration_endpoint_address : aws_elasticache_replication_group.main[0].primary_endpoint_address
}

output "reader_endpoint_address" {
  description = "Reader endpoint address (cluster mode disabled only)"
  value       = var.cluster_mode_enabled ? null : aws_elasticache_replication_group.main[0].reader_endpoint_address
}

output "configuration_endpoint_address" {
  description = "Configuration endpoint address (cluster mode enabled only)"
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.cluster_mode[0].configuration_endpoint_address : null
}

output "port" {
  description = "Redis port"
  value       = var.port
}

output "security_group_id" {
  description = "Security group ID of the ElastiCache cluster"
  value       = aws_security_group.redis.id
}

output "subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = var.subnet_group_name != "" ? var.subnet_group_name : aws_elasticache_subnet_group.main[0].name
}

output "parameter_group_name" {
  description = "Parameter group name"
  value       = var.create_parameter_group ? aws_elasticache_parameter_group.main[0].name : var.parameter_group_name
}

output "member_clusters" {
  description = "List of cluster member IDs"
  value       = var.cluster_mode_enabled ? aws_elasticache_replication_group.cluster_mode[0].member_clusters : aws_elasticache_replication_group.main[0].member_clusters
}

output "connection_string" {
  description = "Redis connection string"
  value = var.cluster_mode_enabled ? (
    var.transit_encryption_enabled ? 
      "rediss://${aws_elasticache_replication_group.cluster_mode[0].configuration_endpoint_address}:${var.port}" :
      "redis://${aws_elasticache_replication_group.cluster_mode[0].configuration_endpoint_address}:${var.port}"
  ) : (
    var.transit_encryption_enabled ? 
      "rediss://${aws_elasticache_replication_group.main[0].primary_endpoint_address}:${var.port}" :
      "redis://${aws_elasticache_replication_group.main[0].primary_endpoint_address}:${var.port}"
  )
  sensitive = true
}
