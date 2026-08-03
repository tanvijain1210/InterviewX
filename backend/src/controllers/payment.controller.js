import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;
    
    // Extract userId matching what isAuth attaches (req.userId)
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request context.",
      });
    }

    if (!amount || !credits) {
      return res.status(400).json({
        success: false,
        message: "Amount and credits are required.",
      });
    }

    // Razorpay accepts amount in paisa (1 INR = 100 paisa)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        userId: userId.toString(),
        planId: planId || "custom",
        credits: credits.toString(),
      },
    };

    // 1. Create order on Razorpay
    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate Razorpay order.",
      });
    }

    // 2. Save order in MongoDB
    const newPayment = await Payment.create({
      userId, // Now correctly receives the user ID string or ObjectId
      planId: planId || "custom",
      amount: Number(amount),
      credits: Number(credits),
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });

    // 3. Return order details
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      paymentId: newPayment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error while creating order.",
    });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters.",
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified and credits applied.",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (isAuthentic) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = "paid";
      await payment.save();

      await User.findByIdAndUpdate(
        payment.userId,
        { $inc: { credit: payment.credits } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully and credits added.",
        creditsAdded: payment.credits,
      });
    } else {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }
  } catch (error) {
    console.error("Error verifying order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during payment verification.",
    });
  }
};