const { getSubscriptionPlan } = require('../../lib/subscription');

describe('getSubscriptionPlan function', () => {
  it('should return "FREE" when user is not a PRO subscriber', () => {
    const user = {
      stripePriceId: null,
      stripeCurrentPeriodEnd: new Date(Date.now() - 86_400_000),
    };

    const plan = getSubscriptionPlan(user);
    expect(plan).toBe('FREE');
  });

  it('should return "PRO" when user is a PRO subscriber', () => {
    const user = {
      stripePriceId: 'some_stripe_price_id',
      stripeCurrentPeriodEnd: new Date(Date.now() + 86_400_000),
    };

    const plan = getSubscriptionPlan(user);
    expect(plan).toBe('PRO');
  });
});
