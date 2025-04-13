module.exports = {
    jeopardy: {
      template: `Generate a Jeopardy-style game data structure optimized for Node.js backend processing with the following specifications:
  
  Language: {{language}}
  Number of categories: {{numCategories}}
  Questions per category: {{numQuestions}}
  Topic: {{topic}}
  
  Technical requirements:
  1. Output ONLY a valid JavaScript object declaration with no Markdown formatting
  2. Return a complete object with an array of category objects
  3. Each category object should have:
     - id: a unique numeric identifier
     - name: the category name
     - questions: an array of question objects
  4. Each question object should have:
     - id: a unique numeric identifier
     - clue: the statement shown to players
     - answer: the direct answer as a simple noun or phrase (NO "What is" format)
     - difficulty: a number from 1-5 representing question difficulty
  5. Make sure the output is valid JavaScript syntax that can be directly parsed with JSON.parse() after removing the variable declaration
  6. Do not include any explanation, comments or backticks in the output`,
      defaults: {
        language: 'English',
        numCategories: 5,
        numQuestions: 5
      }
    },
  };