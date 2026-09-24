import http.server
import socketserver
import os

START_PORT = int(os.environ.get("PORT", "8090"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    for port in range(START_PORT, START_PORT + 20):
        try:
            httpd = socketserver.TCPServer(("", port), Handler)
            break
        except PermissionError:
            continue
        except OSError:
            continue
    else:
        raise RuntimeError(f"No available port found from {START_PORT} to {START_PORT + 19}")

    with httpd:
        print(f"Serving Predictive Autoscaling Control Center on http://localhost:{port}")
        httpd.serve_forever()
