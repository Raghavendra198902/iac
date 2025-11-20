import logger from './utils/logger';
import { PricingData } from './types';

export class PricingEngine {
  private pricingCache: Map<string, PricingData> = new Map();

  constructor() {
    this.initializePricingData();
  }

  async getPricing(
    cloud: string,
    region: string,
    resourceType: string,
    sku?: string
  ): Promise<PricingData | null> {
    const cacheKey = `${cloud}:${region}:${resourceType}:${sku || 'default'}`;
    
    // Check cache first
    if (this.pricingCache.has(cacheKey)) {
      return this.pricingCache.get(cacheKey)!;
    }

    // Fetch from pricing API
    const pricing = await this.fetchPricingFromAPI(cloud, region, resourceType, sku);
    
    if (pricing) {
      this.pricingCache.set(cacheKey, pricing);
    }

    return pricing;
  }

  private async fetchPricingFromAPI(
    cloud: string,
    region: string,
    resourceType: string,
    sku?: string
  ): Promise<PricingData | null> {
    // Mock implementation - in production, this would call:
    // - Azure Retail Prices API
    // - AWS Pricing API
    // - GCP Cloud Billing Catalog API

    logger.info('Fetching pricing data', { cloud, region, resourceType, sku });

    // Return mock pricing based on resource type
    const mockPricing = this.getMockPricing(cloud, region, resourceType, sku);
    
    return mockPricing;
  }

  private initializePricingData(): void {
    // Initialize with common pricing data
    logger.info('Initializing pricing engine');

    // Azure VM pricing samples
    this.addPricing('azure', 'eastus', 'azurerm_virtual_machine', 'Standard_D2s_v3', 'Standard', 0.096);
    this.addPricing('azure', 'eastus', 'azurerm_virtual_machine', 'Standard_D4s_v3', 'Standard', 0.192);
    this.addPricing('azure', 'eastus', 'azurerm_storage_account', 'Standard_LRS', 'Standard', 0.02);
    this.addPricing('azure', 'eastus', 'azurerm_sql_database', 'S0', 'Standard', 0.02);

    // AWS EC2 pricing samples
    this.addPricing('aws', 'us-east-1', 'aws_instance', 't3.medium', 'Standard', 0.0416);
    this.addPricing('aws', 'us-east-1', 'aws_instance', 't3.large', 'Standard', 0.0832);
    this.addPricing('aws', 'us-east-1', 'aws_s3_bucket', 'standard', 'Standard', 0.023);
    this.addPricing('aws', 'us-east-1', 'aws_db_instance', 'db.t3.medium', 'Standard', 0.068);

    // GCP Compute pricing samples
    this.addPricing('gcp', 'us-central1', 'google_compute_instance', 'n1-standard-2', 'Standard', 0.095);
    this.addPricing('gcp', 'us-central1', 'google_compute_instance', 'n1-standard-4', 'Standard', 0.190);
    this.addPricing('gcp', 'us-central1', 'google_storage_bucket', 'standard', 'Standard', 0.020);
    this.addPricing('gcp', 'us-central1', 'google_sql_database_instance', 'db-n1-standard-1', 'Standard', 0.090);

    logger.info('Pricing engine initialized', { entriesCount: this.pricingCache.size });
  }

  private addPricing(
    cloud: string,
    region: string,
    resourceType: string,
    sku: string,
    tier: string,
    unitPrice: number
  ): void {
    const cacheKey = `${cloud}:${region}:${resourceType}:${sku}`;
    
    const pricing: PricingData = {
      cloud,
      region,
      resourceType,
      sku,
      tier,
      unitPrice,
      unit: 'hour',
      currency: 'USD',
      effectiveDate: new Date(),
      metadata: {}
    };

    this.pricingCache.set(cacheKey, pricing);
  }

  private getMockPricing(
    cloud: string,
    region: string,
    resourceType: string,
    sku?: string
  ): PricingData {
    // Return reasonable defaults based on resource type
    const type = resourceType.toLowerCase();
    let basePrice = 0.05; // default $0.05/hour

    if (type.includes('vm') || type.includes('instance') || type.includes('compute')) {
      basePrice = 0.10;
    } else if (type.includes('database') || type.includes('sql')) {
      basePrice = 0.08;
    } else if (type.includes('storage') || type.includes('disk')) {
      basePrice = 0.02;
    } else if (type.includes('network') || type.includes('load')) {
      basePrice = 0.03;
    }

    return {
      cloud,
      region,
      resourceType,
      sku: sku || 'default',
      tier: 'Standard',
      unitPrice: basePrice,
      unit: 'hour',
      currency: 'USD',
      effectiveDate: new Date(),
      metadata: {
        note: 'Mock pricing data - replace with actual API calls in production'
      }
    };
  }

  clearCache(): void {
    this.pricingCache.clear();
    this.initializePricingData();
    logger.info('Pricing cache cleared and reinitialized');
  }

  getCacheStats(): { size: number; clouds: string[]; regions: string[] } {
    const clouds = new Set<string>();
    const regions = new Set<string>();

    for (const pricing of this.pricingCache.values()) {
      clouds.add(pricing.cloud);
      regions.add(pricing.region);
    }

    return {
      size: this.pricingCache.size,
      clouds: Array.from(clouds),
      regions: Array.from(regions)
    };
  }
}
