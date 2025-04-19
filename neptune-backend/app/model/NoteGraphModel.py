import networkx as nx
from datetime import datetime
from transformers import pipeline
import json
import matplotlib.pyplot as plt
import re
from keybert import KeyBERT

class ContextManager:
    def __init__(self):
        self.current_time = datetime.now()
    
    def update_context(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class NoteGraphModel:
    def __init__(self, nlp_model, domain_model, classes=None):
        """
        Initializes the NoteGraphModel.
        
        Args:
            nlp_model: A preloaded NLP model or pipeline for parsing notes into topics and relationships
            domain_model: A text-to-text generation model used for domain classification of courses.
            classes (list, optional): A list of course/class names for domain initialization.
        """
        self.graph = nx.Graph()
        self.context = ContextManager()
        self.kw_model = KeyBERT('all-MiniLM-L6-v2')
        self.dmodel = pipeline("text2text-generation", model=domain_model)
        
        if classes:
            self._init_domains(classes)

    def _init_domains(self, classes):
        """
        Uses AI-powered domain classification to organize courses into domains and subdomains.
        Adds these domains as nodes to the graph.

        Args:
            classes (list): List of course names (e.g., ["Linear Algebra", "Operating Systems"])
        """
        prompt = f"""Group the following course names into a dictionary where the keys are broad domains (e.g., "Math", "Computer Science") and values are lists of subdomains or specific course topics.
        Also include a key called 'relate' that groups related domains or subdomains in a list of lists.

        Return only valid JSON with this structure:
        {{
        "domain1": ["subdomain A", "subdomain B"],
        "relate": [["subdomain A", "subdomain B"]]
        }}

        Courses: {', '.join(classes)}
        """
        result = self.dmodel(prompt, max_length=300)[0]['generated_text']
        
        try:
            domains = json.loads(result)
            for domain, subdomains in domains.items():
                if domain == "relate":
                    continue
                self.graph.add_node(domain, type="domain")
                for sub in subdomains:
                    self.graph.add_node(sub, type="subdomain")
                    self.graph.add_edge(domain, sub, relation="has_subdomain")

            for group in domains.get("related", []):
                for i in range(len(group)):
                    for j in range(i + 1, len(group)):
                        self.graph.add_edge(group[i], group[j], relation="related")
        except json.JSONDecodeError:
            print("Failed to parse domain model output:", result)


    def _add_node(self, node, **attrs):
        """
        Adds a node to the graph.

        Args:
            node: Node identifier.
            **attrs: Arbitrary metadata and note id
            type: domain, subdomain, topic
        """
        self.graph.add_node(node, **attrs)
    
    def _add_edge(self, src, dst, **attrs):
        """
        Adds an edge between two nodes.

        Args:
            src: Source node.
            dst: Destination node.
            **attrs: Arbitrary metadata
        """
        self.graph.add_edge(src, dst, **attrs)

    def _parse_note(self, text, note_id):
        """
        Parses a note and updates the graph with new concepts or connections.
        Extract topics and keywords using KeyBERT and chunk with GPT.

        Args:
            text (dict): dictionary of sentences with index
            note_id (str): Unique note identifier
        """
        index_to_text = list(text.items())
        keywords = []
        topics = []

        # Join all text to process with KeyBERT
        full_text = " ".join([line for _, line in index_to_text])
        
        # 1. Extract keywords using KeyBERT
        extracted_keywords = self.kw_model.extract_keywords(full_text, top_n=10, keyphrase_ngram_range=(1, 2))
        for word, score in extracted_keywords:
            # Map back to the sentence index
            sentence_idx = self._find_sentence_index(word, text)
            keywords.append({"value": word, "index": sentence_idx, "score": score})
        
        # 2. Extract topics (optional GPT chunking)
        topic_chunks = self._chunk_text_with_gpt(full_text)

        for chunk in topic_chunks:
            topic_title = chunk["topic"]
            topic_summary = chunk["summary"]
            topic_idx = self._find_sentence_index(topic_title, text)
            topics.append({"value": topic_title, "index": topic_idx, "summary": topic_summary})
            
            # Add to the graph
            self.graph.add_node(topic_title, type="topic", note_id=note_id, summary=topic_summary)
            for keyword in keywords:
                # Add edges between topics and keywords
                self.graph.add_edge(topic_title, keyword["value"], relation="related")

        # 3. Store the results into the graph (optional relationships)
        for word in keywords:
            self.graph.add_node(word["value"], type="keyword", note_id=note_id)
            # Optional: Add relationships between keywords
            self.graph.add_edge(word["value"], note_id, relation="from_note")

        return {"keywords": keywords, "topics": topics}

        pass

    def _parse_note_md(self, text, note_id):
        """
        Input: dictionary {index: markdown_sentence}
        Output:
        - keywords: list of {"value": word, "index": idx}
        - topics: list of {"value": heading, "index": idx}
        """
        index_to_text = list(text.items())
        keywords = []
        topics = []

        for idx, line in index_to_text:
            # Check for topic (markdown heading)
            if re.match(r'^#{1,6} ', line):
                topics.append({"value": line.strip(), "index": idx})

            # Extract bold-italic keywords
            bold_italic_matches = re.findall(r'\*\*\*(.+?)\*\*\*|___(.+?)___', line)
            for match in bold_italic_matches:
                for word in match:
                    if word:
                        keywords.append({"value": word.strip(), "index": idx})

            # Extract bold-only keywords
            bold_matches = re.findall(r'\*\*(.+?)\*\*|__(.+?)__', line)
            for match in bold_matches:
                for word in match:
                    if word:
                        keywords.append({"value": word.strip(), "index": idx})

            # Extract italic-only keywords
            italic_matches = re.findall(
                r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)',
                line
            )
            for match in italic_matches:
                for word in match:
                    if word:
                        keywords.append({"value": word.strip(), "index": idx})

            # Extracts defined vocabulary terms
            vocab = re.findall(r"\*\*(.*?)\*\*\s*[:\-–=]\s*(.+)", line)
            for term in vocab:
                keywords.append({
                    keywords.append({"value": word.strip(), "index": idx})})
        return {
            "keywords": keywords,
            "topics": topics
        }


    def query(self, **filters):
        """
        Queries the graph for nodes based on dynamic properties and context (time for now)

        Args:
            node_type (str, optional): Filter by node type.
            **filters: Additional attribute filters. {key: value}

        Returns:
            subgraph containing only nodes and edges that match criteria.
        """
        nodes = []

        for node, data in self.graph.nodes(data=True):
            match = True
            for key, value in filters.items():
                node_value = data.get(key)
                if isinstance(value, datetime):
                    if node_value > self.context.current_time:
                        match = False
                        break
                elif node_value != value:
                    match = False
                    break
            if match:
                nodes.append(node)

        return self.graph.subgraph(nodes).copy()

    def get_graph(self):
        """
        Returns:
            The internal NetworkX graph object.
        """
        return self.graph

    def visualize(self):
        """
        Visualizes the graph structure (e.g., using matplotlib or pyvis).
        """
        plt.figure(figsize=(12, 8))
        pos = nx.spring_layout(self.graph, k=0.5, iterations=50)
        
        nx.draw_networkx_nodes(self.graph, pos, node_size=1500)
        nx.draw_networkx_edges(self.graph, pos, arrowstyle='->', arrowsize=20)
        nx.draw_networkx_labels(self.graph, pos, font_size=10, font_weight='bold')
        
        # Edge labels
        edge_labels = {(u, v): d.get("relate", "") for u, v, d in self.graph.edges(data=True)}
        nx.draw_networkx_edge_labels(self.graph, pos, edge_labels=edge_labels, font_color='red')
        
        plt.title("Test Graph")
        plt.axis('off')
        plt.show()
        



        