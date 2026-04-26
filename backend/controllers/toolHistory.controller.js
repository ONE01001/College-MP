import ToolHistory from "../models/toolHistory.model.js";

export const getToolHistoryList = async (req, res) => {
  try {
    const history = await ToolHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select("toolType routePath title inputPreview createdAt");

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching tool history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tool history.",
    });
  }
};

export const getToolHistoryById = async (req, res) => {
  try {
    const historyItem = await ToolHistory.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: "History item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: historyItem,
    });
  } catch (error) {
    console.error("Error fetching tool history item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tool history item.",
    });
  }
};
