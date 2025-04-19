import networkx as nx
import matplotlib.pyplot as plt
import plotly.graph_objects as go
from openai import OpenAI
import os
import itertools
from dotenv import load_dotenv
from .llm_service import extract_topics_from_notes
from typing import List, Dict, Any, Tuple

# Load environment variables
load_dotenv()

def find_topic_relationships(topics: List[str], client: OpenAI = None) -> List[Tuple[str, str, float]]:
    """
    Find relationships between topics using the OpenAI API with a generous approach.
    
    Args:
        topics: List of topic strings
        client: Optional OpenAI client, will create one if not provided
        
    Returns:
        List of tuples (topic1, topic2, strength) representing edges
    """
    if client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)
    
    # No need to find relationships if there are too few topics
    if len(topics) < 2:
        return []
    
    # Generate all possible pairs of topics
    topic_pairs = list(itertools.combinations(topics, 2))
    
    # Create a prompt asking to rate each specific pair
    topic_pairs_text = "\n".join([f"- {pair[0]} and {pair[1]}" for pair in topic_pairs])
    
    prompt = f"""
    I have a set of topics from which I want to build a knowledge graph. I need to identify EVERY possible 
    connection between these topics, even if the relationship is tenuous or indirect.
    
    Please rate the relationship strength between each of the following topic pairs on a scale from 0.1 to 1.0:
    
    {topic_pairs_text}
    
    Instructions:
    - Be generous with connections - find ANY logical connection, no matter how slight
    - A rating of 0.1 means very weakly related but still connected
    - A rating of 1.0 means strongly related
    - Consider ANY type of relationship: subjects taught together, historical connections, conceptual overlap,
      shared methods, complementary ideas, or topics that might appear in the same text or course
    
    Format your response as a JSON object with pairs as keys and strength as values:
    {{
        "{topics[0]}-{topics[1]}": 0.7,
        "{topics[0]}-{topics[2]}": 0.3,
        ...
    }}
    """
    
    print("Finding relationships between topics...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        import json
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Convert the pair-based format to our tuple format
        edges = []
        for pair_key, strength in result.items():
            try:
                # Try to split by hyphen first
                if '-' in pair_key:
                    topic1, topic2 = pair_key.split('-')
                # Otherwise try other formats
                elif ' and ' in pair_key:
                    topic1, topic2 = pair_key.split(' and ')
                else:
                    continue
                    
                topic1 = topic1.strip()
                topic2 = topic2.strip()
                
                if topic1 in topics and topic2 in topics:
                    edges.append((topic1, topic2, float(strength)))
            except:
                # If any error occurs, just skip this pair
                continue
        
        # If we didn't get any edges, create default relationships
        if not edges:
            for t1, t2 in topic_pairs:
                edges.append((t1, t2, 0.3))  # Default modest relationship
                
        print(f"Found {len(edges)} relationships between topics")
        return edges
    
    except Exception as e:
        print(f"Error finding topic relationships: {e}")
        # Create default relationships if there's an error
        edges = []
        for t1, t2 in topic_pairs:
            edges.append((t1, t2, 0.3))  # Default modest relationship
        print(f"Created {len(edges)} default relationships between topics")
        return edges

def create_topic_graph(topics_data: List[Dict[str, Any]]) -> nx.Graph:
    """
    Create a NetworkX graph from topic extraction results.
    
    Args:
        topics_data: List of topic dictionaries, each with 'topic' and 'note_ids' fields
        
    Returns:
        NetworkX graph with topic nodes and relationship edges
    """
    G = nx.Graph()
    
    # Extract all topic names
    topic_names = [item["topic"] for item in topics_data]
    
    # Add topic nodes with size based on number of notes
    for item in topics_data:
        topic_name = item["topic"]
        note_ids = item["note_ids"]
        G.add_node(
            topic_name, 
            type="topic",
            size=len(note_ids) * 20,  # Size proportional to number of notes
            note_count=len(note_ids),
            note_ids=note_ids
        )
    
    # Find and add relationships between topics
    topic_relationships = find_topic_relationships(topic_names)
    for topic1, topic2, strength in topic_relationships:
        G.add_edge(topic1, topic2, weight=strength)
    
    return G

def visualize_graph_plotly(G: nx.Graph, filename: str = "topic_graph.html"):
    """
    Create an interactive Plotly visualization of the topic graph
    
    Args:
        G: NetworkX graph of topics
        filename: Output HTML file name
    """
    # Create a spring layout for node positions
    pos = nx.spring_layout(G, k=0.4, iterations=50, seed=42)
    
    # Create node trace
    node_x = []
    node_y = []
    node_text = []
    node_sizes = []
    
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)
        note_count = G.nodes[node].get('note_count', 0)
        node_text.append(f"{node}<br>Notes: {note_count}")
        node_sizes.append(G.nodes[node].get('size', 30))
    
    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        text=list(G.nodes()),
        textposition="bottom center",
        marker=dict(
            size=node_sizes,
            color='rgba(25, 118, 210, 0.8)',
            line=dict(width=2, color='rgba(50, 50, 50, 0.8)')
        ),
        hoverinfo='text',
        hovertext=node_text,
        name="Topics"
    )
    
    # Create edge trace
    edge_x = []
    edge_y = []
    edge_text = []
    
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])
        weight = G.edges[edge].get('weight', 0.5)
        edge_text.append(f"Relationship strength: {weight:.2f}")
    
    edge_trace = go.Scatter(
        x=edge_x, y=edge_y,
        mode='lines',
        line=dict(width=1, color='rgba(100, 100, 200, 0.7)'),
        hoverinfo='text',
        hovertext=edge_text,
        name="Relationships"
    )
    
    # Create figure - FIX: Update title format to modern Plotly style
    fig = go.Figure(
        data=[edge_trace, node_trace],
        layout=go.Layout(
            title={
                'text': 'Knowledge Graph: Topic Relationships',
                'font': {'size': 16}
            },
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=40),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            paper_bgcolor='rgba(255, 255, 255, 1)',
            plot_bgcolor='rgba(255, 255, 255, 1)'
        )
    )
    
    # Save interactive HTML
    fig.write_html(filename)
    print(f"Interactive graph saved to {filename}")
    
    return fig

def visualize_graph_matplotlib(G: nx.Graph, filename: str = "topic_graph.png"):
    """
    Create a static Matplotlib visualization of the topic graph
    
    Args:
        G: NetworkX graph of topics
        filename: Output PNG file name
    """
    plt.figure(figsize=(12, 10))
    
    # Generate layout
    pos = nx.spring_layout(G, k=0.4, iterations=50, seed=42)
    
    # Get node sizes based on note count
    node_sizes = [G.nodes[node].get('size', 300) for node in G.nodes()]
    
    # Get edge widths based on relationship strength
    edge_widths = [G.edges[edge].get('weight', 0.5) * 2 for edge in G.edges()]
    
    # Draw network
    nx.draw(G, pos,
           node_size=node_sizes,
           node_color='skyblue',
           width=edge_widths,
           edge_color='navy',
           with_labels=True,
           font_size=10,
           font_weight='bold')
    
    plt.title("Knowledge Graph: Topic Relationships", fontsize=16)
    plt.tight_layout()
    
    # Save static image
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    print(f"Static graph image saved to {filename}")
    
    plt.close()

def visualize_topic_relationships(topics_data, filename_base="topic_relationships"):
    """Create a knowledge graph with just topics and their relationships"""
    G = create_topic_graph(topics_data)
    
    # Print graph statistics
    print(f"\nTopic Graph Statistics:")
    print(f"Number of topics: {len(G.nodes())}")
    print(f"Number of relationships: {len(G.edges())}")
    
    # Print topic details
    print("\nTopics and associated note counts:")
    for node, data in G.nodes(data=True):
        note_count = data.get('note_count', 0)
        print(f"  - {node}: {note_count} notes")
    
    # Print relationship details
    if G.edges():
        print("\nTopic relationships:")
        for u, v, data in G.edges(data=True):
            strength = data.get('weight', 0.5)
            print(f"  - {u} <--> {v} (strength: {strength:.2f})")
    else:
        print("\nNo relationships detected between topics.")
    
    # Generate visualizations
    print("\nGenerating topic relationship visualizations...")
    visualize_graph_plotly(G, filename=f"{filename_base}.html")
    visualize_graph_matplotlib(G, filename=f"{filename_base}.png")
    
    return G

def graph_to_frontend_format(G: nx.Graph) -> Dict:
    """
    Convert NetworkX graph to a frontend-friendly JSON structure
    
    Args:
        G: NetworkX graph of topics and relationships
        
    Returns:
        Dictionary with nodes and links arrays for frontend visualization
    """
    nodes = []
    for node, data in G.nodes(data=True):
        nodes.append({
            "id": node,
            "label": node,
            "size": data.get("size", 30),
            "noteCount": data.get("note_count", 0),
            "noteIds": data.get("note_ids", [])
        })
    
    links = []
    for u, v, data in G.edges(data=True):
        links.append({
            "source": u,
            "target": v,
            "strength": data.get("weight", 0.5)
        })
    
    return {
        "nodes": nodes,
        "links": links
    }
    
# Run this to generate the visualizations
# if __name__ == "__main__":
#     from test_llm import test_notes, topics
    
#     # If topics weren't extracted yet, do it now
#     if not topics:
#         topics = extract_topics_from_notes(test_notes)
#         print(f"Extracted topics: {topics}")
    
#     # Create and visualize the topic graph
#     print("\nCreating knowledge graph with just topics and their relationships...")
#     G_topics = visualize_topic_relationships(topics)