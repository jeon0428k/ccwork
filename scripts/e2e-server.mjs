// E2E 테스트용 격리된 JSON Server 기동 스크립트.
// 매 실행마다 fixtures/seed.json 을 임시 db 로 복사한 뒤 그 파일을 watch 한다.
// → 실제 db.json 과 분리되고, 테스트가 시드 원본을 오염시키지 않는다.
import { copyFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const seed = resolve(root, 'e2e/fixtures/seed.json');
const tmpDir = resolve(root, 'e2e/.tmp');
const tmpDb = resolve(tmpDir, 'db.json');
const port = process.env.E2E_API_PORT ?? '3999';

mkdirSync(tmpDir, { recursive: true });
copyFileSync(seed, tmpDb);

const child = spawn(
  'npx',
  ['json-server', '--watch', tmpDb, '--port', port],
  { stdio: 'inherit', cwd: root },
);

const forward = (sig) => child.kill(sig);
process.on('SIGINT', () => forward('SIGINT'));
process.on('SIGTERM', () => forward('SIGTERM'));
child.on('exit', (code) => process.exit(code ?? 0));
