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
    drivePeakHours = true,
    fuelPricePerLiter = null
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

    // Fuel cost calculation (Nigeria PMS price calibrated at ₦1,400/L)
    const fuelPrice = Number(fuelPricePerLiter) > 0 
      ? Number(fuelPricePerLiter) 
      : (this.config.FUEL_PRICE_PER_LITER || 1400);

    // Fuel consumption in litres per driving hour (calibrated for Nigerian urban traffic with AC & idling)
    const litersPerHour = vehicle.fuelLitersPerHour || (
      vehicleType === 'moto' ? 0.55 :
      vehicleType === 'comfort' ? 2.35 :
      vehicleType === 'delivery' ? 2.10 : 1.85
    );

    // Peak hours traffic congestion increases idling and fuel burn by ~5%
    const peakTrafficFuelFactor = drivePeakHours ? 1.05 : 1.0;
    const monthlyFuelLiters = Math.round(monthlyHours * litersPerHour * peakTrafficFuelFactor);
    const monthlyFuelExpense = Math.round(monthlyFuelLiters * fuelPrice);
    const weeklyFuelExpense = Math.round(monthlyFuelExpense / monthlyWeeks);

    // Routine vehicle maintenance & mobile data (approx 7-8% of gross for oil change, brake pads, tires, data plan)
    const maintenanceRatio = city.maintenanceRatio || 0.08;
    const monthlyMaintenanceData = Math.round(monthlyGross * maintenanceRatio);

    // Total operational expenses (fuel expense + vehicle maintenance & mobile data)
    const operationalExpenses = monthlyFuelExpense + monthlyMaintenanceData;

    // Net Take-Home pay
    const inDriveNetMonthly = Math.max(0, monthlyGross - inDriveFee - operationalExpenses);
    const competitorNetMonthly = Math.max(0, monthlyGross - competitorFee - operationalExpenses);
    const inDriveNetWeekly = Math.round(inDriveNetMonthly / monthlyWeeks);
    const inDriveNetDaily = activeDrivingDays > 0 ? Math.round(inDriveNetMonthly / activeDrivingDays) : 0;

    // Savings advantage: With fuel at ₦1,400/L, keeping 86.4% vs 75% saves huge cash
    const extraMoneyKept = inDriveFee < competitorFee ? (competitorFee - inDriveFee) : 0;
    const extraPercent = competitorNetMonthly > 0 ? Math.round((extraMoneyKept / competitorNetMonthly) * 100) : 25;

    // Fuel support bonus equivalence: How many litres of petrol ₦20,000 gives the driver
    const bonusLitresEquivalent = Math.round((20000 / fuelPrice) * 10) / 10;

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
      fuelPricePerLiter: fuelPrice,
      litersPerHour,
      monthlyFuelLiters,
      monthlyFuelExpense,
      weeklyFuelExpense,
      monthlyMaintenanceData,
      operationalExpenses,
      inDriveNetMonthly,
      inDriveNetWeekly,
      competitorNetMonthly,
      extraMoneyKept,
      extraPercent,
      bonusLitresEquivalent,
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
