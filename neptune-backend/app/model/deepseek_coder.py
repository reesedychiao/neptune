from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

prompt = PromptTemplate.from_template("""
Task: Given a list of courses, group them into appropriate domains and subdomains, and return the result as valid JSON. The JSON should follow this structure:
{{
    "Domain": ["Subdomain1", "Subdomain2"],
    "Domain2": ["Subdomain3", "Subdomain4"]
}}
Now only return valid JSON using these courses: {courses}
""")

llm = ChatOpenAI(temperature=0, model_name="gpt-4")

chain = LLMChain(llm=llm, prompt=prompt)

response = chain.run(courses="Math, Algebra, Calculus, Biology, Physics")
print(response)  # should be JSON!
