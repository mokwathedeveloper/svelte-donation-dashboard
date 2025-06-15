import { json } from '@sveltejs/kit';
import { connectDB } from '$lib/db/mongodb';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    await connectDB();

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Check application health
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      database: {
        status: 'connected',
        type: 'MongoDB'
      },
      services: {
        api: 'operational',
        authentication: 'operational',
        payments: 'operational',
        database: 'connected'
      },
      checks: {
        lastUpdated: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }
    };

    return json(healthStatus, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected',
        type: 'MongoDB'
      },
      services: {
        api: 'degraded',
        authentication: 'unknown',
        payments: 'unknown'
      }
    };

    return json(errorStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
};
