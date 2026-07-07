require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');
const fs = require('fs');

async function runTest() {
  try {
    console.log("=== CLOUDINARY TEST SCRIPT ===");
    
    // 1. Create a dummy image file (1x1 pixel base64 PNG) to simulate upload
    const dummyImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    
    console.log("\n[1] Uploading dummy image to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(dummyImageBase64, {
      folder: 'reward-app/test-folder',
      public_id: 'test_image_123',
    });
    console.log("Upload Success!");
    console.log("Public ID:", uploadResult.public_id);
    console.log("Secure URL:", uploadResult.secure_url);

    // 2. Fetch the image details using admin API
    console.log("\n[2] Fetching image details from Cloudinary...");
    const fetchResult = await cloudinary.api.resource(uploadResult.public_id);
    console.log("Fetch Success!");
    console.log("Format:", fetchResult.format);
    console.log("Size:", fetchResult.bytes, "bytes");

    // 3. Update the image (e.g., add tags or change public_id)
    console.log("\n[3] Updating image tags...");
    const updateResult = await cloudinary.api.update(uploadResult.public_id, {
      tags: ['test_tag', 'reward_app']
    });
    console.log("Update Success!");
    console.log("New Tags:", updateResult.tags);

    // 4. Delete the image
    console.log("\n[4] Deleting image from Cloudinary...");
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log("Delete Result:", deleteResult);
    
    if (deleteResult.result === 'ok') {
        console.log("Delete Success!");
    } else {
        console.log("Delete Failed or Not Found!");
    }
    
    console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");

  } catch (error) {
    console.error("\n[ERROR] Cloudinary Test Failed!");
    console.error(error);
  }
}

runTest();
