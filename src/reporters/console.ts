export default (callResults: any[]) => {
  const metrics = {
    errors: 0,
    success: 0
  }
  callResults.forEach((call) => {
    if (call.error) {
      metrics.errors++;
      console.log('⛔️', call.method, 'ERROR:', call.error)
    } else {
      metrics.success++;
      console.log('✅', call.method)
    }
  })
  console.log('==========');
  console.log('Success: ', metrics.success);
  console.log('Errors: ', metrics.errors);
  console.log('==========');
};