import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = '19291817';
const URLS = [
    'https://store-aether.vercel.app/api/webhooks/printify',
    'https://store-aether.vercel.app/api/webhooks/printify/'
];

async function register() {
    for (const url of URLS) {
        console.log(`Trying URL: ${url}`);
        try {
            const res = await axios.post(
                `https://api.printify.com/v1/shops/${SHOP_ID}/webhooks.json`,
                { url: url, topic: 'shop:product:updated' },
                { headers: { Authorization: `Bearer ${API_KEY}` } }
            );
            console.log(`✅ Success for ${url}:`, res.data);
            return; // Stop if one works
        } catch (err: any) {
            console.error(`❌ Failed for ${url}:`, err.response?.data || err.message);
        }
    }
}

register();
