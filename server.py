import http.server
import socketserver
import ssl

PORT = 8001

Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting server at https://localhost:{PORT}")
print("Press Ctrl+C to stop the server")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    # Wrap the socket with SSL
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        keyfile="key.pem",
        certfile="cert.pem",
        server_side=True
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.") 