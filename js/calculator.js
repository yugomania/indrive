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
    tripsPerDay = null,
    hoursPerDay = 8,
    daysPerWeek = 5,
    drivePeakHours = true
  }) {
    const city = this.config.CITIES[cityKey] || this.config.CITIES['lagos'];
    const vehicle = this.config.VEHICLE_TYPES[vehicleType] || this.config.VEHICLE_TYPES['sedan'];

    // Hours & Schedule
    const dailyHours = Math.max(1, Math.min(16, Number(hoursPerDay) || 8));
    const weeklyDays = Math.max(1, Math.min(7, Number(daysPerWeek) || 5));
    const weeklyHours = dailyHours * weeklyDays;
    const monthlyWeeks = 4.333; // Average weeks in a month
    const monthlyHours = weeklyHours * monthlyWeeks;

    // Multipliers
    const vehicleMult = vehicle.multiplier || 1.0;
    const peakMult = drivePeakHours ? 1.20 : 1.0;
    const commitmentBonus = workCommitment === 'fulltime' ? 1.05 : 1.0; // efficiency gains on full-time

    // Trips (Use target tripsPerDay if provided, or derive from active hours)
    const dailyTrips = Number(tripsPerDay) > 0 
      ? Math.max(1, Math.min(35, Math.round(Number(tripsPerDay))))
      : Math.max(1, Math.round(dailyHours * city.avgTripsPerHour));

    const totalTripsPerWeek = Math.round(dailyTrips * weeklyDays);
    const totalTripsPerMonth = Math.round(totalTripsPerWeek * monthlyWeeks);

    // Trip fare baseline with city & vehicle
    const avgFarePerTrip = city.baseTripFare * vehicleMult * peakMult * commitmentBonus;

    // Gross Revenue
    const monthlyGross = Math.round(totalTripsPerMonth * avgFarePerTrip);
    const weeklyGross = Math.round(monthlyGross / monthlyWeeks);
    const hourlyGross = monthlyHours > 0 ? Math.round(monthlyGross / monthlyHours) : 0;
    const activeDrivingDays = weeklyDays * monthlyWeeks;
    const dailyGross = activeDrivingDays > 0 ? Math.round(monthlyGross / activeDrivingDays) : 0;

    // Commissions (inDrive official rate is 13.6%, Competitors ~25%)
    const inDriveCommissionRate = city.inDriveCommissionRate !== undefined ? city.inDriveCommissionRate : 0.136;
    const competitorCommissionRate = city.competitorCommissionRate !== undefined ? city.competitorCommissionRate : 0.25;

    const inDriveFee = Math.round(monthlyGross * inDriveCommissionRate); // 13.6%
    const competitorFee = Math.round(monthlyGross * competitorCommissionRate); // ~25%
    const inDriveFeePercent = Math.round(inDriveCommissionRate * 100 * 10) / 10; // 13.6%
    const competitorFeePercent = Math.round(competitorCommissionRate * 100); // 25%

    // Operational expenses (fuel, mobile data, routine maintenance)
    const operationalExpenses = Math.round(monthlyGross * (city.fuelMaintenanceRatio || 0.22));

    // Net Take-Home pay
    const inDriveNetMonthly = Math.max(0, monthlyGross - inDriveFee - operationalExpenses);
    const competitorNetMonthly = Math.max(0, monthlyGross - competitorFee - operationalExpenses);
    const inDriveNetWeekly = Math.round(inDriveNetMonthly / monthlyWeeks);
    const inDriveNetDaily = activeDrivingDays > 0 ? Math.round(inDriveNetMonthly / activeDrivingDays) : 0;

    // Savings advantage: Keeping 86.4% vs 75%
    const extraMoneyKept = inDriveFee < competitorFee ? (competitorFee - inDriveFee) : 0;
    const extraPercent = competitorNetMonthly > 0 ? Math.round((extraMoneyKept / competitorNetMonthly) * 100) : 25;

    return {
      city,
      vehicle,
      dailyTrips,
      tripsPerDay: dailyTrips,
      dailyGross,
      inDriveNetDaily,
      hoursPerDay: dailyHours,
      daysPerWeek: weeklyDays,
      weeklyHours,
      monthlyHours: Math.round(monthlyHours),
      totalTripsPerMonth,
      totalTripsPerWeek,
      avgFarePerTrip: Math.round(avgFarePerTrip),
      monthlyGross,
      weeklyGross,
      hourlyGross,
      inDriveCommissionRate,
      inDriveFee,
      inDriveFeePercent,
      competitorCommissionRate,
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
