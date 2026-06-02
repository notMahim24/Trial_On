import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ERROR: Mising VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Open SQLite DB
const db = new Database("ecommerce.db");

// 1. Export Products
const products = db.prepare("SELECT * FROM products").all();

// 2. Export Categories
const categories = db.prepare("SELECT * FROM categories").all();

// 3. Export Orders
const orders = db.prepare("SELECT * FROM orders").all();

async function migrate() {
    console.log('Starting Migration to Supabase...');

    // --- MIGRATING PRODUCTS ---
    if (products.length > 0) {
        console.log(`Migrating ${products.length} Products...`);
        const { error } = await supabase.from('products').upsert(
            products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                category: p.category,
                image: p.image,
                video: p.video,
                description: p.description,
                color: p.color,
                size: p.size,
                is_available: p.is_available,
                image2: p.image2,
                image3: p.image3,
                image4: p.image4,
                image5: p.image5,
                video2: p.video2,
                size_chart: p.size_chart
            }))
        );

        if (error) {
            console.error('Error migrating products:', error);
        } else {
            console.log('✅ Products migrated successfully.');
        }
    }

    // --- MIGRATING CATEGORIES ---
    if (categories.length > 0) {
        console.log(`Migrating ${categories.length} Categories...`);
        const { error } = await supabase.from('categories').upsert(
            categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                parentId: c.parentId,
                image: c.image
            }))
        );
        if (error) {
            console.error('Error migrating categories:', error);
        } else {
            console.log('✅ Categories migrated successfully.');
        }
    }

    // --- MIGRATING ORDERS ---
    if (orders.length > 0) {
        console.log(`Migrating ${orders.length} Orders...`);
        const { error } = await supabase.from('orders').upsert(
            orders.map((o: any) => ({
                id: o.id,
                customer_email: o.customer_email,
                total: o.total,
                items: o.items,
                created_at: o.created_at
            }))
        );
        if (error) {
            console.error('Error migrating orders:', error);
        } else {
            console.log('✅ Orders migrated successfully.');
        }
    }

    console.log('Migration Complete.');
}

migrate();
