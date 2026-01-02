import { TaxBracket } from './TaxBracket';

/**
 * Tax breakdown for a specific bracket
 */
export interface TaxBreakdownItem {
  bracket: TaxBracket;
  taxableAmount: number;
  taxAmount: number;
}

/**
 * Progressive tax calculation result
 */
export interface ProgressiveTaxResult {
  totalTax: number;
  breakdown: TaxBreakdownItem[];
}

/**
 * Tax calculator for progressive tax calculation
 */
export class TaxCalculator {
  private readonly brackets: TaxBracket[];

  constructor(
    public readonly personalDeduction: number,
    public readonly dependentDeduction: number,
    brackets: Array<{ from: number; to: number | null; rate: number }>
  ) {
    if (personalDeduction < 0) {
      throw new Error('Personal deduction must be non-negative');
    }
    if (dependentDeduction < 0) {
      throw new Error('Dependent deduction must be non-negative');
    }

    // Convert to TaxBracket instances and validate
    this.brackets = brackets
      .map((b) => new TaxBracket(b.from, b.to, b.rate))
      .sort((a, b) => a.from - b.from);

    // Validate brackets are continuous
    for (let i = 0; i < this.brackets.length - 1; i++) {
      const current = this.brackets[i];
      const next = this.brackets[i + 1];
      if (current.to !== next.from) {
        throw new Error('Tax brackets must be continuous');
      }
    }
  }

  /**
   * Calculate total deductions
   */
  calculateTotalDeductions(
    dependents: number,
    insuranceContribution: number
  ): number {
    if (dependents < 0) {
      throw new Error('Number of dependents must be non-negative');
    }
    if (insuranceContribution < 0) {
      throw new Error('Insurance contribution must be non-negative');
    }

    return (
      this.personalDeduction +
      dependents * this.dependentDeduction +
      insuranceContribution
    );
  }

  /**
   * Calculate taxable income
   */
  calculateTaxableIncome(
    grossSalary: number,
    dependents: number,
    insuranceContribution: number
  ): number {
    if (grossSalary < 0) {
      throw new Error('Gross salary must be non-negative');
    }

    const totalDeductions = this.calculateTotalDeductions(
      dependents,
      insuranceContribution
    );
    return Math.max(0, grossSalary - totalDeductions);
  }

  /**
   * Calculate progressive tax with breakdown
   */
  calculateProgressiveTax(taxableIncome: number): ProgressiveTaxResult {
    if (taxableIncome < 0) {
      throw new Error('Taxable income must be non-negative');
    }

    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const breakdown: TaxBreakdownItem[] = [];

    for (const bracket of this.brackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(remainingIncome, bracket.size);
      const taxForBracket = bracket.calculateTax(taxableInBracket);

      breakdown.push({
        bracket,
        taxableAmount: taxableInBracket,
        taxAmount: taxForBracket,
      });

      totalTax += taxForBracket;
      remainingIncome -= taxableInBracket;
    }

    return {
      totalTax: Math.round(totalTax),
      breakdown,
    };
  }

  /**
   * Calculate tax from gross salary
   */
  calculateFromGross(
    grossSalary: number,
    dependents: number,
    insuranceContribution: number
  ): ProgressiveTaxResult & { taxableIncome: number } {
    const taxableIncome = this.calculateTaxableIncome(
      grossSalary,
      dependents,
      insuranceContribution
    );
    const result = this.calculateProgressiveTax(taxableIncome);

    return {
      ...result,
      taxableIncome,
    };
  }

  /**
   * Get all tax brackets
   */
  getTaxBrackets(): ReadonlyArray<TaxBracket> {
    return this.brackets;
  }

  /**
   * Get tax bracket for specific income
   */
  getBracketForIncome(income: number): TaxBracket | null {
    return this.brackets.find((b) => b.contains(income)) || null;
  }
}
