# Export Document Templates

The Dharma IAC Platform provides customizable export templates for blueprint documentation in both PDF and Word formats.

## Available Templates

### 1. **Standard** (Default)
- **Description**: Clean and professional template with all details
- **Best For**: General purpose documentation
- **Features**:
  - Blue header (#3B82F6)
  - All sections included
  - Balanced formatting
  - Complete resource details with properties and reasoning

### 2. **Executive Summary**
- **Description**: High-level overview focusing on costs and key metrics
- **Best For**: C-level presentations and business stakeholders
- **Features**:
  - Dark gray header (#1F2937)
  - Company branding (Dharma IAC Platform)
  - Cost-focused presentation
  - Resources without technical properties
  - Excludes detailed reasoning
  - Larger fonts for readability

### 3. **Technical Detailed**
- **Description**: Comprehensive documentation with all technical details
- **Best For**: DevOps teams and technical documentation
- **Features**:
  - Purple header (#7C3AED)
  - All technical properties included
  - Complete reasoning explanations
  - Compact formatting for more content
  - Detailed resource specifications

### 4. **Minimal**
- **Description**: Compact format with essential information only
- **Best For**: Quick reference and summary reports
- **Features**:
  - Green header (#10B981)
  - Basic info and costs only
  - No properties or reasoning
  - No footer
  - Smallest file size
  - Condensed spacing

### 5. **Detailed Report**
- **Description**: Complete blueprint documentation with all information
- **Best For**: Audit trails and compliance documentation
- **Features**:
  - Red header (#DC2626)
  - Company information included
  - All sections present
  - Properties and reasoning
  - Larger spacing for readability
  - Professional layout

## Template Configuration

Each template includes:

### Content Sections
- **Title Page**: Blueprint name and platform branding
- **Company Info**: Organization details (optional)
- **Basic Information**: Cloud provider, environment, metadata
- **Cost Summary**: Estimated monthly costs
- **Resources**: Infrastructure components with details
- **Properties**: Technical specifications (optional)
- **Reasoning**: AI-generated explanations (optional)
- **Footer**: Generation date and page numbers (optional)

### Styling Options
- **Header Colors**: Customizable background and text colors
- **Font Sizes**: Title (20-28pt), Heading (14-18pt), Body (10-12pt), Small (8-9pt)
- **Spacing**: Section gaps (10-20pt), Paragraph spacing (5-10pt)
- **Accent Colors**: For highlights and important information

## How to Use

1. Navigate to a blueprint detail page (`/blueprints/:id`)
2. Click the **Export** button in the Resources tab
3. Select your desired template from the dropdown
4. View template preview showing included sections
5. Choose export format (PDF or Word)
6. Document downloads automatically

## Template Selection Guide

| Use Case | Recommended Template |
|----------|---------------------|
| Executive presentation | **Executive Summary** |
| Technical documentation | **Technical Detailed** |
| Quick reference | **Minimal** |
| Audit/Compliance | **Detailed Report** |
| General purpose | **Standard** |

## Customization

Templates are defined in `/frontend/src/config/exportTemplates.ts`.

To create a custom template:

```typescript
customTemplate: {
  name: 'Custom Template',
  description: 'Your description here',
  includeTitle: true,
  includeLogo: true,
  includeBasicInfo: true,
  includeCostSummary: true,
  includeResources: true,
  includeProperties: true,
  includeReasoning: true,
  includeFooter: true,
  headerColor: '#YOUR_HEX_COLOR',
  headerTextColor: '#FFFFFF',
  accentColor: '#YOUR_ACCENT_COLOR',
  fontSize: {
    title: 24,
    heading: 16,
    body: 11,
    small: 8
  },
  spacing: {
    section: 15,
    paragraph: 8
  },
  companyInfo: {
    name: 'Your Company',
    tagline: 'Your tagline',
    website: 'www.yoursite.com',
    email: 'contact@yourcompany.com'
  }
}
```

## File Naming Convention

Exported files follow this pattern:
```
blueprint-{blueprint-name}-{template-name}-{timestamp}.{extension}
```

Example: `blueprint-sample-infrastructure-executive-1700265789123.pdf`

## Technical Details

### PDF Export
- Uses jsPDF library
- Automatic page breaks
- Multi-page support
- Page numbering
- Professional formatting

### Word Export
- Uses docx library
- Structured headings (H1, H2, H3)
- Formatted paragraphs
- Color-coded elements
- Professional styling

### Performance
- Client-side generation (no server required)
- Fast rendering (~1-2 seconds)
- No file size limits
- Works offline

## Future Enhancements

Planned features:
- [ ] Custom logo upload
- [ ] Brand color customization in UI
- [ ] Save favorite templates
- [ ] Template sharing between users
- [ ] Additional export formats (Markdown, JSON, Terraform)
- [ ] Chart and diagram generation
- [ ] Multi-language support
