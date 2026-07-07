const PlatformSettings = require("../models/platform-settings.model");

class PlatformSettingsService {
  constructor() {
    this.cachedSettings = null;
  }

  async getSettings() {
    if (this.cachedSettings) {
      return this.cachedSettings;
    }

    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    this.cachedSettings = settings.toObject();
    return this.cachedSettings;
  }

  async updateSettings(updates, actorId) {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    // Merge partial updates
    if (updates.general) Object.assign(settings.general, updates.general);
    if (updates.rewards) Object.assign(settings.rewards, updates.rewards);
    if (updates.withdrawals) Object.assign(settings.withdrawals, updates.withdrawals);
    if (updates.featureFlags) Object.assign(settings.featureFlags, updates.featureFlags);
    
    settings.version += 1;
    settings.updatedBy = actorId;

    const savedSettings = await settings.save();
    
    // Invalidate Cache
    this.cachedSettings = savedSettings.toObject();
    return this.cachedSettings;
  }
}

// Export as a singleton
module.exports = new PlatformSettingsService();
