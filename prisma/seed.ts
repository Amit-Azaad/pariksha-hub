import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.quizQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.questionAttempt.deleteMany();
  await prisma.questionTag.deleteMany();
  await prisma.questionTranslation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.note.deleteMany();
  await prisma.testSeries.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();
  await prisma.heroSection.deleteMany();

  // Create multiple users for notes
  const user1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      name: 'Rahul Kumar',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      name: 'Priya Sharma',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      name: 'Amit Patel',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  // Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@parikshahub.com',
      name: 'Admin User',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  // Create comprehensive list of exams
  const exams = await Promise.all([
    prisma.exam.create({
      data: { title: 'UPSC Civil Services Exam', imageUrl: 'https://picsum.photos/400/300?random=1' },
    }),
    prisma.exam.create({
      data: { title: 'SSC CGL (Combined Graduate Level)', imageUrl: 'https://picsum.photos/400/300?random=2' },
    }),
    prisma.exam.create({
      data: { title: 'IBPS PO (Probationary Officer)', imageUrl: 'https://picsum.photos/400/300?random=3' },
    }),
    prisma.exam.create({
      data: { title: 'SBI PO (Probationary Officer)', imageUrl: 'https://picsum.photos/400/300?random=4' },
    }),
    prisma.exam.create({
      data: { title: 'RBI Grade B Officer', imageUrl: 'https://picsum.photos/400/300?random=5' },
    }),
    prisma.exam.create({
      data: { title: 'CAT (Common Admission Test)', imageUrl: 'https://picsum.photos/400/300?random=6' },
    }),
    prisma.exam.create({
      data: { title: 'XAT (Xavier Aptitude Test)', imageUrl: 'https://picsum.photos/400/300?random=7' },
    }),
    prisma.exam.create({
      data: { title: 'SSC CHSL (Combined Higher Secondary)', imageUrl: 'https://picsum.photos/400/300?random=8' },
    }),
    prisma.exam.create({
      data: { title: 'Railway NTPC', imageUrl: 'https://picsum.photos/400/300?random=9' },
    }),
    prisma.exam.create({
      data: { title: 'Teaching Exams (CTET/TET)', imageUrl: 'https://picsum.photos/400/300?random=10' },
    }),
    prisma.exam.create({
      data: { title: 'Defense Exams (NDA/CDS)', imageUrl: 'https://picsum.photos/400/300?random=11' },
    }),
    prisma.exam.create({
      data: { title: 'State PSC Exams', imageUrl: 'https://picsum.photos/400/300?random=12' },
    }),
    prisma.exam.create({
      data: { title: 'Bank Clerk Exams', imageUrl: 'https://picsum.photos/400/300?random=13' },
    }),
    prisma.exam.create({
      data: { title: 'Insurance Exams (LIC/IRDA)', imageUrl: 'https://picsum.photos/400/300?random=14' },
    }),
    prisma.exam.create({
      data: { title: 'JEE Main & Advanced', imageUrl: 'https://picsum.photos/400/300?random=15' },
    }),
    prisma.exam.create({
      data: { title: 'NEET (Medical Entrance)', imageUrl: 'https://picsum.photos/400/300?random=16' },
    }),
    prisma.exam.create({
      data: { title: 'GATE (Graduate Aptitude Test)', imageUrl: 'https://picsum.photos/400/300?random=17' },
    }),
    prisma.exam.create({
      data: { title: 'CLAT (Common Law Admission Test)', imageUrl: 'https://picsum.photos/400/300?random=18' },
    }),
    prisma.exam.create({
      data: { title: 'AFCAT (Air Force Common Admission Test)', imageUrl: 'https://picsum.photos/400/300?random=19' },
    }),
    prisma.exam.create({
      data: { title: 'Coast Guard Exams', imageUrl: 'https://picsum.photos/400/300?random=20' },
    }),
  ]);

  // Create comprehensive test series for each exam
  const testSeriesData = [
    // UPSC
    { title: 'UPSC Prelims Test Series 2024', imageUrl: 'https://picsum.photos/400/300?random=21', examId: exams[0].id },
    { title: 'UPSC Mains Test Series', imageUrl: 'https://picsum.photos/400/300?random=22', examId: exams[0].id },
    { title: 'UPSC Current Affairs Tests', imageUrl: 'https://picsum.photos/400/300?random=23', examId: exams[0].id },
    { title: 'UPSC CSAT Practice Tests', imageUrl: 'https://picsum.photos/400/300?random=24', examId: exams[0].id },
    
    // SSC CGL
    { title: 'SSC CGL Tier 1 Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=25', examId: exams[1].id },
    { title: 'SSC CGL Tier 2 Practice', imageUrl: 'https://picsum.photos/400/300?random=26', examId: exams[1].id },
    { title: 'SSC CGL Quantitative Aptitude', imageUrl: 'https://picsum.photos/400/300?random=27', examId: exams[1].id },
    { title: 'SSC CGL English Language', imageUrl: 'https://picsum.photos/400/300?random=28', examId: exams[1].id },
    
    // IBPS PO
    { title: 'IBPS PO Prelims Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=29', examId: exams[2].id },
    { title: 'IBPS PO Mains Practice', imageUrl: 'https://picsum.photos/400/300?random=30', examId: exams[2].id },
    { title: 'IBPS PO Interview Preparation', imageUrl: 'https://picsum.photos/400/300?random=31', examId: exams[2].id },
    
    // SBI PO
    { title: 'SBI PO Prelims Test Series', imageUrl: 'https://picsum.photos/400/300?random=32', examId: exams[3].id },
    { title: 'SBI PO Mains Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=33', examId: exams[3].id },
    { title: 'SBI PO Group Exercises', imageUrl: 'https://picsum.photos/400/300?random=34', examId: exams[3].id },
    
    // RBI Grade B
    { title: 'RBI Grade B Phase 1 Tests', imageUrl: 'https://picsum.photos/400/300?random=35', examId: exams[4].id },
    { title: 'RBI Grade B Phase 2 Practice', imageUrl: 'https://picsum.photos/400/300?random=36', examId: exams[4].id },
    { title: 'RBI Grade B Interview Prep', imageUrl: 'https://picsum.photos/400/300?random=37', examId: exams[4].id },
    
    // CAT
    { title: 'CAT Quantitative Aptitude', imageUrl: 'https://picsum.photos/400/300?random=38', examId: exams[5].id },
    { title: 'CAT Verbal Ability Tests', imageUrl: 'https://picsum.photos/400/300?random=39', examId: exams[5].id },
    { title: 'CAT Data Interpretation', imageUrl: 'https://picsum.photos/400/300?random=40', examId: exams[5].id },
    { title: 'CAT Logical Reasoning', imageUrl: 'https://picsum.photos/400/300?random=41', examId: exams[5].id },
    
    // XAT
    { title: 'XAT Decision Making Tests', imageUrl: 'https://picsum.photos/400/300?random=42', examId: exams[6].id },
    { title: 'XAT General Knowledge', imageUrl: 'https://picsum.photos/400/300?random=43', examId: exams[6].id },
    { title: 'XAT Essay Writing Practice', imageUrl: 'https://picsum.photos/400/300?random=44', examId: exams[6].id },
    
    // SSC CHSL
    { title: 'SSC CHSL Tier 1 Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=45', examId: exams[7].id },
    { title: 'SSC CHSL Typing Test Practice', imageUrl: 'https://picsum.photos/400/300?random=46', examId: exams[7].id },
    
    // Railway NTPC
    { title: 'Railway NTPC CBT 1 Tests', imageUrl: 'https://picsum.photos/400/300?random=47', examId: exams[8].id },
    { title: 'Railway NTPC CBT 2 Practice', imageUrl: 'https://picsum.photos/400/300?random=48', examId: exams[8].id },
    
    // Teaching Exams
    { title: 'CTET Paper 1 Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=49', examId: exams[9].id },
    { title: 'CTET Paper 2 Practice', imageUrl: 'https://picsum.photos/400/300?random=50', examId: exams[9].id },
    { title: 'State TET Preparation', imageUrl: 'https://picsum.photos/400/300?random=51', examId: exams[9].id },
    
    // Defense Exams
    { title: 'NDA Mathematics Tests', imageUrl: 'https://picsum.photos/400/300?random=52', examId: exams[10].id },
    { title: 'NDA General Ability Tests', imageUrl: 'https://picsum.photos/400/300?random=53', examId: exams[10].id },
    { title: 'CDS English Tests', imageUrl: 'https://picsum.photos/400/300?random=54', examId: exams[10].id },
    { title: 'CDS Mathematics Practice', imageUrl: 'https://picsum.photos/400/300?random=55', examId: exams[10].id },
    
    // State PSC
    { title: 'Bihar PSC Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=56', examId: exams[11].id },
    { title: 'UP PSC Practice Tests', imageUrl: 'https://picsum.photos/400/300?random=57', examId: exams[11].id },
    { title: 'Maharashtra PSC Tests', imageUrl: 'https://picsum.photos/400/300?random=58', examId: exams[11].id },
    
    // Bank Clerk
    { title: 'IBPS Clerk Prelims Tests', imageUrl: 'https://picsum.photos/400/300?random=59', examId: exams[12].id },
    { title: 'SBI Clerk Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=60', examId: exams[12].id },
    
    // Insurance
    { title: 'LIC AAO Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=61', examId: exams[13].id },
    { title: 'IRDA Assistant Tests', imageUrl: 'https://picsum.photos/400/300?random=62', examId: exams[13].id },
    
    // JEE
    { title: 'JEE Main Physics Tests', imageUrl: 'https://picsum.photos/400/300?random=63', examId: exams[14].id },
    { title: 'JEE Main Chemistry Tests', imageUrl: 'https://picsum.photos/400/300?random=64', examId: exams[14].id },
    { title: 'JEE Main Mathematics Tests', imageUrl: 'https://picsum.photos/400/300?random=65', examId: exams[14].id },
    { title: 'JEE Advanced Mock Tests', imageUrl: 'https://picsum.photos/400/300?random=66', examId: exams[14].id },
    
    // NEET
    { title: 'NEET Biology Tests', imageUrl: 'https://picsum.photos/400/300?random=67', examId: exams[15].id },
    { title: 'NEET Physics Tests', imageUrl: 'https://picsum.photos/400/300?random=68', examId: exams[15].id },
    { title: 'NEET Chemistry Tests', imageUrl: 'https://picsum.photos/400/300?random=69', examId: exams[15].id },
    
    // GATE
    { title: 'GATE Computer Science Tests', imageUrl: 'https://picsum.photos/400/300?random=70', examId: exams[16].id },
    { title: 'GATE Mechanical Engineering', imageUrl: 'https://picsum.photos/400/300?random=71', examId: exams[16].id },
    { title: 'GATE Electrical Engineering', imageUrl: 'https://picsum.photos/400/300?random=72', examId: exams[16].id },
    
    // CLAT
    { title: 'CLAT English Tests', imageUrl: 'https://picsum.photos/400/300?random=73', examId: exams[17].id },
    { title: 'CLAT Legal Reasoning', imageUrl: 'https://picsum.photos/400/300?random=74', examId: exams[17].id },
    { title: 'CLAT Logical Reasoning', imageUrl: 'https://picsum.photos/400/300?random=75', examId: exams[17].id },
    
    // AFCAT
    { title: 'AFCAT General Awareness', imageUrl: 'https://picsum.photos/400/300?random=76', examId: exams[18].id },
    { title: 'AFCAT Verbal Ability', imageUrl: 'https://picsum.photos/400/300?random=77', examId: exams[18].id },
    { title: 'AFCAT Numerical Ability', imageUrl: 'https://picsum.photos/400/300?random=78', examId: exams[18].id },
    
    // Coast Guard
    { title: 'Coast Guard Yantrik Tests', imageUrl: 'https://picsum.photos/400/300?random=79', examId: exams[19].id },
    { title: 'Coast Guard Navik Tests', imageUrl: 'https://picsum.photos/400/300?random=80', examId: exams[19].id },
  ];

  await prisma.testSeries.createMany({
    data: testSeriesData,
  });

  // Create comprehensive notes
  const notesData = [
    // User 1 Notes
    { title: 'Indian Polity Complete Notes', imageUrl: 'https://picsum.photos/400/300?random=81', userId: user1.id },
    { title: 'Indian Economy Shortcuts', imageUrl: 'https://picsum.photos/400/300?random=82', userId: user1.id },
    { title: 'Geography Important Points', imageUrl: 'https://picsum.photos/400/300?random=83', userId: user1.id },
    { title: 'History Timeline Notes', imageUrl: 'https://picsum.photos/400/300?random=84', userId: user1.id },
    { title: 'Science & Technology Notes', imageUrl: 'https://picsum.photos/400/300?random=85', userId: user1.id },
    { title: 'Current Affairs 2024', imageUrl: 'https://picsum.photos/400/300?random=86', userId: user1.id },
    { title: 'Environment & Ecology', imageUrl: 'https://picsum.photos/400/300?random=87', userId: user1.id },
    { title: 'Art & Culture Notes', imageUrl: 'https://picsum.photos/400/300?random=88', userId: user1.id },
    
    // User 2 Notes
    { title: 'Quantitative Aptitude Formulas', imageUrl: 'https://picsum.photos/400/300?random=89', userId: user2.id },
    { title: 'Reasoning Shortcuts', imageUrl: 'https://picsum.photos/400/300?random=90', userId: user2.id },
    { title: 'English Grammar Rules', imageUrl: 'https://picsum.photos/400/300?random=91', userId: user2.id },
    { title: 'Vocabulary Building', imageUrl: 'https://picsum.photos/400/300?random=92', userId: user2.id },
    { title: 'Data Interpretation Tricks', imageUrl: 'https://picsum.photos/400/300?random=93', userId: user2.id },
    { title: 'Computer Awareness', imageUrl: 'https://picsum.photos/400/300?random=94', userId: user2.id },
    { title: 'Banking Awareness', imageUrl: 'https://picsum.photos/400/300?random=95', userId: user2.id },
    { title: 'Financial Awareness', imageUrl: 'https://picsum.photos/400/300?random=96', userId: user2.id },
    
    // User 3 Notes
    { title: 'JEE Physics Formulas', imageUrl: 'https://picsum.photos/400/300?random=97', userId: user3.id },
    { title: 'JEE Chemistry Reactions', imageUrl: 'https://picsum.photos/400/300?random=98', userId: user3.id },
    { title: 'JEE Mathematics Theorems', imageUrl: 'https://picsum.photos/400/300?random=99', userId: user3.id },
    { title: 'NEET Biology Diagrams', imageUrl: 'https://picsum.photos/400/300?random=100', userId: user3.id },
    { title: 'NEET Physics Concepts', imageUrl: 'https://picsum.photos/400/300?random=101', userId: user3.id },
    { title: 'NEET Chemistry Notes', imageUrl: 'https://picsum.photos/400/300?random=102', userId: user3.id },
    { title: 'GATE CS Algorithms', imageUrl: 'https://picsum.photos/400/300?random=103', userId: user3.id },
    { title: 'GATE CS Data Structures', imageUrl: 'https://picsum.photos/400/300?random=104', userId: user3.id },
    { title: 'CAT Verbal Notes', imageUrl: 'https://picsum.photos/400/300?random=105', userId: user3.id },
    { title: 'CAT Quant Notes', imageUrl: 'https://picsum.photos/400/300?random=106', userId: user3.id },
    { title: 'CLAT Legal Terms', imageUrl: 'https://picsum.photos/400/300?random=107', userId: user3.id },
    { title: 'CLAT Constitution Notes', imageUrl: 'https://picsum.photos/400/300?random=108', userId: user3.id },
  ];

  await prisma.note.createMany({
    data: notesData,
  });

  // Create sample questions
  const questionsData: Array<{
    questionType: string;
    category: string;
    difficulty: string;
    isActive: boolean;
    translations: Array<{
      language: string;
      questionText: string;
      explanation: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOptionKey: string;
    }>;
    tags: string[];
  }> = [
    // UPSC Questions
    {
      questionType: 'MCQ',
      category: 'Indian Polity',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'Which article of the Indian Constitution deals with the Right to Education?',
          explanation: 'Article 21A was inserted by the 86th Constitutional Amendment Act, 2002 to provide free and compulsory education to all children aged 6-14 years.',
          optionA: 'Article 21A',
          optionB: 'Article 45',
          optionC: 'Article 51A',
          optionD: 'Article 350',
          correctOptionKey: 'A'
        }
      ],
      tags: ['Constitution', 'Education', 'Fundamental Rights']
    },
    {
      questionType: 'MCQ',
      category: 'Indian Economy',
      difficulty: 'easy',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the full form of GDP?',
          explanation: 'GDP stands for Gross Domestic Product, which measures the total value of goods and services produced within a country in a specific time period.',
          optionA: 'Gross Domestic Product',
          optionB: 'Gross Development Product',
          optionC: 'General Domestic Product',
          optionD: 'General Development Product',
          correctOptionKey: 'A'
        }
      ],
      tags: ['Economics', 'GDP', 'Basic Concepts']
    },
    {
      questionType: 'MCQ',
      category: 'Geography',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'Which is the highest peak in India?',
          explanation: 'K2 (Mount Godwin-Austen) is the highest peak in India, located in the Karakoram Range. However, it is administered by Pakistan.',
          optionA: 'Mount Everest',
          optionB: 'K2',
          optionC: 'Kangchenjunga',
          optionD: 'Nanda Devi',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Geography', 'Mountains', 'India']
    },
    // SSC Questions
    {
      questionType: 'MCQ',
      category: 'Quantitative Aptitude',
      difficulty: 'easy',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is 15% of 200?',
          explanation: '15% of 200 = (15/100) × 200 = 30',
          optionA: '25',
          optionB: '30',
          optionC: '35',
          optionD: '40',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Mathematics', 'Percentage', 'Basic Math']
    },
    {
      questionType: 'MCQ',
      category: 'English Language',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'Choose the correct synonym for "Eloquent":',
          explanation: 'Eloquent means fluent or persuasive in speaking or writing, which is synonymous with articulate.',
          optionA: 'Silent',
          optionB: 'Articulate',
          optionC: 'Quiet',
          optionD: 'Shy',
          correctOptionKey: 'B'
        }
      ],
      tags: ['English', 'Vocabulary', 'Synonyms']
    },
    // Banking Questions
    {
      questionType: 'MCQ',
      category: 'Banking Awareness',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What does RBI stand for?',
          explanation: 'RBI stands for Reserve Bank of India, which is the central bank of India.',
          optionA: 'Reserve Bank of India',
          optionB: 'Regional Bank of India',
          optionC: 'Royal Bank of India',
          optionD: 'Reserve Banking Institution',
          correctOptionKey: 'A'
        }
      ],
      tags: ['Banking', 'RBI', 'Financial Institutions']
    },
    // JEE Questions
    {
      questionType: 'MCQ',
      category: 'Physics',
      difficulty: 'hard',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the SI unit of electric current?',
          explanation: 'The SI unit of electric current is the Ampere (A), named after André-Marie Ampère.',
          optionA: 'Volt',
          optionB: 'Ampere',
          optionC: 'Ohm',
          optionD: 'Watt',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Physics', 'Electricity', 'SI Units']
    },
    {
      questionType: 'MCQ',
      category: 'Chemistry',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the chemical symbol for gold?',
          explanation: 'The chemical symbol for gold is Au, derived from the Latin word "aurum".',
          optionA: 'Ag',
          optionB: 'Au',
          optionC: 'Fe',
          optionD: 'Cu',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Chemistry', 'Elements', 'Symbols']
    },
    {
      questionType: 'MCQ',
      category: 'Mathematics',
      difficulty: 'hard',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the derivative of x²?',
          explanation: 'The derivative of x² is 2x, using the power rule of differentiation.',
          optionA: 'x',
          optionB: '2x',
          optionC: 'x²',
          optionD: '2x²',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Mathematics', 'Calculus', 'Derivatives']
    }
  ];

  // Create questions with translations and tags
  const createdQuestions: any[] = [];
  for (const questionData of questionsData) {
    const { translations, tags, ...questionFields } = questionData;
    
    const question = await prisma.question.create({
      data: {
        ...questionFields,
        translations: {
          create: translations
        },
        tags: {
          create: tags.map(tag => ({ tag }))
        }
      }
    });
    createdQuestions.push(question);
  }

  // Create sample quizzes
  const quizzesData = [
    {
      title: 'UPSC Prelims Practice Test 1',
      description: 'A comprehensive test covering Indian Polity, Economy, and Geography',
      type: 'practice',
      timeLimit: 60,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [0, 1, 2] // First 3 questions
    },
    {
      title: 'SSC CGL Quantitative Aptitude',
      description: 'Practice questions for SSC CGL quantitative section',
      type: 'practice',
      timeLimit: 45,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [3] // 4th question
    },
    {
      title: 'Banking Awareness Quiz',
      description: 'Test your knowledge of banking and financial institutions',
      type: 'assessment',
      timeLimit: 30,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [5] // 6th question
    },
    {
      title: 'JEE Main Physics Test',
      description: 'Advanced physics questions for JEE Main preparation',
      type: 'practice',
      timeLimit: 90,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [6, 7, 8] // Last 3 questions
    },
    {
      title: 'Mixed Category Quiz',
      description: 'Questions from various categories for general practice',
      type: 'practice',
      timeLimit: 75,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [0, 3, 5, 7] // Mixed selection
    }
  ];

  // Create quizzes with questions
  const createdQuizzes = [];
  for (const quizData of quizzesData) {
    const { questions, ...quizFields } = quizData;
    
    const quiz = await prisma.quiz.create({
      data: {
        ...quizFields,
        questions: {
          create: questions.map((questionIndex, order) => ({
            questionId: createdQuestions[questionIndex].id,
            order: order + 1,
            points: 1
          }))
        }
      }
    });
    createdQuizzes.push(quiz);
  }

  // Hero Sections (carousel)
  await prisma.heroSection.createMany({
    data: [
      {
        imageUrl: 'https://picsum.photos/600/220?random=201',
        text: 'Welcome to Pariksha Hub! Prepare for your exams with the best resources.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=202',
        text: 'Join our comprehensive test series and boost your confidence.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=203',
        text: 'Get expert notes and shortcuts for quick revision.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=204',
        text: 'Practice with thousands of questions across all major exams.'
      },
      {
        imageUrl: 'https://picsum.photos/600/220?random=205',
        text: 'Track your progress with detailed analytics and performance reports.'
      }
    ]
  });

  console.log('Database seeded successfully!');
  console.log(`Created ${exams.length} exams`);
  console.log(`Created ${testSeriesData.length} test series`);
  console.log(`Created ${notesData.length} notes`);
  console.log(`Created ${createdQuestions.length} questions`);
  console.log(`Created ${createdQuizzes.length} quizzes`);
  console.log(`Created 4 users (including admin)`);
  console.log(`Created 5 hero sections`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 