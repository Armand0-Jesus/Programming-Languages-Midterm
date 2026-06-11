package main.java;

import org.teavm.jso.JSBody;

public final class PriorityBridgeEntry {
    private PriorityBridgeEntry() {
    }

    public static void main(String[] args) {
        exposeBridge();
    }

    @JSBody(script = "window.JavaPriorityBridge = {"
            + " calculateScore: function(urgency, difficulty, daysLeft) {"
            + "   return javaMethods.get('main.java.PriorityBridgeEntry.calculateScore(III)D').invoke(urgency, difficulty, daysLeft);"
            + " },"
            + " getPriorityLabel: function(score) {"
            + "   return javaMethods.get('main.java.PriorityBridgeEntry.getPriorityLabel(D)Ljava/lang/String;').invoke(score);"
            + " }"
            + "};")
    private static native void exposeBridge();

    public static double calculateScore(int urgency, int difficulty, int daysLeft) {
        return PriorityCalculator.calculateScore(urgency, difficulty, daysLeft);
    }

    public static String getPriorityLabel(double score) {
        return PriorityCalculator.toPriorityLabel(score);
    }
}
