export type Topic = {
  title: string;
  content: string;
  example?: string;
};

export type Unit = {
  key: string;
  unit: string;
  title: string;
  emoji: string;
  topics: Topic[];
};

export const APTITUDE_UNITS: Unit[] = [
  {
    key: "numbers",
    unit: "UNIT 1",
    title: "Number System",
    emoji: "🔢",
    topics: [
      {
        title: "Introduction to Number System",
        content: "A number system is a way of representing numbers using digits or symbols. The decimal system (base 10) is the most common.",
      },
      {
        title: "Classification of Numbers",
        content: "Numbers are broadly classified into Natural, Whole, Integers, Rational, Irrational, Real and Complex numbers.",
      },
      {
        title: "Natural Numbers (N)",
        content: "Counting numbers starting from 1. N = {1, 2, 3, 4, ...}",
      },
      {
        title: "Whole Numbers (W)",
        content: "Natural numbers including 0. W = {0, 1, 2, 3, ...}",
      },
      {
        title: "Integers (Z)",
        content: "All positive and negative whole numbers including zero. Z = {..., -3, -2, -1, 0, 1, 2, 3, ...}",
      },
      {
        title: "Rational Numbers (Q)",
        content: "Numbers expressible as p/q where q ≠ 0. Examples: 1/2, 0.75, -3, 0.333...",
      },
      {
        title: "Odd & Even Numbers",
        content: "Even: divisible by 2 (2, 4, 6...). Odd: not divisible by 2 (1, 3, 5...).",
      },
      {
        title: "Prime Numbers",
        content: "Numbers greater than 1 with only two factors: 1 and itself. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23...",
      },
      {
        title: "Composite Numbers",
        content: "Numbers with more than two factors. Examples: 4, 6, 8, 9, 10, 12...",
      },
      {
        title: "Divisibility Rules",
        content: "By 2: last digit even. By 3: sum of digits divisible by 3. By 4: last two digits divisible by 4. By 5: ends in 0 or 5. By 6: divisible by 2 and 3. By 8: last three digits divisible by 8. By 9: sum of digits divisible by 9. By 10: ends in 0. By 11: difference between sum of alternate digits is 0 or divisible by 11.",
        example: "12321: (1+3+1)-(2+2)=5-4=1 → not divisible by 11. 121: (1+1)-(2)=0 → divisible by 11.",
      },
      {
        title: "Concept of Division",
        content: "Dividend = Divisor × Quotient + Remainder",
        example: "17 ÷ 5 → Quotient=3, Remainder=2 → 17 = 5×3 + 2 ✓",
      },
      {
        title: "LCM (Least Common Multiple)",
        content: "Smallest number divisible by all given numbers. Find by prime factorization or division method.",
        example: "LCM of 12, 18 → 12=2²×3, 18=2×3² → LCM=2²×3²=36",
      },
      {
        title: "HCF / GCD (Highest Common Factor)",
        content: "Largest number that divides all given numbers. Find by prime factorization or Euclidean algorithm.",
        example: "HCF of 24, 36 → 24=2³×3, 36=2²×3² → HCF=2²×3=12",
      },
      {
        title: "Properties of LCM & HCF",
        content: "Product of two numbers = LCM × HCF. HCF of co-prime numbers = 1. HCF always divides LCM.",
        example: "12 × 18 = 216 = 36 × 6 ✓",
      },
      {
        title: "Applications of LCM & HCF",
        content: "LCM: ringing bells together, circular tracks meeting point. HCF: largest tile size, distributing items equally.",
      },
    ],
  },
  {
    key: "problems",
    unit: "UNIT 2",
    title: "Problems on Numbers",
    emoji: "🧮",
    topics: [
      {
        title: "Digits and Numbers",
        content: "A digit is any symbol from 0–9. Numbers are formed by combining digits in specific positions.",
      },
      {
        title: "Place Value System",
        content: "Each digit's value depends on its position: ones, tens, hundreds, thousands, etc.",
        example: "In 3527 → place value of 5 = 500, face value of 5 = 5.",
      },
      {
        title: "Formation of Numbers",
        content: "A 2-digit number with tens digit a and units digit b = 10a + b. A 3-digit number = 100a + 10b + c.",
      },
      {
        title: "Sum of Digits",
        content: "Add all digits of the number.",
        example: "Sum of digits of 4587 = 4+5+8+7 = 24.",
      },
      {
        title: "Product of Digits",
        content: "Multiply all digits.",
        example: "Product of digits of 235 = 2×3×5 = 30.",
      },
      {
        title: "Reversing Digits",
        content: "Read digits from right to left.",
        example: "Reverse of 1234 = 4321.",
      },
      {
        title: "Interchanging Digits",
        content: "If 2-digit number = 10a+b, after swapping = 10b+a. Difference = 9(a-b).",
        example: "73 → 37, difference = 36 = 9×4.",
      },
      {
        title: "Finding the Original Number",
        content: "Use given conditions (sum/difference of digits, reversal) to set equations and solve.",
      },
      {
        title: "BODMAS Rule",
        content: "Order of operations: Brackets → Of → Division → Multiplication → Addition → Subtraction.",
        example: "12 + 4×3 - 2 = 12 + 12 - 2 = 22.",
      },
      {
        title: "Simplification Techniques",
        content: "Always solve innermost brackets first: ( ) → { } → [ ]. Apply BODMAS at each step.",
        example: "25 - [12 - {6 - (4-2)}] = 25 - [12 - {6-2}] = 25 - [12-4] = 25 - 8 = 17... carefully → 19",
      },
      {
        title: "Logical Number Problems",
        content: "Translate word problems into algebraic equations and solve step by step.",
        example: "Sum=25, Difference=5 → numbers are 15 and 10.",
      },
    ],
  },
  {
    key: "percentage",
    unit: "UNIT 3",
    title: "Percentage",
    emoji: "💯",
    topics: [
      {
        title: "Introduction to Percentage",
        content: "Percent means 'per hundred'. The symbol is %. x% = x/100.",
      },
      {
        title: "Percentage ↔ Fraction Conversion",
        content: "% to fraction: divide by 100. Fraction to %: multiply by 100.",
        example: "25% = 25/100 = 1/4. 3/5 = 0.6 × 100 = 60%.",
      },
      {
        title: "Basic Formulas",
        content: "x% of y = (x/100) × y. To find what % a is of b: (a/b) × 100.",
        example: "25% of 200 = (25/100)×200 = 50.",
      },
      {
        title: "Percentage Increase",
        content: "% Increase = ((New - Old) / Old) × 100.",
        example: "Price 100 → 120: increase = (20/100)×100 = 20%.",
      },
      {
        title: "Percentage Decrease",
        content: "% Decrease = ((Old - New) / Old) × 100.",
        example: "Price 80 → 60: decrease = (20/80)×100 = 25%.",
      },
      {
        title: "Successive Percentage Change",
        content: "Net % change for a%, b% = a + b + (ab/100).",
        example: "+10% then -10% → 10 - 10 + (-100/100) = -1% (net loss).",
      },
      {
        title: "Shortcut Equivalents",
        content: "1% = 1/100, 10% = 1/10, 12.5% = 1/8, 20% = 1/5, 25% = 1/4, 33⅓% = 1/3, 50% = 1/2.",
      },
      {
        title: "Comparison of Percentages",
        content: "If A is x% more than B, then B is (x/(100+x))×100 % less than A.",
        example: "A is 25% more than B → B is (25/125)×100 = 20% less than A.",
      },
      {
        title: "Applications",
        content: "Used in marks, exam scores, population growth, salary hikes, taxes, and discounts.",
      },
    ],
  },
  {
    key: "profitloss",
    unit: "UNIT 4",
    title: "Profit and Loss",
    emoji: "💰",
    topics: [
      {
        title: "Introduction",
        content: "When SP > CP → Profit. When SP < CP → Loss. When SP = CP → No profit, no loss.",
      },
      {
        title: "Cost Price (CP)",
        content: "Price at which an article is purchased (including overhead expenses).",
      },
      {
        title: "Selling Price (SP)",
        content: "Price at which an article is sold to the customer.",
      },
      {
        title: "Profit / Gain",
        content: "Profit = SP - CP (when SP > CP).",
        example: "CP=100, SP=120 → Profit=20.",
      },
      {
        title: "Loss",
        content: "Loss = CP - SP (when CP > SP).",
        example: "CP=200, SP=180 → Loss=20.",
      },
      {
        title: "Profit Percentage",
        content: "Profit % = (Profit / CP) × 100.",
        example: "Profit=20, CP=100 → Profit%=20%.",
      },
      {
        title: "Loss Percentage",
        content: "Loss % = (Loss / CP) × 100.",
        example: "Loss=20, CP=200 → Loss%=10%.",
      },
      {
        title: "Marked Price (MP)",
        content: "The price labelled on an article (also called list price). Discounts are applied on MP.",
      },
      {
        title: "Discount",
        content: "Discount = MP - SP. Discount % = (Discount / MP) × 100.",
        example: "MP=500, Discount=10% → SP = 500 - 50 = 450.",
      },
      {
        title: "CP, SP & % Relationship",
        content: "SP = CP × (100 + Profit%) / 100. SP = CP × (100 - Loss%) / 100. CP = SP × 100 / (100 ± %).",
        example: "SP=240, Profit%=20 → CP = 240×100/120 = 200.",
      },
      {
        title: "Successive Discount",
        content: "For two successive discounts a% and b%: Net discount = a + b - (ab/100).",
        example: "20% then 25% → 20+25-(500/100) = 40%.",
      },
      {
        title: "Real-Life Applications",
        content: "Used in shopping, business analytics, billing, sales tax, and trade calculations.",
      },
    ],
  },
];
