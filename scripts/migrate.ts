/**
 * Migration script: existing JSON data → Supabase
 *
 * Prerequisites:
 * 1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 * 2. Create a Supabase admin user and set SUPABASE_SERVICE_ROLE_KEY below
 * 3. Create storage buckets: level-images, sounds, videos
 * 4. Run: npx tsx scripts/migrate.ts
 *
 * This script:
 * - Reads levels.json and sounds.json from the original project
 * - Uploads images to level-images bucket
 * - Uploads sounds to sounds bucket
 * - Uploads Intro.mp4 to videos bucket
 * - Inserts levels, hazards, sounds into Supabase tables
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ===== CONFIGURE THESE =====
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
const ORIGINAL_PROJECT = path.resolve(__dirname, '../../../'); // Path to RA Game 2 root
// ============================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadFile(bucket: string, localPath: string, remoteName: string): Promise<string> {
  const fullPath = path.join(ORIGINAL_PROJECT, localPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ File not found: ${fullPath}`);
    return remoteName;
  }
  const file = fs.readFileSync(fullPath);
  const { error } = await supabase.storage.from(bucket).upload(remoteName, file, {
    upsert: true,
    contentType: localPath.endsWith('.mp4') ? 'video/mp4'
      : localPath.endsWith('.mp3') ? 'audio/mpeg'
      : localPath.endsWith('.jpg') ? 'image/jpeg'
      : 'application/octet-stream',
  });
  if (error) console.warn(`  ⚠ Upload error for ${remoteName}:`, error.message);
  else console.log(`  ✓ Uploaded ${remoteName}`);
  return remoteName;
}

async function main() {
  console.log('=== Risk Hunting Migration ===\n');

  // 1. Upload images
  console.log('1. Uploading level images...');
  const images = ['image.jpg', 'image2.jpg', 'image3.jpg'];
  for (const img of images) {
    await uploadFile('level-images', img, img);
  }

  // 2. Upload sounds
  console.log('\n2. Uploading sounds...');
  const soundFiles = [
    'assets/good/Molodets.mp3',
    'assets/good/Otlichno.mp3',
    'assets/good/Profi.mp3',
    'assets/bad/Mimo.mp3',
    'assets/bad/ne_popal.mp3',
    'assets/bottle-line.mp3',
    'assets/office.mp3',
  ];
  for (const sf of soundFiles) {
    const name = sf.split('/').pop()!;
    await uploadFile('sounds', sf, name);
  }

  // 3. Upload intro video
  console.log('\n3. Uploading intro video...');
  await uploadFile('videos', 'assets/Intro.mp4', 'Intro.mp4');

  // 4. Read levels data
  console.log('\n4. Inserting levels...');
  const levelsPath = path.join(ORIGINAL_PROJECT, 'server/data/levels.json');
  const levelsData = JSON.parse(fs.readFileSync(levelsPath, 'utf-8'));

  for (const level of levelsData) {
    // Skip empty levels (4-6)
    if (!level.hazards || level.hazards.length === 0) {
      console.log(`  ⊘ Skipping empty level: ${level.name}`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from('levels')
      .insert({
        order_index: level.id - 1,
        name: level.name,
        image_path: level.image,
        audio_background_path: level.audioBackground
          ? level.audioBackground.split('/').pop()
          : null,
        min_risks: level.minRisks || level.hazards.length,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ✗ Error inserting level ${level.name}:`, error.message);
      continue;
    }
    console.log(`  ✓ Inserted level: ${level.name} (${inserted.id})`);

    // Insert hazards
    const hazardRows = level.hazards.map((h: any) => ({
      level_id: inserted.id,
      group_key: h.group,
      name: h.name,
      description: h.description || '',
      x: h.x,
      y: h.y,
      w: h.w,
      h: h.h,
    }));

    const { error: hazardError } = await supabase.from('hazards').insert(hazardRows);
    if (hazardError) {
      console.error(`  ✗ Error inserting hazards:`, hazardError.message);
    } else {
      console.log(`  ✓ Inserted ${hazardRows.length} hazards`);
    }
  }

  // 5. Insert sounds
  console.log('\n5. Inserting sounds...');
  const soundsPath = path.join(ORIGINAL_PROJECT, 'server/data/sounds.json');
  const soundsData = JSON.parse(fs.readFileSync(soundsPath, 'utf-8'));

  for (const category of ['good', 'bad', 'background'] as const) {
    for (const sound of soundsData[category] || []) {
      const fileName = sound.path.split('/').pop()!;
      const { error } = await supabase.from('sounds').insert({
        name: sound.name,
        category,
        file_path: fileName,
      });
      if (error) console.error(`  ✗ Error inserting sound ${sound.name}:`, error.message);
      else console.log(`  ✓ Inserted sound: ${sound.name} (${category})`);
    }
  }

  // 6. Migrate leaderboard if exists
  const leaderboardPath = path.join(ORIGINAL_PROJECT, 'server/data/leaderboard.json');
  if (fs.existsSync(leaderboardPath)) {
    console.log('\n6. Migrating leaderboard...');
    const leaderboardData = JSON.parse(fs.readFileSync(leaderboardPath, 'utf-8'));
    for (const entry of leaderboardData) {
      const { error } = await supabase.from('leaderboard').insert({
        player_name: entry.name || entry.player_name || 'Unknown',
        score: entry.score || 0,
        time_seconds: entry.time || entry.time_seconds || 0,
      });
      if (error) console.error(`  ✗ Error:`, error.message);
      else console.log(`  ✓ ${entry.name || entry.player_name}`);
    }
  }

  console.log('\n=== Migration Complete ===');
}

main().catch(console.error);
