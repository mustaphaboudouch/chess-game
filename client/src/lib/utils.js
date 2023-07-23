function getSubscriptionPlan(user) {
  const isPro =
    user.stripePriceId && new Date(user.stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now();
  return isPro ? "PRO" : "FREE";
}

export { getSubscriptionPlan };
