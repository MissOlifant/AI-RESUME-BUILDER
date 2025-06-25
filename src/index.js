import express from "express";
import cors from "cors";
import { CohereClient } from "cohere-ai";

// Setup Cohere
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

// === HTML formatter with proper structure ===
function formatResumeHTML(text, userData) {
  let html = "";

  // Always start with centered name and job role
  html += `<div class="text-center mb-6">`;
  html += `<h1 class="text-3xl font-bold mb-2">${userData.fullName}</h1>`;
  html += `<h2 class="text-xl text-gray-600 mb-4">${userData.jobRole}</h2>`;
  html += `</div>`;

  // Process the generated content by sections
  const sections = parseTextIntoSections(text);

  // Define the exact order we want
  const sectionOrder = [
    "contact information",
    "summary",
    "skills",
    "work experience",
    "education",
    "certifications",
    "languages",
    "projects",
    "references",
  ];

  sectionOrder.forEach((sectionName) => {
    const section = sections[sectionName.toLowerCase()];
    if (section && section.content.trim()) {
      html += formatSection(
        sectionName.toUpperCase(),
        section.content,
        sectionName,
      );
    }
  });

  return html;
}

// Parse text into sections
function parseTextIntoSections(text) {
  const sections = {};
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let currentSection = null;
  let currentContent = [];

  const sectionHeaders = [
    "contact information",
    "summary",
    "professional summary",
    "about me",
    "skills",
    "core skills",
    "technical skills",
    "work experience",
    "professional experience",
    "experience",
    "employment",
    "education",
    "academic background",
    "certifications",
    "certificates",
    "languages",
    "language skills",
    "projects",
    "key projects",
    "notable projects",
    "references",
  ];

  lines.forEach((line) => {
    const lowerLine = line.toLowerCase().replace(/[:\-]/g, "").trim();

    // Check if this line is a section header
    const matchedSection = sectionHeaders.find(
      (header) => lowerLine === header || lowerLine.startsWith(header),
    );

    if (matchedSection) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        const key = normalizeSection(currentSection);
        sections[key] = { content: currentContent.join("\n") };
      }

      // Start new section
      currentSection = matchedSection;
      currentContent = [];
    } else if (currentSection) {
      // Add content to current section
      if (line.trim()) {
        currentContent.push(line);
      }
    }
  });

  // Don't forget the last section
  if (currentSection && currentContent.length > 0) {
    const key = normalizeSection(currentSection);
    sections[key] = { content: currentContent.join("\n") };
  }

  return sections;
}

// Normalize section names to standard keys
function normalizeSection(sectionName) {
  const lower = sectionName.toLowerCase();
  if (lower.includes("contact")) return "contact information";
  if (lower.includes("summary") || lower.includes("about")) return "summary";
  if (lower.includes("skill")) return "skills";
  if (lower.includes("experience") || lower.includes("employment"))
    return "work experience";
  if (lower.includes("education") || lower.includes("academic"))
    return "education";
  if (lower.includes("certification") || lower.includes("certificate"))
    return "certifications";
  if (lower.includes("language")) return "languages";
  if (lower.includes("project")) return "projects";
  if (lower.includes("reference")) return "references";
  return lower;
}

// Format individual sections
function formatSection(title, content, sectionType) {
  let html = `<div class="mb-6">`;
  html += `<h3 class="text-xl font-bold mb-3 border-b-2 border-pink-500 pb-1">${title}</h3>`;

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (sectionType === "contact information") {
    html += formatContactInfo(lines);
  } else if (["skills", "languages"].includes(sectionType)) {
    html += formatSkillsOrLanguages(lines);
  } else if (
    ["work experience", "education", "certifications"].includes(sectionType)
  ) {
    html += formatExperienceSection(lines);
  } else {
    // Default formatting for summary, projects, references
    lines.forEach((line) => {
      if (line.startsWith("•") || line.startsWith("-")) {
        html += `<ul class="list-disc list-inside mb-2 ml-4">`;
        html += `<li>${line.replace(/^[•\-]\s*/, "")}</li>`;
        html += `</ul>`;
      } else {
        html += `<p class="mb-2">${line}</p>`;
      }
    });
  }

  html += `</div>`;
  return html;
}

// Format contact information with icons
function formatContactInfo(lines) {
  const icons = {
    email: "📧",
    phone: "📞",
    linkedin: "🔗",
    github: "🐙",
    portfolio: "🌐",
  };

  let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-2">';

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (lower.includes("email:")) {
      const email = line.split(":")[1]?.trim();
      html += `<p>${icons.email} <strong>Email:</strong> ${email}</p>`;
    } else if (lower.includes("phone:")) {
      const phone = line.split(":")[1]?.trim();
      html += `<p>${icons.phone} <strong>Phone:</strong> ${phone}</p>`;
    } else if (lower.includes("linkedin:")) {
      const url = line.split(":")[1]?.trim();
      html += `<p>${icons.linkedin} <strong>LinkedIn:</strong> <a href="${url}" class="text-pink-600 hover:underline" target="_blank">${url}</a></p>`;
    } else if (lower.includes("github:")) {
      const url = line.split(":")[1]?.trim();
      html += `<p>${icons.github} <strong>GitHub:</strong> <a href="${url}" class="text-pink-600 hover:underline" target="_blank">${url}</a></p>`;
    } else if (lower.includes("portfolio:")) {
      const url = line.split(":")[1]?.trim();
      html += `<p>${icons.portfolio} <strong>Portfolio:</strong> <a href="${url}" class="text-pink-600 hover:underline" target="_blank">${url}</a></p>`;
    }
  });

  html += "</div>";
  return html;
}

// Format skills or languages as bullet points
function formatSkillsOrLanguages(lines) {
  let html = '<ul class="list-disc list-inside space-y-1 ml-4">';

  lines.forEach((line) => {
    // Remove existing bullets and clean up
    const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
    if (cleanLine) {
      html += `<li>${cleanLine}</li>`;
    }
  });

  html += "</ul>";
  return html;
}

// Format experience sections with proper hierarchy
function formatExperienceSection(lines) {
  let html = '<div class="space-y-4">';
  let entryCount = 0;
  let currentEntry = null;
  let responsibilities = [];

  lines.forEach((line, index) => {
    // Check if this looks like a date/position line
    const hasDate = /\d{4}/.test(line);
    const isNewEntry =
      hasDate ||
      line.includes("University") ||
      line.includes("College") ||
      line.includes("Certified") ||
      line.includes("Developer") ||
      line.includes("Designer") ||
      line.includes("Manager");

    if (isNewEntry) {
      // Save previous entry
      if (currentEntry) {
        entryCount++;
        html += `<div class="mb-4 pl-4 border-l-2 border-pink-200">`;
        html += `<h4 class="font-semibold text-gray-800">${entryCount}. ${currentEntry}</h4>`;

        if (responsibilities.length > 0) {
          responsibilities.forEach((resp) => {
            if (resp.trim()) {
              html += `<p class="text-gray-700 ml-4">> ${resp}</p>`;
            }
          });
        }
        html += "</div>";
      }

      // Start new entry
      currentEntry = line;
      responsibilities = [];
    } else if (
      line.startsWith(">") ||
      line.startsWith("•") ||
      line.startsWith("-")
    ) {
      // This is a responsibility/detail
      responsibilities.push(line.replace(/^[>\•\-]\s*/, "").trim());
    } else if (currentEntry && line.trim()) {
      // Additional info for current entry
      responsibilities.push(line);
    }
  });

  // Don't forget the last entry
  if (currentEntry) {
    entryCount++;
    html += `<div class="mb-4 pl-4 border-l-2 border-pink-200">`;
    html += `<h4 class="font-semibold text-gray-800">${entryCount}. ${currentEntry}</h4>`;

    if (responsibilities.length > 0) {
      responsibilities.forEach((resp) => {
        if (resp.trim()) {
          html += `<p class="text-gray-700 ml-4">> ${resp}</p>`;
        }
      });
    }
    html += "</div>";
  }

  html += "</div>";
  return html;
}

function formatSingleEntry(entry, responsibilities) {
  let html = '<div class="mb-4 pl-4 border-l-2 border-pink-200">';
  html += `<h4 class="font-semibold text-gray-800">${entry}</h4>`;

  if (responsibilities.length > 0) {
    html += '<ul class="list-disc list-inside mt-2 ml-4 space-y-1">';
    responsibilities.forEach((resp) => {
      if (resp.trim()) {
        html += `<li class="text-gray-700">${resp}</li>`;
      }
    });
    html += "</ul>";
  }

  html += "</div>";
  return html;
}

// Build comprehensive user info for AI prompt
function buildDetailedPrompt(data) {
  let userSections = [];

  // Always include basic info
  userSections.push(`Name: ${data.fullName}`);
  userSections.push(`Job Role: ${data.jobRole}`);

  // Contact Information - Always include this section
  let contact = "CONTACT INFORMATION:\n";
  if (data.email) contact += `Email: ${data.email}\n`;
  if (data.phone) contact += `Phone: ${data.phone}\n`;
  if (data.linkedin) contact += `LinkedIn: ${data.linkedin}\n`;
  if (data.github) contact += `GitHub: ${data.github}\n`;
  if (data.portfolio) contact += `Portfolio: ${data.portfolio}\n`;
  userSections.push(contact);

  // Summary - Always include if provided
  if (data.summary) {
    userSections.push(`SUMMARY:\n${data.summary}`);
  }

  // Skills - Always include if provided
  if (data.skills) {
    userSections.push(`SKILLS:\n${data.skills}`);
  }

  // Work Experience - Always include if provided
  if (data.experience) {
    userSections.push(`WORK EXPERIENCE:\n${data.experience}`);
  }

  // Education - Always include if provided
  if (data.education) {
    userSections.push(`EDUCATION:\n${data.education}`);
  }

  // Certifications - Always include if provided
  if (data.certifications) {
    userSections.push(`CERTIFICATIONS:\n${data.certifications}`);
  }

  // Languages - Always include if provided
  if (data.languages) {
    userSections.push(`LANGUAGES:\n${data.languages}`);
  }

  // Projects - Always include if provided
  if (data.projects) {
    userSections.push(`PROJECTS:\n${data.projects}`);
  }

  // References - Always include if provided
  if (data.references && data.references.trim()) {
    userSections.push(`REFERENCES:\n${data.references}`);
  } else {
    // Add a note that references are available upon request if field is empty
    userSections.push(`REFERENCES:\nAvailable upon request`);
  }

  return userSections.join("\n\n");
}

//POST /generate-resume
app.post("/generate-resume", async (req, res) => {
  try {
    const userData = req.body;
    const userInfo = buildDetailedPrompt(userData);
    const template = userData.template || "basic";

    // Enhanced prompt that ensures all sections are included
    const prompt = `
    You are a professional resume writer. Create a complete, well-structured resume using ALL the provided information.

    CRITICAL REQUIREMENTS:
    1. You MUST include EVERY section that has information provided below
    2. Use EXACTLY these section headers in this EXACT order:
       - CONTACT INFORMATION
       - SUMMARY  
       - SKILLS
       - WORK EXPERIENCE
       - EDUCATION
       - CERTIFICATIONS
       - LANGUAGES
       - PROJECTS
       - REFERENCES (ALWAYS include this section - if no references provided, write "Available upon request")

    3. For WORK EXPERIENCE, EDUCATION, and CERTIFICATIONS:
       - Include dates and job titles/degrees
       - List responsibilities with bullets ("•")

    4. For SKILLS and LANGUAGES: Use bullet points with "•" 
    5. For REFERENCES: Include full contact details if provided, otherwise write "Available upon request"
    6. DO NOT skip any section - all 9 sections must appear
    7. DO NOT add commentary, explanations, or meta-text
    8. Start directly with the resume content

    User Information:
    ${userInfo}

    Generate the complete resume now. Include all 9 sections including REFERENCES.
    `;

    const response = await cohere.generate({
      model: "command",
      prompt,
      maxTokens: 1500,
      temperature: 0.3,
    });

    let raw = response.generations[0].text.trim();

    // Clean up any AI commentary
    raw = raw
      .replace(/^.*?(?:Here|Below).*?(?:is|are).*?(?:resume|CV).*?[:]/gis, "")
      .trim();
    raw = raw.replace(/^.*?complete.*?resume.*?[:]/gis, "").trim();

    // Remove trailing commentary
    const lines = raw.split("\n");
    const cleanLines = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      // Stop if we hit obvious commentary
      if (
        lowerLine.includes("this resume") ||
        lowerLine.includes("the above") ||
        lowerLine.includes("good luck") ||
        lowerLine.includes("hope this helps") ||
        lowerLine.includes(" Please note") ||
        lowerLine.includes("for further") ||
        lowerLine.includes("if you need") ||
        lowerLine.includes("feel free")
      ) {
        break;
      }
      cleanLines.push(line);
    }

    raw = cleanLines.join("\n").trim();

    // Format the HTML with proper structure
    const formattedHTML = formatResumeHTML(raw, userData);

    res.json({ resume: formattedHTML });
  } catch (error) {
    console.error("Error in /generate-resume:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
