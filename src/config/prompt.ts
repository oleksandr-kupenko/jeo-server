module.exports = {
    jeopardy: {
      template: `Generate a Jeopardy-style game data structure with the following specifications:
  
  Language: {{language}}
  Number of categories: {{numCategories}}
  Questions per category: {{numQuestions}}
  Topic: {{topic}}
  
  IMPORTANT RESPONSE FORMAT INSTRUCTIONS:
  1. ONLY respond with a raw JSON object - no variable declarations, no const, no var
  2. DO NOT add any JavaScript code around the JSON
  3. DO NOT add any Markdown formatting, code blocks, backticks, or triple backticks
  4. DO NOT include any explanations or comments before or after the JSON
  5. The response should be directly parseable with JSON.parse()
  
  JSON structure requirements:
  1. Return an object with a single 'categories' array
  2. Each category in 'categories' array should have:
     - name: the category name (string)
     - questions: an array of question objects
  3. Each question object should have:
     - clue: the statement shown to players (string)
     - answer: the direct answer as a simple noun or phrase (NO "What is" format) (string)
     - difficulty: a number from 1-5 representing question difficulty
  
  Example of EXACT response format (do not copy this data, create your own):
  {"categories":[{"name":"Geography","questions":[{"clue":"This country is home to the Pyramids of Giza","answer":"Egypt","difficulty":1}]}]}`,
      defaults: {
        language: 'English',
        numCategories: 5,
        numQuestions: 5
      }
    },
  };