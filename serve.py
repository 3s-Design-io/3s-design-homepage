from argparse import ArgumentParser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PortfolioFiles(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".webp": "image/webp", ".otf": "font/otf"}

    def send_error(self, code, message=None, explain=None):
        error_page = Path(self.directory) / "404.html"
        if code != HTTPStatus.NOT_FOUND or not error_page.is_file():
            return super().send_error(code, message, explain)

        content = error_page.read_bytes().replace(
            b'<base href="/3s-design-homepage/">', b'<base href="/">'
        )
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(content)


class PortfolioServer(ThreadingHTTPServer):
    request_queue_size = 128


if __name__ == "__main__":
    parser = ArgumentParser(description="Serve the static 3s Design portfolio.")
    parser.add_argument("--bind", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parent / "docs")
    options = parser.parse_args()
    directory = options.directory.resolve(strict=True)
    with PortfolioServer((options.bind, options.port), partial(PortfolioFiles, directory=str(directory))) as server:
        print(f"Serving {directory} on {options.bind}:{options.port}", flush=True)
        server.serve_forever()
