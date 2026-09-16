/**
 * inDrive Driver Monthly Earnings Calculation Engine
 */

class EarningsCalculator {
  constructor(config = CONFIG) {
    this.config = config;
  }

  calculate({
    cityKey = 'lagos',
    workCommitment = 'fulltime', // 'parttime' or 'fulltime'
    vehicleType = 'sedan',
    hoursPerDay = 8,
    daysPerWeek = 5,
    drivePeakHours = true
  }) {
    const city = this.config.CITIES[cityKey] || this.config.CITIES['lagos'];
    const vehicle = this.config.VEHICLE_TYPES[vehicleType] || this.config.VEHICLE_TYPES['sedan'];

    // Hours
    const dailyHours = Math.max(1, Math.min(16, Number(hoursPerDay) || 8));
    const weeklyDays = Math.max(1, Math.min(7, Number(daysPerWeek) || 5));
    const weeklyHours = dailyHours * weeklyDays;
    const monthlyWeeks = 4.333; // Average weeks in a month
    const monthlyHours = weeklyHours * monthlyWeeks;

    // Multipliers
    const vehicleMult = vehicle.multiplier;
    const peakMult = drivePeakHours ? 1.20 : 1.0;
    const commitmentBonus = workCommitment === 'fulltime' ? 1.05 : 1.0; // efficiency gains on full-time

    // Trips
    const totalTripsPerMonth = Math.round(monthlyHours * city.avgTripsPerHour);
    const totalTripsPerWeek = Math.round(weeklyHours * city.avgTripsPerHour);

    // Trip fare baseline with city & vehicle
    const avgFarePerTrip = city.baseTripFare * vehicleMult * peakMult * commitmentBonus;

    // Gross Revenue
    const monthlyGross = Math.round(totalTripsPerMonth * avgFarePerTrip);
    const weeklyGross = Math.round(monthlyGross / monthlyWeeks);
    const hourlyGross = monthlyHours > 0 ? Math.round(monthlyGross / monthlyHours) : 0;

    // Commissions
    const inDriveFee = Math.round(monthlyGross * city.inDriveCommissionRate); // ~14%
    const competitorFee = Math.round(monthlyGross * city.competitorCommissionRate); // ~25%
    const inDriveFeePercent = Math.round(city.inDriveCommissionRate * 100 * 10) / 10;
    const competitorFeePercent = Math.round(city.competitorCommissionRate * 100);

    // Operational expenses (fuel, data, maintenance)
    const operationalExpenses = Math.round(monthlyGross * city.fuelMaintenanceRatio);

    // Net Take-Home pay
    const inDriveNetMonthly = Math.max(0, monthlyGross - inDriveFee - operationalExpenses);
    const competitorNetMonthly = Math.max(0, monthlyGross - competitorFee - operationalExpenses);
    const inDriveNetWeekly = Math.round(inDriveNetMonthly / monthlyWeeks);

    // Savings advantage
    const extraMoneyKept = inDriveFee < competitorFee ? (competitorFee - inDriveFee) : 0;
    const extraPercent = competitorNetMonthly > 0 ? Math.round((extraMoneyKept / competitorNetMonthly) * 100) : 25;

    return {
      city,
      vehicle,
      hoursPerDay: dailyHours,
      daysPerWeek: weeklyDays,
      weeklyHours,
      monthlyHours: Math.round(monthlyHours),
      totalTripsPerMonth,
      totalTripsPerWeek,
      monthlyGross,
      weeklyGross,
      hourlyGross,
      inDriveFee,
      inDriveFeePercent,
      competitorFee,
      competitorFeePercent,
      operationalExpenses,
      inDriveNetMonthly,
      inDriveNetWeekly,
      competitorNetMonthly,
      extraMoneyKept,
      extraPercent,
      currency: city.currency,
      currencyCode: city.currencyCode
    };
  }

  formatCurrency(amount, currency = '₦') {
    return `${currency}${Number(amount || 0).toLocaleString('en-US')}`;
  }
}

// Attach to window or module
if (typeof window !== 'undefined') {
  window.EarningsCalculator = EarningsCalculator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EarningsCalculator };
}
