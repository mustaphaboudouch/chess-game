function getSubscriptionPlan(user) {
	const isPro =
		user.stripePriceId &&
		user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now();
	return isPro ? 'PRO' : 'FREE';
}

module.exports = { getSubscriptionPlan };
