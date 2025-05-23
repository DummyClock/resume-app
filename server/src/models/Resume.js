const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "JobDesc",
    },
    jobTitle: {
      type: String,
      required: false,
    },
    content: {
      type: Object,
    },
    careerHistory: {
      type: Object,
    },
    eduHistory:{
      type: Object,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUsed_format: {
      type: String,
      required: false,
    },
    lastUsed_templateId: {
      type: String,
      required: false,
    },
    lastUsed_styleId: {
      type: String,
      required: false,
    },
    last_formattedResumeId:
    {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);
