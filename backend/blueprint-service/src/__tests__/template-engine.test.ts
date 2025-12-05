import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockTemplateRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockVariableResolver = {
  resolve: vi.fn(),
  validate: vi.fn(),
  getDefaults: vi.fn(),
};

const mockValidator = {
  validateTemplate: vi.fn(),
  validateVariables: vi.fn(),
  validateConditions: vi.fn(),
};

describe('TemplateEngine', () => {
  let templateEngine: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Initialize template engine with mocked dependencies
    templateEngine = {
      render: vi.fn(),
      compile: vi.fn(),
      validate: vi.fn(),
      parse: vi.fn(),
      repository: mockTemplateRepository,
      resolver: mockVariableResolver,
      validator: mockValidator,
    };
  });

  describe('Template Rendering', () => {
    it('should render basic template with variables', async () => {
      const template = {
        id: 'tmpl-001',
        name: 'EC2 Instance',
        content: 'resource "aws_instance" "{{name}}" { instance_type = "{{instance_type}}" }',
        variables: {
          name: { type: 'string', required: true },
          instance_type: { type: 'string', default: 't2.micro' },
        },
      };

      const variables = {
        name: 'web-server',
        instance_type: 't2.small',
      };

      mockVariableResolver.resolve.mockResolvedValue({
        name: 'web-server',
        instance_type: 't2.small',
      });

      templateEngine.render.mockResolvedValue(
        'resource "aws_instance" "web-server" { instance_type = "t2.small" }'
      );

      const result = await templateEngine.render(template, variables);

      expect(result).toContain('web-server');
      expect(result).toContain('t2.small');
      expect(mockVariableResolver.resolve).toHaveBeenCalledWith(variables, template.variables);
    });

    it('should apply default values for missing variables', async () => {
      const template = {
        content: 'instance_type = "{{instance_type}}"',
        variables: {
          instance_type: { type: 'string', default: 't2.micro' },
        },
      };

      mockVariableResolver.resolve.mockResolvedValue({
        instance_type: 't2.micro',
      });

      templateEngine.render.mockResolvedValue('instance_type = "t2.micro"');

      const result = await templateEngine.render(template, {});

      expect(result).toContain('t2.micro');
    });

    it('should handle nested variable references', async () => {
      const template = {
        content: '{{resource.name}}-{{resource.environment}}',
        variables: {
          resource: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              environment: { type: 'string' },
            },
          },
        },
      };

      const variables = {
        resource: {
          name: 'database',
          environment: 'production',
        },
      };

      mockVariableResolver.resolve.mockResolvedValue(variables);
      templateEngine.render.mockResolvedValue('database-production');

      const result = await templateEngine.render(template, variables);

      expect(result).toBe('database-production');
    });

    it('should support conditional rendering', async () => {
      const template = {
        content: `
          {{#if enable_monitoring}}
          monitoring_enabled = true
          {{else}}
          monitoring_enabled = false
          {{/if}}
        `,
        variables: {
          enable_monitoring: { type: 'boolean', default: false },
        },
      };

      mockVariableResolver.resolve.mockResolvedValue({
        enable_monitoring: true,
      });

      templateEngine.render.mockResolvedValue('monitoring_enabled = true');

      const result = await templateEngine.render(template, { enable_monitoring: true });

      expect(result).toContain('monitoring_enabled = true');
    });

    it('should support loops in templates', async () => {
      const template = {
        content: `
          {{#each tags}}
          {{key}} = "{{value}}"
          {{/each}}
        `,
        variables: {
          tags: { type: 'array', items: { type: 'object' } },
        },
      };

      const variables = {
        tags: [
          { key: 'Environment', value: 'Production' },
          { key: 'Owner', value: 'DevOps' },
        ],
      };

      mockVariableResolver.resolve.mockResolvedValue(variables);
      templateEngine.render.mockResolvedValue(
        'Environment = "Production"\nOwner = "DevOps"'
      );

      const result = await templateEngine.render(template, variables);

      expect(result).toContain('Environment');
      expect(result).toContain('Production');
      expect(result).toContain('Owner');
      expect(result).toContain('DevOps');
    });

    it('should handle template functions', async () => {
      const template = {
        content: 'name = "{{lower(resource_name)}}"',
        variables: {
          resource_name: { type: 'string' },
        },
      };

      mockVariableResolver.resolve.mockResolvedValue({
        resource_name: 'WEB-SERVER',
      });

      templateEngine.render.mockResolvedValue('name = "web-server"');

      const result = await templateEngine.render(template, { resource_name: 'WEB-SERVER' });

      expect(result).toContain('web-server');
    });
  });

  describe('Template Compilation', () => {
    it('should compile template into executable format', async () => {
      const template = {
        content: 'resource "{{type}}" "{{name}}" { }',
        variables: {
          type: { type: 'string' },
          name: { type: 'string' },
        },
      };

      const compiled = {
        ast: {},
        functions: [],
        variables: ['type', 'name'],
        dependencies: [],
      };

      templateEngine.compile.mockResolvedValue(compiled);

      const result = await templateEngine.compile(template);

      expect(result).toHaveProperty('ast');
      expect(result).toHaveProperty('variables');
      expect(result.variables).toContain('type');
      expect(result.variables).toContain('name');
    });

    it('should detect template syntax errors during compilation', async () => {
      const template = {
        content: 'resource "{{type}" "{{name}}" { }', // Missing closing brace
      };

      templateEngine.compile.mockRejectedValue(
        new Error('Template syntax error: Unclosed variable at position 14')
      );

      await expect(templateEngine.compile(template)).rejects.toThrow('Template syntax error');
    });

    it('should identify template dependencies', async () => {
      const template = {
        content: '{{include "network-config"}}',
        variables: {},
      };

      const compiled = {
        ast: {},
        variables: [],
        dependencies: ['network-config'],
      };

      templateEngine.compile.mockResolvedValue(compiled);

      const result = await templateEngine.compile(template);

      expect(result.dependencies).toContain('network-config');
    });

    it('should optimize compiled templates', async () => {
      const template = {
        content: '{{var1}} {{var1}} {{var2}}', // Duplicate variable
      };

      const compiled = {
        ast: {},
        variables: ['var1', 'var2'], // Deduplicated
        optimized: true,
      };

      templateEngine.compile.mockResolvedValue(compiled);

      const result = await templateEngine.compile(template);

      expect(result.variables).toHaveLength(2);
      expect(result.optimized).toBe(true);
    });
  });

  describe('Template Validation', () => {
    it('should validate template structure', async () => {
      const template = {
        id: 'tmpl-001',
        name: 'Valid Template',
        content: 'resource "{{type}}" { }',
        variables: {
          type: { type: 'string', required: true },
        },
      };

      mockValidator.validateTemplate.mockResolvedValue({
        valid: true,
        errors: [],
      });

      templateEngine.validate.mockResolvedValue({
        valid: true,
        errors: [],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', async () => {
      const template = {
        content: 'resource { }',
        // Missing variables definition
      };

      mockValidator.validateTemplate.mockResolvedValue({
        valid: false,
        errors: ['Missing required field: variables'],
      });

      templateEngine.validate.mockResolvedValue({
        valid: false,
        errors: ['Missing required field: variables'],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: variables');
    });

    it('should validate variable definitions', async () => {
      const template = {
        content: '{{instance_type}}',
        variables: {
          instance_type: {
            type: 'string',
            enum: ['t2.micro', 't2.small', 't2.medium'],
          },
        },
      };

      mockValidator.validateVariables.mockResolvedValue({
        valid: true,
        errors: [],
      });

      templateEngine.validate.mockResolvedValue({
        valid: true,
        errors: [],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(true);
    });

    it('should detect invalid variable types', async () => {
      const template = {
        content: '{{count}}',
        variables: {
          count: { type: 'invalid_type' },
        },
      };

      mockValidator.validateVariables.mockResolvedValue({
        valid: false,
        errors: ['Invalid variable type: invalid_type'],
      });

      templateEngine.validate.mockResolvedValue({
        valid: false,
        errors: ['Invalid variable type: invalid_type'],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid variable type: invalid_type');
    });

    it('should validate conditional logic', async () => {
      const template = {
        content: '{{#if condition}} content {{/if}}',
        variables: {
          condition: { type: 'boolean' },
        },
      };

      mockValidator.validateConditions.mockResolvedValue({
        valid: true,
        errors: [],
      });

      templateEngine.validate.mockResolvedValue({
        valid: true,
        errors: [],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(true);
    });

    it('should detect unclosed blocks', async () => {
      const template = {
        content: '{{#if condition}} content', // Missing {{/if}}
      };

      mockValidator.validateTemplate.mockResolvedValue({
        valid: false,
        errors: ['Unclosed block: if'],
      });

      templateEngine.validate.mockResolvedValue({
        valid: false,
        errors: ['Unclosed block: if'],
      });

      const result = await templateEngine.validate(template);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed block: if');
    });
  });

  describe('Template Parsing', () => {
    it('should parse template into AST', async () => {
      const template = {
        content: 'resource "{{type}}" "{{name}}" { }',
      };

      const ast = {
        type: 'template',
        children: [
          { type: 'text', value: 'resource "' },
          { type: 'variable', name: 'type' },
          { type: 'text', value: '" "' },
          { type: 'variable', name: 'name' },
          { type: 'text', value: '" { }' },
        ],
      };

      templateEngine.parse.mockResolvedValue(ast);

      const result = await templateEngine.parse(template.content);

      expect(result).toHaveProperty('type', 'template');
      expect(result.children).toHaveLength(5);
      expect(result.children[1]).toHaveProperty('name', 'type');
    });

    it('should parse nested structures', async () => {
      const template = {
        content: '{{#each items}}{{name}}{{/each}}',
      };

      const ast = {
        type: 'template',
        children: [
          {
            type: 'block',
            name: 'each',
            param: 'items',
            children: [{ type: 'variable', name: 'name' }],
          },
        ],
      };

      templateEngine.parse.mockResolvedValue(ast);

      const result = await templateEngine.parse(template.content);

      expect(result.children[0]).toHaveProperty('type', 'block');
      expect(result.children[0]).toHaveProperty('name', 'each');
    });

    it('should handle comments in templates', async () => {
      const template = {
        content: '{{! This is a comment }}resource "{{type}}"',
      };

      const ast = {
        type: 'template',
        children: [
          { type: 'comment', value: 'This is a comment' },
          { type: 'text', value: 'resource "' },
          { type: 'variable', name: 'type' },
          { type: 'text', value: '"' },
        ],
      };

      templateEngine.parse.mockResolvedValue(ast);

      const result = await templateEngine.parse(template.content);

      expect(result.children[0]).toHaveProperty('type', 'comment');
    });

    it('should extract metadata from templates', async () => {
      const template = {
        content: '{{@meta author="DevOps Team"}}resource { }',
      };

      const ast = {
        type: 'template',
        metadata: { author: 'DevOps Team' },
        children: [{ type: 'text', value: 'resource { }' }],
      };

      templateEngine.parse.mockResolvedValue(ast);

      const result = await templateEngine.parse(template.content);

      expect(result.metadata).toHaveProperty('author', 'DevOps Team');
    });
  });

  describe('Template Inheritance', () => {
    it('should support template inheritance', async () => {
      const baseTemplate = {
        id: 'base-001',
        content: 'base content {{block "custom"}}default{{/block}}',
      };

      const childTemplate = {
        id: 'child-001',
        extends: 'base-001',
        content: '{{block "custom"}}overridden{{/block}}',
      };

      mockTemplateRepository.findById.mockResolvedValue(baseTemplate);
      templateEngine.render.mockResolvedValue('base content overridden');

      const result = await templateEngine.render(childTemplate, {});

      expect(result).toContain('base content');
      expect(result).toContain('overridden');
    });

    it('should support multiple inheritance levels', async () => {
      const grandparent = { id: 'gp-001', content: 'level 1' };
      const parent = { id: 'p-001', extends: 'gp-001', content: 'level 2' };
      const child = { id: 'c-001', extends: 'p-001', content: 'level 3' };

      mockTemplateRepository.findById
        .mockResolvedValueOnce(parent)
        .mockResolvedValueOnce(grandparent);

      templateEngine.render.mockResolvedValue('level 1 level 2 level 3');

      const result = await templateEngine.render(child, {});

      expect(result).toContain('level 1');
      expect(result).toContain('level 2');
      expect(result).toContain('level 3');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined variables gracefully', async () => {
      const template = {
        content: '{{undefined_var}}',
        variables: {},
      };

      templateEngine.render.mockRejectedValue(
        new Error('Undefined variable: undefined_var')
      );

      await expect(templateEngine.render(template, {})).rejects.toThrow('Undefined variable');
    });

    it('should provide detailed error messages', async () => {
      const template = {
        content: 'line1\nline2\n{{invalid syntax}}\nline4',
      };

      const error = new Error('Syntax error at line 3, column 2: invalid syntax');
      templateEngine.parse.mockRejectedValue(error);

      await expect(templateEngine.parse(template.content)).rejects.toThrow('line 3, column 2');
    });

    it('should handle circular dependencies', async () => {
      const template1 = { id: 'tmpl-1', content: '{{include "tmpl-2"}}' };
      const template2 = { id: 'tmpl-2', content: '{{include "tmpl-1"}}' };

      mockTemplateRepository.findById
        .mockResolvedValueOnce(template2)
        .mockResolvedValueOnce(template1);

      templateEngine.render.mockRejectedValue(
        new Error('Circular dependency detected: tmpl-1 -> tmpl-2 -> tmpl-1')
      );

      await expect(templateEngine.render(template1, {})).rejects.toThrow('Circular dependency');
    });
  });
});
