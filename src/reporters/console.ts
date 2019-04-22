import colors from 'colors';

export default (callResults: any[]) => {
  const metrics = {
    errors: 0,
    success: 0
  }
  callResults.forEach((call) => {
    if (call.error) {
      metrics.errors++;
      console.log(colors.red.underline('Error: '), colors.cyan(call.method));
      console.log(call.error);
      console.log(call.params);
    } else {
      metrics.success++;
      console.log(colors.green('Success: '), call.method)
    }
  })
  console.log('==========');
  console.log('Success: ', colors.green(metrics.success.toString()));
  console.log('Errors: ', colors.red(metrics.errors.toString()));
  console.log('==========');
};
