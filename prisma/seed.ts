import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.questionAttempt.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.questionTag.deleteMany();
  await prisma.questionTranslation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.note.deleteMany();
  await prisma.testSeries.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();
  await prisma.heroSection.deleteMany();

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
      data: { title: 'CLAT (Law Entrance)', imageUrl: 'https://picsum.photos/400/300?random=18' },
    }),
    prisma.exam.create({
      data: { title: 'AIIMS (Medical)', imageUrl: 'https://picsum.photos/400/300?random=19' },
    }),
    prisma.exam.create({
      data: { title: 'BITSAT (Engineering)', imageUrl: 'https://picsum.photos/400/300?random=20' },
    })
  ]);

  // Create test series for each exam
  const testSeriesData = [
    { title: 'UPSC Prelims Test Series 2025', examId: exams[0].id },
    { title: 'SSC CGL Tier 1 Mock Tests', examId: exams[1].id },
    { title: 'IBPS PO Prelims Practice', examId: exams[2].id },
    { title: 'SBI PO Complete Test Series', examId: exams[3].id },
    { title: 'RBI Grade B Phase 1 Tests', examId: exams[4].id },
    { title: 'CAT Mock Tests 2025', examId: exams[5].id },
    { title: 'XAT Practice Series', examId: exams[6].id },
    { title: 'SSC CHSL Mock Tests', examId: exams[7].id },
    { title: 'Railway NTPC Practice', examId: exams[8].id },
    { title: 'CTET Paper 1 & 2 Tests', examId: exams[9].id },
    { title: 'NDA & CDS Mock Tests', examId: exams[10].id },
    { title: 'State PSC Practice Tests', examId: exams[11].id },
    { title: 'Bank Clerk Mock Series', examId: exams[12].id },
    { title: 'LIC AAO Test Series', examId: exams[13].id },
    { title: 'JEE Main Mock Tests', examId: exams[14].id },
    { title: 'NEET Practice Tests', examId: exams[15].id },
    { title: 'GATE Mock Tests', examId: exams[16].id },
    { title: 'CLAT Practice Series', examId: exams[17].id },
    { title: 'AIIMS Mock Tests', examId: exams[18].id },
    { title: 'BITSAT Practice Tests', examId: exams[19].id }
  ];

  const createdTestSeries = await Promise.all(
    testSeriesData.map(series => 
      prisma.testSeries.create({ data: series })
    )
  );

  // Create sample notes
  const notesData = [
    {
      title: 'UPSC Polity Notes',
      imageUrl: 'https://picsum.photos/400/300?random=101',
      userId: adminUser.id
    },
    {
      title: 'SSC CGL Math Shortcuts',
      imageUrl: 'https://picsum.photos/400/300?random=102',
      userId: adminUser.id
    },
    {
      title: 'Banking Awareness Notes',
      imageUrl: 'https://picsum.photos/400/300?random=103',
      userId: adminUser.id
    },
    {
      title: 'JEE Physics Formulas',
      imageUrl: 'https://picsum.photos/400/300?random=104',
      userId: adminUser.id
    },
    {
      title: 'NEET Biology Notes',
      imageUrl: 'https://picsum.photos/400/300?random=105',
      userId: adminUser.id
    }
  ];

  const createdNotes = await Promise.all(
    notesData.map(note => 
      prisma.note.create({ data: note })
    )
  );

  // Create bilingual questions with both English and Hindi translations
  const questionsData = [
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
          optionA: 'Article 21A / अनुच्छेद 21A',
          optionB: 'Article 45 / अनुच्छेद 45',
          optionC: 'Article 51A / अनुच्छेद 51A',
          optionD: 'Article 350 / अनुच्छेद 350',
          correctOptionKey: 'A'
        },
        {
          language: 'hi',
          questionText: 'भारतीय संविधान का कौन सा अनुच्छेद शिक्षा के अधिकार से संबंधित है?',
          explanation: 'अनुच्छेद 21A को 86वें संविधान संशोधन अधिनियम, 2002 द्वारा 6-14 वर्ष के सभी बच्चों को मुफ्त और अनिवार्य शिक्षा प्रदान करने के लिए जोड़ा गया था।',
          optionA: 'Article 21A / अनुच्छेद 21A',
          optionB: 'Article 45 / अनुच्छेद 45',
          optionC: 'Article 51A / अनुच्छेद 51A',
          optionD: 'Article 350 / अनुच्छेद 350',
          correctOptionKey: 'A'
        }
      ],
      tags: ['Indian Polity', 'Constitution', 'Education Rights']
    },
    {
      questionType: 'MCQ',
      category: 'Indian Economy',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the full form of GST?',
          explanation: 'GST stands for Goods and Services Tax, which is a comprehensive indirect tax levied on the supply of goods and services.',
          optionA: 'Goods and Sales Tax / वस्तु और बिक्री कर',
          optionB: 'Goods and Services Tax / वस्तु और सेवा कर',
          optionC: 'General Sales Tax / सामान्य बिक्री कर',
          optionD: 'Government Sales Tax / सरकारी बिक्री कर',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'GST का पूरा नाम क्या है?',
          explanation: 'GST का मतलब वस्तु और सेवा कर है, जो वस्तुओं और सेवाओं की आपूर्ति पर लगाया जाने वाला एक व्यापक अप्रत्यक्ष कर है।',
          optionA: 'Goods and Sales Tax / वस्तु और बिक्री कर',
          optionB: 'Goods and Services Tax / वस्तु और सेवा कर',
          optionC: 'General Sales Tax / सामान्य बिक्री कर',
          optionD: 'Government Sales Tax / सरकारी बिक्री कर',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Indian Economy', 'Taxation', 'GST']
    },
    {
      questionType: 'MCQ',
      category: 'Indian Geography',
      difficulty: 'easy',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'What is the capital of India?',
          explanation: 'New Delhi is the capital city of India where the central government is based.',
          optionA: 'Mumbai / मुंबई',
          optionB: 'New Delhi / नई दिल्ली',
          optionC: 'Kolkata / कोलकाता',
          optionD: 'Chennai / चेन्नई',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'भारत की राजधानी क्या है?',
          explanation: 'नई दिल्ली भारत की राजधानी है, जहाँ भारत सरकार स्थित है।',
          optionA: 'Mumbai / मुंबई',
          optionB: 'New Delhi / नई दिल्ली',
          optionC: 'Kolkata / कोलकाता',
          optionD: 'Chennai / चेन्नई',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Indian Geography', 'Capitals', 'India']
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
          optionA: '25 / 25',
          optionB: '30 / 30',
          optionC: '35 / 35',
          optionD: '40 / 40',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: '200 का 15% क्या है?',
          explanation: '200 का 15% = (15/100) × 200 = 30',
          optionA: '25 / 25',
          optionB: '30 / 30',
          optionC: '35 / 35',
          optionD: '40 / 40',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Mathematics', 'Percentage', 'Basic Math']
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
          optionA: 'Reserve Bank of India / भारतीय रिजर्व बैंक',
          optionB: 'Regional Bank of India / भारतीय क्षेत्रीय बैंक',
          optionC: 'Royal Bank of India / भारतीय रॉयल बैंक',
          optionD: 'Reserve Banking Institution / रिजर्व बैंकिंग संस्थान',
          correctOptionKey: 'A'
        },
        {
          language: 'hi',
          questionText: 'RBI का मतलब क्या है?',
          explanation: 'RBI का मतलब भारतीय रिजर्व बैंक है, जो भारत का केंद्रीय बैंक है।',
          optionA: 'Reserve Bank of India / भारतीय रिजर्व बैंक',
          optionB: 'Regional Bank of India / भारतीय क्षेत्रीय बैंक',
          optionC: 'Royal Bank of India / भारतीय रॉयल बैंक',
          optionD: 'Reserve Banking Institution / रिजर्व बैंकिंग संस्थान',
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
          optionA: 'Volt / वोल्ट',
          optionB: 'Ampere / एम्पीयर',
          optionC: 'Ohm / ओम',
          optionD: 'Watt / वाट',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'विद्युत धारा की SI इकाई क्या है?',
          explanation: 'विद्युत धारा की SI इकाई एम्पीयर (A) है, जिसका नाम आंद्रे-मैरी एम्पीयर के नाम पर रखा गया है।',
          optionA: 'Volt / वोल्ट',
          optionB: 'Ampere / एम्पीयर',
          optionC: 'Ohm / ओम',
          optionD: 'Watt / वाट',
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
          optionA: 'Ag / Ag',
          optionB: 'Au / Au',
          optionC: 'Fe / Fe',
          optionD: 'Cu / Cu',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'सोने का रासायनिक प्रतीक क्या है?',
          explanation: 'सोने का रासायनिक प्रतीक Au है, जो लैटिन शब्द "aurum" से लिया गया है।',
          optionA: 'Ag / Ag',
          optionB: 'Au / Au',
          optionC: 'Fe / Fe',
          optionD: 'Cu / Cu',
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
          optionA: 'x / x',
          optionB: '2x / 2x',
          optionC: 'x² / x²',
          optionD: '2x² / 2x²',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'x² का अवकलज क्या है?',
          explanation: 'x² का अवकलज 2x है, जो अवकलन के घात नियम का उपयोग करता है।',
          optionA: 'x / x',
          optionB: '2x / 2x',
          optionC: 'x² / x²',
          optionD: '2x² / 2x²',
          correctOptionKey: 'B'
        }
      ],
      tags: ['Mathematics', 'Calculus', 'Derivatives']
    },
    // Additional questions for variety
    {
      questionType: 'MCQ',
      category: 'General Knowledge',
      difficulty: 'easy',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'Which planet is known as the Red Planet?',
          explanation: 'Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface.',
          optionA: 'Venus / शुक्र',
          optionB: 'Mars / मंगल',
          optionC: 'Jupiter / बृहस्पति',
          optionD: 'Saturn / शनि',
          correctOptionKey: 'B'
        },
        {
          language: 'hi',
          questionText: 'किस ग्रह को लाल ग्रह के नाम से जाना जाता है?',
          explanation: 'मंगल को लाल ग्रह के नाम से जाना जाता है क्योंकि इसकी सतह पर लोहे के ऑक्साइड के कारण यह लाल दिखाई देता है।',
          optionA: 'Venus / शुक्र',
          optionB: 'Mars / मंगल',
          optionC: 'Jupiter / बृहस्पति',
          optionD: 'Saturn / शनि',
          correctOptionKey: 'B'
        }
      ],
      tags: ['General Knowledge', 'Astronomy', 'Planets']
    },
    {
      questionType: 'MCQ',
      category: 'History',
      difficulty: 'medium',
      isActive: true,
      translations: [
        {
          language: 'en',
          questionText: 'In which year did India gain independence from British rule?',
          explanation: 'India gained independence from British rule on August 15, 1947.',
          optionA: '1945 / 1945',
          optionB: '1946 / 1946',
          optionC: '1947 / 1947',
          optionD: '1948 / 1948',
          correctOptionKey: 'C'
        },
        {
          language: 'hi',
          questionText: 'भारत को ब्रिटिश शासन से किस वर्ष में स्वतंत्रता मिली?',
          explanation: 'भारत को 15 अगस्त, 1947 को ब्रिटिश शासन से स्वतंत्रता मिली।',
          optionA: '1945 / 1945',
          optionB: '1946 / 1946',
          optionC: '1947 / 1947',
          optionD: '1948 / 1948',
          correctOptionKey: 'C'
        }
      ],
      tags: ['History', 'Indian Independence', 'British Rule']
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
      type: 'daily',
      category: 'General Knowledge',
      timeLimit: 60,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [0, 1, 2] // First 3 questions
    },
    {
      title: 'SSC CGL Quantitative Aptitude',
      description: 'Practice questions for SSC CGL quantitative section',
      type: 'weekly',
      category: 'Mathematics',
      timeLimit: 45,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [3] // 4th question
    },
    {
      title: 'Banking Awareness Quiz',
      description: 'Test your knowledge of banking and financial institutions',
      type: 'monthly',
      category: 'General Knowledge',
      timeLimit: 30,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [4] // 5th question
    },
    {
      title: 'JEE Main Physics Test',
      description: 'Advanced physics questions for JEE Main preparation',
      type: 'daily',
      category: 'Science',
      timeLimit: 90,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [5, 6, 7] // Physics, Chemistry, Math questions
    },
    {
      title: 'Mixed Category Quiz',
      description: 'Questions from various categories for general practice',
      type: 'weekly',
      category: 'General Knowledge',
      timeLimit: 75,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [0, 3, 4, 5] // Mixed selection
    },
    {
      title: 'General Knowledge Test',
      description: 'Test your knowledge across various subjects',
      type: 'monthly',
      category: 'General Knowledge',
      timeLimit: 60,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [2, 8, 9] // Geography, GK, History
    },
    {
      title: 'Daily Current Affairs Quiz',
      description: 'Stay updated with daily current affairs questions',
      type: 'daily',
      category: 'General Knowledge',
      timeLimit: 20,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [0, 1] // Current affairs questions
    },
    {
      title: 'Weekly Science Challenge',
      description: 'Weekly science quiz covering physics, chemistry, and biology',
      type: 'weekly',
      category: 'Science',
      timeLimit: 40,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [5, 6] // Science questions
    },
    {
      title: 'Monthly History Quiz',
      description: 'Comprehensive history quiz covering ancient to modern times',
      type: 'monthly',
      category: 'History',
      timeLimit: 50,
      isActive: true,
      isPublic: true,
      createdBy: adminUser.id,
      questions: [2, 9] // History questions
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

  console.log('Database seeded successfully with bilingual content!');
  console.log(`Created ${exams.length} exams`);
  console.log(`Created ${testSeriesData.length} test series`);
  console.log(`Created ${notesData.length} notes`);
  console.log(`Created ${createdQuestions.length} bilingual questions`);
  console.log(`Created ${createdQuizzes.length} quizzes`);
  console.log(`Created 1 admin user`);
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