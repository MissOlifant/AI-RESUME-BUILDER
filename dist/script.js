   async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const resumeContent = document.getElementById("resume-preview").innerText;
      const lines = doc.splitTextToSize(resumeContent, 180);
      doc.text(lines, 10, 10);
      doc.save("resume.pdf");
    }

    function generateResume() {
      const getValue = id => document.getElementById(id).value;
      const output = `
        <div style="font-family: ${getValue('fontStyle')}; color: ${getValue('themeColor')};">
          <h3>${getValue('fullName')}</h3>
          <p><strong>Email:</strong> ${getValue('email')}</p>
          <p><strong>Phone:</strong> ${getValue('phone')}</p>
          <p><strong>LinkedIn:</strong> ${getValue('linkedin')}</p>
          <p><strong>GitHub:</strong> ${getValue('github')}</p>
          <p><strong>Portfolio:</strong> ${getValue('portfolio')}</p>
          <p><strong>Job Role:</strong> ${getValue('jobRole')}</p>
          <p><strong>Industry:</strong> ${getValue('industry')}</p>
          <p><strong>Summary:</strong> ${getValue('summary')}</p>
          <p><strong>Education:</strong> ${getValue('education')}</p>
          <p><strong>Certifications:</strong> ${getValue('certifications')}</p>
          <p><strong>Languages:</strong> ${getValue('languages')}</p>
          <p><strong>Projects:</strong> ${getValue('projects')}</p>
          <p><strong>Experience:</strong> ${getValue('experience')}</p>
          <p><strong>Skills:</strong> ${getValue('skills')}</p>
          <p><strong>References:</strong> ${getValue('references')}</p>
        </div>
      `;
      const preview = document.getElementById('resume-preview');
      preview.innerHTML = output;
      document.getElementById('resume-output').classList.remove('hidden');
    }
