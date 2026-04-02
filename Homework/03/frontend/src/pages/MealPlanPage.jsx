import { useState } from 'react';
import { aiAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Toast from '../components/common/Toast';
import { UtensilsCrossed, Clock, Flame, Plus } from 'lucide-react';

export default function MealPlanPage() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.generateMealPlan();
      setMealPlan(response.data.mealPlan);
      setToast({ type: 'success', message: 'Meal plan generated!' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate meal plan';
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const MealCard = ({ meal, type }) => {
    if (!meal) return null;

    return (
      <Card className="h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded uppercase">
            {type}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.name}</h3>
        {meal.recipe && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{meal.recipe}</p>
        )}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Ingredients</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {meal.ingredients.slice(0, 5).map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-4 pt-3 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{meal.calories} kcal</span>
          </div>
          <div className="text-sm text-gray-600">
            P: {meal.protein_g}g | C: {meal.carbs_g}g | F: {meal.fat_g}g
          </div>
        </div>
        {meal.prep_time_minutes && (
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{meal.prep_time_minutes} min prep</span>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Plan</h1>
          <p className="text-gray-600 mt-1">
            AI-generated meals tailored to your goals
          </p>
        </div>
        <Button onClick={generateMealPlan} loading={loading}>
          <UtensilsCrossed className="w-5 h-5 mr-2" />
          Generate New Plan
        </Button>
      </div>

      {loading && !mealPlan && (
        <div className="py-12">
          <Loading text="Generating your personalized meal plan..." />
        </div>
      )}

      {!mealPlan && !loading && (
        <Card className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No meal plan yet</h3>
            <p className="text-gray-600 mt-2 mb-4">
              Generate a personalized meal plan based on your profile
            </p>
            <Button onClick={generateMealPlan}>
              Generate Your Plan
            </Button>
          </div>
        </Card>
      )}

      {mealPlan && (
        <>
          {/* Summary */}
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Calories</p>
                <p className="text-xl font-bold text-gray-900">{mealPlan.total_calories}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-xl font-bold text-blue-600">{mealPlan.total_protein_g}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbs</p>
                <p className="text-xl font-bold text-green-600">{mealPlan.total_carbs_g}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fat</p>
                <p className="text-xl font-bold text-orange-600">{mealPlan.total_fat_g}g</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Meals</p>
                <p className="text-xl font-bold text-purple-600">3+ snacks</p>
              </div>
            </div>
            {mealPlan.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 italic">{mealPlan.notes}</p>
              </div>
            )}
          </Card>

          {/* Meal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard meal={mealPlan.breakfast} type="Breakfast" />
            <MealCard meal={mealPlan.lunch} type="Lunch" />
            <MealCard meal={mealPlan.dinner} type="Dinner" />
          </div>

          {/* Snacks */}
          {mealPlan.snacks && mealPlan.snacks.length > 0 && (
            <Card title="Snacks">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mealPlan.snacks.map((snack, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{snack.name}</p>
                      {snack.description && (
                        <p className="text-sm text-gray-600">{snack.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{snack.calories} kcal</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
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
