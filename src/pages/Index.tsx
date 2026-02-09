import { useNavigate } from 'react-router-dom';
import { SurveyWizard } from '@/components/survey/SurveyWizard';
import { SurveyAnswers } from '@/types/survey';
import { mapSurveyToInputs } from '@/lib/surveyMapping';

const Index = () => {
  const navigate = useNavigate();

  const handleSurveyComplete = (answers: SurveyAnswers) => {
    const inputs = mapSurveyToInputs(answers);
    // Store in sessionStorage so the estimator can pick it up
    sessionStorage.setItem('survey_answers', JSON.stringify(answers));
    sessionStorage.setItem('survey_inputs', JSON.stringify(inputs));
    navigate('/estimator');
  };

  return <SurveyWizard onComplete={handleSurveyComplete} />;
};

export default Index;
