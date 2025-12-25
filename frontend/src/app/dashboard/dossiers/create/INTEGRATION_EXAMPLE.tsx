// Example usage in your main create page

import Step2_DocumentsPersonnels from './Step2_DocumentsPersonnels';
import Step3_DocumentsRevenus from './Step3_DocumentsRevenus';

// In your page component where you manage stages:

// Stage 2 - Documents Personnels
{currentStage === 2 && (
  <Step2_DocumentsPersonnels
    onNext={(data) => {
      // Save step 2 data
      setStep2Data(data);
      handleNext(); // Move to stage 3
    }}
    onBack={handleBack}
    initialData={step2Data}
  />
)}

// Stage 3 - Documents Revenus
{currentStage === 3 && (
  <Step3_DocumentsRevenus
    onNext={(data) => {
      // Save step 3 data
      setStep3Data(data);
      handleNext(); // Move to stage 4
    }}
    onBack={handleBack}
    initialData={step3Data}
    incomeType={simulationData.situationProfessionnelle} // Pass the income type from stage 1
  />
)}
