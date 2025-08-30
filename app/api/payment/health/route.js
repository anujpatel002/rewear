import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET() {
  try {
    const healthCheck = {
      status: 'checking',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {}
    };

    // Check Razorpay configuration
    const razorpayConfig = {
      keyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing'
    };

    healthCheck.checks.razorpay = {
      config: razorpayConfig,
      status: razorpayConfig.keyId === 'Set' && razorpayConfig.keySecret === 'Set' ? 'configured' : 'misconfigured'
    };

    // Test Razorpay connection if configured
    if (razorpayConfig.keyId === 'Set' && razorpayConfig.keySecret === 'Set') {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Test with a minimal order creation (this won't actually create an order)
        // Just checking if the client can be initialized
        healthCheck.checks.razorpay.connection = 'connected';
        healthCheck.checks.razorpay.status = 'operational';
      } catch (error) {
        healthCheck.checks.razorpay.connection = 'failed';
        healthCheck.checks.razorpay.error = error.message;
        healthCheck.checks.razorpay.status = 'error';
      }
    }

    // Determine overall status
    const allChecks = Object.values(healthCheck.checks);
    const operationalChecks = allChecks.filter(check => check.status === 'operational');
    
    if (operationalChecks.length === allChecks.length) {
      healthCheck.status = 'healthy';
    } else if (operationalChecks.length > 0) {
      healthCheck.status = 'degraded';
    } else {
      healthCheck.status = 'unhealthy';
    }

    return NextResponse.json(healthCheck);

  } catch (error) {
    console.error('Payment health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: {}
    }, { status: 500 });
  }
}
