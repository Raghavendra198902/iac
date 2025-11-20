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
  }
}

# Random password for master user
resource "random_password" "master" {
  length  = 32
  special = true
}

# Store master password in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name_prefix             = "${var.identifier}-master-password-"
  description             = "Master password for ${var.identifier} RDS instance"
  recovery_window_in_days = var.recovery_window_in_days
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-master-password"
    }
  )
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.master_username
    password = random_password.master.result
    engine   = "postgres"
    host     = aws_db_instance.main.endpoint
    port     = var.port
    dbname   = var.database_name
  })
}

# DB subnet group
resource "aws_db_subnet_group" "main" {
  count       = var.db_subnet_group_name == "" ? 1 : 0
  name        = "${var.identifier}-subnet-group"
  description = "Database subnet group for ${var.identifier}"
  subnet_ids  = var.subnet_ids
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-subnet-group"
    }
  )
}

# Security group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${var.identifier}-rds-"
  description = "Security group for ${var.identifier} RDS instance"
  vpc_id      = var.vpc_id
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-rds-sg"
    }
  )
}

resource "aws_security_group_rule" "rds_ingress" {
  type                     = "ingress"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_id
  description              = "Allow inbound PostgreSQL traffic from application"
}

resource "aws_security_group_rule" "rds_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rds.id
  description       = "Allow all outbound traffic"
}

# Parameter group
resource "aws_db_parameter_group" "main" {
  count       = var.create_parameter_group ? 1 : 0
  name        = "${var.identifier}-params"
  family      = var.parameter_group_family
  description = "Parameter group for ${var.identifier}"
  
  dynamic "parameter" {
    for_each = var.parameters
    content {
      name         = parameter.value.name
      value        = parameter.value.value
      apply_method = lookup(parameter.value, "apply_method", "immediate")
    }
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-params"
    }
  )
}

# Option group
resource "aws_db_option_group" "main" {
  count                    = var.create_option_group ? 1 : 0
  name                     = "${var.identifier}-options"
  option_group_description = "Option group for ${var.identifier}"
  engine_name              = "postgres"
  major_engine_version     = var.major_engine_version
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-options"
    }
  )
}

# RDS instance
resource "aws_db_instance" "main" {
  identifier     = var.identifier
  engine         = "postgres"
  engine_version = var.engine_version
  
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = var.storage_type
  storage_encrypted = var.storage_encrypted
  kms_key_id        = var.kms_key_id
  iops              = var.storage_type == "io1" || var.storage_type == "gp3" ? var.iops : null
  
  db_name  = var.database_name
  username = var.master_username
  password = random_password.master.result
  port     = var.port
  
  multi_az               = var.multi_az
  db_subnet_group_name   = var.db_subnet_group_name != "" ? var.db_subnet_group_name : aws_db_subnet_group.main[0].name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.publicly_accessible
  
  parameter_group_name = var.create_parameter_group ? aws_db_parameter_group.main[0].name : var.parameter_group_name
  option_group_name    = var.create_option_group ? aws_db_option_group.main[0].name : var.option_group_name
  
  backup_retention_period   = var.backup_retention_period
  backup_window             = var.backup_window
  maintenance_window        = var.maintenance_window
  delete_automated_backups  = var.delete_automated_backups
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.identifier}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  copy_tags_to_snapshot     = true
  
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval             = var.monitoring_interval
  monitoring_role_arn             = var.monitoring_interval > 0 ? aws_iam_role.rds_monitoring[0].arn : null
  
  performance_insights_enabled          = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_enabled ? var.performance_insights_retention_period : null
  performance_insights_kms_key_id       = var.performance_insights_enabled ? var.performance_insights_kms_key_id : null
  
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  apply_immediately          = var.apply_immediately
  deletion_protection        = var.deletion_protection
  
  iam_database_authentication_enabled = var.iam_database_authentication_enabled
  
  tags = merge(
    var.tags,
    {
      Name = var.identifier
    }
  )
}

# IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  count              = var.monitoring_interval > 0 ? 1 : 0
  name_prefix        = "${var.identifier}-rds-monitoring-"
  assume_role_policy = data.aws_iam_policy_document.rds_monitoring_assume_role[0].json
  
  tags = merge(
    var.tags,
    {
      Name = "${var.identifier}-rds-monitoring-role"
    }
  )
}

data "aws_iam_policy_document" "rds_monitoring_assume_role" {
  count = var.monitoring_interval > 0 ? 1 : 0
  
  statement {
    actions = ["sts:AssumeRole"]
    
    principals {
      type        = "Service"
      identifiers = ["monitoring.rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.monitoring_interval > 0 ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.identifier}-high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "free_storage_space" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.identifier}-low-free-storage-space"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10 GB in bytes
  alarm_description   = "This metric monitors RDS free storage space"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  count               = var.create_cloudwatch_alarms ? 1 : 0
  alarm_name          = "${var.identifier}-high-database-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = var.database_connections_threshold
  alarm_description   = "This metric monitors RDS database connections"
  alarm_actions       = var.alarm_actions
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  tags = var.tags
}
