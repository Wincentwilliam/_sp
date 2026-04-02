import { useState } from 'react';
import { aiAPI, scheduleAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Toast from '../components/common/Toast';
import { Dumbbell, Flame, Clock, Calendar, CheckCircle } from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const getExercises = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getExercises();
      setExercises(response.data.exercises);
      setToast({ type: 'success', message: 'Exercise recommendations loaded!' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get exercises';
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const addToSchedule = async (exercise) => {
    try {
      await scheduleAPI.createExercise({
        name: exercise.name,
        description: exercise.description,
        calories_burned: exercise.calories_burned,
        duration_minutes: exercise.duration_minutes,
        difficulty: exercise.difficulty,
        category: exercise.category,
      });
      setToast({ type: 'success', message: 'Exercise added to schedule!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to add exercise' });
    }
  };

  const ExerciseCard = ({ exercise }) => {
    const difficultyColors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };

    return (
      <Card className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
            <span className="text-sm text-gray-500">{exercise.category}</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>

        {exercise.instructions && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Instructions</p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              {exercise.instructions.slice(0, 4).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{exercise.calories_burned} kcal</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{exercise.duration_minutes} min</span>
          </div>
        </div>

        {exercise.sets_reps && (
          <p className="text-sm text-gray-600 mt-2">{exercise.sets_reps}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => addToSchedule(exercise)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add to Schedule
        </Button>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
          <p className="text-gray-600 mt-1">
            Personalized workout recommendations
          </p>
        </div>
        <Button onClick={getExercises} loading={loading}>
          <Dumbbell className="w-5 h-5 mr-2" />
          Get Recommendations
        </Button>
      </div>

      {loading && !exercises && (
        <div className="py-12">
          <Loading text="Creating your personalized workout plan..." />
        </div>
      )}

      {!exercises && !loading && (
        <Card className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No exercises yet</h3>
            <p className="text-gray-600 mt-2 mb-4">
              Get AI-powered exercise recommendations based on your profile
            </p>
            <Button onClick={getExercises}>
              Get Your Plan
            </Button>
          </div>
        </Card>
      )}

      {exercises && (
        <>
          {/* Weekly Plan */}
          {exercises.weekly_plan && (
            <Card title="Weekly Plan">
              <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                {Object.entries(exercises.weekly_plan).map(([day, plan]) => (
                  <div key={day} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                      {day.slice(0, 3)}
                    </p>
                    <p className="text-sm text-gray-900">
                      {plan === 'rest' ? (
                        <span className="text-green-600">Rest</span>
                      ) : (
                        `${plan.length} exercises`
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tips */}
          {exercises.tips && (
            <Card title="Pro Tips">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exercises.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.recommended_exercises?.map((exercise, i) => (
              <ExerciseCard key={i} exercise={exercise} />
            ))}
          </div>
        </>
      )}

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
