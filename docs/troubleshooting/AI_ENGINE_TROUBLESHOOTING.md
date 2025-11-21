# AI Engine Service - Troubleshooting Guide

## Current Status

The AI Engine service is **currently down** due to a Python dependency compatibility issue.

### Error Details
```
ImportError: cannot import name 'cached_download' from 'huggingface_hub'
```

This error occurs because `sentence-transformers==2.2.2` is incompatible with newer versions of `huggingface_hub`.

## Quick Fix Applied

The system now uses **mock AI responses** when the AI Engine is unavailable:
- ✅ Frontend continues to work
- ✅ Generates realistic sample blueprints
- ✅ Includes VPC, subnets, load balancers, databases, compute resources
- ✅ User interface shows clear status banner
- ✅ Toast notifications indicate mock data usage

## To Restore Real AI Service

### Option 1: Update Dependencies (Recommended)

The requirements.txt has been updated with compatible versions:
```bash
cd /home/rrd/Documents/Iac
docker-compose build ai-engine
docker-compose up -d ai-engine
```

**Note:** Build takes 5-10 minutes due to large ML libraries (torch ~670MB)

### Option 2: Use Compatible Versions

Update `/backend/ai-engine/requirements.txt`:
```
sentence-transformers==2.7.0
huggingface_hub==0.20.3
```

Then rebuild:
```bash
docker-compose build ai-engine
docker-compose up -d ai-engine
```

### Option 3: Quick Test Without Rebuild

If you just want to test, you can install packages directly in the container:
```bash
docker exec -it dharma-ai-engine pip install sentence-transformers==2.7.0 huggingface_hub==0.20.3
docker restart dharma-ai-engine
```

## Verify Service is Running

```bash
# Check status
docker ps --filter "name=ai-engine"

# Check logs
docker logs dharma-ai-engine

# Test API endpoint
curl http://localhost:8001/health
```

## What Works Without AI Engine

The platform continues to function with mock data:

### ✅ Working Features
- Blueprint generation (sample data)
- Blueprint viewing and editing
- Blueprint export (PDF/Word with templates)
- Cost estimation (sample costs)
- Resource management
- All other microservices

### ⚠️ Limited Features
- AI-powered natural language processing
- Real-time ML-based recommendations
- Intelligent resource optimization
- Advanced pattern recognition

## Mock Data Details

When AI Engine is unavailable, the system generates blueprints with:

**Sample Resources:**
- VPC with CIDR configuration
- Public/private subnets
- Security groups with common ports
- Application load balancer
- RDS database instance
- Auto-scaling compute instances
- S3/Blob storage buckets
- CloudWatch/monitoring setup

**Realistic Properties:**
- Region-appropriate availability zones
- Standard CIDR blocks (10.0.0.0/16)
- Production-ready security configurations
- High-availability setups
- Best practice defaults

## Future Improvements

To prevent this issue in the future:

1. **Dependency Pinning**: Lock all ML library versions
2. **Health Checks**: Add dependency validation on startup
3. **Fallback Strategy**: Continue using mock data pattern
4. **Monitoring**: Alert when AI Engine goes down
5. **Documentation**: Keep compatibility matrix updated

## Contact

If you continue to experience issues after following these steps, check:
- Docker logs: `docker logs dharma-ai-engine`
- System resources: `docker stats`
- Network connectivity: `docker network inspect dharma-network`
