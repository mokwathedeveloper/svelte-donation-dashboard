document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const notesInput = document.getElementById('notesInput');
    const flashcardContainer = document.getElementById('flashcardContainer');

    generateBtn.addEventListener('click', async () => {
        const notes = notesInput.value;
        if (!notes.trim()) {
            alert('Please enter some notes to generate flashcards.');
            return;
        }

        try {
            const response = await fetch('/generate_flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes: notes }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayFlashcards(data.flashcards);

        } catch (error) {
            console.error('Error generating flashcards:', error);
            alert('Failed to generate flashcards. Please try again.');
        }
    });

    function displayFlashcards(flashcards) {
        flashcardContainer.innerHTML = ''; // Clear previous flashcards
        flashcards.forEach(card => {
            const flashcardDiv = document.createElement('div');
            flashcardDiv.classList.add('flashcard');

            flashcardDiv.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <p>${card.question}</p>
                    </div>
                    <div class="flashcard-back">
                        <p>${card.answer}</p>
                    </div>
                </div>
            `;

            flashcardDiv.addEventListener('click', () => {
                flashcardDiv.classList.toggle('flipped');
            });

            flashcardContainer.appendChild(flashcardDiv);
        });
    }
});
