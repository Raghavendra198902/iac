# Intelligent Mock AI - Test Examples

The system now analyzes your natural language input and generates appropriate infrastructure resources.

## Test Cases

### 1. Simple Web Application
**Input:**
```
I need a web application with a database
```

**Expected Resources:**
- VPC
- Public subnets
- Web security group
- Load balancer
- Compute instances
- PostgreSQL database

---

### 2. Kubernetes Microservices
**Input:**
```
Create a microservices architecture on AWS with Kubernetes and Redis caching
```

**Expected Resources:**
- VPC
- Public/private subnets
- Load balancer
- EKS cluster (auto-scaling enabled)
- Redis cache
- Message queue
- Monitoring

---

### 3. Data Analytics Platform
**Input:**
```
Setup a data analytics pipeline on GCP with BigQuery and storage
```

**Expected Resources:**
- VPC
- Subnets
- GCS storage bucket
- BigQuery analytics
- Monitoring

---

### 4. High-Availability WordPress
**Input:**
```
Deploy a high-availability WordPress site with CDN and auto-scaling
```

**Expected Resources:**
- VPC
- Public/private subnets
- Web security group
- Load balancer
- Auto-scaling compute (2-5 instances)
- MySQL database
- Storage bucket
- CDN (CloudFront)
- Monitoring

---

### 5. API Backend with Cache
**Input:**
```
I need a REST API backend with PostgreSQL database and Redis cache for production
```

**Expected Resources:**
- VPC
- Public/private subnets
- Security groups
- Load balancer
- Compute instances
- PostgreSQL database
- Redis cache
- Message queue
- Monitoring

---

## Keyword Detection

The intelligent parser recognizes:

### Infrastructure Types
- **Web**: web, website, frontend, http, nginx, apache
- **API**: api, backend, rest, graphql, microservice
- **Kubernetes**: kubernetes, k8s, eks, aks, gke, container, docker

### Databases
- **PostgreSQL**: postgres, postgresql
- **MySQL**: mysql, maria
- **MongoDB**: mongodb, mongo
- **Redis**: redis

### Components
- **Cache**: cache, redis, memcache, elasticache
- **Storage**: storage, s3, blob, bucket, file
- **Queue**: queue, message, sqs, kafka, rabbit, event
- **Analytics**: analytic, bigquery, redshift, data warehouse, etl
- **CDN**: cdn, cloudfront, cloudflare, content delivery
- **Monitoring**: monitor, observ, prometheus, grafana, cloudwatch
- **Auto-scaling**: scal, autoscal, elastic
- **Load Balancer**: load balanc, lb, alb, elb

## Smart Features

### 1. Intelligent Resource Selection
- Only includes resources relevant to your description
- Adds supporting infrastructure automatically (VPC, subnets, security groups)

### 2. Cloud Provider Adaptation
- AWS: EKS, RDS, S3, CloudFront, CloudWatch
- Azure: AKS, Azure Database, Blob Storage, CDN, Azure Monitor  
- GCP: GKE, Cloud SQL, GCS, Cloud CDN, Cloud Monitoring

### 3. Cost Estimation
- Calculates based on selected resources
- Respects your budget if specified
- Shows realistic monthly costs

### 4. Auto-Scaling Detection
- Keywords trigger auto-scaling configuration
- Sets appropriate min/max instances
- Configures elastic resources

### 5. Production Best Practices
- Multi-AZ databases
- Backup policies
- Encryption enabled
- Monitoring included for complex setups

## Tips for Better Results

✅ **Good Examples:**
- "Create a scalable e-commerce platform with PostgreSQL and Redis on AWS"
- "I need Kubernetes cluster with auto-scaling for microservices"
- "Setup data analytics pipeline with BigQuery on GCP"

❌ **Less Effective:**
- "Make infrastructure"
- "Cloud stuff"
- Single words without context

## Resource Counts

The system intelligently determines quantities:
- **VPC**: Always 1
- **Subnets**: 2 (public) + 2 (private if needed)
- **Compute**: 2-5 with auto-scaling, 2 without
- **Kubernetes**: 2-10 nodes with auto-scaling, 3 without
- **Database**: 1 (with Multi-AZ)
- **Cache**: 2 nodes for high availability
- **CDN**: 1
- **Load Balancer**: 1

## Testing the Parser

1. Go to http://192.168.1.10:5173/designer
2. Try different descriptions with various keywords
3. See how resources change based on your input
4. Notice the blueprint name adapts (e.g., "Kubernetes + API Backend + PostgreSQL Infrastructure")
5. Check suggestions are relevant to what you requested
