"""Guest bootstrap fixture for native preview CI, never a business API backend."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlsplit

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=7777)
parser.add_argument('--audit', type=Path, default=Path('ci-e2e/preview-api.jsonl'))
args = parser.parse_args()
args.audit.parent.mkdir(parents=True, exist_ok=True)
args.audit.write_text('')


class GuestHandler(BaseHTTPRequestHandler):
    def respond(self):
        path = urlsplit(self.path).path
        ready = self.command == 'GET' and path == '/__ci/health'
        me = self.command == 'GET' and path == '/api/v1/auth/me'
        refresh = self.command == 'POST' and path == '/api/v1/auth/refresh'
        guest = me or refresh
        status = 200 if ready else 401 if guest else 500
        body = json.dumps({'status': 'ready'} if ready else {
            'statusCode': status,
            'code': 'AUTHENTICATION_REQUIRED' if me else 'INVALID_REFRESH_TOKEN' if refresh else 'UNEXPECTED_CI_REQUEST',
            'message': 'CI guest session' if guest else 'Preview must not call business APIs',
        }).encode()
        if not ready:
            record = {'method': self.command, 'path': path, 'status': status, 'unexpected': not guest}
            with args.audit.open('a') as output:
                output.write(json.dumps(record) + '\n')
            print(json.dumps(record), flush=True)
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(body)

    do_GET = respond
    do_POST = respond
    do_PUT = respond
    do_PATCH = respond
    do_DELETE = respond
    do_OPTIONS = respond

    def log_message(self, *_args):
        pass  # Audit only method/path/status; never headers, query strings or bodies.


server = ThreadingHTTPServer(('127.0.0.1', args.port), GuestHandler)
print(f'CI guest fixture listening on port {args.port}', flush=True)
server.serve_forever()
