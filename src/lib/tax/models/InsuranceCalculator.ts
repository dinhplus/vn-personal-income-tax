export type InsuranceBaseConfig =
  | { type: 'basic'; value: number } 
  | { type: 'specific'; value: number } 
  | { type: 'percentage'; value: number };

export interface InsuranceResult {
  baseAmount: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

export class InsuranceCalculator {
  constructor(
    private readonly employeeRate: number,
    private readonly employerRate: number
  ) {
    if (employeeRate < 0 || employeeRate > 100) {
      throw new Error('Employee insurance rate must be between 0 and 100');
    }
    if (employerRate < 0 || employerRate > 100) {
      throw new Error('Employer insurance rate must be between 0 and 100');
    }
  }

  calculateBaseAmount(
    config: InsuranceBaseConfig,
    grossSalary: number
  ): number {
    switch (config.type) {
      case 'basic':
        return config.value;
      case 'specific':
        return config.value;
      case 'percentage':
        return Math.round((grossSalary * config.value) / 100);
    }
  }


  calculateEmployeeContribution(baseAmount: number): number {
    return Math.round((baseAmount * this.employeeRate) / 100);
  }

  calculateEmployerContribution(baseAmount: number): number {
    return Math.round((baseAmount * this.employerRate) / 100);
  }

  calculate(
    config: InsuranceBaseConfig,
    grossSalary: number
  ): InsuranceResult {
    const baseAmount = this.calculateBaseAmount(config, grossSalary);
    const employeeContribution = this.calculateEmployeeContribution(baseAmount);
    const employerContribution = this.calculateEmployerContribution(baseAmount);

    return {
      baseAmount,
      employeeContribution,
      employerContribution,
      totalContribution: employeeContribution + employerContribution,
    };
  }

  get employeeInsuranceRate(): number {
    return this.employeeRate;
  }

  get employerInsuranceRate(): number {
    return this.employerRate;
  }
}
