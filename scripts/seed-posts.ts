import prisma from "../src/config/database";
import PostService from "../src/services/post.service";

async function seedPosts() {
  console.log("Seeding sample Posts & Tags into PostgreSQL...");

  // 1. Create or get admin author
  const author = await prisma.user.upsert({
    where: { email: "admin@blitz.gg" },
    update: {},
    create: {
      email: "admin@blitz.gg",
      username: "BlitzStaff",
      name: "Blitz Editorial Team",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      isEmailVerified: true,
    },
  });

  const samplePosts = [
    {
      title: "Patch 26.19 Notes: Champions Balance and Mid Scope Updates",
      content:
        "Welcome to Patch 26.19! In this update, we are addressing critical champion balance outliers across Solo Queue and professional play. Top lane champions receive updated sustain thresholds, while mid-lane AP items get price-efficiency adjustments. Check out full details below on how your champion pool is impacted.",
      tags: ["patch-notes"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/janna/skins/skin67/images/janna_splash_centered_67.skins_janna_skin67.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Worlds 2026 Meta Report: LCK and LPL Strategies",
      content:
        "The competitive meta is shifting rapidly as international tournaments approach. Control mages continue to dominate the mid lane while heavy engage supports are proving to be the deciding factor in late-game teamfights. Here is our breakdown of pick/ban priorities and win conditions.",
      tags: ["esports"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/mel/skins/skin12/images/mel_splash_centered_12.skins_mel_skin12.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Mastering Jungle Pathing: How to Counter-Jungle in Season 2026",
      content:
        "Clearing efficiently is only half the battle. In this comprehensive guide, we dissect cross-map jungle invades, objective timers, and tempo management to help you climb through Platinum and Emerald tiers.",
      tags: ["gameplay"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/anivia/skins/skin56/images/anivia_splash_centered_56.skins_anivia_skin56.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Community Spotlight: Top Community Builds and Creative Strategies",
      content:
        "Discover off-meta builds engineered by high-elo innovators that are taking solo queue by storm. From AP Kog'Maw Mid to Tank Swain Support, we review the statistical success and matchups for these unconventional choices.",
      tags: ["community"],
      coverImageUrl:
        "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      status: "PUBLISHED" as const,
    },
  ];

  for (const postInput of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { title: postInput.title },
    });
    if (!existing) {
      await PostService.createPost(author.id, postInput);
      console.log(`Created post: "${postInput.title}"`);
    } else {
      console.log(`Post already exists: "${postInput.title}"`);
    }
  }

  console.log("Sample Posts seeded successfully!");
}

seedPosts()
  .catch((e) => {
    console.error("Failed to seed posts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
