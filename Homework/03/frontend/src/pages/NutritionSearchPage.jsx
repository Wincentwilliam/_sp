import { useState } from 'react';
import { aiAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import Toast from '../components/common/Toast';
import { Search, CheckCircle, XCircle, Flame } from 'lucide-react';

export default function NutritionSearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const searchNutrition = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setToast({ type: 'warning', message: 'Please enter a food name' });
      return;
    }

    setLoading(true);
    try {
      const response = await aiAPI.searchNutrition(query);
      setResult(response.data.nutrition);
      setToast({ type: 'success', message: 'Nutrition info loaded!' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search nutrition';
      setToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const HealthScore = ({ score }) => {
    let color = 'text-green-600';
    let bgColor = 'bg-green-100';
    let label = 'Healthy';

    if (score < 40) {
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      label = 'Limit';
    } else if (score < 70) {
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      label = 'Moderate';
    }

    return (
      <div className={`${bgColor} rounded-full px-4 py-2 inline-flex items-center gap-2`}>
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutrition Search</h1>
        <p className="text-gray-600 mt-1">
          Look up any food to get detailed nutritional information
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <form onSubmit={searchNutrition} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a food (e.g., 'apple', 'grilled chicken breast', 'oatmeal')"
              className="w-full"
            />
          </div>
          <Button type="submit" loading={loading}>
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="py-12">
          <Loading text="Analyzing nutritional information..." />
        </div>
      )}

      {!result && !loading && (
        <Card className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Search for food</h3>
            <p className="text-gray-600 mt-2">
              Get calories, macros, vitamins, minerals, and a personalized health score
            </p>
          </div>
        </Card>
      )}

      {result && !loading && (
        <>
          {/* Main Info */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{result.food_name}</h2>
                <p className="text-gray-600">Serving: {result.serving_size}</p>
              </div>
              <div>
                <HealthScore score={result.health_score} />
              </div>
            </div>

            {result.health_analysis && (
              <p className="text-gray-700 mb-6">{result.health_analysis}</p>
            )}

            {result.is_good_for_goal !== undefined && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                result.is_good_for_goal ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                {result.is_good_for_goal ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  result.is_good_for_goal ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {result.is_good_for_goal ? 'Good for your goals' : 'Consider alternatives'}
                </span>
              </div>
            )}

            {result.recommendation && (
              <p className="text-sm text-gray-600 mt-3 italic">{result.recommendation}</p>
            )}
          </Card>

          {/* Calories & Macros */}
          <Card title="Calories & Macros">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{result.calories}</p>
                <p className="text-sm text-gray-600">Calories</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{result.macros?.protein_g}g</p>
                <p className="text-sm text-gray-600">Protein</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{result.macros?.carbs_g}g</p>
                <p className="text-sm text-gray-600">Carbs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{result.macros?.fat_g}g</p>
                <p className="text-sm text-gray-600">Fat</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{result.macros?.fiber_g}g</p>
                <p className="text-sm text-gray-600">Fiber</p>
              </div>
            </div>
          </Card>

          {/* Vitamins */}
          {result.vitamins && (
            <Card title="Vitamins">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.vitamins).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ').replace('mg', '').replace('mcg', '').replace('iu', '')}
                      </span>
                      <span className="font-medium text-gray-900">
                        {value}
                        <span className="text-xs text-gray-500 ml-1">
                          {key.includes('mcg') ? 'mcg' : key.includes('mg') ? 'mg' : 'IU'}
                        </span>
                      </span>
                    </div>
                  )
                ))}
              </div>
            </Card>
          )}

          {/* Minerals */}
          {result.minerals && (
            <Card title="Minerals">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.minerals).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace('_mg', '')}
                      </span>
                      <span className="font-medium text-gray-900">
                        {value}
                        <span className="text-xs text-gray-500 ml-1">mg</span>
                      </span>
                    </div>
                  )
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
