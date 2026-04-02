const { supabase } = require('../config/supabase');

/**
 * Get schedule entries
 * GET /api/schedule?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
const getSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, type } = req.query;

    let query = supabase
      .from('schedule_entries')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (start_date) {
      query = query.gte('scheduled_date', start_date);
    }
    if (end_date) {
      query = query.lte('scheduled_date', end_date);
    }
    if (type) {
      query = query.eq('entry_type', type);
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Get schedule error:', error);
      return res.status(500).json({
        error: 'FETCH_FAILED',
        message: 'Failed to fetch schedule entries',
      });
    }

    res.json({
      entries,
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to fetch schedule',
    });
  }
};

/**
 * Create schedule entry
 * POST /api/schedule
 */
const createScheduleEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entry_type, title, description, scheduled_date, scheduled_time, duration_minutes, metadata } = req.body;

    const { data: entry, error } = await supabase
      .from('schedule_entries')
      .insert([
        {
          user_id: userId,
          entry_type,
          title,
          description: description || null,
          scheduled_date,
          scheduled_time: scheduled_time || null,
          duration_minutes: duration_minutes || null,
          metadata: metadata || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Create schedule entry error:', error);
      return res.status(500).json({
        error: 'CREATE_FAILED',
        message: 'Failed to create schedule entry',
      });
    }

    res.status(201).json({
      message: 'Schedule entry created successfully',
      entry,
    });
  } catch (error) {
    console.error('Create schedule entry error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to create schedule entry',
    });
  }
};

/**
 * Update schedule entry
 * PUT /api/schedule/:id
 */
const updateScheduleEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('schedule_entries')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Schedule entry not found',
      });
    }

    // Remove fields that shouldn't be updated
    const { user_id, id: _, created_at, ...validUpdates } = updates;

    const { data: entry, error } = await supabase
      .from('schedule_entries')
      .update({
        ...validUpdates,
        updated_at: new Date(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update schedule entry error:', error);
      return res.status(500).json({
        error: 'UPDATE_FAILED',
        message: 'Failed to update schedule entry',
      });
    }

    res.json({
      message: 'Schedule entry updated successfully',
      entry,
    });
  } catch (error) {
    console.error('Update schedule entry error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to update schedule entry',
    });
  }
};

/**
 * Mark schedule entry as completed
 * PATCH /api/schedule/:id/complete
 */
const completeScheduleEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: entry, error } = await supabase
      .from('schedule_entries')
      .update({
        completed: true,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Complete schedule entry error:', error);
      return res.status(500).json({
        error: 'UPDATE_FAILED',
        message: 'Failed to mark entry as completed',
      });
    }

    res.json({
      message: 'Schedule entry marked as completed',
      entry,
    });
  } catch (error) {
    console.error('Complete schedule entry error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to complete schedule entry',
    });
  }
};

/**
 * Delete schedule entry
 * DELETE /api/schedule/:id
 */
const deleteScheduleEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership and delete
    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete schedule entry error:', error);
      return res.status(500).json({
        error: 'DELETE_FAILED',
        message: 'Failed to delete schedule entry',
      });
    }

    res.json({
      message: 'Schedule entry deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule entry error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to delete schedule entry',
    });
  }
};

/**
 * Get exercises
 * GET /api/exercises
 */
const getExercises = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduled_date, completed } = req.query;

    let query = supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false });

    if (scheduled_date) {
      query = query.eq('scheduled_date', scheduled_date);
    }
    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    const { data: exercises, error } = await query;

    if (error) {
      console.error('Get exercises error:', error);
      return res.status(500).json({
        error: 'FETCH_FAILED',
        message: 'Failed to fetch exercises',
      });
    }

    res.json({
      exercises,
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to fetch exercises',
    });
  }
};

/**
 * Create exercise
 * POST /api/exercises
 */
const createExercise = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, calories_burned, duration_minutes, difficulty, category, scheduled_date } = req.body;

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert([
        {
          user_id: userId,
          name,
          description: description || null,
          calories_burned: calories_burned || null,
          duration_minutes: duration_minutes || null,
          difficulty: difficulty || null,
          category: category || null,
          scheduled_date: scheduled_date || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Create exercise error:', error);
      return res.status(500).json({
        error: 'CREATE_FAILED',
        message: 'Failed to create exercise',
      });
    }

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise,
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to create exercise',
    });
  }
};

/**
 * Mark exercise as completed
 * PATCH /api/exercises/:id/complete
 */
const completeExercise = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: exercise, error } = await supabase
      .from('exercises')
      .update({
        completed: true,
        completed_at: new Date(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Complete exercise error:', error);
      return res.status(500).json({
        error: 'UPDATE_FAILED',
        message: 'Failed to mark exercise as completed',
      });
    }

    res.json({
      message: 'Exercise marked as completed',
      exercise,
    });
  } catch (error) {
    console.error('Complete exercise error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to complete exercise',
    });
  }
};

/**
 * Delete exercise
 * DELETE /api/exercises/:id
 */
const deleteExercise = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete exercise error:', error);
      return res.status(500).json({
        error: 'DELETE_FAILED',
        message: 'Failed to delete exercise',
      });
    }

    res.json({
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to delete exercise',
    });
  }
};

module.exports = {
  getSchedule,
  createScheduleEntry,
  updateScheduleEntry,
  completeScheduleEntry,
  deleteScheduleEntry,
  getExercises,
  createExercise,
  completeExercise,
  deleteExercise,
};
