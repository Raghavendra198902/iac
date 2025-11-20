variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "redis_auth_token" {
  description = "Redis AUTH token (16-128 characters)"
  type        = string
  sensitive   = true
  default     = ""
}
