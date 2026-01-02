module.exports = function recalculateDayObjectivesTime({
  trainingDay,
  timePerWeek,
  totalDays,
}) {
  const totalSecondsForDay = Math.round(
    (timePerWeek * 60) / totalDays
  );

  const objectives = trainingDay.objectives;

  if (!objectives || objectives.length === 0) return objectives;

  // 1️⃣ Calcul des poids
  const objectivesWithWeight = objectives.map((o) => {
    const difficulty = o.difficultyLevel ?? o.baseDifficultyLevel ?? 4;
    const coef = o.coef ?? 1;

    // 🔥 Difficulty inversée (1 = dur, 7 = facile)
    const difficultyFactor = 1 + ((7 - difficulty) / 6) * 2;
    const weight = coef * difficultyFactor;

    return { obj: o, weight };
  });

  const totalWeight = objectivesWithWeight.reduce(
    (sum, o) => sum + o.weight,
    0
  );

  // 2️⃣ Répartition du temps
  objectivesWithWeight.forEach(({ obj, weight }) => {
    const seconds = Math.round(
      (weight / totalWeight) * totalSecondsForDay
    );

    // ⛔ on ne touche PAS au timer en cours s’il tourne
    obj.baseEstimatedSeconds = seconds;
    obj.estimatedSeconds = seconds;

    if (!obj.isRunning) {
      obj.remainingSeconds = seconds;
      obj.timerProgress = seconds;
    }
  });

  return objectives;
};
