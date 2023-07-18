const User = require('../models/user');

/**
 * Check if user is subscribed in PRO plan
 */
async function isSubscribed(req, res, next) {
	const user = await User.findById(res.locals.user.userId);

	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	const isPro =
		user.stripePriceId &&
		user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now();

	if (!isPro) {
		return res.status(401).json({ message: 'Not subscribed' });
	}

	next();
}

module.exports = isSubscribed;
