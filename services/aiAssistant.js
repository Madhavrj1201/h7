const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIAssistant {
  static async getCodeHints(code, language, context) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        As a coding assistant, analyze this ${language} code and provide hints:
        ${code}
        Context: ${context}
        Provide specific suggestions for:
        1. Logic improvements
        2. Best practices
        3. Potential bugs
        4. Performance optimizations
        5. Design patterns that could be applied
        6. Edge cases to consider
        7. Error handling improvements
        8. Documentation needs

        Format the response in markdown with clear sections and code examples.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Code Hints Error:', error);
      throw new Error('Failed to generate code hints');
    }
  }

  static async reviewCode(code, language) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Perform a comprehensive code review for this ${language} code:
        ${code}

        Analyze and provide detailed feedback on:
        1. Code style and naming conventions
        2. Design patterns and architecture
        3. Security vulnerabilities and best practices
        4. Documentation completeness
        5. Test coverage suggestions
        6. Code complexity and maintainability
        7. Error handling practices
        8. Performance optimization opportunities
        9. Memory management
        10. Potential race conditions
        11. Resource management
        12. API design (if applicable)

        Format the response in markdown with:
        - Critical issues (must fix)
        - Important improvements (should fix)
        - Minor suggestions (nice to have)
        Include code examples for suggested improvements.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Code Review Error:', error);
      throw new Error('Failed to review code');
    }
  }

  static async matchJobProfile(userSkills) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Given these skills and proficiency levels:
        ${JSON.stringify(userSkills)}

        Provide a detailed job matching analysis including:
        1. Top 5 most suitable job roles with:
           - Job titles
           - Required experience level
           - Skill match percentage
           - Core responsibilities
           - Industry demand
           - Salary range expectations
        
        2. Skill gap analysis:
           - Missing critical skills
           - Skills that need improvement
           - Recommended learning path
        
        3. Industry-specific recommendations:
           - Target companies
           - Certification recommendations
           - Portfolio project suggestions
        
        Format the response in markdown with clear sections and bullet points.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Job Match Error:', error);
      throw new Error('Failed to generate job matches');
    }
  }

  static async generateLearningPath(userSkills, targetRole) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Create a personalized learning path:
        Current Skills: ${JSON.stringify(userSkills)}
        Target Role: ${targetRole}
        
        Provide a detailed development plan including:
        1. Skill gaps analysis
           - Critical missing skills
           - Skills requiring improvement
        
        2. Learning roadmap
           - Recommended courses and resources
           - Project suggestions
           - Practice exercises
           - Estimated completion time
        
        3. Milestones and checkpoints
           - Progress indicators
           - Assessment criteria
           - Portfolio building suggestions
        
        4. Industry preparation
           - Interview preparation
           - Resume building tips
           - Portfolio projects
        
        Format the response in markdown with clear sections and timelines.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Learning Path Error:', error);
      throw new Error('Failed to generate learning path');
    }
  }

  static async getRealtimeCodeSuggestions(code, language, cursorPosition) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        Analyze this code snippet and current cursor position to provide real-time suggestions:
        Language: ${language}
        Code: ${code}
        Cursor Position: ${cursorPosition}

        Provide:
        1. Code completion suggestions
        2. Variable/function name recommendations
        3. Relevant code snippets
        4. Best practice reminders
        5. Potential error prevention tips

        Keep suggestions concise and directly applicable to the current context.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Real-time Suggestions Error:', error);
      throw new Error('Failed to generate code suggestions');
    }
  }
}

module.exports = AIAssistant;