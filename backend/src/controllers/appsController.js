const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

router.get('/api/apps/:userID', async (req , res) => {
  try {
    const userID = req.params.userID;

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userID)

    // Check if Supabase returned an error
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // express returns 200 by default
    return res.json(data);

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/api/apps', async (req, res) => {
    try{
        const {user_id, resume_id, company_name, position, stage_id, notes} = req.body;

        const { data, error } = await supabase
            .from('job_applications')
            .insert([{user_id, resume_id, company_name, position, stage_id, notes}])
            .select();

        if (error) {
            return res.status(500).json({error: error.message})
        }

        return res.status(201).json(data);

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({error: 'Internal Server Error'});
}});


router.put('/api/apps/:appID', async (req, res) => {
    try {
        const appID = req.params.appID;

        const allowedUpdates = {};
        if (req.body.company_name !== undefined) allowedUpdates.company_name = req.body.company_name;
        if (req.body.position !== undefined) allowedUpdates.position = req.body.position;
        if (req.body.notes !== undefined) allowedUpdates.notes = req.body.notes;

        // If nothing to update, return early
        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const { data, error } = await supabase
            .from('job_applications')
            .update(allowedUpdates)
            .eq('id', appID)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'job not found'});
        }
        return res.json(data);

    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Internal Server Error' });
}});

module.exports = router;
