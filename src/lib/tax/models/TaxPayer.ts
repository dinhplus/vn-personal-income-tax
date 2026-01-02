import {
  InsuranceCalculator,
  InsuranceBaseConfig,
  InsuranceResult,
} from './InsuranceCalculator';
import {
  TaxCalculator,
  TaxBreakdownItem,
} from './TaxCalculator';
import { TaxBracket } from './TaxBracket';

/**
 * Salary type for calculation
 */
export type SalaryType = 'gross' | 'net';

/**
 * Complete calculation result for a taxpayer
 */
export interface TaxPayerCalculationResult {
  // Input information
  salaryType: SalaryType;
  dependents: number;

  // Calculated values
  grossSalary: number;
  netSalary: number;
  taxableIncome: number;
  totalTax: number;

  // Insurance details
  insurance: InsuranceResult;

  // Tax breakdown
  taxBreakdown: TaxBreakdownItem[];

  // Employer cost
  totalEmployerCost: number;
}

/**
 * TaxPayer represents an individual taxpayer with their information
 */
export class TaxPayer {
  constructor(
    private readonly insuranceCalculator: InsuranceCalculator,
    private readonly taxCalculator: TaxCalculator,
    public readonly dependents: number,
    public readonly insuranceBaseConfig: InsuranceBaseConfig
  ) {
    if (dependents < 0) {
      throw new Error('Number of dependents must be non-negative');
    }
  }

  /**
   * Calculate tax from gross salary
   */
  calculateFromGross(grossSalary: number): TaxPayerCalculationResult {
    if (grossSalary < 0) {
      throw new Error('Gross salary must be non-negative');
    }

    // Calculate insurance
    const insurance = this.insuranceCalculator.calculate(
      this.insuranceBaseConfig,
      grossSalary
    );

    // Calculate tax
    const taxResult = this.taxCalculator.calculateFromGross(
      grossSalary,
      this.dependents,
      insurance.employeeContribution
    );

    // Calculate net salary
    const netSalary =
      grossSalary - insurance.employeeContribution - taxResult.totalTax;

    // Calculate total employer cost
    const totalEmployerCost = grossSalary + insurance.employerContribution;

    return {
      salaryType: 'gross',
      dependents: this.dependents,
      grossSalary,
      netSalary,
      taxableIncome: taxResult.taxableIncome,
      totalTax: taxResult.totalTax,
      insurance,
      taxBreakdown: taxResult.breakdown,
      totalEmployerCost,
    };
  }

  /**
   * Calculate gross salary from net salary using iterative approximation
   */
  calculateFromNet(targetNetSalary: number): TaxPayerCalculationResult {
    if (targetNetSalary < 0) {
      throw new Error('Net salary must be non-negative');
    }

    // Use binary search to find gross salary
    let low = targetNetSalary;
    let high = targetNetSalary * 2;
    let iterations = 0;
    const maxIterations = 100;
    const tolerance = 1; // VND

    while (iterations < maxIterations) {
      const mid = Math.round((low + high) / 2);
      const result = this.calculateFromGross(mid);

      if (Math.abs(result.netSalary - targetNetSalary) < tolerance) {
        return result;
      }

      if (result.netSalary < targetNetSalary) {
        low = mid;
      } else {
        high = mid;
      }

      iterations++;
    }

    // If we couldn't converge, return the closest result
    return this.calculateFromGross(Math.round((low + high) / 2));
  }

  /**
   * Calculate based on salary type
   */
  calculate(
    salary: number,
    salaryType: SalaryType
  ): TaxPayerCalculationResult {
    if (salaryType === 'gross') {
      return this.calculateFromGross(salary);
    } else {
      return this.calculateFromNet(salary);
    }
  }

  /**
   * Get tax brackets
   */
  getTaxBrackets(): ReadonlyArray<TaxBracket> {
    return this.taxCalculator.getTaxBrackets();
  }

  /**
   * Get insurance rates
   */
  getInsuranceRates(): {
    employee: number;
    employer: number;
  } {
    return {
      employee: this.insuranceCalculator.employeeInsuranceRate,
      employer: this.insuranceCalculator.employerInsuranceRate,
    };
  }

  /**
   * Get deductions
   */
  getDeductions(): {
    personal: number;
    dependent: number;
    totalDependents: number;
  } {
    return {
      personal: this.taxCalculator.personalDeduction,
      dependent: this.taxCalculator.dependentDeduction,
      totalDependents: this.dependents * this.taxCalculator.dependentDeduction,
    };
  }
}
