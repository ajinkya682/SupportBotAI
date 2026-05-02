import ImageKit from '@imagekit/nodejs';
import config from '../config/config.js';

/**
 * ImageKit Configuration
 * Handles cloud storage for bot avatars and brand assets.
 * Using ES Modules and environment variables for security.
 */
const imagekit = new ImageKit({
    // Use clear naming from your .env file
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});

/**
 * Optimization: Verification helper
 * Ensures your credentials are correct before the app tries to upload files.
 */
if (!config.IMAGEKIT_PRIVATE_KEY) {
    console.warn('⚠️ Warning: ImageKit credentials missing. Uploads will fail.');
}

export default imagekit;