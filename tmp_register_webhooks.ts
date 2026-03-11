import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

const API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = '19291817';
const WEBHOOK_URL = 'https://store-aether.vercel.app/api/webhooks/printify';

async function register() {
    const topics = ['shop:product:updated', 'shop:product:deleted'];

    for (const topic of topics) {
        try {
            console.log(`Registering ${topic}...`);
            const res = await axios.post(
                `https://api.printify.com/v1/shops/${SHOP_ID}/webhooks.json`,
                { url: WEBHOOK_URL, topic },
                { headers: { Authorization: `Bearer ${API_KEY}` } }
            );
            console.log(`✅ Success for ${topic}:`, res.data);
        } catch (err: any) {
            console.error(`❌ Failed for ${topic}:`, err.response?.data || err.message);
        }
    }
}

register();
