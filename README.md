# Trend Tracker: A web page for summarizing trends across the web 

The web page displays the 5-bullet point summary cards retrieved from various online resoures (i.e., latest Hacker News posts, Gitlab trending repos, etc.) across different categories through [emreg00/TrendTracker](https://github.com/emreg00/n8n-local) self hosted n8n workflow. The content summaries and tags assigned to them are generated using a local LLM. The web supports filtering by a selected tag (e.g., IT, AI, Health, Science, etc.) and date (when the content was uploaded). 

Built using
* Content generation workflow: [n8n](https://n8n.io/)
* LLM-based sumarization [Ollama](https://ollama.com/)
* Web page design [Gemini](https://aistudio.google.com/)
* Web hosting (this repo) [Github pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site")

Current content summaries and tags are created using llama3.2:3b model on a Mac Air with 8GB RAM.