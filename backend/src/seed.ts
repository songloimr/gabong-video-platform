import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as schema from './database/schema';

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Helper function to generate UUID
function generateUUID(): string {
  return crypto.randomUUID();
}

// Helper function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper to generate short code
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function seed() {
  console.log('Starting seed...');

  try {
    // Clear existing data in reverse dependency order
    console.log('Clearing existing data...');
    await db.delete(schema.watchLater);
    await db.delete(schema.likes);
    await db.delete(schema.comments);
    await db.delete(schema.playlistVideos);
    await db.delete(schema.playlists);
    await db.delete(schema.videoTags);
    await db.delete(schema.tags);
    await db.delete(schema.videos);
    await db.delete(schema.categories);
    await db.delete(schema.bannerAds);
    await db.delete(schema.announcements);
    await db.delete(schema.siteSettings);
    await db.delete(schema.refreshTokens);
    await db.delete(schema.users);

    // ============================================
    // USERS
    // ============================================
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        id: generateUUID(),
        username: 'admin',
        email: 'admin@gabong.net',
        password_hash: hashedPassword,
        role: 'admin' as const,
        status: 'active' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: 'Site administrator',
      },
      {
        id: generateUUID(),
        username: 'john_doe',
        email: 'john@example.com',
        password_hash: hashedPassword,
        role: 'user' as const,
        status: 'active' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        bio: 'Just a regular content creator sharing my passion.',
      },
      {
        id: generateUUID(),
        username: 'jane_smith',
        email: 'jane@example.com',
        password_hash: hashedPassword,
        role: 'user' as const,
        status: 'active' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        bio: 'Video enthusiast and tech lover.',
      },
      {
        id: generateUUID(),
        username: 'mike_wilson',
        email: 'mike@example.com',
        password_hash: hashedPassword,
        role: 'user' as const,
        status: 'active' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        bio: 'Gaming and entertainment content.',
      },
      {
        id: generateUUID(),
        username: 'sarah_connor',
        email: 'sarah@example.com',
        password_hash: hashedPassword,
        role: 'user' as const,
        status: 'suspended' as const,
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        bio: 'Suspended user account for testing.',
      },
    ];

    const insertedUsers = await db
      .insert(schema.users)
      .values(usersData)
      .returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    // ============================================
    // CATEGORIES
    // ============================================
    console.log('Seeding categories...');
    const categoryNames = [
      'Gaming', 'Technology', 'Music', 'Education', 'Entertainment',
      'Sports', 'Travel', 'Food & Cooking', 'DIY & Crafts', 'Fashion & Beauty',
      'Health & Fitness', 'News & Politics', 'Science', 'Art & Design', 'Comedy',
      'Nature', 'Automotive', 'Animals', 'Animation', 'Business & Finance',
      'Coding', 'Cryptocurrency', 'Documentary', 'History', 'Movies & Cinema'
    ];

    const categoriesData = categoryNames.map((name, index) => ({
      id: generateUUID(),
      name,
      slug: createSlug(name),
      thumbnail_url: `https://picsum.photos/seed/${createSlug(name)}/400/300`,
      video_count: 0,
      sort_order: index + 1,
    }));

    const insertedCategories = await db
      .insert(schema.categories)
      .values(categoriesData)
      .returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    // ============================================
    // TAGS
    // ============================================
    console.log('Seeding tags...');
    const commonTags = [
      'tutorial', 'gameplay', 'review', 'funny', 'how-to', 'tips',
      'unboxing', 'live', 'vlog', 'documentary', 'news', 'trending',
      'educational', '4k', 'slowmotion', 'compilation', 'best-of', 'short'
    ];

    const tagsData = commonTags.map(name => ({
      id: generateUUID(),
      name,
      slug: createSlug(name),
      usage_count: 0,
    }));

    const insertedTags = await db
      .insert(schema.tags)
      .values(tagsData)
      .returning();
    console.log(`Inserted ${insertedTags.length} tags`);

    // ============================================
    // VIDEOS
    // ============================================
    console.log('Seeding videos...');
    const videoTemplates = [
      { title: 'Best of {category} 2024', desc: 'A compilation of the most amazing {category} moments this year.' },
      { title: 'How to master {category} in 10 minutes', desc: 'A quick guide to getting started with {category}.' },
      { title: '{category} Tutorial for Beginners', desc: 'Step by step instructions for {category} enthusiasts.' },
      { title: 'The Future of {category}', desc: 'Exploring where {category} is headed in the next decade.' },
      { title: 'Top 10 {category} Secrets You Didn\'t Know', desc: 'Revealing the hidden truths about {category}.' },
      { title: 'My {category} Journey', desc: 'Sharing my personal experience with {category}.' },
    ];

    const videosData: any[] = [];

    // Generate at least 50 videos
    for (let i = 0; i < 50; i++) {
      const category = insertedCategories[i % insertedCategories.length];
      const template = videoTemplates[i % videoTemplates.length];
      const title = template.title.replace('{category}', category.name);
      const user = insertedUsers[1 + (i % (insertedUsers.length - 1))]; // Avoid admin for most uploads

      videosData.push({
        id: generateUUID(),
        title: i === 0 ? 'Getting Started with TypeScript' : `${title} #${Math.floor(i / 10) + 1}`,
        slug: createSlug(`${title}-${i}`),
        short_code: generateShortCode(),
        description: template.desc.replace('{category}', category.name.toLowerCase()),
        source_type: i % 10 === 0 ? 'embed' : 'upload',
        user_id: user.id,
        category_id: category.id,
        video_url: i % 10 === 0 ? null : `https://example.com/videos/video-${i}.mp4`,
        embed_url: i % 10 === 0 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
        embed_platform: i % 10 === 0 ? 'youtube' : null,
        thumbnail_url: `https://picsum.photos/seed/vid-${i}/1280/720`,
        duration: 300 + Math.floor(Math.random() * 3000),
        resolution: '1920x1080',
        file_size: 100 * 1024 * 1024 + Math.floor(Math.random() * 500 * 1024 * 1024),
        status: i % 15 === 0 ? 'pending_approval' : 'approved',
        views: Math.floor(Math.random() * 100000),
        likes_count: Math.floor(Math.random() * 5000),
        comments_count: Math.floor(Math.random() * 200),
        published_at: i % 15 === 0 ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }

    const insertedVideos = await db
      .insert(schema.videos)
      .values(videosData)
      .returning();
    console.log(`Inserted ${insertedVideos.length} videos`);

    // ============================================
    // VIDEO TAGS
    // ============================================
    console.log('Seeding video tags...');
    const videoTagsData = [];
    for (const video of insertedVideos) {
      // Assign 1-3 random tags to each video
      const numTags = 1 + Math.floor(Math.random() * 3);
      const selectedTagIndices = new Set<number>();
      while (selectedTagIndices.size < numTags) {
        selectedTagIndices.add(Math.floor(Math.random() * insertedTags.length));
      }

      for (const tagIndex of selectedTagIndices) {
        videoTagsData.push({
          video_id: video.id,
          tag_id: insertedTags[tagIndex].id,
        });
      }
    }

    await db.insert(schema.videoTags).values(videoTagsData);
    console.log(`Inserted ${videoTagsData.length} video-tag associations`);

    // ============================================
    // COMMENTS
    // ============================================
    console.log('Seeding comments...');
    const commentsData: any[] = [];
    const videoCommentsCount = 50; // Randomly sample videos to add comments

    for (let i = 0; i < videoCommentsCount; i++) {
      const video = insertedVideos[Math.floor(Math.random() * insertedVideos.length)];
      const user = insertedUsers[1 + Math.floor(Math.random() * (insertedUsers.length - 1))];

      commentsData.push({
        id: generateUUID(),
        video_id: video.id,
        user_id: user.id,
        parent_id: null,
        content: `Wow, this video about ${video.title} is awesome!`,
      });
    }

    const insertedComments = await db
      .insert(schema.comments)
      .values(commentsData)
      .returning();

    // Add some random replies
    const repliesData = [];
    for (let i = 0; i < 20; i++) {
      const parent = insertedComments[Math.floor(Math.random() * insertedComments.length)];
      const user = insertedUsers[1 + Math.floor(Math.random() * (insertedUsers.length - 1))];

      repliesData.push({
        id: generateUUID(),
        video_id: parent.video_id,
        user_id: user.id,
        parent_id: parent.id,
        content: "I completely agree with you!",
      });
    }

    await db.insert(schema.comments).values(repliesData);
    console.log(
      `Inserted ${commentsData.length + repliesData.length} total comments`,
    );

    // ============================================
    // PLAYLISTS
    // ============================================
    console.log('Seeding playlists...');
    const playlistNames = [
      'Watch Later', 'My Favorites', 'Best Tutorials', 'Random Fun',
      'Learn to Code', 'Workout Music', 'Travel Bucket List', 'Food Recipes'
    ];

    const playlistsData = playlistNames.map((title, index) => ({
      id: generateUUID(),
      title,
      slug: createSlug(`${title}-${index}`),
      description: `My collection of ${title.toLowerCase()}`,
      thumbnail_url: `https://picsum.photos/seed/playlist-${index}/400/300`,
      is_public: index % 2 === 0,
      video_count: 0,
      created_by: insertedUsers[1 + (index % (insertedUsers.length - 1))].id,
    }));

    const insertedPlaylists = await db
      .insert(schema.playlists)
      .values(playlistsData)
      .returning();
    console.log(`Inserted ${insertedPlaylists.length} playlists`);

    // ============================================
    // PLAYLIST VIDEOS
    // ============================================
    console.log('Seeding playlist videos...');
    const playlistVideosData: any[] = [];

    for (const playlist of insertedPlaylists) {
      // Add 3-8 random videos to each playlist
      const numVideos = 3 + Math.floor(Math.random() * 5);
      const selectedVideoIndices = new Set<number>();
      while (selectedVideoIndices.size < numVideos) {
        selectedVideoIndices.add(Math.floor(Math.random() * insertedVideos.length));
      }

      let pos = 1;
      for (const vidIndex of selectedVideoIndices) {
        playlistVideosData.push({
          playlist_id: playlist.id,
          video_id: insertedVideos[vidIndex].id,
          position: pos++,
        });
      }

      // Update video count in database
      await db.update(schema.playlists)
        .set({ video_count: numVideos })
        .where(eq(schema.playlists.id, playlist.id));
    }

    await db.insert(schema.playlistVideos).values(playlistVideosData);
    console.log(`Inserted ${playlistVideosData.length} playlist-video associations`);

    // ============================================
    // LIKES
    // ============================================
    console.log('Seeding likes...');
    const likesData = [];
    for (let i = 0; i < 100; i++) {
      const video = insertedVideos[Math.floor(Math.random() * insertedVideos.length)];
      const user = insertedUsers[1 + Math.floor(Math.random() * (insertedUsers.length - 1))];

      likesData.push({
        id: generateUUID(),
        user_id: user.id,
        video_id: video.id,
      });
    }

    // Filter duplicates for (user_id, video_id)
    const uniqueLikes = likesData.filter((v, i, a) =>
      a.findIndex(t => (t.user_id === v.user_id && t.video_id === v.video_id)) === i
    );

    await db.insert(schema.likes).values(uniqueLikes);
    console.log(`Inserted ${uniqueLikes.length} unique likes`);

    // ============================================
    // WATCH LATER
    // ============================================
    console.log('Seeding watch later...');
    const watchLaterData = [];
    for (let i = 0; i < 30; i++) {
      const video = insertedVideos[Math.floor(Math.random() * insertedVideos.length)];
      const user = insertedUsers[1 + Math.floor(Math.random() * (insertedUsers.length - 1))];

      watchLaterData.push({
        id: generateUUID(),
        user_id: user.id,
        video_id: video.id,
      });
    }

    // Filter duplicates
    const uniqueWatchLater = watchLaterData.filter((v, i, a) =>
      a.findIndex(t => (t.user_id === v.user_id && t.video_id === v.video_id)) === i
    );

    await db.insert(schema.watchLater).values(uniqueWatchLater);
    console.log(`Inserted ${uniqueWatchLater.length} unique watch later items`);

    // ============================================
    // SITE SETTINGS
    // ============================================
    console.log('Seeding site settings...');
    const siteSettingsData = [
      // Branding
      { key: 'site_name', value: 'Gabong.net' },
      { key: 'site_tagline', value: 'Video Streaming Platform' },
      { key: 'site_url', value: 'https://gabong.net' },
      // General
      { key: 'age_verification_enabled', value: false },
      { key: 'google_analytics_code', value: '' },
      { key: 'custom_head_html', value: '' },
      { key: 'custom_body_html', value: '' },
      // Upload
      { key: 'max_upload_size_mb', value: 500 },
      { key: 'max_video_duration', value: 900 },
      { key: 'max_files_per_upload', value: 5 },
      { key: 'allowed_video_formats', value: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'] },
      // R2 Storage
      { key: 'r2_account_id', value: '' },
      { key: 'r2_access_key_id', value: '' },
      { key: 'r2_secret_access_key', value: '' },
      { key: 'r2_bucket', value: '' },
      // FFmpeg
      { key: 'ffmpeg_path', value: '' },
      { key: 'ffmpeg_max_processes', value: 1 },
      { key: 'ffmpeg_preset', value: 'medium' },
      // Cache
      { key: 'cache_ttl_minutes', value: 15 },
      // Rate limits
      { key: 'global_rate_limit_requests', value: 15 },
      { key: 'global_rate_limit_seconds', value: 60 },
      { key: 'new_account_wait_hours', value: 24 },
      { key: 'daily_upload_limit', value: 2 },
      { key: 'comment_cooldown_seconds', value: 30 },
      { key: 'comment_daily_limit', value: 30 },
      // Legal
      { key: 'contact_email', value: 'admin@gabong.net' },
      { key: 'terms_updated_at', value: new Date().toISOString() },
      { key: 'privacy_updated_at', value: new Date().toISOString() },
      { key: 'cookies_updated_at', value: new Date().toISOString() },
    ];

    await db.insert(schema.siteSettings).values(siteSettingsData);
    console.log(`Inserted ${siteSettingsData.length} site settings`);

    // ============================================
    // BANNER ADS
    // ============================================
    console.log('Seeding banner ads...');
    const bannerAdsData = [
      {
        id: generateUUID(),
        name: 'Homepage Hero Banner',
        content: '<div class="hero-banner"><h1>Welcome to Gabong.net</h1><p>Discover amazing videos</p></div>',
        link_url: '/explore',
        position: 'hero',
        is_active: true,
        impressions: 125000,
        clicks: 4500,
      },
      {
        id: generateUUID(),
        name: 'Sidebar Ad - Premium',
        content: '<div class="sidebar-ad"><img src="/ads/premium.jpg" alt="Go Premium"/></div>',
        link_url: '/premium',
        position: 'sidebar',
        is_active: true,
        impressions: 89000,
        clicks: 2100,
      },
    ];

    await db.insert(schema.bannerAds).values(bannerAdsData);
    console.log(`Inserted ${bannerAdsData.length} banner ads`);

    console.log('\nSeed completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Users: ${insertedUsers.length}`);
    console.log(`   - Categories: ${insertedCategories.length}`);
    console.log(`   - Tags: ${insertedTags.length}`);
    console.log(`   - Videos: ${insertedVideos.length}`);
    console.log(`   - Playlists: ${insertedPlaylists.length}`);
    console.log(`   - Total Comments: ${commentsData.length + repliesData.length}`);
    console.log(`   - Unique Likes: ${uniqueLikes.length}`);
    console.log(`   - Site Settings: ${siteSettingsData.length}`);

    console.log('\nTest Accounts:');
    console.log('   Admin: admin@gabong.net / password123');
    console.log('   User:  john@example.com / password123');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
