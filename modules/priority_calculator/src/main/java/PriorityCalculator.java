package main.java;

public class PriorityCalculator {
    public static double calculateScore(int urgency, int difficulty, int daysLeft) {
        int safeDays = Math.max(daysLeft, 1);
        return (urgency * 0.5) + (difficulty * 0.3) + ((10.0 / safeDays) * 0.2);
    }

    public static String toPriorityLabel(double score) {
        if (score >= 8) {
            return "HIGH";
        }
        if (score >= 5) {
            return "MEDIUM";
        }
        return "LOW";
    }

    public static String calculate(String taskName, int urgency, int difficulty, int daysLeft) {
        double score = calculateScore(urgency, difficulty, daysLeft);
        return toPriorityLabel(score);
    }
}
