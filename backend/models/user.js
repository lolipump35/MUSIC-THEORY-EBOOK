const mongoose = require("mongoose");

const objectiveSchema = new mongoose.Schema({
  objectiveId: { type: String, required: true },
  objectiveTitle: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  timerProgress: { type: Number, default: 0 },
  difficultyLevel: { type: Number, default: 4 },
  coef: { type: Number, default: 1 },
  completedDays: { type: [Number], default: [] },
  exercises: { type: [String], default: [] },
});

const trainingDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  objectives: [objectiveSchema],
});

const programDataSchema = new mongoose.Schema({
  name: { type: String },
  daysPerWeek: { type: Number },
  timePerWeek: { type: Number },
  trainingDays: [trainingDaySchema],
});

const userCreatedModuleSchema = new mongoose.Schema({
  moduleKey: { type: String, required: true },
  moduleRef: { type: mongoose.Schema.Types.ObjectId, ref: "Module", default: null },
  type: { type: String, enum: ["user"], default: "user" },
  startDate: { type: Date, default: Date.now },
  programData: programDataSchema,
});

const assignedModuleSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
  assignedAt: { type: Date, default: Date.now },
  programData: { type: Object, default: {} },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchases: [{ type: String }],
  preferredPlatform: { type: String, default: "spotify" },
  userCreatedModules: [userCreatedModuleSchema],
  assignedModules: [assignedModuleSchema],
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

module.exports = mongoose.model("User", userSchema);
