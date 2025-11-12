/**
 * Tests for export utilities
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { exportToCsv, exportToExcel } from './export';

describe('exportToCsv', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should log export data', () => {
    const data = [{ name: 'Test', value: 100 }];
    exportToCsv(data, 'test.csv');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to CSV not yet implemented:',
      'test.csv',
      data.length,
      'items'
    );
  });

  it('should handle empty array', () => {
    exportToCsv([], 'empty.csv');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to CSV not yet implemented:',
      'empty.csv',
      0,
      'items'
    );
  });

  it('should handle complex data structures', () => {
    const data = [
      { id: 1, nested: { value: 'test' } },
      { id: 2, nested: { value: 'test2' } },
    ];
    exportToCsv(data, 'complex.csv');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to CSV not yet implemented:',
      'complex.csv',
      data.length,
      'items'
    );
  });
});

describe('exportToExcel', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should log export data', () => {
    const data = [{ name: 'Test', value: 100 }];
    exportToExcel(data, 'test.xlsx');

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to Excel not yet implemented:',
      'test.xlsx',
      data.length,
      'items'
    );
  });

  it('should handle empty array', () => {
    exportToExcel([], 'empty.xlsx');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to Excel not yet implemented:',
      'empty.xlsx',
      0,
      'items'
    );
  });

  it('should handle complex data structures', () => {
    const data = [
      { id: 1, nested: { value: 'test' } },
      { id: 2, nested: { value: 'test2' } },
    ];
    exportToExcel(data, 'complex.xlsx');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Export to Excel not yet implemented:',
      'complex.xlsx',
      data.length,
      'items'
    );
  });
});
