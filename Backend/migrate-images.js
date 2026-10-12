import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import dns from 'node:dns';
import Product from './models/product.js';
import cloudinary from './config/cloudinary.js';

dotenv.config();

// Use public DNS servers to fix SRV lookup issues on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uploadFromUrl = async (url, publicId) => {
  // Skip if already on Cloudinary
  if (url.includes('res.cloudinary.com')) {
    return { skipped: true, url, reason: 'already-cloudinary' };
  }

  // Skip base64 (too large to re-upload via this method — handle separately)
  if (url.startsWith('data:')) {
    return { skipped: true, url, reason: 'base64' };
  }

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'merogadget/products',
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return { success: true, url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    return { error: err.message, url };
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products\n`);
    console.log('─'.repeat(80));

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const num = String(i + 1).padStart(2, '0');
      const images = product.images || [];
      const primaryImage = product.image;

      console.log(`\n[${num}/${products.length}] ${product.name}`);

      if (images.length === 0 && !primaryImage) {
        console.log('   ⏭  No images to migrate');
        skipped++;
        continue;
      }

      const newImages = [];
      let migratedAny = false;

      // Migrate images array
      for (let j = 0; j < images.length; j++) {
        const img = images[j];
        const publicId = `prod_${product._id}_${j}`;

        if (img.includes('res.cloudinary.com')) {
          console.log(`   ⏭  Image ${j + 1}: already Cloudinary`);
          newImages.push(img);
          continue;
        }

        if (img.startsWith('data:')) {
          console.log(`   ⏭  Image ${j + 1}: base64 (skipped)`);
          newImages.push(img);
          continue;
        }

        console.log(`   ⬆️  Uploading image ${j + 1}...`);
        const result = await uploadFromUrl(img, publicId);

        if (result.success) {
          console.log(`   ✅ Image ${j + 1} → ${result.url.slice(0, 70)}...`);
          newImages.push(result.url);
          migratedAny = true;
        } else if (result.skipped) {
          newImages.push(img);
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
          newImages.push(img);
          failed++;
        }
      }

      // Migrate primary image field
      let newPrimary = primaryImage;
      if (primaryImage && !primaryImage.includes('res.cloudinary.com') && !primaryImage.startsWith('data:')) {
        const result = await uploadFromUrl(primaryImage, `prod_${product._id}_main`);
        if (result.success) {
          console.log(`   ✅ Main image → ${result.url.slice(0, 70)}...`);
          newPrimary = result.url;
          migratedAny = true;
        } else if (result.skipped) {
          // keep as-is
        } else {
          console.log(`   ❌ Main image failed: ${result.error}`);
          failed++;
        }
      }

      if (migratedAny) {
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              images: newImages,
              image: newPrimary || newImages[0] || ''
            }
          }
        );
        migrated++;
      } else {
        skipped++;
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n Summary:`);
    console.log(`   ✅ Migrated: ${migrated} products`);
    console.log(`   ⏭  Skipped:  ${skipped} products (already Cloudinary or no images)`);
    console.log(`   ❌ Failed:   ${failed} images\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

run();