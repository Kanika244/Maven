export interface PersonaOption {
  answer_id: number;
  answer: string;
  score: number;
}

export interface PersonaQuestion {
  question_id: number;
  question: string;
  options: PersonaOption[];
}

export const personaQuestions: PersonaQuestion[] = [
  {
    question_id: 1,
    question: "What is your investment goal?",
    options: [
      {
        answer_id: 1,
        answer: "Retirement",
        score: 2,
      },
      {
        answer_id: 2,
        answer: "Asset Purchase",
        score: 3,
      },
      {
        answer_id: 3,
        answer: "Wealth Creation",
        score: 4,
      },
      {
        answer_id: 4,
        answer: "Other",
        score: 2,
      },
    ],
  },

  {
    question_id: 2,
    question: "For how long are you planning to invest?",
    options: [
      {
        answer_id: 5,
        answer: "Short Term (1–3 years)",
        score: 1,
      },
      {
        answer_id: 6,
        answer: "Medium Term (3–7 years)",
        score: 2,
      },
      {
        answer_id: 7,
        answer: "Long Term (7+ years)",
        score: 4,
      },
    ],
  },

  {
    question_id: 3,
    question: "What is the amount you are planning to invest initially?",
    options: [
      {
        answer_id: 8,
        answer: "Below ₹10,000",
        score: 1,
      },
      {
        answer_id: 9,
        answer: "₹10,000 – ₹25,000",
        score: 2,
      },
      {
        answer_id: 10,
        answer: "₹25,000 – ₹50,000",
        score: 3,
      },
      {
        answer_id: 11,
        answer: "Above ₹50,000",
        score: 4,
      },
    ],
  },

  {
    question_id: 4,
    question: "How familiar are you with stock markets and investing?",
    options: [
      {
        answer_id: 12,
        answer: "Not familiar at all",
        score: 1,
      },
      {
        answer_id: 13,
        answer: "Somewhat familiar",
        score: 2,
      },
      {
        answer_id: 14,
        answer: "Comfortable with markets",
        score: 3,
      },
      {
        answer_id: 15,
        answer: "Very experienced investor",
        score: 4,
      },
    ],
  },

  {
    question_id: 5,
    question: "What percentage of your monthly income do you invest?",
    options: [
      {
        answer_id: 16,
        answer: "Less than 5%",
        score: 1,
      },
      {
        answer_id: 17,
        answer: "5–15%",
        score: 2,
      },
      {
        answer_id: 18,
        answer: "15–30%",
        score: 3,
      },
      {
        answer_id: 19,
        answer: "More than 30%",
        score: 4,
      },
    ],
  },

  {
    question_id: 6,
    question: "What is your primary investment objective?",
    options: [
      {
        answer_id: 20,
        answer: "Preserve capital at all costs",
        score: 1,
      },
      {
        answer_id: 21,
        answer: "Earn steady income",
        score: 2,
      },
      {
        answer_id: 22,
        answer: "Balanced growth",
        score: 3,
      },
      {
        answer_id: 23,
        answer: "Aggressive capital growth",
        score: 4,
      },
    ],
  },

  {
    question_id: 7,
    question:
      "How would you react if your portfolio lost 20% of its value in one month?",
    options: [
      {
        answer_id: 24,
        answer: "Sell everything immediately",
        score: 1,
      },
      {
        answer_id: 25,
        answer: "Sell some and move to safer assets",
        score: 2,
      },
      {
        answer_id: 26,
        answer: "Hold and wait for recovery",
        score: 3,
      },
      {
        answer_id: 27,
        answer: "Buy more at the lower price",
        score: 4,
      },
    ],
  },

  {
    question_id: 8,
    question: "Which statement best describes your investment style?",
    options: [
      {
        answer_id: 28,
        answer: "I avoid investment risks whenever possible.",
        score: 1,
      },
      {
        answer_id: 29,
        answer: "I prefer moderate, stable returns.",
        score: 2,
      },
      {
        answer_id: 30,
        answer: "I can tolerate some volatility for better returns.",
        score: 3,
      },
      {
        answer_id: 31,
        answer: "I actively seek high-risk, high-reward opportunities.",
        score: 4,
      },
    ],
  },
];