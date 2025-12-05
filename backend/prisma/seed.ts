import { PrismaClient, UserRole, OrganizationType, NarrativeTone } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log('Seeding database...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Cleaning existing data...');
    await prisma.narrativeAnalytics.deleteMany();
    await prisma.narrative.deleteMany();
    await prisma.brandVoice.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.apiUsage.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  }

  // Create demo organizations
  console.log('Creating organizations...');

  const ngoOrg = await prisma.organization.create({
    data: {
      name: 'GreenEarth Foundation',
      slug: 'greenearth',
      description: 'Environmental advocacy organization focused on climate action and sustainability',
      website: 'https://greenearth.example.org',
      type: OrganizationType.NGO,
    },
  });

  const politicalOrg = await prisma.organization.create({
    data: {
      name: 'Progress for All Campaign',
      slug: 'progress-for-all',
      description: 'Progressive political campaign focused on social equity',
      type: OrganizationType.POLITICAL_CAMPAIGN,
    },
  });

  const advocacyOrg = await prisma.organization.create({
    data: {
      name: 'Digital Rights Alliance',
      slug: 'digital-rights',
      description: 'Advocacy group fighting for privacy and digital rights',
      type: OrganizationType.ADVOCACY_GROUP,
    },
  });

  // Create demo users
  console.log('Creating users...');

  const adminPassword = await hashPassword('Admin123!');
  const userPassword = await hashPassword('User123!');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@narrativepulse.dev',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      organizationId: ngoOrg.id,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@narrativepulse.dev',
      passwordHash: userPassword,
      name: 'Demo User',
      role: UserRole.USER,
      organizationId: ngoOrg.id,
    },
  });

  const politicalUser = await prisma.user.create({
    data: {
      email: 'campaign@narrativepulse.dev',
      passwordHash: userPassword,
      name: 'Campaign Manager',
      role: UserRole.USER,
      organizationId: politicalOrg.id,
    },
  });

  // Create brand voices
  console.log('Creating brand voices...');

  const greenEarthVoice = await prisma.brandVoice.create({
    data: {
      name: 'GreenEarth Official Voice',
      description: 'Our primary brand voice for all external communications',
      isDefault: true,
      organizationId: ngoOrg.id,
      userId: adminUser.id,
      personality: {
        formal: 6,
        passionate: 9,
        technical: 5,
        empathetic: 8,
        urgent: 7,
      },
      terminology: {
        preferred: [
          'climate crisis',
          'environmental justice',
          'sustainable future',
          'collective action',
          'ecological balance',
        ],
        avoided: [
          'climate change',
          'environmentalism',
          'green lifestyle',
        ],
        replacements: {
          'climate change': 'climate crisis',
          'global warming': 'climate emergency',
          'consumers': 'community members',
        },
      },
      audienceProfiles: {
        donors: {
          tone: 'grateful and impact-focused',
          emphasis: ['impact metrics', 'transparency', 'efficiency'],
        },
        activists: {
          tone: 'empowering and action-oriented',
          emphasis: ['urgency', 'solidarity', 'tangible actions'],
        },
        policymakers: {
          tone: 'professional and evidence-based',
          emphasis: ['research', 'economic impact', 'policy solutions'],
        },
      },
      goodExamples: [
        'Join us in the fight for climate justice. Every action counts.',
        'Together, we can build a sustainable future for generations to come.',
        'The climate crisis demands immediate action. Here\'s how you can help.',
      ],
      poorExamples: [
        'Buy our eco-friendly products to save the planet.',
        'Climate change is happening, maybe do something about it.',
        'Scientists say the Earth is getting warmer.',
      ],
    },
  });

  const campaignVoice = await prisma.brandVoice.create({
    data: {
      name: 'Campaign Rally Voice',
      description: 'Energizing voice for campaign events and mobilization',
      isDefault: true,
      organizationId: politicalOrg.id,
      userId: politicalUser.id,
      personality: {
        formal: 4,
        passionate: 10,
        technical: 3,
        empathetic: 7,
        urgent: 9,
      },
      terminology: {
        preferred: [
          'working families',
          'our community',
          'progress',
          'together',
          'opportunity',
        ],
        avoided: [
          'voters',
          'constituents',
          'electorate',
        ],
        replacements: {
          'voters': 'neighbors',
          'constituents': 'community members',
          'taxes': 'investments in our future',
        },
      },
      audienceProfiles: {
        volunteers: {
          tone: 'appreciative and motivating',
          emphasis: ['impact', 'community', 'momentum'],
        },
        undecided: {
          tone: 'welcoming and informative',
          emphasis: ['values', 'shared concerns', 'practical solutions'],
        },
      },
      goodExamples: [
        'When we stand together, there\'s nothing we can\'t achieve.',
        'This is our moment. This is our time. Let\'s make history.',
      ],
      poorExamples: [
        'Vote for us because we\'re better.',
        'The other side is wrong about everything.',
      ],
    },
  });

  // Create sample narratives
  console.log('Creating sample narratives...');

  const inputText1 = 'Recent study shows 40% decline in pollinator populations over the last decade. Main causes include pesticide use, habitat loss, and climate change. Immediate action needed to prevent agricultural collapse.';

  await prisma.narrative.create({
    data: {
      inputText: inputText1,
      outputText: `Our pollinators are disappearing at an alarming rate - a 40% decline in just one decade. These tiny creatures, essential for our food supply and ecosystem health, face a triple threat: toxic pesticides, vanishing habitats, and the escalating climate crisis.

This isn't just an environmental issue - it's a food security emergency. Without pollinators, our agricultural systems face collapse.

But we can act now. Demand pesticide-free farming. Protect natural habitats. Fight climate change. Together, we can save our pollinators and secure our future.`,
      tone: NarrativeTone.activist,
      title: 'Pollinator Crisis Alert',
      tags: ['environment', 'pollinators', 'agriculture', 'climate'],
      modelUsed: 'claude-3-5-sonnet-20241022',
      promptVersion: '1.0.0',
      generationTime: 1250,
      tokenCount: 180,
      humanReviewed: true,
      reviewedBy: adminUser.name,
      reviewedAt: new Date(),
      sourceDataHash: hashContent(inputText1),
      userId: adminUser.id,
      organizationId: ngoOrg.id,
      brandVoiceId: greenEarthVoice.id,
    },
  });

  const inputText2 = 'Community solar program reaches 5,000 household milestone. Average savings of $45/month per household. 15,000 tons CO2 reduced annually.';

  await prisma.narrative.create({
    data: {
      inputText: inputText2,
      outputText: `5,000 families strong - and growing!

Our community solar program just hit a major milestone, and the numbers speak for themselves:
- 5,000 households now powered by clean energy
- $45 average monthly savings per family
- 15,000 tons of CO2 kept out of our atmosphere every year

This is what progress looks like. Working families saving money while fighting climate change. Neighbors coming together for a cleaner future.

Ready to join? Sign up today and be part of the solution.`,
      tone: NarrativeTone.inspirational,
      title: 'Community Solar Milestone',
      tags: ['solar', 'community', 'savings', 'clean-energy'],
      modelUsed: 'claude-3-5-sonnet-20241022',
      promptVersion: '1.0.0',
      generationTime: 980,
      tokenCount: 145,
      humanReviewed: false,
      sourceDataHash: hashContent(inputText2),
      userId: demoUser.id,
      organizationId: ngoOrg.id,
      brandVoiceId: greenEarthVoice.id,
    },
  });

  const inputText3 = 'New healthcare proposal: universal coverage, negotiated drug prices, mental health parity. Estimated cost: $2.1T over 10 years. Funded by 2% wealth tax on assets over $50M.';

  await prisma.narrative.create({
    data: {
      inputText: inputText3,
      outputText: `Healthcare is a right, not a privilege.

Our comprehensive healthcare plan ensures every American has access to quality care:

**Universal Coverage**: No more worrying about losing your insurance when you change jobs or face a health crisis.

**Lower Drug Costs**: We'll finally let Medicare negotiate drug prices, saving families thousands.

**Mental Health Matters**: Full mental health coverage, because your mind deserves the same care as your body.

How do we pay for it? By asking the wealthiest Americans - those with over $50 million in assets - to contribute their fair share through a modest 2% wealth tax.

It's time for a healthcare system that works for everyone, not just the wealthy few.`,
      tone: NarrativeTone.political,
      title: 'Healthcare For All Plan',
      tags: ['healthcare', 'policy', 'universal-coverage'],
      modelUsed: 'claude-3-5-sonnet-20241022',
      promptVersion: '1.0.0',
      generationTime: 1450,
      tokenCount: 210,
      humanReviewed: true,
      reviewedBy: politicalUser.name,
      reviewedAt: new Date(),
      sourceDataHash: hashContent(inputText3),
      userId: politicalUser.id,
      organizationId: politicalOrg.id,
      brandVoiceId: campaignVoice.id,
    },
  });

  const inputText4 = 'Meta-analysis of 47 studies confirms correlation between screen time >4hrs/day and increased anxiety/depression in adolescents. Effect strongest in social media use. Recommendations: age verification, usage limits, parental controls.';

  await prisma.narrative.create({
    data: {
      inputText: inputText4,
      outputText: `A comprehensive meta-analysis examining 47 peer-reviewed studies has established a significant correlation between extended screen time and mental health outcomes in adolescents.

**Key Findings:**
- Screen time exceeding 4 hours daily correlates with elevated rates of anxiety and depression
- Social media platforms demonstrate the strongest association with negative mental health outcomes
- The effect persists across diverse demographic groups and geographic regions

**Evidence-Based Recommendations:**
1. Implementation of robust age verification systems for social media platforms
2. Platform-level usage monitoring and optional time limits
3. Enhanced parental control features with transparent reporting
4. Further longitudinal research to establish causation

These findings underscore the urgent need for evidence-based digital wellness policies that protect adolescent mental health while preserving the benefits of digital connectivity.`,
      tone: NarrativeTone.scientific,
      title: 'Screen Time Mental Health Study',
      tags: ['research', 'mental-health', 'social-media', 'adolescents'],
      modelUsed: 'claude-3-5-sonnet-20241022',
      promptVersion: '1.0.0',
      generationTime: 1680,
      tokenCount: 235,
      humanReviewed: false,
      sourceDataHash: hashContent(inputText4),
      userId: demoUser.id,
    },
  });

  // Create narrative analytics
  console.log('Creating analytics...');

  const narratives = await prisma.narrative.findMany();

  for (const narrative of narratives) {
    await prisma.narrativeAnalytics.create({
      data: {
        narrativeId: narrative.id,
        views: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 50) + 5,
        copies: Math.floor(Math.random() * 30) + 3,
        exports: Math.floor(Math.random() * 20) + 1,
        rating: Math.random() * 2 + 3, // 3-5 rating
        feedbackCount: Math.floor(Math.random() * 15),
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Demo Accounts:');
  console.log('-------------------');
  console.log('Admin:    admin@narrativepulse.dev / Admin123!');
  console.log('Demo:     demo@narrativepulse.dev / User123!');
  console.log('Campaign: campaign@narrativepulse.dev / User123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
