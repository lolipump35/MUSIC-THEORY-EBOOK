const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchases: [{ type: String }],
  preferredPlatform: { type: String, default: "spotify" },

  userCreatedModules: [
    {
      moduleKey: {
        type: String,
        required: true,
      },

      moduleRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
        default: null,
      },

      type: {
        type: String,
        enum: ["user"],
        default: "user",
      },

      startDate: {
        type: Date,
        default: Date.now,
      },

      programData: {
        name: String,
        daysPerWeek: Number,
        timePerWeek: Number,
        difficultyLevel: Number,

        completedDays: {
          type: [Number],
          default: [],
        },

        objectives: [
          {
            moduleId: String,
            id: String,
            objectif: String, // tu peux garder si tu veux, mais inutile pour le rendu
            objectiveTitle: String, // 👈 nouveau champ pour le titre visible
            assignedDays: { type: [Number], default: [] },
            coef: Number,
            difficultyLevel: Number,
            completedDays: { type: [Number], default: [] },
            isCompleted: { type: Boolean, default: false },
            timerProgress: { type: Number, default: 0 },
            exercises: { type: [String], default: [] },
          },
        ],

        trainingDays: [
          {
            dayNumber: Number,
            objectives: [
              {
                objectiveId: String,
                objectiveTitle: String, // 👈 nouveau champ
                isCompleted: { type: Boolean, default: false },
                timerProgress: { type: Number, default: 0 },
                exercises: { type: [String], default: [] },
                difficultyLevel: { type: Number, default: 4 }, // ajouté
                coef: { type: Number, default: 1 },
              },
            ],
          },
        ],
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
