import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
    console.log('--- Starting Admin Data Seeding ---');

    // 1. Seed Services
    const services = [
        { title: 'Virtual Fitting Room', description: 'Experience our AI-powered dressing mirror.', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800', link: '/try-on' },
        { title: 'Beserve Tailoring', description: 'Custom-fitted garments crafted to your measurements.', image_url: 'https://images.unsplash.com/photo-1558230315-0678b8436cd9?q=80&w=800', link: '/services' },
        { title: 'Personal Stylist', description: 'Consult with our experts for your perfect look.', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800', link: '/contact' }
    ];
    await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('services').insert(services);
    console.log('✅ Services seeded');

    // 2. Seed Contact Messages
    const messages = [
        { name: 'Julianne Moore', email: 'j.moore@example.com', subject: 'Custom Order Inquiry', message: 'I would like to inquire about a custom velvet blazer for an upcoming gala.', is_read: false },
        { name: 'Alexander Wang', email: 'wang.a@example.com', subject: 'Shipping Update', message: 'When will the new collection be available for international shipping?', is_read: true },
        { name: 'Elena Gilbert', email: 'elena.g@mystic.com', subject: 'Return Request', message: 'The silk dress I received is slightly too large. Can I exchange it?', is_read: false }
    ];
    await supabase.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('contact_messages').insert(messages);
    console.log('✅ Contact Messages seeded');

    // 3. Seed Orders
    const orders = [
        { 
            customer_email: 'j.moore@example.com', 
            total: 1240.00, 
            items: JSON.stringify([{ id: 37, name: 'Midnight Velvet Blazer', quantity: 2, price: 449.99 }]),
            payment_status: 'Paid',
            fulfillment_status: 'Processing'
        },
        { 
            customer_email: 'wang.a@example.com', 
            total: 450.00, 
            items: JSON.stringify([{ id: 38, name: 'Silk Slip Dress', quantity: 1, price: 289.00 }]),
            payment_status: 'Paid',
            fulfillment_status: 'Shipped'
        }
    ];
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').insert(orders);
    console.log('✅ Orders seeded');

    // 4. Seed Newsletters
    const subscribers = [
        { email: 'fashionista@modern.com', status: 'Active' },
        { email: 'style.guide@vogue.it', status: 'Active' },
        { email: 'minimalist@luxury.com', status: 'Active' }
    ];
    await supabase.from('newsletters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('newsletters').insert(subscribers);
    console.log('✅ Newsletters seeded');

    // 5. Seed Banners
    const banners = [
        { title: 'The Ethereal Collection', subtitle: 'Experience the new standard of modern luxury.', image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000', button_text: 'Explore Now', link: '/collection', is_active: true },
        { title: 'AI Virtual Try-On', subtitle: 'The fitting room, reimagined for your home.', image_url: 'https://images.unsplash.com/photo-1558230315-0678b8436cd9?q=80&w=2000', button_text: 'Try It Now', link: '/try-on', is_active: true }
    ];
    await supabase.from('banners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('banners').insert(banners);
    console.log('✅ Banners seeded');

    console.log('--- Admin Data Seeding Complete ---');
}

seedAdmin().catch(console.error);
