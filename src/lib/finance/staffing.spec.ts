/**
 * Staffing calculation tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateStaffingCost,
  generateStaffingSchedule,
  type StaffingConfig,
} from './staffing';

describe('calculateStaffingCost', () => {
  const config: StaffingConfig = {
    teacherRatio: 20,
    nonTeacherRatio: 50,
    teacherAvgCost: 120_000,
    nonTeacherAvgCost: 80_000,
    teacherEscalationRate: 0.03,
    nonTeacherEscalationRate: 0.025,
    baseYear: 2023,
  };

  it('should calculate staffing costs correctly', () => {
    const result = calculateStaffingCost(config, 2028, 1200);

    // Headcount
    expect(result.teacherHeadcount).toBe(60); // ceil(1200/20)
    expect(result.nonTeacherHeadcount).toBe(24); // ceil(1200/50)

    // Costs (with 5 years escalation from 2023)
    // Teacher: 120K × (1.03)^5 = 139,112.73
    // Non-teacher: 80K × (1.025)^5 = 90,510.20
    expect(result.teacherCost).toBeCloseTo(60 * 139_112.73, -1000);
    expect(result.nonTeacherCost).toBeCloseTo(24 * 90_510.20, -1000);
  });

  it('should round up headcount for partial ratios', () => {
    const result = calculateStaffingCost(config, 2028, 21);

    expect(result.teacherHeadcount).toBe(2); // ceil(21/20)
    expect(result.nonTeacherHeadcount).toBe(1); // ceil(21/50)
  });

  it('should handle zero students', () => {
    const result = calculateStaffingCost(config, 2028, 0);

    expect(result.teacherHeadcount).toBe(0);
    expect(result.nonTeacherHeadcount).toBe(0);
    expect(result.totalCost).toBe(0);
  });
});

describe('generateStaffingSchedule', () => {
  const config: StaffingConfig = {
    teacherRatio: 20,
    nonTeacherRatio: 50,
    teacherAvgCost: 120_000,
    nonTeacherAvgCost: 80_000,
    teacherEscalationRate: 0.03,
    nonTeacherEscalationRate: 0.025,
    baseYear: 2023,
  };

  it('should generate schedule correctly', () => {
    const studentSchedule = [0, 0, 0, 0, 0, 1200, 1500, 1800];
    const schedule = generateStaffingSchedule(config, studentSchedule, 2023, 2030);

    expect(schedule).toHaveLength(8);
    expect(schedule[0].totalStudents).toBe(0);
    expect(schedule[5].totalStudents).toBe(1200);
    expect(schedule[5].teacherHeadcount).toBe(60);
  });
});

