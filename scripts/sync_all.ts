import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.PRINTIFY_API_KEY;

async function syncAll() {
    if (!API_KEY) {
        console.error('PRINTIFY_API_KEY is missing in .env');
        return;
    }

    try {
        console.log('Fetching shops...');
        const shopsResponse = await axios.get('https://api.printify.com/v1/shops.json', {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const shop = shopsResponse.data[0];
        if (!shop) {
            console.error('No shop found.');
            return;
        }

        const SHOP_ID = shop.id;
        console.log(`Starting Turbo Sync for Shop ${SHOP_ID} (${shop.title})...`);

        // 1. Get all products from Printify
        const response = await axios.get(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json`, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const products = response.data.data;
        console.log(`Found ${products.length} products. Triggering Parallel Turbo Sync...`);

        // We use the live production URL for the sync calls to ensure Vercel's database is updated
        const SYNC_ENDPOINT = 'https://store-aether.vercel.app/api/webhooks/printify';

        // Process in chunks of 5 to avoid overwhelming the serverless functions
        const CHUNK_SIZE = 5;
        for (let i = 0; i < products.length; i += CHUNK_SIZE) {
            const chunk = products.slice(i, i + CHUNK_SIZE);
            console.log(`Processing chunk ${i / CHUNK_SIZE + 1} (${chunk.length} products)...`);

            await Promise.all(chunk.map(async (product) => {
                console.log(`Syncing: ${product.title}...`);
                try {
                    // Mimic a webhook payload
                    await axios.post(SYNC_ENDPOINT, {
                        type: 'shop:product:updated',
                        data: { ...product, shop_id: SHOP_ID }
                    });
                    console.log(`✅ ${product.title} synced.`);
                } catch (err: any) {
                    console.error(`❌ Failed to sync ${product.title}:`, err.response?.data || err.message);
                }
            }));
        }

        console.log('\n--- Turbo Sync Complete ---');
        console.log('Your live storefront at https://store-aether.vercel.app is now fully updated.');
    } catch (error: any) {
        console.error('Turbo Sync Error:', error.response?.data || error.message);
    }
}

syncAll();
