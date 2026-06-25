const { AppVersion } = require("../models");
const HttpError = require("../utils/http-error");

async function createVersion(req, res, next) {
  try {
    const { version, forceUpdate, notes, platform } = req.body;

    if (!version) {
      throw new HttpError(400, "Version is required");
    }

    const appVersion = await AppVersion.create({
      version,
      forceUpdate: Boolean(forceUpdate),
      notes,
      platform: platform || "all",
    });

    res.status(201).json({ appVersion });
  } catch (error) {
    next(error);
  }
}

async function updateVersion(req, res, next) {
  try {
    const { versionId } = req.params;
    const { version, forceUpdate, notes, platform } = req.body;

    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion) {
      throw new HttpError(404, "App version not found");
    }

    if (version) appVersion.version = version;
    if (typeof forceUpdate === "boolean") appVersion.forceUpdate = forceUpdate;
    if (notes !== undefined) appVersion.notes = notes;
    if (platform) appVersion.platform = platform;

    await appVersion.save();

    res.json({ appVersion });
  } catch (error) {
    next(error);
  }
}

async function getLatestVersion(req, res, next) {
  try {
    const { platform } = req.query;
    const filter = {};

    if (platform) {
      filter.platform = { $in: [platform, "all"] };
    }

    const latest = await AppVersion.find(filter)
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();

    res.json({ latest: latest[0] || null });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVersion,
  updateVersion,
  getLatestVersion,
};
