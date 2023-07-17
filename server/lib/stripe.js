const stripe = require('stripe');

const Stripe = stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2022-11-15',
});

module.exports = Stripe;
