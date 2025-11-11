/**
 * Curriculum planning tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCurriculumEnrollment,
  generateCurriculumEnrollmentProjections,
  calculateOverallUtilization,
  calculateCurriculumTuition,
  generateTuitionLadder,
  calculateCurriculumRevenue,
  calculateTotalRevenue,
  generateRevenueSchedule,
  type CurriculumConfig,
  type CurriculumEnrollmentResult,
} from './curriculum';

describe('calculateCurriculumEnrollment', () => {
  const ibConfig: CurriculumConfig = {
    id: 'ib-1',
    name: 'International Baccalaureate',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [
      { yearOffset: 0, utilisation: 0.2 },
      { yearOffset: 1, utilisation: 0.4 },
      { yearOffset: 2, utilisation: 0.6 },
      { yearOffset: 3, utilisation: 0.8 },
      { yearOffset: 4, utilisation: 1.0 },
    ],
    tuitionBase: 92_000,
    cpiRate: 0.03,
    cpiFrequency: 'EVERY_2_YEARS',
    cpiBaseYear: 2028,
  };

  it('should return zero enrollment before launch year', () => {
    const projection = calculateCurriculumEnrollment(ibConfig, 2027);
    expect(projection.enrollment).toBe(0);
    expect(projection.utilisation).toBe(0);
  });

  it('should calculate enrollment during ramp period', () => {
    const projection2028 = calculateCurriculumEnrollment(ibConfig, 2028);
    expect(projection2028.enrollment).toBe(120); // 600 × 0.2

    const projection2029 = calculateCurriculumEnrollment(ibConfig, 2029);
    expect(projection2029.enrollment).toBe(240); // 600 × 0.4

    const projection2032 = calculateCurriculumEnrollment(ibConfig, 2032);
    expect(projection2032.enrollment).toBe(600); // 600 × 1.0
  });

  it('should use 100% after ramp period', () => {
    const projection2035 = calculateCurriculumEnrollment(ibConfig, 2035);
    expect(projection2035.enrollment).toBe(600); // 600 × 1.0
    expect(projection2035.utilisation).toBe(1.0);
  });

  it('should apply ramp overrides', () => {
    const overrides = new Map<number, number>();
    overrides.set(2028, 0.5); // Override to 50%

    const projection = calculateCurriculumEnrollment(ibConfig, 2028, overrides);
    expect(projection.enrollment).toBe(300); // 600 × 0.5
    expect(projection.utilisation).toBe(0.5);
  });
});

describe('generateCurriculumEnrollmentProjections', () => {
  const frenchConfig: CurriculumConfig = {
    id: 'french-1',
    name: 'French Curriculum',
    capacity: 1200,
    launchYear: 2028,
    rampSteps: [
      { yearOffset: 0, utilisation: 1.0 }, // Already established
    ],
    tuitionBase: 58_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  it('should generate projections for all years', () => {
    const projections = generateCurriculumEnrollmentProjections(
      frenchConfig,
      2025,
      2030
    );

    expect(projections).toHaveLength(6);
    expect(projections[0].year).toBe(2025);
    expect(projections[0].enrollment).toBe(0); // Before launch
    expect(projections[3].year).toBe(2028);
    expect(projections[3].enrollment).toBe(1200); // At launch (100%)
  });
});

describe('calculateOverallUtilization', () => {
  it('should calculate overall utilization correctly', () => {
    const enrollments: CurriculumEnrollmentResult[] = [
      {
        curriculumId: 'ib-1',
        curriculumName: 'IB',
        projections: [
          { year: 2028, enrollment: 120, capacity: 600, utilisation: 0.2 },
        ],
      },
      {
        curriculumId: 'french-1',
        curriculumName: 'French',
        projections: [
          { year: 2028, enrollment: 1200, capacity: 1200, utilisation: 1.0 },
        ],
      },
    ];

    const utilization = calculateOverallUtilization(enrollments, 2028);
    // Total: 1320 enrollment / 1800 capacity = 0.7333
    expect(utilization).toBeCloseTo(0.7333, 4);
  });

  it('should return 0 for zero capacity', () => {
    const enrollments: CurriculumEnrollmentResult[] = [];
    const utilization = calculateOverallUtilization(enrollments, 2028);
    expect(utilization).toBe(0);
  });
});

describe('calculateCurriculumTuition', () => {
  const config: CurriculumConfig = {
    id: 'ib-1',
    name: 'IB',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
    tuitionBase: 92_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  it('should calculate CPI-adjusted tuition', () => {
    const tuition2028 = calculateCurriculumTuition(config, 2028);
    expect(tuition2028).toBe(92_000); // Base year

    const tuition2029 = calculateCurriculumTuition(config, 2029);
    // 92K × 1.025 = 94,300
    expect(tuition2029).toBeCloseTo(94_300, 2);
  });

  it('should apply tuition overrides', () => {
    const overrides = new Map<number, number>();
    overrides.set(2029, 100_000);

    const tuition = calculateCurriculumTuition(config, 2029, overrides);
    expect(tuition).toBe(100_000);
  });
});

describe('generateTuitionLadder', () => {
  const config: CurriculumConfig = {
    id: 'ib-1',
    name: 'IB',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
    tuitionBase: 92_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  it('should generate tuition ladder for year range', () => {
    const ladder = generateTuitionLadder(config, 2028, 2030);
    expect(ladder).toHaveLength(3);
    expect(ladder[0]).toBe(92_000); // 2028 base
    expect(ladder[1]).toBeCloseTo(94_300, 2); // 2029 with CPI
    expect(ladder[2]).toBeCloseTo(96_657.5, 2); // 2030 with CPI
  });

  it('should apply tuition overrides in ladder', () => {
    const overrides = new Map<number, number>();
    overrides.set(2029, 100_000);

    const ladder = generateTuitionLadder(config, 2028, 2030, overrides);
    expect(ladder[1]).toBe(100_000); // Override applied
  });
});

describe('calculateCurriculumRevenue', () => {
  const config: CurriculumConfig = {
    id: 'ib-1',
    name: 'IB',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
    tuitionBase: 92_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  it('should calculate revenue correctly', () => {
    const revenue = calculateCurriculumRevenue(config, 2028, 120);
    // 92K × 120 = 11,040,000
    expect(revenue).toBe(11_040_000);
  });

  it('should return 0 for zero enrollment', () => {
    const revenue = calculateCurriculumRevenue(config, 2028, 0);
    expect(revenue).toBe(0);
  });

  it('should return 0 for negative enrollment', () => {
    const revenue = calculateCurriculumRevenue(config, 2028, -10);
    expect(revenue).toBe(0);
  });
});

describe('calculateTotalRevenue', () => {
  const ibConfig: CurriculumConfig = {
    id: 'ib-1',
    name: 'IB',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 0.2 }],
    tuitionBase: 92_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  const frenchConfig: CurriculumConfig = {
    id: 'french-1',
    name: 'French',
    capacity: 1200,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
    tuitionBase: 58_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  const enrollments: CurriculumEnrollmentResult[] = [
    {
      curriculumId: 'ib-1',
      curriculumName: 'IB',
      projections: [
        { year: 2028, enrollment: 120, capacity: 600, utilisation: 0.2 },
      ],
    },
    {
      curriculumId: 'french-1',
      curriculumName: 'French',
      projections: [
        { year: 2028, enrollment: 1200, capacity: 1200, utilisation: 1.0 },
      ],
    },
  ];

  const configs = new Map<string, CurriculumConfig>();
  configs.set('ib-1', ibConfig);
  configs.set('french-1', frenchConfig);

  it('should calculate total revenue across curricula', () => {
    const totalRevenue = calculateTotalRevenue(
      enrollments,
      configs,
      2028
    );

    // IB: 92K × 120 = 11,040,000
    // French: 58K × 1200 = 69,600,000
    // Total: 80,640,000
    expect(totalRevenue).toBe(80_640_000);
  });

  it('should skip curricula without config', () => {
    const enrollmentsWithMissing: CurriculumEnrollmentResult[] = [
      {
        curriculumId: 'missing-1',
        curriculumName: 'Missing',
        projections: [
          { year: 2028, enrollment: 100, capacity: 200, utilisation: 0.5 },
        ],
      },
    ];

    const totalRevenue = calculateTotalRevenue(
      enrollmentsWithMissing,
      configs,
      2028
    );

    // Should skip missing config and return 0
    expect(totalRevenue).toBe(0);
  });

  it('should skip curricula without projection for year', () => {
    const enrollmentsWithoutProjection: CurriculumEnrollmentResult[] = [
      {
        curriculumId: 'ib-1',
        curriculumName: 'IB',
        projections: [
          { year: 2029, enrollment: 120, capacity: 600, utilisation: 0.2 },
        ],
      },
    ];

    const totalRevenue = calculateTotalRevenue(
      enrollmentsWithoutProjection,
      configs,
      2028
    );

    // Should skip enrollment without 2028 projection
    expect(totalRevenue).toBe(0);
  });
});

describe('generateRevenueSchedule', () => {
  const config: CurriculumConfig = {
    id: 'ib-1',
    name: 'IB',
    capacity: 600,
    launchYear: 2028,
    rampSteps: [{ yearOffset: 0, utilisation: 1.0 }],
    tuitionBase: 92_000,
    cpiRate: 0.025,
    cpiFrequency: 'ANNUAL',
    cpiBaseYear: 2028,
  };

  const enrollments: CurriculumEnrollmentResult[] = [
    {
      curriculumId: 'ib-1',
      curriculumName: 'IB',
      projections: [
        { year: 2027, enrollment: 0, capacity: 600, utilisation: 0 },
        { year: 2028, enrollment: 600, capacity: 600, utilisation: 1.0 },
        { year: 2029, enrollment: 600, capacity: 600, utilisation: 1.0 },
      ],
    },
  ];

  const configs = new Map<string, CurriculumConfig>();
  configs.set('ib-1', config);

  it('should generate revenue schedule', () => {
    const schedule = generateRevenueSchedule(
      enrollments,
      configs,
      2027,
      2029
    );

    expect(schedule).toHaveLength(3);
    expect(schedule[0]).toBe(0); // 2027: no enrollment
    expect(schedule[1]).toBe(55_200_000); // 2028: 92K × 600
    expect(schedule[2]).toBeCloseTo(56_580_000, 0); // 2029: 94.3K × 600
  });
});

