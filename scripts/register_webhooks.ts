import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = '19291817'; // Based on previous context
const WEBHOOK_URL = process.env.APP_URL ? `${process.env.APP_URL}/api/webhooks/printify` : 'http://localhost:3000/api/webhooks/printify';

async function registerWebhooks() {
    if (!API_KEY) {
        console.error('PRINTIFY_API_KEY is missing');
        return;
    }

    console.log(`Registering webhooks for Shop ${SHOP_ID} with URL: ${WEBHOOK_URL}`);

    const topics = [
        'shop:product:published',
        'shop:product:updated',
        'shop:product:deleted'
    ];

    try {
        // 1. Get existing webhooks
        const existing = await axios.get(`https://api.printify.com/v1/shops/${SHOP_ID}/webhooks.json`, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });

        // 2. Clear old webhooks for this URL to avoid duplicates
        for (const hook of existing.data) {
            if (hook.url === WEBHOOK_URL) {
                await axios.delete(`https://api.printify.com/v1/shops/${SHOP_ID}/webhooks/${hook.id}.json`, {
                    headers: { Authorization: `Bearer ${API_KEY}` }
                });
                console.log(`Deleted old webhook: ${hook.id}`);
            }
        }

        // 3. Register new webhooks
        for (const topic of topics) {
            const response = await axios.post(`https://api.printify.com/v1/shops/${SHOP_ID}/webhooks.json`, {
                topic,
                url: WEBHOOK_URL
            }, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });
            console.log(`Registered topic: ${topic} (ID: ${response.data.id})`);
        }

        console.log('Webhook registration complete!');
    } catch (error: any) {
        console.error('Failed to register webhooks:', error.response?.data || error.message);
    }
}

registerWebhooks();
