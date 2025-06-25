     function addField(type) {
      const container = document.getElementById(`${type}-container`);
      const count = container.querySelectorAll('textarea').length + 1;
      const textarea = document.createElement('textarea');
      textarea.id = `${type}-${count}`;
      textarea.rows = 3;
      textarea.placeholder = type === 'education'
        ? 'e.g. MSc Artificial Intelligence, ABC University, 2023–2025'
        : type === 'certifications'
        ? 'e.g. Microsoft Certified Azure Developer, 2024'
        : 'e.g. Backend Developer at XYZ Ltd, June 2021 – Present, Built REST APIs...';
      textarea.className = "w-full border border-gray-300 rounded-md px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-pink-400";
      container.appendChild(textarea);
    }

    function getMultiValues(type) {
      return Array.from(document.querySelectorAll(`#${type}-container textarea`))
        .map(t => t.value)
        .filter(val => val.trim() !== '')
        .join('\n\n');
    }

    async function generateResume() {
      const getValue = id => document.getElementById(id).value;

      const payload = {
      fullName: getValue('fullName'),
      jobRole: getValue('jobRole'),
      industry: getValue('industry'),
      summary: getValue('summary'),
      skills: getValue('skills'),
      experience: getMultiValues('experience'),
      education: getMultiValues('education'),
      certifications: getMultiValues('certifications'),
      template: getValue('template') 
 };


      if (!payload.fullName || !payload.jobRole || !payload.summary) {
        alert('Please fill in at least Full Name, Job Role, and Summary.');
        return;
      }

      const button = document.getElementById('generate-btn');
      button.disabled = true;
      button.innerText = "Generating...";

      try {
        const response = await fetch('https://3b903056-8b7d-4369-9e4b-5fb5cbe6231d-00-33m2mreivyf0c.spock.replit.dev/generate-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 429) {
          alert('API quota exceeded. Please check your OpenAI billing and usage limits.');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const preview = document.getElementById('resume-preview');
        preview.innerHTML = `<div style="font-family: ${getValue('fontStyle')}; color: ${getValue('themeColor')}; white-space: pre-wrap;">${data.resume}</div>`;
        document.getElementById('resume-output').classList.remove('hidden');

      } catch (err) {
        console.error(err);
        alert('Error generating resume. Check console for details.');
      } finally {
        button.disabled = false;
        button.innerText = "Generate Resume";
      }
    }

    async function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const resumeElement = document.getElementById("resume-preview");
      const canvas = await html2canvas(resumeElement, { scale: 3 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");
    }

    document.getElementById('resume-form').addEventListener('reset', () => {
      document.getElementById('resume-output').classList.add('hidden');
    });