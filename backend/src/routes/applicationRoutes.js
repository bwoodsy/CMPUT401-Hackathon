const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Get all applications (with optional user_id filter)
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.query;

        let query = supabase.from('applications').select('*');

        if (user_id) {
            query = query.eq('user_id', user_id);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get user's applications
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get single application by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Application not found' });
            }
            return res.status(500).json({ error: error.message });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create application
router.post('/', async (req, res) => {
    try {
        const { user_id, job_id, status, notes, job_title, company } = req.body;

        if (!user_id || !job_id) {
            return res.status(400).json({ error: 'user_id and job_id are required' });
        }

        const { data, error } = await supabase
            .from('applications')
            .insert([{
                user_id,
                job_id,
                status: status || 'applied',
                notes: notes || '',
                job_title: job_title || '',
                company: company || '',
                applied_date: new Date().toISOString(),
            }])
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(data);
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update application status/notes
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const allowedUpdates = {};
        if (status !== undefined) allowedUpdates.status = status;
        if (notes !== undefined) allowedUpdates.notes = notes;
        allowedUpdates.updated_at = new Date().toISOString();

        if (Object.keys(allowedUpdates).length === 1) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Get the application first to check if it exists and get user_id for notification
        const { data: existingApp, error: fetchError } = await supabase
            .from('applications')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingApp) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const { data, error } = await supabase
            .from('applications')
            .update(allowedUpdates)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Create notification if status changed
        if (status && status !== existingApp.status) {
            await supabase.from('notifications').insert({
                user_id: existingApp.user_id,
                title: 'Application Update',
                message: `Your application to ${existingApp.job_title || 'a job'} is now: ${status}`,
                type: 'status_change',
                job_id: existingApp.job_id,
                read: false
            });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        return res.json({ message: 'Application deleted successfully', data });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
