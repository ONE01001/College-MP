import mongoose from "mongoose";

const toolHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toolType: {
      type: String,
      required: true,
      enum: [
        "notes-summary",
        "notes-generator",
        "quiz",
        "flashcards",
        "study-plan",
        "question-generator",
      ],
      index: true,
    },
    routePath: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    inputPreview: { type: String, default: "" },
    inputData: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

toolHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ToolHistory", toolHistorySchema);
