import ImageKit from '@imagekit/nodejs';
import config from '../config/config.js';


const imagekit = new ImageKit({
    // Use clear naming from your .env file
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});


if (!config.IMAGEKIT_PRIVATE_KEY) {
    console.warn('⚠️ Warning: ImageKit credentials missing. Uploads will fail.');
}

export default imagekit;