const {
  calculateOvulationDayByCycle,
  getFertilityWindow,
  getBaseProbability
} = require('../src/services/prediction');

describe('Prediction Service', () => {
  describe('calculateOvulationDayByCycle', () => {
    it('should calculate ovulation day 14 days before next period', () => {
      const lastPeriodStart = new Date('2026-03-01');
      const ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, 28);

      expect(ovulationDay.toISOString().split('T')[0]).toBe('2026-03-15');
    });

    it('should handle custom cycle length', () => {
      const lastPeriodStart = new Date('2026-03-01');
      const ovulationDay = calculateOvulationDayByCycle(lastPeriodStart, 30);

      expect(ovulationDay.toISOString().split('T')[0]).toBe('2026-03-17');
    });
  });

  describe('getFertilityWindow', () => {
    it('should return 7-day fertility window', () => {
      const ovulationDay = new Date('2026-03-15');
      const window = getFertilityWindow(ovulationDay);

      expect(window.start.toISOString().split('T')[0]).toBe('2026-03-10'); // -5 days
      expect(window.end.toISOString().split('T')[0]).toBe('2026-03-16');    // +1 day
    });
  });

  describe('getBaseProbability', () => {
    it('should return 60% on ovulation day', () => {
      expect(getBaseProbability(0)).toBe(0.60);
    });

    it('should return 50% one day before ovulation', () => {
      expect(getBaseProbability(-1)).toBe(0.50);
    });

    it('should return 20% five days before ovulation', () => {
      expect(getBaseProbability(-5)).toBe(0.20);
    });

    it('should return 0% more than 5 days before ovulation', () => {
      expect(getBaseProbability(-6)).toBe(0);
    });

    it('should return decreasing probability after ovulation', () => {
      expect(getBaseProbability(1)).toBe(0.30);
      expect(getBaseProbability(2)).toBe(0.10);
      expect(getBaseProbability(3)).toBe(0);
    });
  });
});