terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Subnet group for ElastiCache
resource "aws_elasticache_subnet_group" "main" {
  count       = var.subnet_group_name == "" ? 1 : 0
  name        = "${var.cluster_id}-subnet-group"
  description = "ElastiCache subnet group for ${var.cluster_id}"
  subnet_ids  = var.subnet_ids
  
  tags = merge(
    var.tags,
    {
      Name = "${var.cluster_id}-subnet-group"
    }
  )
}

# Security group for ElastiCache
resource "aws_security_group" "redis" {
  name_prefix = "${var.cluster_id}-redis-"
  description = "Security group for ${var.cluster_id} ElastiCache cluster"
  vpc_id      = var.vpc_id
  
  tags = merge(
    var.tags,
    {
      Name = "${var.cluster_id}-redis-sg"
    }
  )
}

resource "aws_security_group_rule" "redis_ingress" {
  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.redis.id
  source_security_group_id = var.allowed_security_group_id
  description              = "Allow inbound Redis traffic from application"
}

resource "aws_security_group_rule" "redis_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.redis.id
  description       = "Allow all outbound traffic"
}

# Parameter group
resource "aws_elasticache_parameter_group" "main" {
  count       = var.create_parameter_group ? 1 : 0
  name        = "${var.cluster_id}-params"
  family      = var.parameter_group_family
  description = "Parameter group for ${var.cluster_id}"
  
  dynamic "parameter" {
    for_each = var.parameters
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.cluster_id}-params"
    }
  )
}

# Replication group (cluster mode disabled)
resource "aws_elasticache_replication_group" "main" {
  count = var.cluster_mode_enabled ? 0 : 1
  
  replication_group_id       = var.cluster_id
  replication_group_description = var.description
  engine                     = "redis"
  engine_version             = var.engine_version
  port                       = var.port
  node_type                  = var.node_type
  num_cache_clusters         = var.num_cache_nodes
  
  parameter_group_name = var.create_parameter_group ? aws_elasticache_parameter_group.main[0].name : var.parameter_group_name
  subnet_group_name    = var.subnet_group_name != "" ? var.subnet_group_name : aws_elasticache_subnet_group.main[0].name
  security_group_ids   = [aws_security_group.redis.id]
  
  automatic_failover_enabled = var.automatic_failover_enabled && var.num_cache_nodes > 1
  multi_az_enabled           = var.multi_az_enabled && var.num_cache_nodes > 1
  
  at_rest_encryption_enabled = var.at_rest_encryption_enabled
  kms_key_id                 = var.kms_key_id
  transit_encryption_enabled = var.transit_encryption_enabled
  auth_token                 = var.auth_token_enabled && var.auth_token != "" ? var.auth_token : null
  
  snapshot_retention_limit   = var.snapshot_retention_limit
  snapshot_window            = var.snapshot_window
  maintenance_window         = var.maintenance_window
  notification_topic_arn     = var.notification_topic_arn
  
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  apply_immediately          = var.apply_immediately
  
  log_delivery_configuration {
    destination      = var.slow_log_destination
    destination_type = var.slow_log_destination_type
    log_format       = var.log_format
    log_type         = "slow-log"
  }
  
  log_delivery_configuration {
    destination      = var.engine_log_destination
    destination_type = var.engine_log_destination_type
    log_format       = var.log_format
    log_type         = "engine-log"
  }
  
  tags = merge(
    var.tags,
    {
      Name = var.cluster_id
    }
  )
}

# Replication group (cluster mode enabled)
resource "aws_elasticache_replication_group" "cluster_mode" {
  count = var.cluster_mode_enabled ? 1 : 0
  
  replication_group_id       = var.cluster_id
  replication_group_description = var.description
  engine                     = "redis"
  engine_version             = var.engine_version
  port                       = var.port
  node_type                  = var.node_type
  
  parameter_group_name = var.create_parameter_group ? aws_elasticache_parameter_group.main[0].name : var.parameter_group_name
  subnet_group_name    = var.subnet_group_name != "" ? var.subnet_group_name : aws_elasticache_subnet_group.main[0].name
  security_group_ids   = [aws_security_group.redis.id]
  
  automatic_failover_enabled = true
  
  num_node_groups         = var.num_node_groups
  replicas_per_node_group = var.replicas_per_node_group
  
  at_rest_encryption_enabled = var.at_rest_encryption_enabled
  kms_key_id                 = var.kms_key_id
  transit_encryption_enabled = var.transit_encryption_enabled
  auth_token                 = var.auth_token_enabled && var.auth_token != "" ? var.auth_token : null
  
  snapshot_retention_limit   = var.snapshot_retention_limit
  snapshot_window            = var.snapshot_window
  maintenance_window         = var.maintenance_window
  notification_topic_arn     = var.notification_topic_arn
  
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  apply_immediately          = var.apply_immediately
  
  log_delivery_configuration {
    destination      = var.slow_log_destination
    destination_type = var.slow_log_destination_type
    log_format       = var.log_format
    log_type         = "slow-log"
  }
  
  log_delivery_configuration {
    destination      = var.engine_log_destination
    destination_type = var.engine_log_destination_type
    log_format       = var.log_format
    log_type         = "engine-log"
  }
  
  tags = merge(
    var.tags,
    {
      Name = var.cluster_id
    }
  )
}

# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.cluster_id}-high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "This metric monitors ElastiCache CPU utilization"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ReplicationGroupId = var.cluster_id
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "memory_utilization" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.cluster_id}-high-memory-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors ElastiCache memory utilization"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ReplicationGroupId = var.cluster_id
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "evictions" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.cluster_id}-high-evictions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Sum"
  threshold           = 1000
  alarm_description   = "This metric monitors ElastiCache evictions"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ReplicationGroupId = var.cluster_id
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "replication_lag" {
  count               = var.create_cloudwatch_alarms && var.num_cache_nodes > 1 ? 1 : 0
  alarm_name          = "${var.cluster_id}-high-replication-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ReplicationLag"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 30
  alarm_description   = "This metric monitors ElastiCache replication lag"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    ReplicationGroupId = var.cluster_id
  }
  
  tags = var.tags
}
