import { microSaasTools, getCategoryTools, getAvailableTools, getToolById } from '../config/tools';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  const LinkComponent = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => {
    return <a href={href} {...props}>{children}</a>;
  };
  LinkComponent.displayName = 'Link';
  return LinkComponent;
});

describe('Tools Configuration', () => {
  test('should have all required tool properties', () => {
    microSaasTools.forEach(tool => {
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('title');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('icon');
      expect(tool).toHaveProperty('route');
      expect(tool).toHaveProperty('category');
      expect(tool).toHaveProperty('status');
      
      expect(typeof tool.id).toBe('string');
      expect(typeof tool.title).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.icon).toBe('string');
      expect(typeof tool.route).toBe('string');
      expect(['productivity', 'content', 'analysis', 'automation']).toContain(tool.category);
      expect(['available', 'coming-soon', 'beta']).toContain(tool.status);
    });
  });

  test('should filter tools by category correctly', () => {
    const contentTools = getCategoryTools('content');
    const productivityTools = getCategoryTools('productivity');
    const analysisTools = getCategoryTools('analysis');
    const automationTools = getCategoryTools('automation');

    expect(contentTools.every(tool => tool.category === 'content')).toBe(true);
    expect(productivityTools.every(tool => tool.category === 'productivity')).toBe(true);
    expect(analysisTools.every(tool => tool.category === 'analysis')).toBe(true);
    expect(automationTools.every(tool => tool.category === 'automation')).toBe(true);
  });

  test('should return only available tools', () => {
    const availableTools = getAvailableTools();
    expect(availableTools.every(tool => tool.status === 'available')).toBe(true);
  });

  test('should find tool by ID correctly', () => {
    const tool = getToolById('worksheet-generator');
    expect(tool).toBeDefined();
    expect(tool?.id).toBe('worksheet-generator');
    expect(tool?.title).toBe('Werkblad Generator');

    const nonExistentTool = getToolById('non-existent');
    expect(nonExistentTool).toBeUndefined();
  });

  test('should have at least one tool in each category', () => {
    expect(getCategoryTools('content').length).toBeGreaterThan(0);
    expect(getCategoryTools('productivity').length).toBeGreaterThan(0);
    expect(getCategoryTools('analysis').length).toBeGreaterThan(0);
    expect(getCategoryTools('automation').length).toBeGreaterThan(0);
  });

  test('should have unique tool IDs', () => {
    const ids = microSaasTools.map(tool => tool.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('should have valid route patterns', () => {
    microSaasTools.forEach(tool => {
      expect(tool.route).toMatch(/^\/tools\/[a-z-]+$/);
    });
  });
});