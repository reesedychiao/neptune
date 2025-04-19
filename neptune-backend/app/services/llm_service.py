import os
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self, model_name="gpt-4o"):
        self.model_name = model_name
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("Warning: OPENAI_API_KEY not found in environment")
        self.client = OpenAI(api_key=api_key)
    
    def extract_topic_from_note(self, note_content: str, note_id: str) -> Dict[str, Any]:
        """Extract a single topic from a note"""
        prompt = f"""
        Generate a single general topic (1 word) that best summarizes this note content. It doesn't have to describe the significance of the note as such.
        Choose something more general but not too much. I want a little more generalization because I want to combine some notes into a single topic. But I don't want it too general such that it combines every note.

        Note content:
        {note_content[:3000]}
        
        Return ONLY the topic, nothing else.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=10
            )
            topic = response.choices[0].message.content.strip()
            return {"topic": topic, "note_id": note_id}
        except Exception as e:
            print(f"Error extracting topic: {e}")
            return {"topic": "unclassified", "note_id": note_id}
    
    def process_notes(self, notes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process notes and return consolidated topics"""
        # Extract topics for each note
        extracted_topics = []
        for note in notes:
            result = self.extract_topic_from_note(note["content"], note["id"])
            extracted_topics.append(result)
        
        # Consolidate duplicate topics
        topic_map = {}
        for item in extracted_topics:
            topic = item["topic"]
            note_id = item["note_id"]
            
            if topic in topic_map:
                topic_map[topic].append(note_id)
            else:
                topic_map[topic] = [note_id]
        
        # Format as requested: list of topics with note_ids
        return [
            {"topic": topic, "note_ids": note_ids}
            for topic, note_ids in topic_map.items()
        ]

# Create a singleton instance
llm_service = LLMService()

# API functions
def extract_topics_from_notes(notes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process a list of notes and extract consolidated topics.
    
    Args:
        notes: List of dictionaries with note content and IDs
              [{"content": "...", "id": "note1"}, ...]
              
    Returns:
        List of topics with associated note IDs
        [{"topic": "algebra", "note_ids": ["note1", "note3"]}, ...]
    """
    return llm_service.process_notes(notes)

def get_llm_response(prompt: str) -> str:
    """Legacy function for compatibility"""
    try:
        response = llm_service.client.chat.completions.create(
            model=llm_service.model_name,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def set_llm_model(model_name: str):
    llm_service.model_name = model_name

def get_available_models() -> list:
    try:
        models = llm_service.client.models.list()
        return [model.id for model in models.data if "gpt" in model.id]
    except:
        return ["gpt-3.5-turbo", "gpt-4"]