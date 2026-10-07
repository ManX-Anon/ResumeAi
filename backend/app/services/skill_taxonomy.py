"""
skill_taxonomy.py

Central, expandable list of technical skills the app recognizes.
Keys are the canonical display name; values are a list of surface-form
aliases/synonyms that should map to that canonical skill when found in
text. Matching is done on preprocessed (lowercased) tokens/phrases, so
aliases here should be lowercase.

To add a new skill: add a new entry with at least the canonical name as
its own alias.
"""

SKILL_TAXONOMY = {
    "Python": ["python", "python3"],
    "Java": ["java"],
    "SQL": ["sql", "mysql", "postgresql", "t-sql", "pl/sql"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp"],
    "JavaScript": ["javascript", "js", "es6"],
    "TypeScript": ["typescript", "ts"],
    "React": ["react", "reactjs", "react.js"],
    "Node.js": ["node.js", "nodejs", "node"],
    "Docker": ["docker", "containerization"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Azure": ["azure", "microsoft azure"],
    "GCP": ["gcp", "google cloud", "google cloud platform"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch", "torch"],
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "dl", "neural networks", "cnn", "rnn"],
    "Natural Language Processing": ["nlp", "natural language processing"],
    "Git": ["git"],
    "GitHub": ["github"],
    "Linux": ["linux", "unix", "bash", "shell scripting"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3", "tailwind", "tailwindcss"],
    "Power BI": ["power bi", "powerbi"],
    "Excel": ["excel", "microsoft excel"],
    "Tableau": ["tableau"],
    "MongoDB": ["mongodb", "mongo"],
    "PostgreSQL": ["postgresql", "postgres"],
    "FastAPI": ["fastapi"],
    "Flask": ["flask"],
    "Django": ["django"],
    "OpenCV": ["opencv", "cv2"],
    "Scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "REST APIs": ["rest api", "restful api", "rest apis", "api development"],
    "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
    "Data Analysis": ["data analysis", "data analytics"],
    "Data Visualization": ["data visualization", "matplotlib", "seaborn", "plotly"],
    "Agile/Scrum": ["agile", "scrum", "kanban"],
}


def all_canonical_skills():
    return list(SKILL_TAXONOMY.keys())
