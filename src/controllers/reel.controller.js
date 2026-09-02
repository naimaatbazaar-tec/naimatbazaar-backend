import Reel from '../models/reel.model.js';

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
export const getReels = async (req, res) => {
  try {
    const reels = await Reel.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: reels.length, data: reels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new reel
// @route   POST /api/admin/reels or /api/reels
// @access  Private/Admin
export const createReel = async (req, res) => {
  try {
    const { title, subtitle, desc, thumb, videoUrl, order } = req.body;
    const reel = await Reel.create({ title, subtitle, desc, thumb, videoUrl, order });

    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'New unboxing reel added' });
    }

    res.status(201).json({ success: true, data: reel });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a reel
// @route   PUT /api/admin/reels/:id
// @access  Private/Admin
export const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'Unboxing reel updated' });
    }

    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a reel
// @route   DELETE /api/admin/reels/:id
// @access  Private/Admin
export const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'Unboxing reel deleted' });
    }

    res.status(200).json({ success: true, message: 'Reel removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};