(async function () {
  if (window.hasRunCourseEvalScript) return;
  window.hasRunCourseEvalScript = true;

  function waitForSelector(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const intervalTime = 100;
      let timeElapsed = 0;

      const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          resolve(element);
        } else if (timeElapsed >= timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout: ${selector} not found`));
        }
        timeElapsed += intervalTime;
      }, intervalTime);
    });
  }

  function waitForAllSelectors(selectors, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const intervalTime = 100;
      let timeElapsed = 0;

      const interval = setInterval(() => {
        const elements = selectors.map(selector => document.querySelector(selector));
        if (elements.every(el => el)) {
          clearInterval(interval);
          resolve(elements);
        } else if (timeElapsed >= timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout: Not all selectors found`));
        }
        timeElapsed += intervalTime;
      }, intervalTime);
    });
  }

  function isListPage() {
    return document.querySelectorAll('.btn.btn-default').length > 0;
  }

  function isFormPage() {
    return document.querySelector('.form-control');
  }

  async function automateEvaluation(startIndex = 0) {
    try {
      if (isFormPage()) {
        // On the form page: fill and submit
        await waitForAllSelectors(['input[type="radio"][value="A"]', '.form-control']);
        const radios = document.querySelectorAll('input[type="radio"][value="A"]');
        radios.forEach(radio => { if (!radio.checked) radio.click(); });
        const textarea = document.querySelector('.form-control');
        if (textarea) textarea.value = "謝謝老師！";

        chrome.storage.local.set({ currentFormIndex: startIndex + 1 }, () => {
        const submitButton = document.querySelector('.btn.btn-light.btn-default');
        if (submitButton) submitButton.click();
        console.log("Form submitted, waiting for navigation...");
      });
      } 
      else if (isListPage()) {
        // On the list page: click the next form button
        let forms = Array.from(document.querySelectorAll('.btn.btn-default'));
        console.log(`Found ${forms.length} forms.`);
        console.log(`Current form index: ${startIndex}`);
        if (startIndex < forms.length) {
          chrome.storage.local.set({ currentFormIndex: startIndex });
          forms[startIndex].click();
        } 
        else {
          chrome.storage.local.remove("currentFormIndex");
          console.log(`Current form index: ${startIndex} All forms submitted successfully!`);
        }
      }
      else {
        // Not on a relevant page
        console.log("Not on a recognized evaluation page.");
      }
    } catch (error) {
      console.error("Automation error:", error);
    }
  }

  chrome.storage.local.get("currentFormIndex", (data) => {
  if (data.currentFormIndex !== undefined) {
    const idx = parseInt(data.currentFormIndex, 10);
    automateEvaluation(idx);
  }
  });

})();
