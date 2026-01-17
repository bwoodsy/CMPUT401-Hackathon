const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

router.get('/', async (req , res) => {
  try {
    const { data, error } = await supabase
      .from('resume')
      .select('*');

    // Check if Supabase returned an error
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // express returns 200 by default
    return res.json(data);

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req , res) => {
  try {
    const id = req.params.id;

    const { data, error } = await supabase
      .from('resume')
      .select('*')
      .eq('id', id)
      .single();

    // Check if Supabase returned an error
    if (error) {
        // PGRST116 is the code for "No rows found"
        if (error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Resume not found' });
        }
        return res.status(500).json({ error: error.message });
    }
    
    // express returns 200 by default
    return res.json(data);

  } catch (error) {
    console.error('Error fetching resumess:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
    try{
        const { contact, education, experience, skills, certifications, references } = req.body;

        const { data, error } = await supabase
            .from('resume')
            .insert([{ contact, education, experience, skills, certifications, references}])
            .select();

        if (error) {
            return res.status(500).json({error: error.message})
        }

        return res.status(201).json(data);

    } catch (error) {
        console.error('Error creating resume:', error);
        res.status(500).json({error: 'Internal Server Error'});
}});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const { data, error } = await supabase
            .from('resume')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }   

        // make the sure the resume was found and deleted
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        return res.json({ message: 'Resume deleted successfully', data }); 
    } catch (error) {
        console.error('Error deleting Resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
}});

router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const allowedUpdates = {};
        if (req.body.contact !== undefined) allowedUpdates.contact = req.body.contact;
        if (req.body.education !== undefined) allowedUpdates.education = req.body.education;
        if (req.body.experience !== undefined) allowedUpdates.experience = req.body.experience;
        if (req.body.skills !== undefined) allowedUpdates.skills = req.body.skills;
        if (req.body.certifications !== undefined) allowedUpdates.certifications = req.body.certifications;
        if (req.body.references !== undefined) allowedUpdates.references = req.body.references;


        // If nothing to update, return early
        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const { data, error } = await supabase
            .from('resume')
            .update(allowedUpdates)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({error: 'resume not found'});
        }
        return res.json(data);

    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ error: 'Internal Server Error' });
}});

module.exports = router;