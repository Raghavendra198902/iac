export interface ExportTemplate {
  name: string;
  description: string;
  includeTitle: boolean;
  includeLogo: boolean;
  includeBasicInfo: boolean;
  includeCostSummary: boolean;
  includeResources: boolean;
  includeProperties: boolean;
  includeReasoning: boolean;
  includeFooter: boolean;
  headerColor: string;
  headerTextColor: string;
  accentColor: string;
  fontSize: {
    title: number;
    heading: number;
    body: number;
    small: number;
  };
  spacing: {
    section: number;
    paragraph: number;
  };
  companyInfo?: {
    name: string;
    tagline?: string;
    website?: string;
    email?: string;
  };
}

export const exportTemplates: Record<string, ExportTemplate> = {
  standard: {
    name: 'Standard',
    description: 'Clean and professional template with all details',
    includeTitle: true,
    includeLogo: false,
    includeBasicInfo: true,
    includeCostSummary: true,
    includeResources: true,
    includeProperties: true,
    includeReasoning: true,
    includeFooter: true,
    headerColor: '#3B82F6', // Blue
    headerTextColor: '#FFFFFF',
    accentColor: '#2563EB',
    fontSize: {
      title: 24,
      heading: 16,
      body: 11,
      small: 8
    },
    spacing: {
      section: 15,
      paragraph: 8
    }
  },
  
  executive: {
    name: 'Executive Summary',
    description: 'High-level overview focusing on costs and key metrics',
    includeTitle: true,
    includeLogo: true,
    includeBasicInfo: true,
    includeCostSummary: true,
    includeResources: true,
    includeProperties: false,
    includeReasoning: false,
    includeFooter: true,
    headerColor: '#1F2937', // Dark Gray
    headerTextColor: '#FFFFFF',
    accentColor: '#059669',
    fontSize: {
      title: 28,
      heading: 18,
      body: 12,
      small: 9
    },
    spacing: {
      section: 20,
      paragraph: 10
    },
    companyInfo: {
      name: 'Dharma IAC Platform',
      tagline: 'Infrastructure as Code - Simplified',
      website: 'www.dharma-iac.com',
      email: 'info@dharma-iac.com'
    }
  },
  
  technical: {
    name: 'Technical Detailed',
    description: 'Comprehensive documentation with all technical details',
    includeTitle: true,
    includeLogo: false,
    includeBasicInfo: true,
    includeCostSummary: true,
    includeResources: true,
    includeProperties: true,
    includeReasoning: true,
    includeFooter: true,
    headerColor: '#7C3AED', // Purple
    headerTextColor: '#FFFFFF',
    accentColor: '#6D28D9',
    fontSize: {
      title: 22,
      heading: 14,
      body: 10,
      small: 8
    },
    spacing: {
      section: 12,
      paragraph: 6
    }
  },
  
  minimal: {
    name: 'Minimal',
    description: 'Compact format with essential information only',
    includeTitle: true,
    includeLogo: false,
    includeBasicInfo: true,
    includeCostSummary: true,
    includeResources: true,
    includeProperties: false,
    includeReasoning: false,
    includeFooter: false,
    headerColor: '#10B981', // Green
    headerTextColor: '#FFFFFF',
    accentColor: '#059669',
    fontSize: {
      title: 20,
      heading: 14,
      body: 10,
      small: 8
    },
    spacing: {
      section: 10,
      paragraph: 5
    }
  },
  
  detailed: {
    name: 'Detailed Report',
    description: 'Complete blueprint documentation with all information',
    includeTitle: true,
    includeLogo: true,
    includeBasicInfo: true,
    includeCostSummary: true,
    includeResources: true,
    includeProperties: true,
    includeReasoning: true,
    includeFooter: true,
    headerColor: '#DC2626', // Red
    headerTextColor: '#FFFFFF',
    accentColor: '#B91C1C',
    fontSize: {
      title: 26,
      heading: 16,
      body: 11,
      small: 8
    },
    spacing: {
      section: 18,
      paragraph: 9
    },
    companyInfo: {
      name: 'Dharma IAC Platform',
      tagline: 'Enterprise Infrastructure Solutions',
      website: 'www.dharma-iac.com',
      email: 'support@dharma-iac.com'
    }
  }
};

export const defaultTemplate = 'standard';
