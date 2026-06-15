import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

function git(args, fallback = '') {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch (_error) {
    return fallback;
  }
}

function repoSlugFromRemote(remote) {
  const match = String(remote || '').match(/github\.com[:/](.+?)(?:\.git)?$/);
  return match ? match[1] : 'bluemoonwj/brandgenome-cfo-operating-dashboard';
}

const commit = process.env.VERCEL_GIT_COMMIT_SHA || git(['rev-parse', 'HEAD']);
const remote = process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
  ? process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG
  : repoSlugFromRemote(git(['config', '--get', 'remote.origin.url']));

const buildInfo = {
  commit,
  shortCommit: commit ? commit.slice(0, 7) : '',
  commitTime: git(['show', '-s', '--format=%cI', commit || 'HEAD']),
  commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || git(['show', '-s', '--format=%s', commit || 'HEAD']),
  branch: process.env.VERCEL_GIT_COMMIT_REF || git(['rev-parse', '--abbrev-ref', 'HEAD']),
  repo: remote,
  commitUrl: commit ? 'https://github.com/' + remote + '/commit/' + commit : '',
  generatedAt: new Date().toISOString()
};

const outputDir = 'public';
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

[
  'index.html',
  'mock_api_contract.json',
  'mock_data_snapshot.json'
].forEach((file) => {
  if (existsSync(file)) copyFileSync(file, join(outputDir, file));
});

['tiktok', 'kakao'].forEach((vendor) => {
  if (existsSync(vendor)) {
    cpSync(vendor, join(outputDir, vendor), { recursive: true });
  }
});

writeFileSync(join(outputDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2) + '\n');

// Keep a local root copy for simple static-server checks outside Vercel.
writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2) + '\n');

['tiktok', 'kakao'].forEach((vendor) => {
  const indexPath = join(outputDir, vendor, 'oauth/callback/index.html');
  mkdirSync(dirname(indexPath), { recursive: true });
  const cleanUrlPath = join(outputDir, vendor, 'oauth/callback.html');
  if (existsSync(cleanUrlPath) && !existsSync(indexPath)) {
    copyFileSync(cleanUrlPath, indexPath);
  }
});

console.log('public/ static build written for ' + (buildInfo.shortCommit || 'unknown commit'));
