// Square Integration
const express = require("express");
const router = express.Router();
const { paymentsApi } = require("square");
const { v4: uuidv4 } = require("uuid");

router.post("/create-checkout-session", async (req, res) => {
  const { programId, email } = req.body;

  const programData = {
    'teen-programs': { name: 'Teen Programs', price: 150.0 },
    'adult-programs': { name: 'Adult Programs', price: 280.0 },
  };

  const selectedProgram = programData[programId];
  if (!selectedProgram) return res.status(400).json({ error: "Invalid program" });

  const client = new paymentsApi.PaymentsApi(new square.Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: square.Environment.Sandbox,
  }));

  try {
    const response = await client.createPaymentLink({
      idempotencyKey: uuidv4(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: [{
          name: selectedProgram.name,
          quantity: "1",
          basePriceMoney: {
            amount: selectedProgram.price * 100,
            currency: "USD"
          }
        }]
      },
      checkoutOptions: [{
        redirectUrl: `${process.env.FRONTEND_URL}/payment/success?programId=${programId}`
      }]
    });

    res.json({ url: response.result.paymentLink.url });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;