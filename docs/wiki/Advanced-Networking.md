# Advanced Networking

Comprehensive guide to network architecture, security, and optimization in IAC Dharma.

---

## 📋 Overview

IAC Dharma provides advanced networking capabilities for multi-cloud environments:

- **VPC Architecture**: Subnet design, routing, and segmentation
- **Network Security**: Firewalls, security groups, NACLs
- **Load Balancing**: Application and network load balancers
- **Service Mesh**: Istio, Linkerd integration
- **DNS & CDN**: Route 53, CloudFront, Azure Front Door
- **VPN & Direct Connect**: Hybrid cloud connectivity

---

## 🏗️ Network Architecture

### Multi-Tier VPC Design

**Standard 3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    VPC (10.0.0.0/16)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────  Public Subnet  ─────────────────┐  │
│  │  10.0.1.0/24 (AZ-1)    10.0.2.0/24 (AZ-2)       │  │
│  │  ┌──────────┐          ┌──────────┐             │  │
│  │  │   ALB    │          │   NAT    │             │  │
│  │  │ Bastion  │          │ Gateway  │             │  │
│  │  └──────────┘          └──────────┘             │  │
│  └─────────────────────────────────────────────────┘  │
│                        │                               │
│  ┌────────────────  Private Subnet  ───────────────┐  │
│  │  10.0.11.0/24 (AZ-1)   10.0.12.0/24 (AZ-2)     │  │
│  │  ┌──────────┐          ┌──────────┐            │  │
│  │  │   App    │          │   App    │            │  │
│  │  │ Servers  │          │ Servers  │            │  │
│  │  └──────────┘          └──────────┘            │  │
│  └─────────────────────────────────────────────────┘  │
│                        │                               │
│  ┌────────────────  Database Subnet  ───────────────┐ │
│  │  10.0.21.0/24 (AZ-1)   10.0.22.0/24 (AZ-2)     │  │
│  │  ┌──────────┐          ┌──────────┐            │  │
│  │  │   RDS    │◄────────►│   RDS    │            │  │
│  │  │ Primary  │          │ Replica  │            │  │
│  │  └──────────┘          └──────────┘            │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Terraform Configuration**:
```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "iac-dharma-vpc"
    Environment = "production"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "iac-dharma-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "iac-dharma-public-${count.index + 1}"
    Type = "public"
  }
}

# Private Subnets (Application)
resource "aws_subnet" "private_app" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "iac-dharma-private-app-${count.index + 1}"
    Type = "private"
    Tier = "application"
  }
}

# Private Subnets (Database)
resource "aws_subnet" "private_db" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 21}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "iac-dharma-private-db-${count.index + 1}"
    Type = "private"
    Tier = "database"
  }
}

# NAT Gateway
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "iac-dharma-nat-eip-${count.index + 1}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "iac-dharma-nat-${count.index + 1}"
  }
}
```

### Subnet Sizing Best Practices

**CIDR Block Selection**:
```yaml
vpc_cidr: 10.0.0.0/16  # 65,536 IPs

subnets:
  public:
    cidr: /24  # 256 IPs per subnet
    count: 2   # One per AZ
    reserved: 5  # AWS reserves 5 IPs
    available: 251
  
  private_app:
    cidr: /20  # 4,096 IPs per subnet
    count: 2
    purpose: "Application servers, containers"
  
  private_db:
    cidr: /24  # 256 IPs per subnet
    count: 2
    purpose: "Database instances"
  
  private_cache:
    cidr: /24  # 256 IPs per subnet
    count: 2
    purpose: "Redis, Memcached"
```

**IP Address Planning**:
- **10.0.0.0/16**: Production VPC
- **10.1.0.0/16**: Staging VPC
- **10.2.0.0/16**: Development VPC
- **10.10.0.0/16**: Management VPC
- **10.20.0.0/16**: Security VPC (for security tools)

---

## 🔒 Network Security

### Security Groups

**Layered Security Groups**:

**ALB Security Group**:
```hcl
resource "aws_security_group" "alb" {
  name        = "iac-dharma-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  # Inbound rules
  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from Internet (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound rules
  egress {
    description      = "To application servers"
    from_port        = 3000
    to_port          = 3000
    protocol         = "tcp"
    security_groups  = [aws_security_group.app.id]
  }

  tags = {
    Name = "iac-dharma-alb-sg"
  }
}
```

**Application Security Group**:
```hcl
resource "aws_security_group" "app" {
  name        = "iac-dharma-app-sg"
  description = "Security group for application servers"
  vpc_id      = aws_vpc.main.id

  # Inbound from ALB
  ingress {
    description      = "From ALB"
    from_port        = 3000
    to_port          = 3000
    protocol         = "tcp"
    security_groups  = [aws_security_group.alb.id]
  }

  # Inbound from other app servers (service mesh)
  ingress {
    description = "From other app servers"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  # Outbound to database
  egress {
    description      = "To database"
    from_port        = 5432
    to_port          = 5432
    protocol         = "tcp"
    security_groups  = [aws_security_group.db.id]
  }

  # Outbound to Redis
  egress {
    description      = "To Redis"
    from_port        = 6379
    to_port          = 6379
    protocol         = "tcp"
    security_groups  = [aws_security_group.cache.id]
  }

  # Outbound to Internet (for API calls)
  egress {
    description = "To Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "iac-dharma-app-sg"
  }
}
```

**Database Security Group**:
```hcl
resource "aws_security_group" "db" {
  name        = "iac-dharma-db-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main.id

  # Inbound from app servers only
  ingress {
    description      = "PostgreSQL from app servers"
    from_port        = 5432
    to_port          = 5432
    protocol         = "tcp"
    security_groups  = [aws_security_group.app.id]
  }

  # Inbound from bastion (for admin access)
  ingress {
    description      = "PostgreSQL from bastion"
    from_port        = 5432
    to_port          = 5432
    protocol         = "tcp"
    security_groups  = [aws_security_group.bastion.id]
  }

  # No outbound rules (database doesn't initiate connections)

  tags = {
    Name = "iac-dharma-db-sg"
  }
}
```

### Network ACLs

**Defense in Depth with NACLs**:
```hcl
# Public Subnet NACL
resource "aws_network_acl" "public" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.public[*].id

  # Inbound rules
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 80
    to_port    = 80
  }

  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 443
    to_port    = 443
  }

  ingress {
    rule_no    = 120
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "203.0.113.0/24"  # Office IP range
    from_port  = 22
    to_port    = 22
  }

  # Ephemeral ports (for return traffic)
  ingress {
    rule_no    = 900
    protocol   = "tcp"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  # Outbound rules
  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "iac-dharma-public-nacl"
  }
}

# Private Subnet NACL
resource "aws_network_acl" "private" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = concat(
    aws_subnet.private_app[*].id,
    aws_subnet.private_db[*].id
  )

  # Inbound from VPC only
  ingress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 0
    to_port    = 0
  }

  # Deny all other inbound
  ingress {
    rule_no    = 200
    protocol   = "-1"
    action     = "deny"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  # Outbound
  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "iac-dharma-private-nacl"
  }
}
```

---

## ⚖️ Load Balancing

### Application Load Balancer (ALB)

**Configuration**:
```hcl
resource "aws_lb" "main" {
  name               = "iac-dharma-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = true
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  tags = {
    Name = "iac-dharma-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "app" {
  name     = "iac-dharma-app-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  deregistration_delay = 30

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400  # 1 day
    enabled         = true
  }

  tags = {
    Name = "iac-dharma-app-tg"
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# HTTP to HTTPS Redirect
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

### Network Load Balancer (NLB)

**Use Cases**:
- High-throughput, low-latency requirements
- Static IP addresses needed
- TCP/UDP traffic (non-HTTP)
- Millions of requests per second

**Configuration**:
```hcl
resource "aws_lb" "nlb" {
  name               = "iac-dharma-nlb"
  internal           = false
  load_balancer_type = "network"
  subnets            = aws_subnet.public[*].id

  enable_cross_zone_load_balancing = true

  tags = {
    Name = "iac-dharma-nlb"
  }
}
```

---

## 🌐 DNS & CDN

### Route 53 Configuration

**Hosted Zone**:
```hcl
resource "aws_route53_zone" "main" {
  name = "iac-dharma.com"

  tags = {
    Name = "iac-dharma-zone"
  }
}

# A Record with Alias to ALB
resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.iac-dharma.com"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Wildcard SSL certificate
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}
```

**Health Checks**:
```hcl
resource "aws_route53_health_check" "app" {
  fqdn              = "app.iac-dharma.com"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "iac-dharma-health-check"
  }
}
```

### CloudFront CDN

**Distribution**:
```hcl
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "IAC Dharma CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # US, Europe, Israel

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "alb"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.main.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "iac-dharma-cdn"
  }
}
```

---

## 🔗 VPC Peering & Transit Gateway

### VPC Peering

**Connect Production and Management VPCs**:
```hcl
# VPC Peering Connection
resource "aws_vpc_peering_connection" "prod_to_mgmt" {
  vpc_id      = aws_vpc.production.id
  peer_vpc_id = aws_vpc.management.id
  auto_accept = true

  tags = {
    Name = "prod-to-mgmt-peering"
  }
}

# Route table entries
resource "aws_route" "prod_to_mgmt" {
  route_table_id            = aws_route_table.prod_private.id
  destination_cidr_block    = "10.10.0.0/16"  # Management VPC
  vpc_peering_connection_id = aws_vpc_peering_connection.prod_to_mgmt.id
}

resource "aws_route" "mgmt_to_prod" {
  route_table_id            = aws_route_table.mgmt_private.id
  destination_cidr_block    = "10.0.0.0/16"  # Production VPC
  vpc_peering_connection_id = aws_vpc_peering_connection.prod_to_mgmt.id
}
```

### Transit Gateway

**Hub-and-Spoke Architecture**:
```hcl
resource "aws_ec2_transit_gateway" "main" {
  description                     = "IAC Dharma Transit Gateway"
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  dns_support                     = "enable"
  vpn_ecmp_support               = "enable"

  tags = {
    Name = "iac-dharma-tgw"
  }
}

# Attach VPCs
resource "aws_ec2_transit_gateway_vpc_attachment" "prod" {
  subnet_ids         = aws_subnet.private_app[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.production.id

  tags = {
    Name = "tgw-attachment-prod"
  }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "staging" {
  subnet_ids         = aws_subnet.staging_private[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.staging.id

  tags = {
    Name = "tgw-attachment-staging"
  }
}
```

---

## 🕸️ Service Mesh

### Istio Configuration

**Installation**:
```bash
# Install Istio
istioctl install --set profile=production -y

# Enable automatic sidecar injection
kubectl label namespace default istio-injection=enabled
```

**Virtual Service**:
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api-gateway
spec:
  hosts:
  - api-gateway
  http:
  - match:
    - uri:
        prefix: "/api/v1"
    route:
    - destination:
        host: api-gateway
        port:
          number: 3000
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
```

**Destination Rule**:
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api-gateway
spec:
  host: api-gateway
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
    loadBalancer:
      simple: LEAST_REQUEST
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

---

## 📊 Network Monitoring

### VPC Flow Logs

```hcl
resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  tags = {
    Name = "iac-dharma-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "flow_logs" {
  name              = "/aws/vpc/flow-logs"
  retention_in_days = 30

  tags = {
    Name = "iac-dharma-flow-logs"
  }
}
```

### Network Performance Monitoring

**CloudWatch Metrics**:
- Network packets in/out
- Network bytes in/out
- Connection count
- Latency
- Packet loss

---

## 🔍 Troubleshooting

### Connectivity Issues

```bash
# Test connectivity
nc -zv 10.0.11.5 3000

# Trace route
traceroute api-gateway.iac-dharma.com

# DNS lookup
dig +short api-gateway.iac-dharma.com

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-12345
```

### High Latency

**Check**:
1. Network hops (Transit Gateway, NAT Gateway)
2. Security group rules (stateful inspection)
3. NACL rules (stateless inspection)
4. Route table configuration
5. Cross-AZ traffic

---

## 📚 Related Documentation

- [Security Best Practices](Security-Best-Practices) - Network security
- [Kubernetes Deployment](Kubernetes-Deployment) - K8s networking
- [Performance Tuning](Performance-Tuning) - Network optimization
- [Multi-Cloud Support](Multi-Cloud-Support) - Cross-cloud networking

---

**Next Steps**: Review [Disaster-Recovery](Disaster-Recovery) for network failover strategies.
