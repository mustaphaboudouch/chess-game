const User = require('../models/user');
const Stripe = require('../lib/stripe');

function getSubscriptionPlan(user) {
	const isPro =
		user.stripePriceId &&
		user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now();
	return isPro ? 'PRO' : 'FREE';
}

/**
 * Create logged user stripe subscription
 */
async function subscribe(req, res) {
	try {
		const user = await User.findById(res.locals.user.userId);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const plan = getSubscriptionPlan(user);
		const billingUrl = `${process.env.CLIENT_URL}/profile`;

		// PRO Plan : create a portal session to manage subscription
		if (plan === 'PRO' && user.stripeCustomerId) {
			const stripeSession = await Stripe.billingPortal.sessions.create({
				customer: user.stripeCustomerId,
				return_url: billingUrl,
			});

			return res.status(200).json({ url: stripeSession.url });
		}

		// FREE Plan : create a portal session to manage subscription
		const stripeSession = await Stripe.checkout.sessions.create({
			success_url: billingUrl,
			cancel_url: billingUrl,
			payment_method_types: ['card'],
			mode: 'subscription',
			billing_address_collection: 'auto',
			customer_email: user.email,
			line_items: [
				{
					price: 'price_1NUwFfAlzW5ZDZ2bmmvHZTYf',
					quantity: 1,
				},
			],
			metadata: {
				userId: user.id,
			},
		});

		res.status(200).json({ url: stripeSession.url });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

/**
 * Stripe webhook
 */
async function webhook(req, res) {
	const payload = req.body;
	const signature = req.headers['stripe-signature'];
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

	let event;

	try {
		event = Stripe.webhooks.constructEvent(payload, signature, endpointSecret);
	} catch (error) {
		return res.status(400).json({ message: `Webhook Error: ${error.message}` });
	}

	const session = event.data.object;

	if (event.type === 'checkout.session.completed') {
		// Retrieve the subscription details from Stripe.
		const subscription = await Stripe.subscriptions.retrieve(
			session.subscription,
		);

		// Update the user stripe into in our database
		// Since this is the initial subscription, we need to update the subscription id and customer id
		await User.findByIdAndUpdate(session?.metadata?.userId, {
			stripeSubscriptionId: subscription.id,
			stripeCustomerId: subscription.customer,
			stripePriceId: subscription.items.data[0].price.id,
			stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
		});
	}

	if (event.type === 'invoice.payment_succeeded') {
		// Retrieve the subscription details from Stripe
		const subscription = await Stripe.subscriptions.retrieve(
			session.subscription,
		);

		// Update the price id and set the new period end
		await User.findOneAndUpdate(
			{ stripeSubscriptionId: subscription.id },
			{
				stripePriceId: subscription.items.data[0].price.id,
				stripeCurrentPeriodEnd: new Date(
					subscription.current_period_end * 1000,
				),
			},
		);
	}

	res.status(200).end();
}

module.exports = { subscribe, webhook };
