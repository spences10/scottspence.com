// UK Tax Calculator
// Tax bands are loaded from the uk_tax_config DB table.
// NOTE: Check and update uk_tax_config annually around March/April
// budget. Current rates: 2025/26 (frozen to April 2028).

export interface UkTaxConfig {
	personal_allowance: number
	personal_allowance_taper_start: number
	basic_rate_ceiling: number
	higher_rate_ceiling: number
	basic_rate: number
	higher_rate: number
	additional_rate: number
	ni_primary_threshold: number
	ni_upper_earnings_limit: number
	ni_main_rate: number
	ni_upper_rate: number
	corporation_tax_rate: number
	dividend_allowance: number
	dividend_basic_rate: number
	dividend_higher_rate: number
	basic_rate_band: number
}

export interface PermanentBreakdown {
	gross: number
	personal_allowance: number
	income_tax: number
	employee_ni: number
	total_deductions: number
	take_home: number
}

export interface ContractorBreakdown {
	gross_annual: number
	salary: number
	corporation_tax: number
	dividends: number
	dividend_tax: number
	salary_income_tax: number
	salary_ni: number
	total_tax: number
	take_home: number
}

export interface ContractorVsPermanent {
	day_rate: number
	working_days: number
	contractor: ContractorBreakdown
	equivalent_permanent: PermanentBreakdown
}

const effective_personal_allowance = (
	gross: number,
	config: UkTaxConfig,
): number => {
	if (gross <= config.personal_allowance_taper_start) {
		return config.personal_allowance
	}
	const taper_end =
		config.personal_allowance_taper_start +
		config.personal_allowance * 2
	if (gross >= taper_end) return 0
	const excess = gross - config.personal_allowance_taper_start
	return Math.max(
		0,
		config.personal_allowance - Math.floor(excess / 2),
	)
}

const calculate_income_tax = (
	gross: number,
	config: UkTaxConfig,
): number => {
	const allowance = effective_personal_allowance(gross, config)
	const taxable = Math.max(0, gross - allowance)

	let tax = 0
	const basic_band = Math.max(
		0,
		config.basic_rate_ceiling - allowance,
	)
	const higher_band =
		config.higher_rate_ceiling - config.basic_rate_ceiling

	if (taxable <= basic_band) {
		tax = taxable * config.basic_rate
	} else if (taxable <= basic_band + higher_band) {
		tax = basic_band * config.basic_rate
		tax += (taxable - basic_band) * config.higher_rate
	} else {
		tax = basic_band * config.basic_rate
		tax += higher_band * config.higher_rate
		tax +=
			(taxable - basic_band - higher_band) * config.additional_rate
	}

	return Math.round(tax * 100) / 100
}

const calculate_employee_ni = (
	gross: number,
	config: UkTaxConfig,
): number => {
	if (gross <= config.ni_primary_threshold) return 0

	let ni = 0
	const main_band =
		Math.min(gross, config.ni_upper_earnings_limit) -
		config.ni_primary_threshold
	ni += main_band * config.ni_main_rate

	if (gross > config.ni_upper_earnings_limit) {
		ni +=
			(gross - config.ni_upper_earnings_limit) * config.ni_upper_rate
	}

	return Math.round(ni * 100) / 100
}

export const calculate_permanent_take_home = (
	gross: number,
	config: UkTaxConfig,
): PermanentBreakdown => {
	const allowance = effective_personal_allowance(gross, config)
	const income_tax = calculate_income_tax(gross, config)
	const employee_ni = calculate_employee_ni(gross, config)
	const total_deductions = income_tax + employee_ni

	return {
		gross: Math.round(gross * 100) / 100,
		personal_allowance: allowance,
		income_tax,
		employee_ni,
		total_deductions: Math.round(total_deductions * 100) / 100,
		take_home: Math.round((gross - total_deductions) * 100) / 100,
	}
}

const calculate_dividend_tax = (
	dividends: number,
	salary: number,
	config: UkTaxConfig,
): number => {
	if (dividends <= 0) return 0

	const salary_taxable = Math.max(
		0,
		salary - config.personal_allowance,
	)
	const remaining_basic_band = Math.max(
		0,
		config.basic_rate_band - salary_taxable,
	)

	let tax = 0
	let remaining = dividends

	const allowance_used = Math.min(
		remaining,
		config.dividend_allowance,
	)
	remaining -= allowance_used

	const basic_rate_space = Math.max(
		0,
		remaining_basic_band - allowance_used,
	)
	const basic_dividends = Math.min(remaining, basic_rate_space)
	tax += basic_dividends * config.dividend_basic_rate
	remaining -= basic_dividends

	if (remaining > 0) {
		tax += remaining * config.dividend_higher_rate
	}

	return Math.round(tax * 100) / 100
}

export const calculate_contractor_take_home = (
	gross_annual: number,
	config: UkTaxConfig,
): ContractorBreakdown => {
	const salary = config.personal_allowance
	const profit = Math.max(0, gross_annual - salary)
	const corporation_tax = profit * config.corporation_tax_rate
	const dividends = profit - corporation_tax

	const salary_income_tax = calculate_income_tax(salary, config)
	const salary_ni = calculate_employee_ni(salary, config)
	const dividend_tax = calculate_dividend_tax(
		dividends,
		salary,
		config,
	)

	const total_tax =
		corporation_tax + salary_income_tax + salary_ni + dividend_tax

	return {
		gross_annual: Math.round(gross_annual * 100) / 100,
		salary,
		corporation_tax: Math.round(corporation_tax * 100) / 100,
		dividends: Math.round(dividends * 100) / 100,
		dividend_tax,
		salary_income_tax,
		salary_ni,
		total_tax: Math.round(total_tax * 100) / 100,
		take_home: Math.round((gross_annual - total_tax) * 100) / 100,
	}
}

// Reverse: find gross salary that gives target take-home (binary search)
export const calculate_gross_from_take_home = (
	target_take_home: number,
	config: UkTaxConfig,
): PermanentBreakdown => {
	let low = target_take_home
	let high = target_take_home * 3

	for (let i = 0; i < 100; i++) {
		const mid = (low + high) / 2
		const result = calculate_permanent_take_home(mid, config)

		if (Math.abs(result.take_home - target_take_home) < 1) {
			return result
		}

		if (result.take_home < target_take_home) {
			low = mid
		} else {
			high = mid
		}
	}

	return calculate_permanent_take_home((low + high) / 2, config)
}

// Full comparison: day rate -> contractor take-home -> equivalent salary
export const calculate_contractor_vs_permanent = (
	day_rate: number,
	working_days: number,
	config: UkTaxConfig,
): ContractorVsPermanent => {
	const gross_annual = day_rate * working_days
	const contractor = calculate_contractor_take_home(
		gross_annual,
		config,
	)
	const equivalent_permanent = calculate_gross_from_take_home(
		contractor.take_home,
		config,
	)

	return {
		day_rate,
		working_days,
		contractor,
		equivalent_permanent,
	}
}
