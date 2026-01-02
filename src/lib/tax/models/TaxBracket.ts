/**
 * Tax bracket model with calculation methods
 */
export class TaxBracket {
  constructor(
    public readonly from: number,
    public readonly to: number | null,
    public readonly rate: number
  ) {
    if (from < 0) {
      throw new Error('Tax bracket "from" must be non-negative');
    }
    if (to !== null && to <= from) {
      throw new Error('Tax bracket "to" must be greater than "from"');
    }
    if (rate < 0 || rate > 100) {
      throw new Error('Tax rate must be between 0 and 100');
    }
  }

  /**
   * Get the size of this bracket
   */
  get size(): number {
    return this.to ? this.to - this.from : Infinity;
  }

  /**
   * Check if an income falls within this bracket
   */
  contains(income: number): boolean {
    return income >= this.from && (this.to === null || income < this.to);
  }

  /**
   * Calculate taxable amount in this bracket for given income
   */
  getTaxableAmountForIncome(income: number): number {
    if (income <= this.from) {
      return 0;
    }

    const taxableInBracket = Math.min(income - this.from, this.size);
    
    return Math.max(0, taxableInBracket);
  }

  /**
   * Calculate tax amount for given taxable amount in this bracket
   */
  calculateTax(taxableAmount: number): number {
    return Math.round((taxableAmount * this.rate) / 100);
  }

  /**
   * Calculate tax for income within this bracket
   */
  calculateTaxForIncome(income: number): number {
    const taxableAmount = this.getTaxableAmountForIncome(income);
    return this.calculateTax(taxableAmount);
  }

  /**
   * Get formatted rate as percentage string
   */
  getFormattedRate(): string {
    return `${this.rate}%`;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      from: this.from,
      to: this.to,
      rate: this.rate,
    };
  }
}
