import orderModel from "../models/orderModel.js";

export const getSalesAnalytics = async (req, res) => {
  try {
    let { startDate, endDate } = req.body;

    // If no dates provided, set to extremes
    const start = startDate
      ? new Date(startDate).getTime()
      : 0;
    const end = endDate
      ? new Date(endDate).setHours(23, 59, 59, 999)
      : Date.now();

    // Match on your `date` field (timestamp in ms) & only paid orders
    const sales = await orderModel.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          payment: true
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $project: {
          _id: 1,
          items: 1,
          amount: 1,
          address: 1,
          date: 1
        }
      }
    ]);

    return res.json({ success: true, analytics: sales });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
