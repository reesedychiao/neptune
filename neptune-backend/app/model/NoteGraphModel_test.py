from NoteGraphModel import NoteGraphModel

fake_courses = ["Linear Algebra", "Calculus", "Operating Systems", "Algorithms"]
model = NoteGraphModel(classes=fake_courses)

def test_markdown():
    model = NoteGraphModel()

    test_file = """# Machine Learning Overview

    Machine learning is a **subset** of artificial intelligence focused on _data-driven_ predictions.
    It involves ***algorithms*** that improve over time through exposure to **data**.

    ## Supervised Learning
    """
    dictionary = model._parse_note_md(test_file, 1)
    print(dictionary)
# Test data for courses

def test_graph_init_and_visualize():
    print("Initializing model...")    
    # Run the _init_domains() function directly
    model._init_domains(fake_courses)
    
    # Output nodes in the graph to verify domain initialization
    print("Nodes in graph:")
    for node, data in model.get_graph().nodes(data=True):
        print(f"  {node}: {data}")

    # Output edges in the graph to verify domain relationships
    print("\nEdges in graph:")
    for u, v, data in model.get_graph().edges(data=True):
        print(f"  {u} -- {v} ({data})")
    
    # Visualize the graph
    print("\nVisualizing graph...")
    model.visualize()

if __name__ == "__main__":
    test_graph_init_and_visualize()

