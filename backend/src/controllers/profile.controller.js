const User = require('../models/user.model');
const { uploadToCloudinary } = require('../middleware/upload');
const presentUser = require('../utils/user-presenter');
const { logAudit } = require('../utils/audit');
const logger = require('../utils/logger');

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const photoUrl = await uploadToCloudinary(req.file);

    const userBefore = await User.findById(req.user._id || req.user.id);
    const user = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      { profilePhotoUrl: photoUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userBefore) {
      await logAudit(req, 'PROFILE_UPDATED', user._id, user.company, { profilePhotoUrl: userBefore.profilePhotoUrl }, { profilePhotoUrl: user.profilePhotoUrl });
    }

    res.json({
      user: presentUser(user),
    });
  } catch (error) {
    logger.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
};

// Remove profile photo
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      { profilePhotoUrl: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: presentUser(user),
    });
  } catch (error) {
    logger.error('Error removing profile photo:', error);
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
};

module.exports = {
  uploadProfilePhoto,
  removeProfilePhoto
};
