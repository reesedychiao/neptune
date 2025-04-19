from NoteGraphModel import NoteGraphModel

model = NoteGraphModel()

test_file = """# Machine Learning Overview

Machine learning is a **subset** of artificial intelligence focused on _data-driven_ predictions.
It involves ***algorithms*** that improve over time through exposure to **data**.

## Supervised Learning
"""

if __name__ == "__main__":
    dictionary = model._parse_note_md(test_file, 1)
    print(dictionary)

