import ToolHistory from "../models/toolHistory.model.js";

export const saveToolHistory = async ({
  userId,
  toolType,
  routePath,
  title,
  inputPreview = "",
  inputData = {},
  outputData,
}) => {
  try {
    if (!userId || !toolType || !routePath || !title || !outputData) {
      return null;
    }

    return await ToolHistory.create({
      userId,
      toolType,
      routePath,
      title,
      inputPreview,
      inputData,
      outputData,
    });
  } catch (error) {
    console.error("Failed to save tool history:", error);
    return null;
  }
};
