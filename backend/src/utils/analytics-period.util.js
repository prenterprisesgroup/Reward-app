class AnalyticsPeriodUtil {
  /**
   * Returns standard date ranges for analytics period comparisons.
   * @param {string} period - "today", "7d", "30d", "1y"
   * @returns {Object} { currentStart, currentEnd, previousStart, previousEnd, comparisonLabel, format }
   */
  static getPeriodDates(period) {
    const now = new Date();
    const currentEnd = new Date(now);
    let currentStart = new Date(now);
    let previousStart = new Date(now);
    let previousEnd = new Date(now);
    let comparisonLabel = "";
    let format = "%Y-%m-%d"; // default format for aggregation groupings

    switch (period) {
      case "today":
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        
        comparisonLabel = "yesterday";
        format = "%H:00"; // group by hour for today
        break;

      case "7d":
        currentStart.setDate(now.getDate() - 7);
        
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - 7);
        
        comparisonLabel = "previous_7d";
        format = "%Y-%m-%d";
        break;

      case "30d":
        currentStart.setDate(now.getDate() - 30);
        
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - 30);
        
        comparisonLabel = "previous_30d";
        format = "%Y-%m-%d";
        break;

      case "1y":
        currentStart.setFullYear(now.getFullYear() - 1);
        
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        
        previousStart = new Date(previousEnd);
        previousStart.setFullYear(previousStart.getFullYear() - 1);
        
        comparisonLabel = "previous_year";
        format = "%Y-%m"; // group by month for yearly
        break;

      default:
        throw new Error("INVALID_PERIOD");
    }

    return {
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
      comparisonLabel,
      format
    };
  }
}

module.exports = AnalyticsPeriodUtil;
