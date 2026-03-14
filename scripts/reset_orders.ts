import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function resetOrders() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('Connected to Postgres.');
    
    // Check if table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    
    if (res.rows[0].exists) {
      await client.query('TRUNCATE TABLE public.orders CASCADE;');
      console.log('Successfully truncated the orders table.');
    } else {
      console.log('Orders table does not exist.');
    }
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting database:', err);
    process.exit(1);
  }
}

resetOrders();
