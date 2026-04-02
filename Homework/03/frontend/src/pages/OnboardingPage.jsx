import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Toast from '../components/common/Toast';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'active', label: 'Active (exercise 6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise/physical job)' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const GOALS = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain', label: 'Gain Muscle' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { saveHealthProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    weight_kg: '',
    height_cm: '',
    age: '',
    gender: '',
    activity_level: '',
    goal: 'maintain',
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.weight_kg || formData.weight_kg < 20 || formData.weight_kg > 300) {
        newErrors.weight_kg = 'Please enter a valid weight (20-300 kg)';
      }
      if (!formData.height_cm || formData.height_cm < 50 || formData.height_cm > 250) {
        newErrors.height_cm = 'Please enter a valid height (50-250 cm)';
      }
    }

    if (stepNum === 2) {
      if (!formData.age || formData.age < 10 || formData.age > 120) {
        newErrors.age = 'Please enter a valid age (10-120)';
      }
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
    }

    if (stepNum === 3) {
      if (!formData.activity_level) {
        newErrors.activity_level = 'Please select your activity level';
      }
    }

    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await saveHealthProfile(formData);
      await updateUser();

      setToast({ type: 'success', message: 'Profile saved successfully!' });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save profile';
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Body Measurements</h2>
              <p className="text-gray-600 mt-2">Let's start with your basic measurements</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                error={errors.weight_kg}
                placeholder="70"
                required
              />
              <Input
                label="Height (cm)"
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                error={errors.height_cm}
                placeholder="175"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
              <p className="text-gray-600 mt-2">Tell us about yourself</p>
            </div>

            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              placeholder="25"
              required
            />

            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              error={errors.gender}
              options={GENDERS}
              required
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Activity & Goals</h2>
              <p className="text-gray-600 mt-2">Help us personalize your recommendations</p>
            </div>

            <Select
              label="Activity Level"
              name="activity_level"
              value={formData.activity_level}
              onChange={handleChange}
              error={errors.activity_level}
              options={ACTIVITY_LEVELS}
              required
            />

            <Select
              label="Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              options={GOALS}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </Button>
              ) : (
                <div className="flex-1" />
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Skip link for testing */}
        <p className="text-center text-white/60 text-sm mt-6">
          Complete all steps to unlock your personalized dashboard
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
