import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = '19291817';

async function syncAll() {
    if (!API_KEY) {
        console.error('PRINTIFY_API_KEY is missing in .env');
        return;
    }

    console.log(`Starting Deep Sync for Shop ${SHOP_ID}...`);

    try {
        // 1. Get all products from Printify
        const response = await axios.get(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json`, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        const products = response.data.data;
        console.log(`Found ${products.length} products. Triggering sync for each...`);

        // We trigger our local server's sync endpoint for each product
        // This ensures the logic in server.ts (which handles Supabase upserts) is reused
        const LOCAL_API = 'http://localhost:3000/api/printify/sync';

        for (const product of products) {
            console.log(`Syncing product: ${product.title} (${product.id})...`);
            try {
                await axios.post(`${LOCAL_API}/${product.id}`);
                console.log(`✅ ${product.title} synced.`);
            } catch (err: any) {
                console.error(`❌ Failed to sync ${product.title}:`, err.message);
            }
        }

        console.log('\n--- Sync Complete ---');
        console.log('Your Supabase database is now populated with all Printify products, variants, and mockups.');
    } catch (error: any) {
        console.error('Failed to fetch products from Printify:', error.response?.data || error.message);
    }
}

syncAll();
