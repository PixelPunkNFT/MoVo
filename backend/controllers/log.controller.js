const Log = require('../models/Log.model');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, action, userId, search, startDate, endDate, severity } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (userId) filter.user = userId;
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .populate('user', 'firstName lastName email profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const categories = await Log.distinct('category');
    const actions = await Log.distinct('action');

    res.json({
      success: true,
      data: {
        logs,
        total,
        page: page * 1,
        totalPages: Math.ceil(total / limit),
        categories,
        actions,
      },
    });
  } catch (error) {
    console.error('Errore getLogs:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero dei log' });
  }
};

exports.getLogStats = async (req, res) => {
  try {
    const [byCategory, byAction, last24h] = await Promise.all([
      Log.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Log.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      Log.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

    res.json({ success: true, data: { byCategory, byAction, last24h } });
  } catch (error) {
    console.error('Errore getLogStats:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero statistiche log' });
  }
};
