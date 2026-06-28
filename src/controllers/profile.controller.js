const User = require('../models/user.model');
const { uploadToCloudinary } = require('../middleware/upload');

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const photoUrl = await uploadToCloudinary(req.file);

    // Update user's profile photo URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhotoUrl: photoUrl },
      { new: true, runValidators: true }
    ).select('-passwordHash -otpCode -otpExpiresAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile photo uploaded successfully',
      user: {
        id: user._id,
        name: user.name,
        profilePhotoUrl: user.profilePhotoUrl
      }
    });
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
};

// Remove profile photo
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhotoUrl: null },
      { new: true }
    ).select('-passwordHash -otpCode -otpExpiresAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile photo removed successfully',
      user: {
        id: user._id,
        name: user.name,
        profilePhotoUrl: null
      }
    });
  } catch (error) {
    console.error('Error removing profile photo:', error);
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
};

module.exports = {
  uploadProfilePhoto,
  removeProfilePhoto
};
