import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { Activity, Flame, Target, TrendingUp, Utensils, Dumbbell } from 'lucide-react';

export default function DashboardHome() {
  const { healthProfile, loading } = useProfile();

  const [stats, setStats] = useState({
    bmr: 0,
    dailyCalories: 0,
    bmi: 0,
    bmiCategory: '',
  });

  useEffect(() => {
    if (healthProfile) {
      const bmi = healthProfile.weight_kg / ((healthProfile.height_cm / 100) ** 2);
      let bmiCategory = 'normal';
      if (bmi < 18.5) bmiCategory = 'underweight';
      else if (bmi >= 25) bmiCategory = bmi < 30 ? 'overweight' : 'obese';

      setStats({
        bmr: Math.round(healthProfile.bmr),
        dailyCalories: Math.round(healthProfile.daily_calories),
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
      });
    }
  }, [healthProfile]);

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  const statCards = [
    {
      title: 'Daily Calories',
      value: stats.dailyCalories,
      unit: 'kcal',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      description: 'Your daily target',
    },
    {
      title: 'BMR',
      value: stats.bmr,
      unit: 'kcal',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Basal metabolic rate',
    },
    {
      title: 'BMI',
      value: stats.bmi,
      unit: '',
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: stats.bmiCategory,
    },
    {
      title: 'Weight',
      value: healthProfile?.weight_kg,
      unit: 'kg',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: `Goal: ${healthProfile?.goal || 'maintain'}`,
    },
  ];

  const quickActions = [
    {
      title: 'Generate Meal Plan',
      description: 'Get AI-powered meal recommendations',
      icon: Utensils,
      href: '/dashboard/meal-plan',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'View Exercises',
      description: 'Personalized workout recommendations',
      icon: Dumbbell,
      href: '/dashboard/exercises',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Nutrition Search',
      description: 'Look up food nutritional info',
      icon: Target,
      href: '/dashboard/nutrition',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Calendar',
      description: 'Plan your meals and workouts',
      icon: Activity,
      href: '/dashboard/calendar',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {healthProfile ? ' Champion' : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your personalized health overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {stat.unit}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className="block group"
              >
                <Card className="h-full hover:shadow-xl transition-all group-hover:-translate-y-1">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </Card>
              </a>
            );
          })}
        </div>
      </div>

      {/* Profile Info */}
      <Card title="Your Profile">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="font-medium text-gray-900">{healthProfile?.age} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-medium text-gray-900 capitalize">{healthProfile?.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Activity Level</p>
            <p className="font-medium text-gray-900 capitalize">{healthProfile?.activity_level?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Height</p>
            <p className="font-medium text-gray-900">{healthProfile?.height_cm} cm</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Weight</p>
            <p className="font-medium text-gray-900">{healthProfile?.weight_kg} kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Goal</p>
            <p className="font-medium text-gray-900 capitalize">{healthProfile?.goal}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
