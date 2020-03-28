import { exec } from 'child_process'
exec('serve src/static').stdout.pipe(process.stdout)
