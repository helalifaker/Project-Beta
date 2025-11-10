# Golden Datasets

Golden datasets are known-good test cases with verified inputs and expected outputs. They serve as regression tests for the financial engine and validation logic.

## Purpose

- **Accuracy Testing**: Verify financial calculations produce correct results
- **Regression Prevention**: Catch unintended changes to calculation logic
- **Documentation**: Provide examples of valid version configurations
- **Performance Benchmarking**: Measure calculation performance over time

## Dataset Structure

Each golden dataset is a JSON file containing:

```json
{
  "version": {
    "id": "unique-id",
    "name": "Descriptive Name",
    "status": "DRAFT",
    "rentModelType": "FIXED_ESC"
  },
  "assumptions": {
    "leaseTerms": { ... },
    "curriculum": { ... },
    "staffing": { ... },
    "opex": { ... },
    "capex": { ... }
  },
  "expectedResults": {
    "npv": { ... },
    "financials": { ... },
    "validation": { ... }
  },
  "notes": "Description of test case"
}
```

## Available Datasets

### toy-version.json

**Purpose**: Simple smoke test case  
**Scenario**: Basic school with 2 curricula, Fixed+Escalation rent  
**Key Features**:
- 2000 student capacity
- 60/40 National/International split
- Fixed+Escalation rent model
- Annual indexation
- Simple capex rules

**Use Cases**:
- Smoke testing after code changes
- Quick validation of financial engine
- Example for new developers

## Using Golden Datasets

### In Unit Tests

```typescript
import goldenVersion from '@/tests/golden/toy-version.json';

describe('Financial Engine', () => {
  it('should match golden dataset results', () => {
    const statements = generateStatements(goldenVersion.assumptions);
    
    expect(statements.pl['2028'].revenue).toBeCloseTo(
      goldenVersion.expectedResults.financials['2028'].revenue,
      -3 // Within 1000 SAR
    );
  });
});
```

### In Integration Tests

```typescript
it('should generate valid statements for toy version', async () => {
  const version = await createVersion(goldenVersion.version);
  await updateAssumptions(version.id, goldenVersion.assumptions);
  
  const statements = await generateStatements(version.id);
  
  expect(statements.convergence.balanced).toBe(true);
  expect(statements.validation.criticalCount).toBe(0);
});
```

## Creating New Golden Datasets

1. **Create a Version**: Use the app to create a version with specific assumptions
2. **Verify Results**: Manually verify all calculations are correct
3. **Export Data**: Export the version and expected results
4. **Add to Tests**: Create a new JSON file in this directory
5. **Write Tests**: Add tests that use the new dataset
6. **Document**: Update this README with the new dataset

### Naming Convention

- `toy-version.json` — Simple test case
- `complex-version.json` — Complex scenario with all features
- `edge-case-*.json` — Edge cases (e.g., edge-case-max-capacity.json)
- `regression-*.json` — Specific regression tests (e.g., regression-npv-bug-123.json)

## Validation Rules

All golden datasets must:

- ✅ Have valid JSON structure
- ✅ Include all required fields
- ✅ Have realistic assumptions
- ✅ Include expected results with tolerances
- ✅ Pass all validation rules
- ✅ Balance sheet must balance
- ✅ Be documented in this README

## Maintenance

- **Review Quarterly**: Verify datasets still represent realistic scenarios
- **Update on Breaking Changes**: When calculation logic changes intentionally
- **Add for Bug Fixes**: Create regression datasets for fixed bugs
- **Archive Obsolete**: Move outdated datasets to `archived/` subdirectory

## Tolerance Guidelines

### Financial Values

- **Revenue, COGS, OpEx**: ±1,000 SAR (0.001%)
- **NPV**: ±100,000 SAR (0.1%)
- **Margins**: ±0.001 (0.1 percentage points)

### Non-Financial Values

- **Headcount**: Exact match
- **Utilization**: ±0.01 (1 percentage point)
- **Validation Counts**: Exact match

## Performance Benchmarks

Target performance for golden dataset tests:

- **toy-version.json**: <100ms
- **complex-version.json**: <400ms
- **Full suite**: <2s

If tests exceed these targets, investigate performance regressions.

## Related Documentation

- [Testing Strategy](../../ZERO_ERROR_DEVELOPMENT_GUIDE.md#testing)
- [Financial Engine Spec](../../SCHOOL_RELOCATION_PLANNER_TECHNICAL_SPEC.md#financial-engine)
- [Validation Rules](../../SCHOOL_RELOCATION_PLANNER_TECHNICAL_SPEC.md#validation)

