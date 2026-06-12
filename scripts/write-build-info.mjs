import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

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

writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2) + '\n');
console.log('build-info.json written for ' + (buildInfo.shortCommit || 'unknown commit'));
