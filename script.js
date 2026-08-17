/* ==========================================================================
   DM HOME IMPROVEMENT LLC - LUXURY KITCHEN REMODELING LANDING PAGE
   Interactive Multi-Step Qualification Modal, Video Controls & Lead Magnet
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Mobile Menu Drawer Toggle
  // --------------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 2. Rimadesio Hero Video Controls (Mute / Unmute & Play / Pause)
  // --------------------------------------------------------------------------
  const heroBgVideo = document.getElementById('heroBgVideo');
  const videoSoundBtn = document.getElementById('videoSoundBtn');

  if (heroBgVideo && videoSoundBtn) {
    videoSoundBtn.addEventListener('click', () => {
      if (heroBgVideo.muted) {
        heroBgVideo.muted = false;
        videoSoundBtn.innerHTML = '🔊 Sound On';
      } else {
        heroBgVideo.muted = true;
        videoSoundBtn.innerHTML = '🔇 Muted';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. 5-Second Automatic Questionnaire Popup Modal Trigger
  // --------------------------------------------------------------------------
  const quizModal = document.getElementById('quizModal');
  const quizCloseBtn = document.getElementById('quizCloseBtn');
  let quizHasAutoTriggered = false;

  const openQuizModal = () => {
    if (quizModal) {
      quizModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeQuizModal = () => {
    if (quizModal) {
      quizModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // 5-Second Timer
  setTimeout(() => {
    if (!quizHasAutoTriggered && !localStorage.getItem('dm_kitchen_quiz_submitted')) {
      openQuizModal();
      quizHasAutoTriggered = true;
    }
  }, 5000);

  if (quizCloseBtn) {
    quizCloseBtn.addEventListener('click', closeQuizModal);
  }

  // Open modal from any CTA button click
  document.querySelectorAll('.js-open-consultation').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuizModal();
    });
  });

  // Close modal when clicking dark overlay outside card
  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) {
        closeQuizModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Multi-Step Questionnaire Wizard Logic (5 Steps Total)
  // --------------------------------------------------------------------------
  let currentStep = 1;
  const totalSteps = 5;
  const userAnswers = {
    budget: '',
    timeline: '',
    projectType: '',
    matters: [],
    name: '',
    phone: '',
    email: '',
    zip: ''
  };

  const stepElements = {
    1: document.getElementById('quizStep1'),
    2: document.getElementById('quizStep2'),
    3: document.getElementById('quizStep3'),
    4: document.getElementById('quizStep4'),
    5: document.getElementById('quizStep5'),
    success: document.getElementById('quizStepSuccess')
  };

  const stepIndicator = document.getElementById('quizStepIndicator');
  const progressFill = document.getElementById('quizProgressFill');

  const updateQuizStep = (newStep) => {
    currentStep = newStep;

    Object.values(stepElements).forEach(el => {
      if (el) el.style.display = 'none';
    });

    if (newStep <= totalSteps) {
      if (stepElements[newStep]) stepElements[newStep].style.display = 'block';
      if (stepIndicator) stepIndicator.textContent = `STEP ${newStep} OF ${totalSteps}`;
      if (progressFill) progressFill.style.width = `${(newStep / totalSteps) * 100}%`;
    } else {
      if (stepElements.success) stepElements.success.style.display = 'block';
      if (stepIndicator) stepIndicator.textContent = 'COMPLETE';
      if (progressFill) progressFill.style.width = '100%';
    }
  };

  // Step 1 Selection (Budget)
  document.querySelectorAll('#quizStep1 .quiz-option-card').forEach(card => {
    card.addEventListener('click', () => {
      userAnswers.budget = card.dataset.value;
      setTimeout(() => updateQuizStep(2), 200);
    });
  });

  // Step 2 Selection (Timeline)
  document.querySelectorAll('#quizStep2 .quiz-option-card').forEach(card => {
    card.addEventListener('click', () => {
      userAnswers.timeline = card.dataset.value;
      setTimeout(() => updateQuizStep(3), 200);
    });
  });

  // Step 3 Selection (Project Type)
  document.querySelectorAll('#quizStep3 .quiz-option-card').forEach(card => {
    card.addEventListener('click', () => {
      userAnswers.projectType = card.dataset.value;
      setTimeout(() => updateQuizStep(4), 200);
    });
  });

  // Step 4 Checkbox Selection (What Matters Most)
  document.querySelectorAll('#quizStep4 .quiz-checkbox-card').forEach(card => {
    card.addEventListener('click', () => {
      const checkbox = card.querySelector('.quiz-checkbox');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      }
    });
  });

  const btnNextStep4 = document.getElementById('btnNextStep4');
  if (btnNextStep4) {
    btnNextStep4.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('#quizStep4 .quiz-checkbox:checked');
      userAnswers.matters = Array.from(selectedCheckboxes).map(cb => cb.value);
      updateQuizStep(5);
    });
  }

  // Step 5 Final Form Submission (Direct 1-Click Submission)
  const quizFinalForm = document.getElementById('quizFinalForm');
  if (quizFinalForm) {
    quizFinalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      userAnswers.name = document.getElementById('quizName').value;
      userAnswers.phone = document.getElementById('quizPhone').value;
      userAnswers.email = document.getElementById('quizEmail').value;
      userAnswers.zip = document.getElementById('quizZip').value;

      console.log('DM Home Improvement Kitchen Lead Submitted:', userAnswers);
      localStorage.setItem('dm_kitchen_quiz_submitted', 'true');

      // Update name on success screen
      const quizSuccessName = document.getElementById('quizSuccessName');
      if (quizSuccessName) {
        quizSuccessName.textContent = userAnswers.name;
      }

      // Show success screen instantly in 1 click with zero extra steps or external redirects
      updateQuizStep(6);
    });
  }




  // --------------------------------------------------------------------------
  // 5. Lead Magnet Remodel Guide Form Submission
  // --------------------------------------------------------------------------
  const guideLeadForm = document.getElementById('guideLeadForm');
  const guideFormContainer = document.getElementById('guideFormContainer');
  const guideSuccessMessage = document.getElementById('guideSuccessMessage');

  if (guideLeadForm) {
    guideLeadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (guideFormContainer && guideSuccessMessage) {
        guideFormContainer.style.display = 'none';
        guideSuccessMessage.style.display = 'block';
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. Photo Detail Viewer Modal (Matched to REQUEST Folder Photos)
  // --------------------------------------------------------------------------
  const renderViewerModal = document.getElementById('renderViewerModal');
  const renderViewerClose = document.getElementById('renderViewerClose');
  const renderModalImg = document.getElementById('renderModalImg');
  const renderModalTitle = document.getElementById('renderModalTitle');
  const renderModalDesc = document.getElementById('renderModalDesc');

  const renderData = {
    'photo1': {
      title: 'Emerald Green & Gold Shaker Style',
      desc: 'Deep forest green custom cabinetry paired with warm wood open shelving, champagne gold hardware, gas cooktop, and vertical subway tile backsplash.',
      img: 'assets/kitchen-photo-1.png'
    },
    'photo2': {
      title: 'Slate Grey & Dark Granite Island',
      desc: 'Custom slate grey island cabinetry featuring a sleek dark granite worktop, double undermount ceramic sink, brushed nickel faucet, and integrated dishwasher.',
      img: 'assets/kitchen-photo-2.png'
    },
    'photo3': {
      title: 'Bright White & Calacatta Quartz Peninsula',
      desc: 'Premium bright white custom cabinetry featuring champagne gold hardware, Calacatta white vein quartz countertops, and an open peninsula layout.',
      img: 'assets/kitchen-photo-3.png'
    },
    'photo4': {
      title: 'Cream Shaker & Speckled Granite Countertops',
      desc: 'Clean cream shaker cabinetry with polished nickel pulls, speckled granite surfaces, double white sink, and a matte black gooseneck faucet.',
      img: 'assets/kitchen-photo-4.png'
    }
  };

  document.querySelectorAll('.js-view-render').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const styleKey = btn.dataset.style;
      const data = renderData[styleKey];

      if (data && renderViewerModal) {
        renderModalImg.src = data.img;
        renderModalTitle.textContent = data.title;
        renderModalDesc.textContent = data.desc;
        renderViewerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (renderViewerClose) {
    renderViewerClose.addEventListener('click', () => {
      if (renderViewerModal) {
        renderViewerModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
