const przelewy24Service = require('./przelewy24-service');

async function testPrzelewy24() {
  console.log('=== TEST PRZELEWY24 ===');
  
  try {
    const sessionId = `test_session_${Date.now()}`;
    const amount = 9.99;
    const currency = 'PLN';
    const description = 'Test płatności - Plan Premium';
    const email = 'test@example.com';
    const method = 'blik';
    
    console.log('Test parameters:', {
      sessionId,
      amount,
      currency,
      description,
      email,
      method
    });
    
    const result = await przelewy24Service.createPaymentForMethod(
      method, 
      amount, 
      currency, 
      description, 
      email, 
      sessionId
    );
    
    console.log('Test result:', result);
    
    if (result.success) {
      console.log('✅ Test passed!');
      console.log('Payment ID:', result.paymentId);
      console.log('Redirect URL:', result.redirectUrl);
    } else {
      console.log('❌ Test failed!');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testPrzelewy24(); 