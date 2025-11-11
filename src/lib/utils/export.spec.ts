/**
 * Tests for export utilities
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { exportToCsv, exportToExcel } from './export';

describe('exportToCsv', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log export data', () => {
    const data = [{ name: 'Test', value: 100 }];
    exportToCsv(data, 'test.csv');

    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to CSV:', 'test.csv', data);
  });

  it('should handle empty array', () => {
    exportToCsv([], 'empty.csv');
    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to CSV:', 'empty.csv', []);
  });

  it('should handle complex data structures', () => {
    const data = [
      { id: 1, nested: { value: 'test' } },
      { id: 2, nested: { value: 'test2' } },
    ];
    exportToCsv(data, 'complex.csv');
    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to CSV:', 'complex.csv', data);
  });
});

describe('exportToExcel', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log export data', () => {
    const data = [{ name: 'Test', value: 100 }];
    exportToExcel(data, 'test.xlsx');

    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to Excel:', 'test.xlsx', data);
  });

  it('should handle empty array', () => {
    exportToExcel([], 'empty.xlsx');
    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to Excel:', 'empty.xlsx', []);
  });

  it('should handle complex data structures', () => {
    const data = [
      { id: 1, nested: { value: 'test' } },
      { id: 2, nested: { value: 'test2' } },
    ];
    exportToExcel(data, 'complex.xlsx');
    expect(consoleLogSpy).toHaveBeenCalledWith('Exporting to Excel:', 'complex.xlsx', data);
  });
});

