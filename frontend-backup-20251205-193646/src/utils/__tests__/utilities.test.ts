import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('String Utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1);

      expect(capitalize('hello')).toBe('Hello');
    });

    it('should convert to kebab-case', () => {
      const toKebabCase = (str: string) =>
        str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

      expect(toKebabCase('helloWorld')).toBe('hello-world');
    });

    it('should convert to camelCase', () => {
      const toCamelCase = (str: string) =>
        str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

      expect(toCamelCase('hello-world')).toBe('helloWorld');
    });

    it('should truncate long strings', () => {
      const truncate = (str: string, length: number) =>
        str.length > length ? str.substring(0, length) + '...' : str;

      expect(truncate('This is a long string', 10)).toBe('This is a ...');
    });
  });

  describe('Number Utilities', () => {
    it('should format currency', () => {
      const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

      expect(formatCurrency(1234.56)).toContain('1,234.56');
    });

    it('should format percentage', () => {
      const formatPercentage = (value: number) =>
        `${(value * 100).toFixed(2)}%`;

      expect(formatPercentage(0.1234)).toBe('12.34%');
    });

    it('should clamp number between min and max', () => {
      const clamp = (num: number, min: number, max: number) =>
        Math.min(Math.max(num, min), max);

      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should generate random number in range', () => {
      const random = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const result = random(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe('Array Utilities', () => {
    it('should remove duplicates', () => {
      const unique = (arr: any[]) => [...new Set(arr)];

      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it('should chunk array', () => {
      const chunk = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };

      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should shuffle array', () => {
      const shuffle = (arr: any[]) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      };

      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should group by property', () => {
      const groupBy = (arr: any[], key: string) =>
        arr.reduce((acc, item) => {
          (acc[item[key]] = acc[item[key]] || []).push(item);
          return acc;
        }, {});

      const data = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];

      const grouped = groupBy(data, 'type');
      expect(grouped['a']).toHaveLength(2);
      expect(grouped['b']).toHaveLength(1);
    });
  });

  describe('Date Utilities', () => {
    it('should format date', () => {
      const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      const date = new Date('2025-01-15');
      expect(formatDate(date)).toContain('January');
      expect(formatDate(date)).toContain('2025');
    });

    it('should calculate time ago', () => {
      const timeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      };

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should check if date is today', () => {
      const isToday = (date: Date) => {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      };

      expect(isToday(new Date())).toBe(true);
      expect(isToday(new Date('2020-01-01'))).toBe(false);
    });
  });

  describe('Object Utilities', () => {
    it('should deep clone object', () => {
      const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      cloned.b.c = 3;

      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    it('should deep merge objects', () => {
      const deepMerge = (target: any, source: any) => {
        const output = { ...target };
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object') {
            output[key] = deepMerge(target[key] || {}, source[key]);
          } else {
            output[key] = source[key];
          }
        });
        return output;
      };

      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = deepMerge(obj1, obj2);

      expect(merged.a).toBe(1);
      expect(merged.b.c).toBe(2);
      expect(merged.b.d).toBe(3);
      expect(merged.e).toBe(4);
    });

    it('should pick properties from object', () => {
      const pick = (obj: any, keys: string[]) =>
        keys.reduce((acc, key) => {
          if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
          }
          return acc;
        }, {} as any);

      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should omit properties from object', () => {
      const omit = (obj: any, keys: string[]) =>
        Object.keys(obj).reduce((acc, key) => {
          if (!keys.includes(key)) {
            acc[key] = obj[key];
          }
          return acc;
        }, {} as any);

      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('Validation Utilities', () => {
    it('should validate email', () => {
      const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('should validate URL', () => {
      const isValidURL = (url: string) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('not-a-url')).toBe(false);
    });

    it('should validate phone number', () => {
      const isValidPhone = (phone: string) =>
        /^\+?[\d\s-()]+$/.test(phone);

      expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
      expect(isValidPhone('555-1234')).toBe(true);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});
