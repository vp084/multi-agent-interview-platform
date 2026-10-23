/**
 * Calculates interview overall score and per-phase averages strictly in code.
 *
 * Rules:
 * - Greeting and closing phases are unscored (score: null).
 * - Warmup phase: weight 0.5.
 * - Other scored phases (resume, technical, behavioral): weight 1.0.
 * - Skipped/timed-out questions have score 0 and are included in the weighted average.
 * - Unscored questions (score: null) are ignored.
 * - Legacy interviews (no phase field): equal weights (1.0 each) across all scored questions.
 */
export function calculateInterviewScores(questions = []) {
    let weightedSum = 0;
    let totalWeight = 0;
    const phaseBuckets = {
        warmup: [],
        resume: [],
        technical: [],
        behavioral: [],
    };

    const hasAnyPhase = questions.some(q => Boolean(q.phase));

    for (const q of questions) {
        const sc = q.feedback?.score;
        if (typeof sc === "number" && sc !== null && !isNaN(sc)) {
            if (!hasAnyPhase) {
                // Legacy interviews without phase: equal weights (1.0 each)
                weightedSum += sc;
                totalWeight += 1;
            } else {
                const phase = q.phase;
                const weight = q.isFollowUp
                    ? 0.5
                    : (phase === "warmup" ? 0.5 : (phase === "greeting" || phase === "closing" ? 0 : 1.0));
                if (weight > 0) {
                    weightedSum += sc * weight;
                    totalWeight += weight;
                }
                if (phase && phaseBuckets[phase] !== undefined && weight > 0) {
                    phaseBuckets[phase].push({ score: sc, weight });
                }
            }
        }
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    const computeBucketAverage = (bucket) => {
        if (!bucket || bucket.length === 0) return null;
        const sumWeights = bucket.reduce((sum, item) => sum + item.weight, 0);
        if (sumWeights === 0) return null;
        const sumPoints = bucket.reduce((sum, item) => sum + (item.score * item.weight), 0);
        return Math.round(sumPoints / sumWeights);
    };

    const phaseScores = {
        warmup: computeBucketAverage(phaseBuckets.warmup),
        resume: computeBucketAverage(phaseBuckets.resume),
        technical: computeBucketAverage(phaseBuckets.technical),
        behavioral: computeBucketAverage(phaseBuckets.behavioral),
    };

    return { overallScore, phaseScores };
}
