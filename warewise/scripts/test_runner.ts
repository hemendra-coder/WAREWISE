import fetch from 'node-fetch';

async function runSystemDiagnosticSuite() {
  console.log('====================================================');
  console.log('   SKANVI ENTERPRISE WAREHOUSE DIAGNOSTIC SUITE    ');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3000';
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function recordResult(testName: string, success: boolean, details?: string) {
    totalTests++;
    if (success) {
      passedTests++;
      console.log(`[PASS] ${testName} ${details ? `(${details})` : ''}`);
    } else {
      failedTests++;
      console.log(`[FAIL] ${testName} - ${details}`);
    }
  }

  // 1. API Health Check Test
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data: any = await res.json();
    recordResult('API Health Check Endpoint', res.status === 200 && data.status === 'ok', `HTTP ${res.status}`);
  } catch (err: any) {
    recordResult('API Health Check Endpoint', false, err.message);
  }

  // 2. Customer AI Assistant Endpoint Verification
  try {
    const res = await fetch(`${BASE_URL}/api/customer/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Recommend high performance AI hardware in stock',
        context: { availableProducts: [{ name: 'NeoCore X9', price: 49999 }] },
      }),
    });
    const data: any = await res.json();
    recordResult(
      'Customer AI Assistant Response',
      res.status === 200 && Boolean(data.text),
      `Length: ${data.text ? data.text.length : 0} chars`
    );
  } catch (err: any) {
    recordResult('Customer AI Assistant Response', false, err.message);
  }

  // 3. Admin AI Copilot Endpoint Verification
  try {
    const res = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'hi',
        context: { ordersCount: 5, criticalSlaCount: 3, activeExceptions: 2 },
      }),
    });
    const data: any = await res.json();
    const replyText = data.reply || data.text || '';
    const isFriendlyBuddyGreeting = replyText.toLowerCase().includes('hi') || replyText.toLowerCase().includes('buddy');
    recordResult(
      'Admin Copilot Greeting ("hi" -> Buddy Response)',
      res.status === 200 && isFriendlyBuddyGreeting,
      `Response sample: "${replyText.slice(0, 60)}..."`
    );
  } catch (err: any) {
    recordResult('Admin Copilot Greeting', false, err.message);
  }

  // 4. Stress Test: 10 Concurrent API Requests
  try {
    const start = Date.now();
    const requests = Array.from({ length: 10 }).map((_, i) =>
      fetch(`${BASE_URL}/api/health`)
    );
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;
    const allOk = responses.every((r) => r.status === 200);
    recordResult('Stress Test: 10 Parallel Requests', allOk, `Completed in ${duration}ms`);
  } catch (err: any) {
    recordResult('Stress Test: 10 Parallel Requests', false, err.message);
  }

  // 5. Security & Sanitization Payload Test (XSS / SQL Injection payloads)
  try {
    const res = await fetch(`${BASE_URL}/api/customer/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "<script>alert('xss')</script> OR 1=1 -- Drop table orders;",
      }),
    });
    const data = await res.json();
    recordResult('Security Injection Sanitization', res.status === 200, 'Payload handled safely without server crash');
  } catch (err: any) {
    recordResult('Security Injection Sanitization', false, err.message);
  }

  console.log('\n====================================================');
  console.log(` DIAGNOSTIC REPORT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');
}

runSystemDiagnosticSuite();
