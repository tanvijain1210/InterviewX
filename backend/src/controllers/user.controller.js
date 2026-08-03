import User from "../models/user.model.js";

const getCurrentUser = async (req, res) => {
  try {
    // 1. Get userId directly (req.userId was set by the middleware)
    const userId = req.userId;

    // 2. Fetch user by primary key (_id)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Return user data as JSON
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default getCurrentUser;