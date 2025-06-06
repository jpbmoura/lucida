import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  questionCount: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  type: {
    type: Object,
    required: true,
  },
  questions: [
    {
      type: Object,
      required: true,
    },
  ],
  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Exam = mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
export { ExamSchema };
