from flask import Flask, send_from_directory
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'qazanamaz.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)