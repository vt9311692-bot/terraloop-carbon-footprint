import streamlit as st
import streamlit.components.v1 as components
import os

# Set page configurations to be wide and clean
st.set_page_config(
    page_title="TerraLoop - Carbon Footprint Tracker",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide standard Streamlit header and footer elements for a clean full-screen look
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            .block-container {
                padding-top: 0rem;
                padding-bottom: 0rem;
                padding-left: 0rem;
                padding-right: 0rem;
            }
            iframe {
                display: block;
                border: none;
            }
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

# Helper to read file safely
def read_file(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    return ""

# Read HTML, CSS, and JS components
html_content = read_file("index.html")
css_content = read_file("styles.css")
db_content = read_file("database.js")
app_content = read_file("app.js")

# Bundle CSS and JS directly inside the HTML structure for single-bundle iframe delivery
if html_content:
    # Inject style tag
    css_tag = f"<style>\n{css_content}\n</style>"
    html_content = html_content.replace('<link rel="stylesheet" href="styles.css">', css_tag)
    
    # Inject database and app logic tags
    db_tag = f"<script>\n{db_content}\n</script>"
    html_content = html_content.replace('<script src="database.js"></script>', db_tag)
    
    app_tag = f"<script>\n{app_content}\n</script>"
    html_content = html_content.replace('<script src="app.js"></script>', app_tag)

    # Render inside Streamlit Component
    components.html(html_content, height=1000, scrolling=True)
else:
    st.error("Application files are missing. Please verify index.html is present in the repository.")
