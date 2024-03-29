const MollitiaPrometheus = require('@mollitia/prometheus');
const Mollitia = require('mollitia');

const { Circuit, Fallback, SlidingCountBreaker, BreakerState } = Mollitia;

Mollitia.use(new MollitiaPrometheus.PrometheusAddon());

const config = {
  name: 'appCounter',
  slidingWindowSize: 6, // Failure Rate Calculation
  minimumNumberOfCalls: 3, // 3 iterations are needed to start
  failureRateThreshold: 60,
  slowCallDurationThreshold: 500,
  slowCallRateThreshold: 50,
  permittedNumberOfCallsInHalfOpenState: 2,
  openStateDelay: 10000,
  halfOpenStateMaxDelay: 30000,
};

const slidingCountBreaker = new SlidingCountBreaker(config);

// Create fallback
const fallback = new Fallback({
  callback(err) {
    // Every time the method rejects, You can filter here
    if (err) {
      return err;
    }

    return 0;
  },
});

/**
 * Creates a circuit breaker
 * Usage: await buildCircuitBreaker('Circuit Name', 'some_circuit')
 *          .fn(yourFunction).execute('dummy');
 * @param {*} circuitName
 * @param {*} prometheusName
 * @returns
 */
const buildCircuit = (circuitName, prometheusName = 'circuit_breaker') =>
  new Circuit({
    name: circuitName,
    options: {
      prometheus: {
        name: prometheusName,
      },
      modules: [slidingCountBreaker, fallback],
    },
  });

module.exports = {
  BreakerState,
  buildCircuit,
};
