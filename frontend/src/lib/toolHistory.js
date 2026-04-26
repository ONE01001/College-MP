export const TOOL_HISTORY_LABELS = {
  "notes-summary": "PDF Summary",
  "notes-generator": "PDF Notes",
  quiz: "Quiz",
  flashcards: "Flashcards",
  "study-plan": "Study Plan",
  "question-generator": "Question Generator",
};

export const fetchToolHistoryRecord = async (historyId) => {
  try {
    const response = await fetch(`/api/tools/history/${historyId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      return {
        success: false,
        message: data?.message || "Failed to load history item.",
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to load history item.",
    };
  }
};

export const formatHistoryDate = (value) => {
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};
