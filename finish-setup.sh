#!/bin/bash
# Usage: ./finish-setup.sh <google_client_id> <google_client_secret> <anthropic_api_key>
# Example: ./finish-setup.sh "466756430447-xxx.apps.googleusercontent.com" "GOCSPX-xxx" "sk-ant-xxx"

GOOGLE_CLIENT_ID="$1"
GOOGLE_CLIENT_SECRET="$2"
ANTHROPIC_API_KEY="$3"

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Usage: ./finish-setup.sh <google_client_id> <google_client_secret> <anthropic_api_key>"
  exit 1
fi

echo "Updating Vercel environment variables..."

python3 << PYEOF
import subprocess, time, os, json

auth_path = os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json')
with open(auth_path, 'w') as f: f.write('{}')

proc = subprocess.Popen(['vercel', 'login'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
token = None
deadline = time.time() + 45
last = '{}'
while time.time() < deadline:
    try:
        with open(auth_path) as f: current = f.read()
        if current != last and current.strip() not in ('{}', ''):
            data = json.loads(current)
            if data.get('token'): token = data['token']; break
        last = current
    except: pass
    if proc.poll() is not None: break
    time.sleep(0.01)
proc.wait()

if not token:
    print("Failed to get Vercel token"); exit(1)

env = os.environ.copy()
env['VERCEL_TOKEN'] = token
cwd = os.path.dirname(os.path.abspath('$0'))

def set_env(key, value):
    subprocess.run(['vercel', 'env', 'rm', key, 'production', '--yes'], env=env, cwd=cwd, capture_output=True)
    r = subprocess.run(['vercel', 'env', 'add', key, 'production', '--value', value, '--yes'], env=env, cwd=cwd, capture_output=True, text=True)
    print(f"  {'✓' if r.returncode == 0 else '✗'} {key}")

set_env('GOOGLE_CLIENT_ID', '$GOOGLE_CLIENT_ID')
set_env('GOOGLE_CLIENT_SECRET', '$GOOGLE_CLIENT_SECRET')
set_env('ANTHROPIC_API_KEY', '$ANTHROPIC_API_KEY')
PYEOF

echo ""
echo "Redeploying..."
python3 << PYEOF
import subprocess, time, os, json

auth_path = os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json')
with open(auth_path, 'w') as f: f.write('{}')

proc = subprocess.Popen(['vercel', 'login'], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
token = None
deadline = time.time() + 45
last = '{}'
while time.time() < deadline:
    try:
        with open(auth_path) as f: current = f.read()
        if current != last and current.strip() not in ('{}', ''):
            data = json.loads(current)
            if data.get('token'): token = data['token']; break
        last = current
    except: pass
    if proc.poll() is not None: break
    time.sleep(0.01)
proc.wait()

if token:
    env = os.environ.copy()
    env['VERCEL_TOKEN'] = token
    result = subprocess.run(['vercel', '--prod', '--yes'], env=env, cwd='/Users/khizar.ali/Desktop/newapp', capture_output=True, text=True)
    for line in result.stderr.split('\n'):
        if 'Aliased:' in line:
            print(f"\n✅ Done! Live at: {line.strip().replace('Aliased: ', '')}")
PYEOF
