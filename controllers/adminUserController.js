const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;

    const hasPagination = page && limit;

    if (hasPagination) {
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        User.countDocuments(filter),
      ]);

      return res.json({
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        users,
      });
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "User updated", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
