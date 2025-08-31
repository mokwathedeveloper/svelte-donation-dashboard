from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    notes = request.json.get('notes')
    if not notes:
        return jsonify({"error": "No notes provided"}), 400

    # Placeholder for Hugging Face QA API integration
    # This will be replaced with actual API calls later
    flashcards = [
        {"question": "What is Flask?", "answer": "A micro web framework for Python."},
        {"question": "What is EduSense?", "answer": "An AI-powered learning companion."},
        {"question": "What is SDG 4?", "answer": "Quality Education."}
    ]
    return jsonify({"flashcards": flashcards})

if __name__ == '__main__':
    app.run(debug=True)
